import axios from "./axios";
import EventSource from "eventsource";
import ep from "./endpoints";
import { AxiosInstance } from "axios";
import { User, Transaction, Donation, EventTypes, EventCallbackTypes } from "./types";

class SaweriaClient {
	private jwt: string;
	private streamKey: string;
	private axios: AxiosInstance;
	private events: Record<string, EventCallbackTypes<string>[]>;
	private eventSource: EventSource | null;
	
	constructor(axiosClient = axios) {
		this.jwt = "";
		this.events = {};
		this.streamKey = "";
		this.axios = axiosClient;
		this.eventSource = null;
	}



	/**
	 * FOR EVENT LISTENER
	 */
	on<T extends EventTypes>(name: T, listener: EventCallbackTypes<T>): void {
		if (!this.events[name]) this.events[name] = [];
		this.events[name].push(listener);
	}

	
	removeListener(name: string, listenerToRemove: () => void): void {
		if (!this.events[name]) return;
		this.events[name] = this.events[name].filter((listener) => listener !== listenerToRemove);
	}
	
	private emit(name: string, data: unknown): void {
		if (!this.events[name]) return;   
		this.events[name].forEach((callback) => { callback(data); });
	}

	/**
	 * Connects to Saweria event source endpoint for donation listener
	 * 
	 * @returns {string}
	 */
	private async initiateEventSource(): Promise<void> {
		if (this.eventSource !== null) this.eventSource.close();
		this.eventSource = new EventSource(`https://api.saweria.co/streams?channel=donation.${await this.getStreamKey()}`);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.eventSource.addEventListener("donations", (message: any) => {
			this.emit("donation", JSON.parse(message.data).data);
		});
		this.eventSource.addEventListener("error", (error) => {
			this.emit("error", error);
		});
	}



	/**
	 * Login to Saweria
	 * 
	 * @param email User email
	 * @param password User password
	 * @param otp OTP if the account have 2FA enabled
	 * 
	 * @returns {User}
	 */
	async login(email: string, password: string, otp: string): Promise<void> {
		const response = await this.axios[ep.LOGIN.method](ep.LOGIN.url, { email, password, otp });
		
		if (response.status !== 200) throw new Error(response.data);
		this.setJWT(response.headers.authorization);
		await this.initiateEventSource();
		this.emit("login", response.data.data as User);
	}


	/**
	 * Remove jwt from HTTP client
	 */
	logout(): void {
		this.jwt = "";
		this.axios.defaults.headers.common.authorization = "";
		this.eventSource = null;
	}


	/**
	 * Set JWT and assign it to HTTP Client for Authorization header
	 * 
	 * @param jwt JSON Web Token
	 */
	setJWT(jwt: string): void {
		this.jwt = jwt;
		this.axios.defaults.headers.common.authorization = this.jwt;
	}


	/**
	 * Get user Stream key
	 * 
	 * @returns {string}
	 */
	async getStreamKey(): Promise<string> {
		if (!this.streamKey) {
			const response = await this.axios[ep.STREAM_KEY.method](ep.STREAM_KEY.url);
			this.streamKey = response.data.data.streamKey; 
		}
		return this.streamKey;
	}

	/**
	 * Set user Stream key
	 */
	async setStreamKey(streamKey: string): Promise<void> {
		this.streamKey = streamKey;
		await this.initiateEventSource();
	}


	/**
	 * Get user balance
	 * 
	 * @returns {number}
	 */
	async getBalance(): Promise<number> {
		const response = await this.axios[ep.BALANCE.method](ep.BALANCE.url);
		return response.data.data.balance;
	}


	/**
	 * Get user available balance
	 * 
	 * @returns {number}
	 */
	async getAvailableBalance(): Promise<number> {
		const response = await this.axios[ep.AVAILABLE_BALANCE.method](ep.AVAILABLE_BALANCE.url);
		return response.data.data.availableBalance;
	}


	/**
	 * Get transaction list
	 * 
	 * @param page What page of transaction to get
	 * @param pageSize How many transaction per page
	 * 
	 * @returns {Transaction[]}
	 */
	async getTransaction(page = 1, pageSize = 15): Promise<Transaction[]> {
		const response = await this.axios[ep.TRANSACTIONS.method](`${ep.TRANSACTIONS.url}?page=${page}&page_size=${pageSize}`);
		return response.data.data.transactions || [];
	}


	/**
	 * Get milestone progress from given date until now
	 * 
	 * @param fromDate From date with dd-mm-yyyy format
	 * 
	 * @returns {number} 
	 */
	async getMilestoneProgress(fromDate: string | Date): Promise<number> {
		if (fromDate instanceof Date) fromDate = fromDate.toJSON().slice(0,10).split("-").reverse().join("-");
		const response = await this.axios[ep.MILESTONE_PROGRESS.method](`${ep.MILESTONE_PROGRESS.url}?start_date=${fromDate}`, {
			headers: {
				"stream-key": await this.getStreamKey()
			}
		});
		return response.data.data.progress;
	}


	/**
	 * Get donation leaderboard from given period
	 * 
	 * @param period Time period, can be "all", "year", "month", or "week"
	 * 
	 * @returns {Donation[]}
	 */
	async getLeaderboard(period = "all"): Promise<Donation[]> {
		const validPeriod = ["all", "year", "month", "week"];
		if (!validPeriod.includes(period)) {
			throw new Error("Invalid Period value");
		}
		const response = await this.axios[ep.LEADERBOARD.method](`${ep.LEADERBOARD.url}/${period}`, {
			headers: {
				"stream-key": await this.getStreamKey()
			}
		});
		return response.data.data;
	}
}

export = SaweriaClient;
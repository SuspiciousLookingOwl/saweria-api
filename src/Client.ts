import axios from "./axios";
import ep from "./endpoints";
import { AxiosInstance } from "axios";
import { User, Transaction, Donation } from "./types";

class SaweriaClient {
	private jwt: string;
	private streamKey: string;
	private axios: AxiosInstance;
	
	constructor() {
		this.jwt = "";
		this.streamKey = "";
		this.axios = axios;
	}


	/**
	 * Login to Saweria
	 * 
	 * @param email User email
	 * @param password User password
	 * 
	 * @returns {User}
	 */
	async login(email: string, password: string): Promise<User> {
		const response = await this.axios[ep.LOGIN.method](ep.LOGIN.url, { email, password });
		
		if (response.status !== 200) throw new Error(response.data);
		this.setJWT(response.headers.authorization);
		await this.getStreamKey();
		return response.data.data;
	}


	/**
	 * Remove jwt from HTTP client
	 */
	logout(): void {
		this.jwt = "";
		this.axios.defaults.headers.common.authorization = "";
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
	async getMilestoneProgress(fromDate: string): Promise<number> {

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
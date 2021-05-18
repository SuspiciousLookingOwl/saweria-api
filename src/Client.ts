import axios from "./axios";
import { EventEmitter } from "events";
import EventSource from "eventsource";
import ENDPOINT from "./endpoints";
import { AxiosInstance } from "axios";
import {
	User,
	Transaction,
	Donation,
	EventTypes,
	EventCallbackTypes,
	EmittedDonation,
	EmittedMedia,
} from "./interfaces";

declare interface SaweriaClient {
	on<T extends EventTypes>(event: T, listener: EventCallbackTypes<T>): this;
	emit<T extends EventTypes>(
		event: T,
		...args: Parameters<EventCallbackTypes<T>>
	): boolean;
}

class SaweriaClient extends EventEmitter {
	public jwt: string;
	private streamKey: string;
	private axios: AxiosInstance;
	private eventSource: {
		alert: EventSource;
		media: EventSource;
	} | null;

	constructor(axiosClient = axios) {
		super();
		this.jwt = "";
		this.streamKey = "";
		this.axios = axiosClient;
		this.eventSource = null;
	}

	/**
	 * Connects to Saweria event source endpoint for donation listener
	 *
	 * @returns {string}
	 */
	private async initiateEventSource(): Promise<void> {
		if (this.eventSource !== null) {
			this.eventSource.alert.close();
			this.eventSource.media.close();
		}
		this.eventSource = {
			alert: new EventSource(
				`https://api.saweria.co/streams?channel=donation.${await this.getStreamKey()}`
			),
			media: new EventSource(
				`https://api.saweria.co/streams?channel=mediashare.${await this.getStreamKey()}`
			),
		};
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.eventSource.alert.addEventListener("donations", (message: any) => {
			const donations = (JSON.parse(message.data) as EmittedDonation[]).map(
				(donation) => {
					donation.amount = +donation.amount;
					donation.type = "normal";
					return donation;
				}
			);
			this.emit("donations", donations);
			for (const donation of donations) this.emit("donation", donation);
		});
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.eventSource.media.addEventListener("donations", (message: any) => {
			const donations = (JSON.parse(message.data) as EmittedMedia[]).map(
				(donation) => {
					donation.amount = +donation.amount;
					donation.type = "media";
					return donation;
				}
			);
			this.emit("donations", donations);
			for (const donation of donations) this.emit("donation", donation);
		});

		this.eventSource.alert.addEventListener("error", (error) => {
			this.emit("error", error);
		});
		this.eventSource.media.addEventListener("error", (error) => {
			this.emit("error", error);
		});
	}

	/**
	 * Login to Saweria
	 *
	 * @param email User email
	 * @param password User password
	 * @param otp OTP if the account have 2FA enabled
	 */
	async login(jwt: string): Promise<void>;
	async login(email: string, password: string, otp?: string): Promise<void>;
	async login(
		emailOrJwt: string,
		password?: string,
		otp?: string
	): Promise<void> {
		let user: User;
		if (password) {
			const response = await this.axios[ENDPOINT.LOGIN.METHOD](
				ENDPOINT.LOGIN.URL,
				{ email: emailOrJwt, password, otp }
			);
			if (response.status !== 200) throw new Error(response.data);
			this.setJWT(response.headers.authorization);
			user = response.data.data;
		} else {
			this.setJWT(emailOrJwt);
			user = await this.getUser();
		}
		await this.initiateEventSource();
		this.emit("login", user);
	}

	/**
	 * Remove jwt from HTTP client
	 */
	logout(): void {
		this.jwt = "";
		this.axios.defaults.headers.common.authorization = "";
		if (this.eventSource !== null) {
			this.eventSource.media.close();
			this.eventSource.alert.close();
			this.eventSource = null;
		}
	}

	/**
	 * Get user data
	 *
	 * @returns {User}
	 */
	async getUser(): Promise<User> {
		const response = await this.axios[ENDPOINT.USER.METHOD](ENDPOINT.USER.URL);
		return response.data.data;
	}

	/**
	 * Set JWT and assign it to HTTP Client for Authorization header
	 *
	 * @param jwt JSON Web Token
	 */
	private setJWT(jwt: string): void {
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
			const response = await this.axios[ENDPOINT.STREAM_KEY.METHOD](
				ENDPOINT.STREAM_KEY.URL
			);
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
		const response = await this.axios[ENDPOINT.BALANCE.METHOD](
			ENDPOINT.BALANCE.URL
		);
		return response.data.data.balance;
	}

	/**
	 * Send a fake donation
	 */
	async sendFakeDonation(): Promise<void> {
		await this.axios[ENDPOINT.FAKE.METHOD](ENDPOINT.FAKE.URL);
	}

	/**
	 * Get user available balance
	 *
	 * @returns {number}
	 */
	async getAvailableBalance(): Promise<number> {
		const response = await this.axios[ENDPOINT.AVAILABLE_BALANCE.METHOD](
			ENDPOINT.AVAILABLE_BALANCE.URL
		);
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
		const response = await this.axios[ENDPOINT.TRANSACTIONS.METHOD](
			`${ENDPOINT.TRANSACTIONS.URL}?page=${page}&page_size=${pageSize}`
		);
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
		if (fromDate instanceof Date)
			fromDate = fromDate.toJSON().slice(0, 10).split("-").reverse().join("-");
		const response = await this.axios[ENDPOINT.MILESTONE_PROGRESS.METHOD](
			`${ENDPOINT.MILESTONE_PROGRESS.URL}?start_date=${fromDate}`,
			{
				headers: {
					"stream-key": await this.getStreamKey(),
				},
			}
		);
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
		const response = await this.axios[ENDPOINT.LEADERBOARD.METHOD](
			`${ENDPOINT.LEADERBOARD.URL}/${period}`,
			{
				headers: {
					"stream-key": await this.getStreamKey(),
				},
			}
		);
		return response.data.data;
	}
}

export = SaweriaClient;

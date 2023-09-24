import axios from "./axios";
import { EventEmitter } from "events";
import { WebSocket } from "ws";
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
	Vote,
} from "./interfaces";

declare interface SaweriaClient {
	on<T extends EventTypes>(event: T, listener: EventCallbackTypes<T>): this;
	once<T extends EventTypes>(event: T, listener: EventCallbackTypes<T>): this;
	emit<T extends EventTypes>(
		event: T,
		...args: Parameters<EventCallbackTypes<T>>
	): boolean;
}

class SaweriaClient extends EventEmitter {
	public jwt: string;
	private streamKey: string;
	private axios: AxiosInstance;
	private webSocket: WebSocket | null;

	constructor(axiosClient = axios) {
		super();
		this.jwt = "";
		this.streamKey = "";
		this.axios = axiosClient;
		this.webSocket = null;
	}

	/**
	 * Connects to Saweria event source endpoint for donation listener
	 *
	 * @returns {string}
	 */
	private async initiateWebSocket(): Promise<void> {
		if (this.webSocket !== null) this.webSocket.close();

		const url = ENDPOINT.STREAMS.URL;
		const streamKey = await this.getStreamKey();

		this.webSocket = new WebSocket(`${url}?streamKey=${streamKey}`);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any

		this.webSocket.on("message", (message: string) => {
			const data = JSON.parse(message);
			if (data.type === "donation") {
				const donations = (data.data as EmittedDonation[] | EmittedMedia[]).map(
					(donation) => {
						donation.amount = +donation.amount;
						donation.type = "tts" in donation ? "normal" : "media";
						return donation;
					}
				) as EmittedDonation[] | EmittedMedia[];
				this.emit("donations", donations);
				for (const donation of donations) this.emit("donation", donation);
			}
		});

		this.webSocket.on("error", (error) => {
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
		await this.initiateWebSocket();
		this.emit("login", user);
	}

	/**
	 * Remove jwt from HTTP client
	 */
	logout(): void {
		this.jwt = "";
		this.axios.defaults.headers.common.authorization = "";
		if (this.webSocket !== null) {
			this.webSocket.close();
			this.webSocket = null;
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
		await this.initiateWebSocket();
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

	/**
	 * Get currently active vote data
	 *
	 * @returns {Vote}
	 */
	async getVote(): Promise<Vote> {
		const response = await this.axios[ENDPOINT.VOTE.METHOD](ENDPOINT.VOTE.URL, {
			headers: { "stream-key": await this.getStreamKey() },
		});
		return response.data.data;
	}
}

export = SaweriaClient;

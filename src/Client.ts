import axios from "./axios";
import ep from "./endpoints";
import { AxiosInstance } from "axios";
import { User, Transaction } from "./types";

class SaweriaClient {
	private jwt: string;
	private axios: AxiosInstance;
	
	constructor() {
		this.jwt = "";
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
		this.setJwt(response.headers.authorization);
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
	setJwt(jwt: string): void {
		this.jwt = jwt;
		this.axios.defaults.headers.common.authorization = this.jwt;
	}


	/**
	 * Get user Stream key
	 * 
	 * @returns {string}
	 */
	async getStreamKey(): Promise<string> {
		const response = await this.axios[ep.STREAM_KEY.method](ep.STREAM_KEY.url);
		return response.data.data.streamKey;
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
}

export = SaweriaClient;
import fetch, { Headers } from "node-fetch";

type Response = {
	status: number;
	data: any;
	headers: Headers;
};

export class Http {
	private authorization: string = "";

	async post(url: string, body: any, options?: Partial<RequestInit>): Promise<Response> {
		let headers = {
			authorization: this.authorization,
			"content-type": "application/json",
		};
		if (options?.headers) headers = { ...headers, ...options.headers };

		const response = await fetch(url, {
			...options,
			body: JSON.stringify(body),
			method: "post",
			headers,
		});
		return {
			status: response.status,
			data: Http.toCamelCase(await response.json()),
			headers: response.headers,
		};
	}

	async get(url: string, options?: Partial<RequestInit>): Promise<Response> {
		let headers = { authorization: this.authorization };
		if (options?.headers) headers = { ...headers, ...options.headers };

		const response = await fetch(url, {
			...options,
			body: undefined,
			method: "get",
			headers,
		});
		return {
			status: response.status,
			data: Http.toCamelCase(await response.json()),
			headers: response.headers,
		};
	}

	async setAuthorization(token: string) {
		this.authorization = token;
	}

	async removeAuthorization() {
		this.authorization = "";
	}

	private static toCamelCase(obj: any): any {
		if (Array.isArray(obj)) {
			return obj.map(Http.toCamelCase);
		} else if (obj !== null && typeof obj === "object") {
			return Object.keys(obj).reduce<Record<string, any>>((result, key) => {
				const camelKey = key.replace(/([-_][a-z])/g, (m, p1) =>
					p1.toUpperCase().replace(/[-_]/, ""),
				);
				result[camelKey] = Http.toCamelCase(obj[key]);
				return result;
			}, {});
		}
		return obj;
	}
}

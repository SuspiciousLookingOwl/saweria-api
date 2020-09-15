export default {
	LOGIN: {
		url: "https://api.saweria.co/auth/login",
		method: "post"
	},
	BALANCE: {
		url: "https://api.saweria.co//donations/balance",
		method: "get"
	},
	AVAILABLE_BALANCE: {
		url: "https://api.saweria.co/donations/available-balance",
		method: "get"
	},
	TRANSACTIONS: {
		url: "https://api.saweria.co/transactions",
		method: "get"
	},
	STREAM_KEY: {
		url: "https://api.saweria.co/auth/stream-key",
		method: "get"
	},
	MILESTONE_PROGRESS: {
		url: "https://api.saweria.co/widgets/milestone-progress",
		method: "get"
	},
	LEADERBOARD: {
		url: "https://api.saweria.co/widgets/leaderboard",
		method: "get"
	}
} as const;
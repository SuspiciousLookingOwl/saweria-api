export default {
	LOGIN: {
		URL: "https://api.saweria.co/auth/login",
		METHOD: "post"
	},
	BALANCE: {
		URL: "https://api.saweria.co//donations/balance",
		METHOD: "get"
	},
	AVAILABLE_BALANCE: {
		URL: "https://api.saweria.co/donations/available-balance",
		METHOD: "get"
	},
	TRANSACTIONS: {
		URL: "https://api.saweria.co/transactions",
		METHOD: "get"
	},
	STREAM_KEY: {
		URL: "https://api.saweria.co/auth/stream-key",
		METHOD: "get"
	},
	MILESTONE_PROGRESS: {
		URL: "https://api.saweria.co/widgets/milestone-progress",
		METHOD: "get"
	},
	LEADERBOARD: {
		URL: "https://api.saweria.co/widgets/leaderboard",
		METHOD: "get"
	},
	FAKE: {
		URL: "https://api.saweria.co/donations/fake",
		METHOD: "get"
	},
	USER: {
		URL: "https://api.saweria.co/users",
		METHOD: "get"
	}
} as const;
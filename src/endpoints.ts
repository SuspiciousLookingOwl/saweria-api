export default {
	LOGIN: {
		URL: "https://backend.saweria.co/auth/login",
		METHOD: "post",
	},
	BALANCE: {
		URL: "https://backend.saweria.co//donations/balance",
		METHOD: "get",
	},
	AVAILABLE_BALANCE: {
		URL: "https://backend.saweria.co/donations/available-balance",
		METHOD: "get",
	},
	TRANSACTIONS: {
		URL: "https://backend.saweria.co/transactions",
		METHOD: "get",
	},
	STREAM_KEY: {
		URL: "https://backend.saweria.co/auth/stream-key",
		METHOD: "get",
	},
	MILESTONE_PROGRESS: {
		URL: "https://backend.saweria.co/widgets/milestone-progress",
		METHOD: "get",
	},
	LEADERBOARD: {
		URL: "https://backend.saweria.co/widgets/leaderboard",
		METHOD: "get",
	},
	VOTE: {
		URL: "https://backend.saweria.co/widgets/vote",
		METHOD: "get",
	},
	FAKE: {
		URL: "https://backend.saweria.co/donations/fake",
		METHOD: "get",
	},
	USER: {
		URL: "https://backend.saweria.co/users",
		METHOD: "get",
	},
	STREAMS: {
		URL: "wss://events.saweria.co/stream",
	},
} as const;

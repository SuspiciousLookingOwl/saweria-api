export interface User {
	description: string;
	donationTemplate: string;
	email: string;
	emailVerified: boolean;
	id: string;
	overlay: {
		media: boolean;
		mediashare: boolean;
		mediashareMaxDuration: number;
		mediashareRate: 100;
		min: number;
		minMedia: number;
		minTts: number;
		quickAmounts: number[];
		sound?: Record<string, string>;
		textFilter: string;
		tts: string;
	};
	plus?: boolean;
	profilePicture: string;
	socials: {
		facebook: string;
		instagram: string;
		twitch: string;
		twitter: string;
		youtube: string;
	};
	tierKey?: string;
	username: string;
	verified: boolean;
	vote?: {
		endAt: string;
		on: boolean;
		startAt: string;
		tag: string[];
		title: string;
	};
}

export interface Transaction {
	amountRaw: number;
	createdAt: string;
	cut: number;
	donator: {
		email: string;
		firstName: string;
	};
	failureCode?: number;
	id: string;
	message: string;
	status: string;
	type: string;
}

export interface Vote {
	endAt: string;
	on: boolean;
	startAt: string;
	tag: string[];
	title: string;
	votes: Record<string, number>;
}

export interface Donation {
	amount: number;
	donator: string;
}

export interface EmittedDonation extends Donation {
	media?: {
		src: string[];
		tag: string;
	};
	message: string;
	sound: Record<string, string> | null;
	tts: string;
	type: "normal";
}

export interface EmittedMedia extends Donation {
	media: {
		end: number;
		id: string;
		start: number;
		type: string;
	};
	message: string;
	sound: Record<string, string> | null;
	type: "media";
}

export type EventTypes = "login" | "donations" | "donation" | "error";

export type EventCallbackTypes<T> = T extends "login"
	? (user: User) => void
	: T extends "donations"
	? (donations: EmittedDonation[] | EmittedMedia[]) => void
	: T extends "donation"
	? (donations: EmittedDonation | EmittedMedia) => void
	: T extends "error"
	? (error: any) => void
	: any;

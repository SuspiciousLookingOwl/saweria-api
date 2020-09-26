export interface User {
    description: string;
    donationTemplate: string;
    email: string;
    emailVerified: boolean;
    id: string;
    overlay: {
        media: boolean;
        min: number;
        minMedia: number;
    };
    profilePicture: string;
    socials: {
        facebook: string;
        instagram: string;
        twitch: string;
        twitter: string;
        youtube: string;
    };
    tierKey: string;
    username: string;
    verified: boolean;
}

export interface Transaction {
    amountRaw: number;
    created_at: string;
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

export interface Donation {
    amount: number;
    donator: string;
}

export interface EmittedDonation extends Donation {
    media?: {
        src: string[],
        tag: string
      },
    message: string,
    sound: Record<string,string>
}

export type EventTypes = "login" | "donation" | "error";

export type EventCallbackTypes<T> =
    T extends "login" ? (user: User) => void:
    T extends "donation" ? (donation: EmittedDonation) => void:
    T extends "error" ? (error: any) => void:
    any

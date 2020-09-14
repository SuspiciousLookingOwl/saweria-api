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
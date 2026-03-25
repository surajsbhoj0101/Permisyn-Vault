export type AuthResponse = {
    isAuthorized: boolean;
    role: string | null;
    userId: string | null;
}

export type nonceResponse = {
    nonce: string;
}
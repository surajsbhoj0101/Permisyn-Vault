import type { ConnectedWallet } from "./wallet";
export interface InternalClientConfig {
    apiBaseUrl: string;
    walletProvider?: {
        request<TResult>(args: {
            method: string;
            params?: readonly unknown[] | object;
        }): Promise<TResult>;
    };
    authEndpoint?: string;
    nonceEndpoint?: string;
    authStatusEndpoint?: string;
    formatAddress?: (address: string) => string;
    fetch?: typeof fetch;
    appName?: string;
}
export interface AuthenticatedUser {
    isAuthorized: boolean;
    user: {
        id: string;
        walletAddress: string;
        role?: string | null;
        displayName?: string;
        username?: string | null;
        [key: string]: unknown;
    };
}
export interface SiwePayload {
    domain: string;
    address: string;
    statement: string;
    uri: string;
    version: "1";
    chainId: number;
    nonce: string;
    issuedAt: string;
}
interface AuthenticateWalletInput {
    apiBaseUrl: string;
    authEndpoint: string;
    authStatusEndpoint: string;
    address: string;
    message: SiwePayload;
    signature: string;
    fetcher?: typeof fetch;
}
export declare class SignatureError extends Error {
    constructor(message: string);
}
export declare class AuthenticationError extends Error {
    constructor(message: string);
}
export declare function validateClientConfig(config: InternalClientConfig): void;
export declare function createLoginMessage(address: string, appName?: string, chainId?: string, domain?: string, uri?: string, nonce?: string): SiwePayload;
export declare function prepareLoginMessage(message: SiwePayload): string;
export declare function signMessage(wallet: ConnectedWallet, message: string): Promise<string>;
export declare function fetchNonce(apiBaseUrl: string, nonceEndpoint: string, fetcher?: typeof fetch): Promise<string>;
export declare function authenticateWallet(input: AuthenticateWalletInput): Promise<AuthenticatedUser>;
export {};
//# sourceMappingURL=sign.d.ts.map
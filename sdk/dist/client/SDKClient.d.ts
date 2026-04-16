import { createLoginMessage, type AuthenticatedUser } from "../core/sign";
import { type WalletProvider } from "../core/wallet";
export interface AuthStatus {
    isAuthorized: boolean;
    role: string | null;
    userId: string | null;
    username: string | null;
}
export interface CompleteUserOnboardingInput {
    username: string;
    email: string;
}
export interface SDKClientConfig {
    apiBaseUrl: string;
    authEndpoint?: string;
    nonceEndpoint?: string;
    authStatusEndpoint?: string;
    appName?: string;
    walletProvider?: WalletProvider;
    formatAddress?: (address: string) => string;
    fetch?: typeof fetch;
}
export interface LoginOptions {
    message?: ReturnType<typeof createLoginMessage>;
}
export declare class SDKClient {
    private readonly config;
    constructor(config: SDKClientConfig);
    login(options?: LoginOptions): Promise<AuthenticatedUser>;
    getAuthStatus(): Promise<AuthStatus>;
    checkUsernameAvailability(username: string): Promise<boolean>;
    checkEmailAvailability(email: string): Promise<boolean>;
    requestOtp(email: string): Promise<{
        success: boolean;
        message?: string;
    }>;
    verifyOtp(email: string, otp: string): Promise<{
        success: boolean;
        message?: string;
    }>;
    completeUserOnboarding(input: CompleteUserOnboardingInput): Promise<AuthStatus>;
    private requestJson;
}
export type { AuthenticatedUser };
//# sourceMappingURL=SDKClient.d.ts.map
import type { AuthStatus, SDKClient } from "../client/SDKClient";
export declare const OTP_EXPIRATION_TIME = 300;
interface OnboardingClient {
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
    completeUserOnboarding(input: {
        username: string;
        email: string;
    }): Promise<AuthStatus>;
}
export interface OnboardingDetails {
    username: string;
    email: string;
}
export interface CompleteOnboardingInput extends OnboardingDetails {
    otp: string;
    otpSent: boolean;
}
export declare function canContinueOnboarding(details: OnboardingDetails): boolean;
export declare function validateOnboardingDetails(client: OnboardingClient, details: OnboardingDetails): Promise<void>;
export declare function requestOnboardingOtp(client: OnboardingClient, email: string): Promise<{
    notice: string;
    otpTimeLeft: number;
}>;
export declare function completeOnboarding(client: OnboardingClient, input: CompleteOnboardingInput): Promise<AuthStatus>;
export declare function toOnboardingError(error: unknown, fallbackMessage: string): Error;
export type { OnboardingClient, SDKClient };
//# sourceMappingURL=onboarding.d.ts.map
import type { AuthStatus, SDKClient } from "../client/SDKClient";

export const OTP_EXPIRATION_TIME = 300;

interface OnboardingClient {
  checkUsernameAvailability(username: string): Promise<boolean>;
  checkEmailAvailability(email: string): Promise<boolean>;
  requestOtp(email: string): Promise<{ success: boolean; message?: string }>;
  verifyOtp(email: string, otp: string): Promise<{ success: boolean; message?: string }>;
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

export function canContinueOnboarding(details: OnboardingDetails): boolean {
  return details.username.trim().length > 0 && details.email.trim().length > 0;
}

export async function validateOnboardingDetails(
  client: OnboardingClient,
  details: OnboardingDetails,
): Promise<void> {
  if (!canContinueOnboarding(details)) {
    throw new Error("Username and email are required.");
  }

  const [usernameTaken, emailTaken] = await Promise.all([
    client.checkUsernameAvailability(details.username),
    client.checkEmailAvailability(details.email),
  ]);

  if (usernameTaken) {
    throw new Error("Username is already taken.");
  }

  if (emailTaken) {
    throw new Error("Email is already in use.");
  }
}

export async function requestOnboardingOtp(
  client: OnboardingClient,
  email: string,
): Promise<{ notice: string; otpTimeLeft: number }> {
  await client.requestOtp(email);

  return {
    notice: `OTP sent to ${email.trim()}.`,
    otpTimeLeft: OTP_EXPIRATION_TIME,
  };
}

export async function completeOnboarding(
  client: OnboardingClient,
  input: CompleteOnboardingInput,
): Promise<AuthStatus> {
  if (!input.otpSent) {
    throw new Error("Request OTP first.");
  }

  if (input.otp.trim().length !== 6) {
    throw new Error("Enter a valid 6-digit OTP.");
  }

  await client.verifyOtp(input.email, input.otp);

  return client.completeUserOnboarding({
    username: input.username,
    email: input.email,
  });
}

export function toOnboardingError(
  error: unknown,
  fallbackMessage: string,
): Error {
  return error instanceof Error ? error : new Error(fallbackMessage);
}

export type { OnboardingClient, SDKClient };

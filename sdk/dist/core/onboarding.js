export const OTP_EXPIRATION_TIME = 300;
export function canContinueOnboarding(details) {
    return details.username.trim().length > 0 && details.email.trim().length > 0;
}
export async function validateOnboardingDetails(client, details) {
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
export async function requestOnboardingOtp(client, email) {
    await client.requestOtp(email);
    return {
        notice: `OTP sent to ${email.trim()}.`,
        otpTimeLeft: OTP_EXPIRATION_TIME,
    };
}
export async function completeOnboarding(client, input) {
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
export function toOnboardingError(error, fallbackMessage) {
    return error instanceof Error ? error : new Error(fallbackMessage);
}
//# sourceMappingURL=onboarding.js.map
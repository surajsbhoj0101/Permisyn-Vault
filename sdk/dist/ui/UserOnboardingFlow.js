import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { completeOnboarding, requestOnboardingOtp, toOnboardingError, validateOnboardingDetails, } from "../core/onboarding";
export function UserOnboardingFlow({ client, defaultValues, onSuccess, onError, }) {
    const [username, setUsername] = useState(defaultValues?.username ?? "");
    const [email, setEmail] = useState(defaultValues?.email ?? "");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1);
    const [isChecking, setIsChecking] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [notice, setNotice] = useState(null);
    const [error, setError] = useState(null);
    const [otpTimeLeft, setOtpTimeLeft] = useState(0);
    useEffect(() => {
        if (otpTimeLeft <= 0) {
            return;
        }
        const timer = window.setInterval(() => {
            setOtpTimeLeft((previous) => {
                if (previous <= 1) {
                    window.clearInterval(timer);
                    return 0;
                }
                return previous - 1;
            });
        }, 1000);
        return () => window.clearInterval(timer);
    }, [otpTimeLeft]);
    const onboardingDetails = { username, email };
    const handleStepOne = async () => {
        setIsChecking(true);
        setError(null);
        setNotice(null);
        try {
            await validateOnboardingDetails(client, onboardingDetails);
            setStep(2);
        }
        catch (caughtError) {
            const resolvedError = toOnboardingError(caughtError, "Unable to validate onboarding details.");
            setError(resolvedError.message);
            onError?.(resolvedError);
        }
        finally {
            setIsChecking(false);
        }
    };
    const handleRequestOtp = async () => {
        setIsSendingOtp(true);
        setError(null);
        setNotice(null);
        try {
            const otpState = await requestOnboardingOtp(client, email);
            setOtpSent(true);
            setOtpTimeLeft(otpState.otpTimeLeft);
            setNotice(otpState.notice);
        }
        catch (caughtError) {
            const resolvedError = toOnboardingError(caughtError, "Failed to request OTP.");
            setError(resolvedError.message);
            onError?.(resolvedError);
        }
        finally {
            setIsSendingOtp(false);
        }
    };
    const handleComplete = async () => {
        setIsCompleting(true);
        setError(null);
        setNotice(null);
        try {
            const auth = await completeOnboarding(client, {
                username,
                email,
                otp,
                otpSent,
            });
            setNotice("Onboarding completed successfully.");
            onSuccess?.(auth);
        }
        catch (caughtError) {
            const resolvedError = toOnboardingError(caughtError, "Failed to complete onboarding.");
            setError(resolvedError.message);
            onError?.(resolvedError);
        }
        finally {
            setIsCompleting(false);
        }
    };
    return (_jsxs("section", { style: shellStyles, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }, children: [_jsxs("div", { children: [_jsx("p", { style: eyebrowStyles, children: "User Onboarding" }), _jsx("h2", { style: titleStyles, children: "Guest to User" }), _jsx("p", { style: descriptionStyles, children: "This SDK flow is intentionally limited to user onboarding. It validates username and email, requests an OTP, verifies it, and completes the `GUEST` to `USER` transition." })] }), _jsxs("div", { style: stepBadgeStyles, children: ["Step ", step, " / 2"] })] }), step === 1 ? (_jsxs("div", { style: { marginTop: 24, display: "grid", gap: 16 }, children: [_jsxs("label", { style: { display: "grid", gap: 8 }, children: [_jsx("span", { style: { fontSize: 14, fontWeight: 600, color: "#0f172a" }, children: "Username" }), _jsx("input", { value: username, onChange: (event) => setUsername(event.target.value), placeholder: "username", style: inputStyles })] }), _jsxs("label", { style: { display: "grid", gap: 8 }, children: [_jsx("span", { style: { fontSize: 14, fontWeight: 600, color: "#0f172a" }, children: "Email" }), _jsx("input", { value: email, onChange: (event) => setEmail(event.target.value), placeholder: "name@example.com", type: "email", style: inputStyles })] }), _jsx("button", { type: "button", onClick: handleStepOne, disabled: isChecking, style: primaryButtonStyles, children: isChecking ? "Checking..." : "Continue to OTP" })] })) : (_jsxs("div", { style: { marginTop: 24, display: "grid", gap: 16 }, children: [_jsxs("div", { style: {
                            borderRadius: 16,
                            background: "#f8fafc",
                            border: "1px solid rgba(148, 163, 184, 0.2)",
                            padding: 16,
                            color: "#334155",
                            fontSize: 14,
                            lineHeight: 1.6,
                        }, children: ["Request an OTP for ", _jsx("strong", { children: email.trim() }), ", then verify it to finish onboarding as a user."] }), _jsxs("div", { style: { display: "flex", gap: 12, flexWrap: "wrap" }, children: [_jsx("button", { type: "button", onClick: handleRequestOtp, disabled: isSendingOtp || otpTimeLeft > 0, style: secondaryButtonStyles, children: isSendingOtp
                                    ? "Sending OTP..."
                                    : otpTimeLeft > 0
                                        ? `Resend in ${otpTimeLeft}s`
                                        : otpSent
                                            ? "Resend OTP"
                                            : "Request OTP" }), _jsx("button", { type: "button", onClick: () => setStep(1), style: ghostButtonStyles, children: "Back" })] }), _jsxs("label", { style: { display: "grid", gap: 8 }, children: [_jsx("span", { style: { fontSize: 14, fontWeight: 600, color: "#0f172a" }, children: "OTP Code" }), _jsx("input", { value: otp, onChange: (event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6)), placeholder: "000000", inputMode: "numeric", style: inputStyles })] }), _jsx("button", { type: "button", onClick: handleComplete, disabled: isCompleting, style: primaryButtonStyles, children: isCompleting ? "Verifying..." : "Verify OTP and Finish" })] })), notice ? (_jsx("div", { style: noticeStyles, children: notice })) : null, error ? (_jsx("div", { style: errorStyles, children: error })) : null] }));
}
const shellStyles = {
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 24,
    background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.92))",
    padding: 22,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
};
const eyebrowStyles = {
    margin: 0,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#2563eb",
};
const titleStyles = {
    margin: "10px 0 0",
    fontSize: 26,
    fontWeight: 800,
    color: "#0f172a",
};
const descriptionStyles = {
    margin: "12px 0 0",
    maxWidth: 560,
    fontSize: 14,
    lineHeight: 1.6,
    color: "#475569",
};
const stepBadgeStyles = {
    alignSelf: "flex-start",
    borderRadius: 999,
    background: "#eff6ff",
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 700,
    color: "#1d4ed8",
};
const inputStyles = {
    minHeight: 44,
    borderRadius: 12,
    border: "1px solid rgba(148, 163, 184, 0.35)",
    padding: "0 14px",
    fontSize: 14,
    color: "#0f172a",
    background: "#fff",
};
const primaryButtonStyles = {
    minHeight: 46,
    borderRadius: 12,
    border: "none",
    padding: "0 16px",
    fontSize: 14,
    fontWeight: 700,
    color: "#fff",
    background: "linear-gradient(135deg, #0f3f8c, #3b82f6)",
    cursor: "pointer",
};
const secondaryButtonStyles = {
    ...primaryButtonStyles,
    color: "#0f172a",
    background: "#e2e8f0",
};
const ghostButtonStyles = {
    minHeight: 46,
    borderRadius: 12,
    border: "1px solid rgba(148, 163, 184, 0.35)",
    padding: "0 16px",
    fontSize: 14,
    fontWeight: 700,
    color: "#334155",
    background: "#fff",
    cursor: "pointer",
};
const noticeStyles = {
    marginTop: 16,
    borderRadius: 14,
    border: "1px solid rgba(96, 165, 250, 0.28)",
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "12px 14px",
    fontSize: 14,
};
const errorStyles = {
    marginTop: 16,
    borderRadius: 14,
    border: "1px solid rgba(248, 113, 113, 0.28)",
    background: "#fef2f2",
    color: "#b91c1c",
    padding: "12px 14px",
    fontSize: 14,
};
//# sourceMappingURL=UserOnboardingFlow.js.map
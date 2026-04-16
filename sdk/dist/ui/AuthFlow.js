import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { ConnectButton } from "./ConnectButton";
import { UserOnboardingFlow } from "./UserOnboardingFlow";
export function AuthFlow({ client, triggerLabel = "Open Auth Flow", title = "Connect and Continue", description = "Authenticate with your wallet. If the account is still a guest, the SDK automatically continues into onboarding.", connectLabel = "Connect Wallet", defaultValues, onAuthenticated, onOnboardingRequired, onOnboardingSuccess, onContinue, onClose, onError, className, }) {
    const [isOpen, setIsOpen] = useState(false);
    const [stage, setStage] = useState("connect");
    const [authUser, setAuthUser] = useState(null);
    const [flowError, setFlowError] = useState(null);
    const openModal = () => {
        setIsOpen(true);
    };
    const closeModal = () => {
        setIsOpen(false);
        onClose?.();
    };
    const handleConnectSuccess = (user) => {
        setAuthUser(user);
        setFlowError(null);
        const role = user.user.role ?? null;
        const requiresOnboarding = role === null || role === "GUEST";
        if (requiresOnboarding) {
            setStage("onboarding");
            onOnboardingRequired?.(user);
            return;
        }
        setStage("complete");
        onAuthenticated?.(user);
    };
    const handleConnectError = (error) => {
        setFlowError(error.message);
        onError?.(error);
    };
    const handleOnboardingSuccess = (auth) => {
        setFlowError(null);
        setStage("complete");
        onOnboardingSuccess?.(auth);
    };
    const handleOnboardingError = (error) => {
        setFlowError(error.message);
        onError?.(error);
    };
    const resolvedDefaultValues = {
        username: defaultValues?.username,
        email: defaultValues?.email,
    };
    return (_jsxs("div", { className: className, style: hostStyles, children: [_jsx("button", { type: "button", onClick: openModal, style: triggerStyles, children: triggerLabel }), isOpen ? (_jsxs("div", { style: overlayStyles, children: [_jsx("div", { style: backdropStyles, onClick: closeModal }), _jsxs("section", { style: shellStyles, children: [_jsx("div", { style: chromeStyles, children: _jsxs("div", { style: heroStyles, children: [_jsxs("div", { style: heroContentStyles, children: [_jsx("p", { style: eyebrowStyles, children: "Permisyn Auth Flow" }), _jsx("h2", { style: titleStyles, children: title }), _jsx("p", { style: descriptionStyles, children: description })] }), _jsxs("div", { style: chromeAsideStyles, children: [_jsxs("div", { style: progressShellStyles, children: [_jsx("div", { style: progressStepStyles(stage === "connect"), children: "1" }), _jsx("div", { style: progressLineStyles(stage !== "connect") }), _jsx("div", { style: progressStepStyles(stage === "onboarding"), children: "2" }), _jsx("div", { style: progressLineStyles(stage === "complete"), children: "3" })] }), _jsx("button", { type: "button", onClick: closeModal, style: closeButtonStyles, children: "Close" })] })] }) }), stage === "connect" ? (_jsxs("div", { style: panelStyles, children: [_jsxs("div", { style: stageHeaderStyles, children: [_jsx("p", { style: stageEyebrowStyles, children: "Step 1" }), _jsx("h3", { style: stageTitleStyles, children: "Verify wallet access" }), _jsx("p", { style: stageBodyStyles, children: "Connect once to create the verified session. If the account is still a guest, the flow moves directly into onboarding." })] }), _jsxs("div", { style: connectPanelStyles, children: [_jsxs("div", { style: connectPreviewStyles, children: [_jsx("div", { style: previewBadgeStyles, children: "Wallet Sign-In" }), _jsx("p", { style: previewTitleStyles, children: "Secure, session-first access" }), _jsx("p", { style: previewBodyStyles, children: "The SDK handles nonce fetch, signature verification, and the guest-to-user transition in one modal journey." })] }), _jsx(ConnectButton, { client: client, onSuccess: handleConnectSuccess, onError: handleConnectError, style: connectButtonStyles, children: connectLabel }), _jsx("p", { style: helperStyles, children: "Wallet verification completes first. Guest accounts then continue into profile setup automatically." })] })] })) : null, stage === "onboarding" ? (_jsxs("div", { style: panelStyles, children: [_jsxs("div", { style: stageHeaderStyles, children: [_jsx("p", { style: stageEyebrowStyles, children: "Step 2" }), _jsx("h3", { style: stageTitleStyles, children: "Finish guest onboarding" }), _jsx("p", { style: stageBodyStyles, children: "Add the basics we need to upgrade the authenticated guest session into a full user account." })] }), _jsx(UserOnboardingFlow, { client: client, defaultValues: resolvedDefaultValues, onSuccess: handleOnboardingSuccess, onError: handleOnboardingError })] })) : null, stage === "complete" ? (_jsxs("div", { style: successPanelStyles, children: [_jsx("p", { style: successEyebrowStyles, children: "Authenticated" }), _jsxs("h3", { style: successTitleStyles, children: ["Welcome ", authUser?.user.username ?? "User"] }), _jsx("p", { style: successBodyStyles, children: "Your wallet has been verified and your session is active. The SDK flow is complete and the app can continue with a trusted session." }), _jsxs("div", { style: summaryGridStyles, children: [_jsxs("div", { style: summaryCardStyles, children: [_jsx("p", { style: summaryLabelStyles, children: "Wallet" }), _jsx("p", { style: summaryValueStyles, children: authUser?.user.walletAddress ?? "Connected wallet" })] }), _jsxs("div", { style: summaryCardStyles, children: [_jsx("p", { style: summaryLabelStyles, children: "User ID" }), _jsx("p", { style: summaryValueStyles, children: authUser?.user.id ?? "Pending" })] }), _jsxs("div", { style: summaryCardStyles, children: [_jsx("p", { style: summaryLabelStyles, children: "Role" }), _jsx("p", { style: summaryValueStyles, children: authUser?.user.role ?? "USER" })] })] }), _jsxs("div", { style: actionsStyles, children: [_jsx("button", { type: "button", onClick: () => {
                                                    onContinue?.(authUser);
                                                    closeModal();
                                                }, style: actionPrimaryStyles, children: "Continue to App" }), _jsx("button", { type: "button", onClick: () => {
                                                    if (authUser?.user.walletAddress) {
                                                        navigator.clipboard.writeText(authUser.user.walletAddress);
                                                    }
                                                }, style: actionSecondaryStyles, children: "Copy Wallet" })] })] })) : null, flowError ? _jsx("div", { style: errorStyles, children: flowError }) : null] })] })) : null] }));
}
const hostStyles = {
    display: "inline-flex",
};
const triggerStyles = {
    minHeight: 48,
    border: "none",
    borderRadius: 16,
    padding: "0 20px",
    fontSize: 14,
    fontWeight: 800,
    color: "#ffffff",
    background: "linear-gradient(135deg, #0f3f8c, #2563eb 55%, #60a5fa)",
    boxShadow: "0 16px 34px rgba(37, 99, 235, 0.22)",
    cursor: "pointer",
};
const overlayStyles = {
    position: "fixed",
    inset: 0,
    zIndex: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
};
const backdropStyles = {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(circle at top, rgba(59,130,246,0.2), transparent 35%), rgba(15,23,42,0.55)",
    backdropFilter: "blur(10px)",
};
const shellStyles = {
    position: "relative",
    display: "grid",
    gap: 20,
    width: "min(100%, 860px)",
    maxHeight: "min(92vh, 920px)",
    overflowY: "auto",
    borderRadius: 32,
    padding: 24,
    background: "radial-gradient(circle at top left, rgba(96,165,250,0.18), transparent 26%), linear-gradient(180deg, rgba(248,250,252,0.98), rgba(255,255,255,0.98))",
    border: "1px solid rgba(255,255,255,0.55)",
    boxShadow: "0 30px 90px rgba(15, 23, 42, 0.24)",
};
const chromeStyles = {
    position: "sticky",
    top: 0,
    zIndex: 1,
    margin: "-24px -24px 0",
    padding: "24px 24px 0",
    background: "linear-gradient(180deg, rgba(248,250,252,0.96), rgba(248,250,252,0.92), rgba(248,250,252,0))",
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
    margin: 0,
    fontSize: 30,
    lineHeight: 1.1,
    fontWeight: 800,
    color: "#0f172a",
};
const descriptionStyles = {
    margin: 0,
    maxWidth: 620,
    fontSize: 14,
    lineHeight: 1.7,
    color: "#475569",
};
const heroStyles = {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    flexWrap: "wrap",
    alignItems: "flex-start",
};
const heroContentStyles = {
    display: "grid",
    gap: 10,
    flex: "1 1 400px",
};
const chromeAsideStyles = {
    display: "grid",
    gap: 12,
    justifyItems: "end",
};
const progressShellStyles = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 16px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.88)",
    border: "1px solid rgba(148, 163, 184, 0.24)",
    boxShadow: "0 14px 30px rgba(15, 23, 42, 0.08)",
};
const progressStepStyles = (active) => ({
    width: 34,
    height: 34,
    borderRadius: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 800,
    color: active ? "#ffffff" : "#64748b",
    background: active ? "linear-gradient(135deg, #0f3f8c, #3b82f6)" : "#e2e8f0",
    boxShadow: active ? "0 10px 24px rgba(37, 99, 235, 0.24)" : "none",
});
const progressLineStyles = (active) => ({
    width: 28,
    height: 2,
    borderRadius: 999,
    background: active ? "#3b82f6" : "#cbd5e1",
});
const closeButtonStyles = {
    minHeight: 38,
    borderRadius: 999,
    border: "1px solid rgba(148, 163, 184, 0.28)",
    padding: "0 14px",
    background: "rgba(255,255,255,0.88)",
    color: "#334155",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
};
const panelStyles = {
    display: "grid",
    gap: 18,
    padding: 22,
    borderRadius: 24,
    background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    boxShadow: "0 18px 50px rgba(15, 23, 42, 0.06)",
};
const connectButtonStyles = {
    minHeight: 48,
    border: "none",
    borderRadius: 14,
    background: "linear-gradient(135deg, #0f3f8c, #3b82f6)",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 700,
    padding: "0 18px",
    cursor: "pointer",
};
const stageHeaderStyles = {
    display: "grid",
    gap: 8,
};
const stageEyebrowStyles = {
    margin: 0,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#1d4ed8",
};
const stageTitleStyles = {
    margin: 0,
    fontSize: 24,
    lineHeight: 1.2,
    fontWeight: 800,
    color: "#0f172a",
};
const stageBodyStyles = {
    margin: 0,
    maxWidth: 620,
    fontSize: 14,
    lineHeight: 1.6,
    color: "#475569",
};
const connectPanelStyles = {
    display: "grid",
    gap: 16,
    padding: 20,
    borderRadius: 22,
    background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,245,249,0.82))",
    border: "1px solid rgba(148, 163, 184, 0.18)",
};
const connectPreviewStyles = {
    display: "grid",
    gap: 8,
    padding: 18,
    borderRadius: 18,
    background: "radial-gradient(circle at top right, rgba(96,165,250,0.2), transparent 45%), #eff6ff",
    border: "1px solid rgba(96, 165, 250, 0.18)",
};
const previewBadgeStyles = {
    width: "fit-content",
    margin: 0,
    borderRadius: 999,
    padding: "6px 10px",
    background: "rgba(255,255,255,0.8)",
    color: "#1d4ed8",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
};
const previewTitleStyles = {
    margin: 0,
    fontSize: 20,
    lineHeight: 1.2,
    fontWeight: 800,
    color: "#0f172a",
};
const previewBodyStyles = {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.6,
    color: "#475569",
};
const helperStyles = {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.6,
    color: "#64748b",
};
const successPanelStyles = {
    display: "grid",
    gap: 10,
    borderRadius: 20,
    padding: 22,
    border: "1px solid rgba(96, 165, 250, 0.28)",
    background: "linear-gradient(180deg, #eff6ff, #f8fbff)",
    boxShadow: "0 18px 50px rgba(37, 99, 235, 0.08)",
};
const successEyebrowStyles = {
    margin: 0,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#1d4ed8",
};
const successTitleStyles = {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    color: "#0f172a",
};
const successBodyStyles = {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.6,
    color: "#334155",
};
const summaryGridStyles = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginTop: 8,
};
const summaryCardStyles = {
    borderRadius: 16,
    padding: 14,
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
};
const summaryLabelStyles = {
    margin: 0,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#64748b",
};
const summaryValueStyles = {
    margin: "8px 0 0",
    fontSize: 14,
    lineHeight: 1.5,
    fontWeight: 700,
    color: "#0f172a",
    wordBreak: "break-word",
};
const actionsStyles = {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 6,
};
const actionPrimaryStyles = {
    minHeight: 44,
    border: "none",
    borderRadius: 14,
    padding: "0 18px",
    fontSize: 14,
    fontWeight: 700,
    color: "#ffffff",
    background: "linear-gradient(135deg, #0f3f8c, #3b82f6)",
    cursor: "pointer",
};
const actionSecondaryStyles = {
    minHeight: 44,
    borderRadius: 14,
    border: "1px solid rgba(59, 130, 246, 0.24)",
    padding: "0 18px",
    fontSize: 14,
    fontWeight: 700,
    color: "#1d4ed8",
    background: "rgba(255,255,255,0.9)",
    cursor: "pointer",
};
const errorStyles = {
    borderRadius: 14,
    border: "1px solid rgba(248, 113, 113, 0.28)",
    background: "#fef2f2",
    color: "#b91c1c",
    padding: "12px 14px",
    fontSize: 14,
};
//# sourceMappingURL=AuthFlow.js.map
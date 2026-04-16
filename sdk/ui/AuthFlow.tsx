import { useState, type CSSProperties, type ReactNode } from "react";

import {
  SDKClient,
  type AuthStatus,
  type AuthenticatedUser,
  type CompleteUserOnboardingInput,
} from "../client/SDKClient";
import { ConnectButton } from "./ConnectButton";
import { UserOnboardingFlow } from "./UserOnboardingFlow";

type AuthFlowStage = "connect" | "onboarding" | "complete";

export interface AuthFlowProps {
  client: SDKClient;
  triggerLabel?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  connectLabel?: ReactNode;
  defaultValues?: Partial<CompleteUserOnboardingInput>;
  onAuthenticated?: (user: AuthenticatedUser) => void;
  onOnboardingRequired?: (user: AuthenticatedUser) => void;
  onOnboardingSuccess?: (auth: AuthStatus) => void;
  onContinue?: (user: AuthenticatedUser | null) => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function AuthFlow({
  client,
  triggerLabel = "Open Auth Flow",
  title = "Connect and Continue",
  description = "Authenticate with your wallet. If the account is still a guest, the SDK automatically continues into onboarding.",
  connectLabel = "Connect Wallet",
  defaultValues,
  onAuthenticated,
  onOnboardingRequired,
  onOnboardingSuccess,
  onContinue,
  onClose,
  onError,
  className,
}: AuthFlowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stage, setStage] = useState<AuthFlowStage>("connect");
  const [authUser, setAuthUser] = useState<AuthenticatedUser | null>(null);
  const [flowError, setFlowError] = useState<string | null>(null);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleConnectSuccess = (user: AuthenticatedUser) => {
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

  const handleConnectError = (error: Error) => {
    setFlowError(error.message);
    onError?.(error);
  };

  const handleOnboardingSuccess = (auth: AuthStatus) => {
    setFlowError(null);
    setStage("complete");
    onOnboardingSuccess?.(auth);
  };

  const handleOnboardingError = (error: Error) => {
    setFlowError(error.message);
    onError?.(error);
  };

  const resolvedDefaultValues = {
    username: defaultValues?.username,
    email: defaultValues?.email,
  };

  return (
    <div className={className} style={hostStyles}>
      <button type="button" onClick={openModal} style={triggerStyles}>
        {triggerLabel}
      </button>

      {isOpen ? (
        <div style={overlayStyles}>
          <div style={backdropStyles} onClick={closeModal} />
          <section style={shellStyles}>
            <div style={chromeStyles}>
              <div style={heroStyles}>
                <div style={heroContentStyles}>
                  <p style={eyebrowStyles}>Permisyn Auth Flow</p>
                  <h2 style={titleStyles}>{title}</h2>
                  <p style={descriptionStyles}>{description}</p>
                </div>
                <div style={chromeAsideStyles}>
                  <div style={progressShellStyles}>
                    <div style={progressStepStyles(stage === "connect")}>1</div>
                    <div style={progressLineStyles(stage !== "connect")} />
                    <div style={progressStepStyles(stage === "onboarding")}>2</div>
                    <div style={progressLineStyles(stage === "complete")}>3</div>
                  </div>
                  <button type="button" onClick={closeModal} style={closeButtonStyles}>
                    Close
                  </button>
                </div>
              </div>
            </div>

            {stage === "connect" ? (
              <div style={panelStyles}>
                <div style={stageHeaderStyles}>
                  <p style={stageEyebrowStyles}>Step 1</p>
                  <h3 style={stageTitleStyles}>Verify wallet access</h3>
                  <p style={stageBodyStyles}>
                    Connect once to create the verified session. If the account is still a guest,
                    the flow moves directly into onboarding.
                  </p>
                </div>
                <div style={connectPanelStyles}>
                  <div style={connectPreviewStyles}>
                    <div style={previewBadgeStyles}>Wallet Sign-In</div>
                    <p style={previewTitleStyles}>Secure, session-first access</p>
                    <p style={previewBodyStyles}>
                      The SDK handles nonce fetch, signature verification, and the guest-to-user
                      transition in one modal journey.
                    </p>
                  </div>
                  <ConnectButton
                    client={client}
                    onSuccess={handleConnectSuccess}
                    onError={handleConnectError}
                    style={connectButtonStyles}
                  >
                    {connectLabel}
                  </ConnectButton>
                  <p style={helperStyles}>
                    Wallet verification completes first. Guest accounts then continue into profile
                    setup automatically.
                  </p>
                </div>
              </div>
            ) : null}

            {stage === "onboarding" ? (
              <div style={panelStyles}>
                <div style={stageHeaderStyles}>
                  <p style={stageEyebrowStyles}>Step 2</p>
                  <h3 style={stageTitleStyles}>Finish guest onboarding</h3>
                  <p style={stageBodyStyles}>
                    Add the basics we need to upgrade the authenticated guest session into a full
                    user account.
                  </p>
                </div>
                <UserOnboardingFlow
                  client={client}
                  defaultValues={resolvedDefaultValues}
                  onSuccess={handleOnboardingSuccess}
                  onError={handleOnboardingError}
                />
              </div>
            ) : null}

            {stage === "complete" ? (
              <div style={successPanelStyles}>
                <p style={successEyebrowStyles}>Authenticated</p>
                <h3 style={successTitleStyles}>Welcome {authUser?.user.username ?? "User"}</h3>
                <p style={successBodyStyles}>
                  Your wallet has been verified and your session is active. The SDK flow is
                  complete and the app can continue with a trusted session.
                </p>

                <div style={summaryGridStyles}>
                  <div style={summaryCardStyles}>
                    <p style={summaryLabelStyles}>Wallet</p>
                    <p style={summaryValueStyles}>
                      {authUser?.user.walletAddress ?? "Connected wallet"}
                    </p>
                  </div>
                  <div style={summaryCardStyles}>
                    <p style={summaryLabelStyles}>User ID</p>
                    <p style={summaryValueStyles}>{authUser?.user.id ?? "Pending"}</p>
                  </div>
                  <div style={summaryCardStyles}>
                    <p style={summaryLabelStyles}>Role</p>
                    <p style={summaryValueStyles}>{authUser?.user.role ?? "USER"}</p>
                  </div>
                </div>

                <div style={actionsStyles}>
                  <button
                    type="button"
                    onClick={() => {
                      onContinue?.(authUser);
                      closeModal();
                    }}
                    style={actionPrimaryStyles}
                  >
                    Continue to App
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (authUser?.user.walletAddress) {
                        navigator.clipboard.writeText(authUser.user.walletAddress);
                      }
                    }}
                    style={actionSecondaryStyles}
                  >
                    Copy Wallet
                  </button>
                </div>
              </div>
            ) : null}

            {flowError ? <div style={errorStyles}>{flowError}</div> : null}
          </section>
        </div>
      ) : null}
    </div>
  );
}

const hostStyles: CSSProperties = {
  display: "inline-flex",
};

const triggerStyles: CSSProperties = {
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

const overlayStyles: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
};

const backdropStyles: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(circle at top, rgba(59,130,246,0.2), transparent 35%), rgba(15,23,42,0.55)",
  backdropFilter: "blur(10px)",
};

const shellStyles: CSSProperties = {
  position: "relative",
  display: "grid",
  gap: 20,
  width: "min(100%, 860px)",
  maxHeight: "min(92vh, 920px)",
  overflowY: "auto",
  borderRadius: 32,
  padding: 24,
  background:
    "radial-gradient(circle at top left, rgba(96,165,250,0.18), transparent 26%), linear-gradient(180deg, rgba(248,250,252,0.98), rgba(255,255,255,0.98))",
  border: "1px solid rgba(255,255,255,0.55)",
  boxShadow: "0 30px 90px rgba(15, 23, 42, 0.24)",
};

const chromeStyles: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 1,
  margin: "-24px -24px 0",
  padding: "24px 24px 0",
  background:
    "linear-gradient(180deg, rgba(248,250,252,0.96), rgba(248,250,252,0.92), rgba(248,250,252,0))",
};

const eyebrowStyles: CSSProperties = {
  margin: 0,
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#2563eb",
};

const titleStyles: CSSProperties = {
  margin: 0,
  fontSize: 30,
  lineHeight: 1.1,
  fontWeight: 800,
  color: "#0f172a",
};

const descriptionStyles: CSSProperties = {
  margin: 0,
  maxWidth: 620,
  fontSize: 14,
  lineHeight: 1.7,
  color: "#475569",
};

const heroStyles: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  flexWrap: "wrap",
  alignItems: "flex-start",
};

const heroContentStyles: CSSProperties = {
  display: "grid",
  gap: 10,
  flex: "1 1 400px",
};

const chromeAsideStyles: CSSProperties = {
  display: "grid",
  gap: 12,
  justifyItems: "end",
};

const progressShellStyles: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "14px 16px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.88)",
  border: "1px solid rgba(148, 163, 184, 0.24)",
  boxShadow: "0 14px 30px rgba(15, 23, 42, 0.08)",
};

const progressStepStyles = (active: boolean): CSSProperties => ({
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

const progressLineStyles = (active: boolean): CSSProperties => ({
  width: 28,
  height: 2,
  borderRadius: 999,
  background: active ? "#3b82f6" : "#cbd5e1",
});

const closeButtonStyles: CSSProperties = {
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

const panelStyles: CSSProperties = {
  display: "grid",
  gap: 18,
  padding: 22,
  borderRadius: 24,
  background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))",
  border: "1px solid rgba(148, 163, 184, 0.2)",
  boxShadow: "0 18px 50px rgba(15, 23, 42, 0.06)",
};

const connectButtonStyles: CSSProperties = {
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

const stageHeaderStyles: CSSProperties = {
  display: "grid",
  gap: 8,
};

const stageEyebrowStyles: CSSProperties = {
  margin: 0,
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#1d4ed8",
};

const stageTitleStyles: CSSProperties = {
  margin: 0,
  fontSize: 24,
  lineHeight: 1.2,
  fontWeight: 800,
  color: "#0f172a",
};

const stageBodyStyles: CSSProperties = {
  margin: 0,
  maxWidth: 620,
  fontSize: 14,
  lineHeight: 1.6,
  color: "#475569",
};

const connectPanelStyles: CSSProperties = {
  display: "grid",
  gap: 16,
  padding: 20,
  borderRadius: 22,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,245,249,0.82))",
  border: "1px solid rgba(148, 163, 184, 0.18)",
};

const connectPreviewStyles: CSSProperties = {
  display: "grid",
  gap: 8,
  padding: 18,
  borderRadius: 18,
  background:
    "radial-gradient(circle at top right, rgba(96,165,250,0.2), transparent 45%), #eff6ff",
  border: "1px solid rgba(96, 165, 250, 0.18)",
};

const previewBadgeStyles: CSSProperties = {
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

const previewTitleStyles: CSSProperties = {
  margin: 0,
  fontSize: 20,
  lineHeight: 1.2,
  fontWeight: 800,
  color: "#0f172a",
};

const previewBodyStyles: CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.6,
  color: "#475569",
};

const helperStyles: CSSProperties = {
  margin: 0,
  fontSize: 13,
  lineHeight: 1.6,
  color: "#64748b",
};

const successPanelStyles: CSSProperties = {
  display: "grid",
  gap: 10,
  borderRadius: 20,
  padding: 22,
  border: "1px solid rgba(96, 165, 250, 0.28)",
  background: "linear-gradient(180deg, #eff6ff, #f8fbff)",
  boxShadow: "0 18px 50px rgba(37, 99, 235, 0.08)",
};

const successEyebrowStyles: CSSProperties = {
  margin: 0,
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#1d4ed8",
};

const successTitleStyles: CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 800,
  color: "#0f172a",
};

const successBodyStyles: CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.6,
  color: "#334155",
};

const summaryGridStyles: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
  marginTop: 8,
};

const summaryCardStyles: CSSProperties = {
  borderRadius: 16,
  padding: 14,
  background: "rgba(255,255,255,0.82)",
  border: "1px solid rgba(148, 163, 184, 0.18)",
};

const summaryLabelStyles: CSSProperties = {
  margin: 0,
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#64748b",
};

const summaryValueStyles: CSSProperties = {
  margin: "8px 0 0",
  fontSize: 14,
  lineHeight: 1.5,
  fontWeight: 700,
  color: "#0f172a",
  wordBreak: "break-word",
};

const actionsStyles: CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  marginTop: 6,
};

const actionPrimaryStyles: CSSProperties = {
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

const actionSecondaryStyles: CSSProperties = {
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

const errorStyles: CSSProperties = {
  borderRadius: 14,
  border: "1px solid rgba(248, 113, 113, 0.28)",
  background: "#fef2f2",
  color: "#b91c1c",
  padding: "12px 14px",
  fontSize: 14,
};

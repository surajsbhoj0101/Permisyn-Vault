import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import type { AuthResponse, SetRoleRequest } from "../../../shared/auth/type";
import { useAuth } from "../contexts/AuthContext";
import {
  ArrowRight,
  Building2,
  CircleUserRound,
  ShieldCheck,
} from "lucide-react";
import type { Role } from "../../../shared/role/type";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const OTP_EXPIRATION_TIME = 300;

type OnboardingFormState = {
  username: string;
  companyName: string;
  email: string;
  role: Role | null;
};

const getRedirectPathByRole = (currentRole: Role | null | undefined) => {
  if (currentRole === "DEVELOPER") return "/developer/overview";
  return "/user/overview";
};

function Onboarding() {
  const navigate = useNavigate();
  const { isAuthorized, role, setAuthState } = useAuth();

  useEffect(() => {
    if (isAuthorized && role !== "GUEST") {
      const normalizedRole =
        role === "DEVELOPER" || role === "USER" || role === "GUEST"
          ? role
          : null;
      navigate(getRedirectPathByRole(normalizedRole));
    }
  }, [isAuthorized, role, navigate]);

  const [form, setForm] = useState<OnboardingFormState>({
    username: "",
    companyName: "",
    email: "",
    role: "USER",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);
  const [emailTaken, setEmailTaken] = useState(false);
  const [otpTimeLeft, setOtpTimeLeft] = useState(0);

  useEffect(() => {
    if (otpTimeLeft <= 0) return;

    const timer = setInterval(() => {
      setOtpTimeLeft((prev) => {
        if (prev <= 1) {
          setOtpSent(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [otpTimeLeft]);

  const canSubmit = useMemo(() => {
    if (!form.role) return false;
    if (!form.username.trim()) return false;
    if (!form.email.trim()) return false;
    if (emailTaken) return false;
    if (form.role === "DEVELOPER" && !form.companyName.trim()) return false;
    return true;
  }, [form, emailTaken]);

  const canGoToOtpStep = canSubmit && !emailTaken;

  const checkEmailAvailability = async (emailToCheck: string) => {
    const normalizedEmail = emailToCheck.trim().toLowerCase();
    if (!normalizedEmail) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/auth/check-email/${encodeURIComponent(normalizedEmail)}`,
      );
      setEmailTaken(response.data.isTaken);
      if (response.data.isTaken) {
        setError("Email is already in use");
      } else {
        setError(null);
      }
    } catch (caughtError) {
      console.error("Failed to check email:", caughtError);
      setEmailTaken(false);
    }
  };

  const requestOtp = async () => {
    if (!form.email.trim()) {
      setError("Enter email before requesting OTP");
      return;
    }

    setIsSendingOtp(true);
    setError(null);
    setOtpNotice(null);

    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/request-otp`,
        { email: form.email.trim() },
        { withCredentials: true },
      );
      setOtpSent(true);
      setOtpVerified(false);
      setOtpTimeLeft(OTP_EXPIRATION_TIME);
      setOtpNotice(`OTP sent to ${form.email.trim()}`);
    } catch (caughtError) {
      const apiError = caughtError as AxiosError<{ error?: string }>;
      setError(apiError.response?.data?.error || "Failed to request OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpSent) {
      setError("Request OTP first");
      return;
    }

    if (otpCode.trim().length !== 6) {
      setError("Enter a valid 6-digit OTP");
      return;
    }

    setIsVerifyingOtp(true);
    setError(null);
    setOtpNotice(null);

    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/verify-otp`,
        {
          email: form.email.trim(),
          otp: otpCode.trim(),
        },
        { withCredentials: true },
      );
      setOtpVerified(true);
      setOtpNotice("OTP verified successfully. Completing onboarding...");
      await submitOnboarding();
    } catch (caughtError) {
      const apiError = caughtError as AxiosError<{ error?: string }>;
      setError(apiError.response?.data?.error || "Failed to verify OTP");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleUsernameChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setForm({ ...form, username: e.target.value });

    try {
      const usernameToCheck = e.target.value.trim();
      if (!usernameToCheck) return;

      const response = await axios.get<{ isTaken: boolean }>(
        `${API_BASE_URL}/api/auth/check-username/${encodeURIComponent(usernameToCheck)}`,
        { withCredentials: true },
      );

      if (response.data.isTaken) {
        setError("Username is already taken");
      } else {
        setError(null);
      }
    } catch (caughtError) {
      console.error("Error checking username availability:", caughtError);
    }
  };

  const submitOnboarding = async () => {
    if (!canSubmit || !form.role) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/api/auth/set-role`,
        {
          username: form.username.trim(),
          companyName:
            form.role === "DEVELOPER" ? form.companyName.trim() : null,
          email: form.email.trim(),
          role: form.role,
        } satisfies SetRoleRequest,
        { withCredentials: true },
      );

      setAuthState(
        response.data.isAuthorized,
        response.data.role,
        response.data.userId,
        response.data.username,
      );
      navigate(getRedirectPathByRole(response.data.role));
    } catch (caughtError) {
      const apiError = caughtError as AxiosError<{ error?: string }>;
      setError(apiError.response?.data?.error || "Unable to save onboarding");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {isAuthorized ? (
        <main className="saas-shell relative overflow-hidden px-4 py-10 md:py-14">
          <div className="relative mx-auto max-w-4xl">
            <section className="saas-card rounded-3xl p-6 sm:p-8 md:p-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p
                  className="neo-pill px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
                  style={{ color: "var(--muted)" }}
                >
                  Account Setup
                </p>
                <p
                  className="neo-pill inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold"
                  style={{ color: "var(--brand)" }}
                >
                  <span className="neo-dot" />
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure wallet session
                </p>
              </div>

              <h1 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
                Configure your workspace,
                <span className="block bg-[linear-gradient(120deg,#11357f,#1f4eb3,#2f5ec4)] bg-clip-text text-transparent">
                  then unlock operations.
                </span>
              </h1>

              <p
                className="mt-4 max-w-2xl text-sm sm:text-base"
                style={{ color: "var(--muted)" }}
              >
                Complete profile details and verify email with OTP. This keeps
                role intent explicit and audit-friendly from day one.
              </p>

              <div className="mt-5 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[rgba(126,163,232,0.22)]">
                  <div
                    className={`h-full rounded-full bg-[linear-gradient(120deg,#5f95f4,#80b2ff)] transition-all duration-500 ${
                      step === 1 ? "w-1/2" : "w-full"
                    }`}
                  />
                </div>
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "var(--muted)" }}
                >
                  Step {step} / 2
                </span>
              </div>

              {step === 1 ? (
                <>
                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, role: "USER" }))
                      }
                      className={`rounded-2xl border p-4 text-left transition ${
                        form.role === "USER"
                          ? "border-[rgba(178,205,255,0.42)] bg-(--brand-soft)"
                          : "neo-surface"
                      }`}
                      style={
                        form.role !== "USER"
                          ? { borderColor: "var(--border)" }
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-2">
                        <CircleUserRound
                          className="h-5 w-5"
                          style={{ color: "var(--text)" }}
                        />
                        <p className="font-semibold">User</p>
                      </div>
                      <p
                        className="mt-1 text-sm"
                        style={{ color: "var(--muted)" }}
                      >
                        Vault data owner
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, role: "DEVELOPER" }))
                      }
                      className={`rounded-2xl border p-4 text-left transition ${
                        form.role === "DEVELOPER"
                          ? "border-[rgba(178,205,255,0.42)] bg-(--brand-soft)"
                          : "neo-surface"
                      }`}
                      style={
                        form.role !== "DEVELOPER"
                          ? { borderColor: "var(--border)" }
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-2">
                        <Building2
                          className="h-5 w-5"
                          style={{ color: "var(--text)" }}
                        />
                        <p className="font-semibold">Developer</p>
                      </div>
                      <p
                        className="mt-1 text-sm"
                        style={{ color: "var(--muted)" }}
                      >
                        Requests access to data
                      </p>
                    </button>
                  </div>

                  <div className="neo-surface mt-6 p-4 sm:p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          className="mb-1.5 block text-sm font-medium"
                          style={{ color: "var(--text)" }}
                        >
                          Username
                        </label>
                        <div className="neo-inset flex w-full items-center transition focus-within:border-[rgba(174,203,255,0.6)]">
                          <span
                            className="pl-3 text-sm font-semibold"
                            style={{ color: "var(--muted)" }}
                          >
                            @
                          </span>
                          <input
                            value={form.username}
                            onChange={handleUsernameChange}
                            className="w-full rounded-xl bg-transparent px-1 py-2.5 pr-3 text-sm outline-none"
                            style={{ color: "var(--text)" }}
                            placeholder="username"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          className="mb-1.5 block text-sm font-medium"
                          style={{ color: "var(--text)" }}
                        >
                          Email
                        </label>
                        <input
                          value={form.email}
                          onChange={(e) => {
                            setForm((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }));
                            if (e.target.value.trim()) {
                              checkEmailAvailability(e.target.value);
                            }
                          }}
                          className="saas-input"
                          placeholder="Enter email"
                        />
                      </div>
                    </div>

                    {form.role === "DEVELOPER" ? (
                      <div className="mt-4">
                        <label
                          className="mb-1.5 block text-sm font-medium"
                          style={{ color: "var(--text)" }}
                        >
                          Company name
                        </label>
                        <input
                          value={form.companyName}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              companyName: e.target.value,
                            }))
                          }
                          className="saas-input"
                          placeholder="Enter company name"
                        />
                      </div>
                    ) : null}

                    <p
                      className="mt-4 text-xs"
                      style={{ color: "var(--muted)" }}
                    >
                      Your username is public. Your email is used for
                      notifications.
                    </p>
                  </div>
                </>
              ) : (
                <div className="neo-surface mt-7 p-4 sm:p-5">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    Verify email with OTP
                  </p>
                  <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                    We will verify your account using a one-time password sent
                    to
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text)" }}
                    >
                      {" "}
                      {form.email}
                    </span>
                    .
                  </p>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={requestOtp}
                      disabled={isSendingOtp || otpTimeLeft > 0}
                      className="saas-btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSendingOtp
                        ? "Sending OTP..."
                        : otpTimeLeft > 0
                          ? `Resend in ${otpTimeLeft}s`
                          : otpSent
                            ? "Resend OTP"
                            : "Request OTP"}
                    </button>
                    {otpVerified ? (
                      <span
                        className="neo-pill inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold"
                        style={{ color: "var(--brand)" }}
                      >
                        <span className="neo-dot" />
                        OTP Verified
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      value={otpCode}
                      onChange={(e) =>
                        setOtpCode(
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      className="saas-input w-full tracking-[0.25em] sm:w-56"
                      placeholder="000000"
                      inputMode="numeric"
                    />
                    <button
                      type="button"
                      onClick={verifyOtp}
                      disabled={isVerifyingOtp || !otpSent}
                      className="saas-btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isVerifyingOtp
                        ? "Verifying..."
                        : !otpSent
                          ? "Request OTP first"
                          : "Verify OTP"}
                    </button>
                  </div>

                  <p className="mt-3 text-xs" style={{ color: "var(--muted)" }}>
                    Use the 6-digit code from your email inbox. OTP expires in 5
                    minutes.
                  </p>
                </div>
              )}

              {error ? (
                <p
                  className="mt-4 rounded-xl border px-3 py-2 text-sm"
                  style={{
                    borderColor: "rgba(255,150,170,0.4)",
                    background: "var(--danger-soft)",
                    color: "#ffd9e2",
                  }}
                >
                  {error}
                </p>
              ) : null}

              {otpNotice ? (
                <p
                  className="mt-4 rounded-xl border px-3 py-2 text-sm"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--brand-soft)",
                    color: "var(--text)",
                  }}
                >
                  {otpNotice}
                </p>
              ) : null}

              <div
                className="mt-6 flex flex-wrap gap-4"
                style={{ color: "var(--muted)" }}
              >
                <p className="inline-flex items-center gap-2">
                  <ShieldCheck
                    className="h-4 w-4"
                    style={{ color: "var(--brand)" }}
                  />
                  Fast role onboarding
                </p>
                <p className="inline-flex items-center gap-2">
                  <ShieldCheck
                    className="h-4 w-4"
                    style={{ color: "var(--brand)" }}
                  />
                  Wallet-first verification
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  You can update this information later in settings.
                </p>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  {step === 2 ? (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="saas-btn-secondary inline-flex w-full items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition sm:w-auto"
                    >
                      Back
                    </button>
                  ) : null}

                  {step === 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!canGoToOtpStep) {
                          setError(
                            "Complete profile details before continuing",
                          );
                          return;
                        }
                        setError(null);
                        setStep(2);
                      }}
                      className="saas-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition sm:w-auto"
                    >
                      Continue to OTP
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={submitOnboarding}
                      disabled={!canSubmit || !otpVerified || isSaving}
                      className="saas-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {isSaving ? "Saving..." : "Complete Onboarding"}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>
      ) : (
        <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
          <div className="saas-card rounded-3xl p-6 sm:p-8">
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
              Connect wallet first
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
              You need a valid wallet session before onboarding.
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="saas-btn-primary mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold transition"
            >
              Go Home
            </button>
          </div>
        </main>
      )}
    </>
  );
}

export default Onboarding;

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
const OTP_EXPIRATION_TIME = 300; // 5 minutes in seconds, must match Redis expiration

type OnboardingFormState = {
  username: string;
  companyName: string;
  email: string;
  role: Role | null;
};

function Onboarding() {
  const navigate = useNavigate();
  const { isAuthorized, setAuthState } = useAuth();

  useEffect(() => {
    console.log("Onboarding: Checking authorization status...", {
      isAuthorized,
    });
  }, [isAuthorized, navigate]);

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

  // OTP countdown timer effect
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
      setOtpNotice("OTP verified successfully");
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
    } catch (error) {
      console.error("Error checking username availability:", error);
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
      );
      navigate("/");
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
        <main className="relative overflow-hidden bg-slate-50 px-4 py-10 md:py-14">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-teal-200/55 blur-3xl" />
            <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-3xl rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-xl shadow-slate-200/70 backdrop-blur sm:p-8 md:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="rounded-full border border-teal-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
                Consent Infrastructure for Web3 SaaS
              </p>
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure wallet session
              </p>
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
              Trust-Centered Access,
              <span className="block bg-linear-to-r from-teal-700 to-cyan-600 bg-clip-text text-transparent">
                Built for Product Teams.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
              Complete onboarding by selecting account type and profile details.
              This keeps ownership and access intent explicit from day one.
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
              Step {step} of 2
            </p>

            {step === 1 ? (
              <>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, role: "USER" }))
                    }
                    className={`group rounded-2xl border p-4 text-left transition ${
                      form.role === "USER"
                        ? "border-teal-500 bg-teal-50 shadow-sm"
                        : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CircleUserRound className="h-5 w-5 text-slate-700 group-hover:text-slate-900" />
                      <p className="font-semibold text-slate-900">User</p>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      Vault data owner
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, role: "DEVELOPER" }))
                    }
                    className={`group rounded-2xl border p-4 text-left transition ${
                      form.role === "DEVELOPER"
                        ? "border-teal-500 bg-teal-50 shadow-sm"
                        : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-slate-700 group-hover:text-slate-900" />
                      <p className="font-semibold text-slate-900">Developer</p>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      Requests access to data
                    </p>
                  </button>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/55 p-4 sm:p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Username
                      </label>
                      <div className="flex w-full items-center rounded-xl border border-slate-300 bg-white transition focus-within:border-teal-500">
                        <span className="pl-3 text-sm font-semibold text-slate-500">
                          @
                        </span>
                        <input
                          value={form.username}
                          onChange={handleUsernameChange}
                          className="w-full rounded-xl bg-transparent px-1 py-2.5 pr-3 text-sm text-slate-900 outline-none"
                          placeholder="username"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
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
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500"
                        placeholder="Enter email"
                      />
                    </div>
                  </div>

                  {form.role === "DEVELOPER" ? (
                    <div className="mt-4">
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
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
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500"
                        placeholder="Enter company name"
                      />
                    </div>
                  ) : null}
                  <p className="mt-4 text-xs text-slate-500">
                    Your username is public. Your email is used for
                    notifications.
                  </p>
                </div>
              </>
            ) : (
              <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                <p className="text-sm font-semibold text-slate-900">
                  Verify email with OTP
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  We will verify your account using a one-time password sent to
                  <span className="font-semibold text-slate-800">
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
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
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
                    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      OTP Verified
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    value={otpCode}
                    onChange={(e) =>
                      setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm tracking-[0.25em] text-slate-900 outline-none transition focus:border-teal-500 sm:w-56"
                    placeholder="000000"
                    inputMode="numeric"
                  />
                  <button
                    type="button"
                    onClick={verifyOtp}
                    disabled={isVerifyingOtp || !otpSent}
                    className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isVerifyingOtp
                      ? "Verifying..."
                      : !otpSent
                        ? "Request OTP first"
                        : "Verify OTP"}
                  </button>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Use the 6-digit code from your email inbox. OTP expires in 5
                  minutes.
                </p>
              </div>
            )}

            {error ? (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            {otpNotice ? (
              <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {otpNotice}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">
              <p className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Fast role onboarding
              </p>
              <p className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Wallet-first verification
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                You can update this information later in settings.
              </p>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                {step === 2 ? (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:w-auto"
                  >
                    Back
                  </button>
                ) : null}

                {step === 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!canGoToOtpStep) {
                        setError("Complete profile details before continuing");
                        return;
                      }
                      setError(null);
                      setStep(2);
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-teal-700 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-100 transition hover:from-teal-800 hover:to-cyan-700 sm:w-auto"
                  >
                    Continue to OTP
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={submitOnboarding}
                    disabled={!canSubmit || !otpVerified || isSaving}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-teal-700 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-100 transition hover:from-teal-800 hover:to-cyan-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {isSaving ? "Saving..." : "Complete Onboarding"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      ) : (
        <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-2xl font-bold text-slate-900">
              Connect wallet first
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              You need a valid wallet session before onboarding.
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-5 rounded-xl bg-linear-to-r from-teal-700 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-100 transition hover:from-teal-800 hover:to-cyan-700"
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

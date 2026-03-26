import { useAccount, useChainId, useSignMessage, useWalletClient } from "wagmi";
import { SiweMessage } from "siwe";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserProvider } from "ethers";
import type { AuthResponse, nonceResponse } from "../../../shared/auth/type";
import axios from "axios";
import type { AxiosError } from "axios";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

type LoginProps = {
  setLoadingUser: (isLoading: boolean) => void;
  setNotice: (message: string | null) => void;
  setRedNotice: (message: string | null) => void;
};

const Login = ({ setLoadingUser, setNotice, setRedNotice }: LoginProps) => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const { signMessageAsync } = useSignMessage();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSelectingRole, setIsSelectingRole] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const { setAuthState } = useAuth();

  const pushNotice = (message: string) => {
    setNotice(message);
    setRedNotice(null);
  };

  const pushRedNotice = (message: string) => {
    setRedNotice(message);
    setNotice(null);
  };

  useEffect(() => {
    if (!isConnected || !address) return;
    checkAuth();
  }, [address, isConnected]);

  const redirectByRole = (role: string) => {
    if (role === "admin") {
      navigate("/");
      return;
    }

    navigate("/");
  };

  async function getSigner() {
    let signer;
    if (walletClient) {
      const provider = new BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
    }
    return signer;
  }

  const checkAuth = async () => {
    try {
      setLoadingUser(true);

      const jwtRes = await axios.get<AuthResponse>(
        `${API_BASE_URL}/api/auth/is-authorized`,
        { withCredentials: true },
      );

      const { isAuthorized, role, userId } = jwtRes.data;

      if (!isAuthorized) {
        await handleSiwe();
        return;
      }

      if (!role) {
        setIsSelectingRole(true);
        setModalStep(1);
        pushNotice("Please complete your profile details");
        return;
      }

      setAuthState(isAuthorized, role, userId);
      pushNotice("Login successful");

      redirectByRole(role);
    } catch (err) {
      console.log("Not authorized, need to sign in", err);
      pushNotice("Please sign the message to continue");
      await handleSiwe();
    } finally {
      setLoadingUser(false);
    }
  };

  const handleSiwe = async () => {
    try {
      const nonceRes = await axios.get<nonceResponse>(
        `${API_BASE_URL}/api/auth/get-nonce`,
        {
          withCredentials: true,
        },
      );

      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement:
          "Welcome to Permisyn Vault! Sign in to manage your permissions.",
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce: nonceRes.data.nonce,
      });

      await getSigner();
      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });

      await axios.post(
        `${API_BASE_URL}/api/auth/verify`,
        { message, signature },
        { withCredentials: true },
      );
      pushNotice("Wallet verified successfully");
      await checkAuth();
    } catch (error) {
      const apiError = error as AxiosError<{ error?: string }>;
      const message =
        apiError.response?.data?.error ||
        "Wallet sign-in failed. Please try again.";
      setError(message);
      pushRedNotice(message);
    }
  };

  const handleRoleModalSubmit = async () => {
    if (!fullName.trim()) {
      pushRedNotice("Please enter full name");
      return;
    }

    if (!selectedRole) {
      pushRedNotice("Please choose a role to continue");
      return;
    }

    try {
      setLoadingUser(true);
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/api/auth/set-role`,
        {
          fullName: fullName.trim(),
          companyName: companyName.trim() || null,
          role: selectedRole,
        },
        { withCredentials: true },
      );

      setAuthState(
        response.data.isAuthorized,
        response.data.role,
        response.data.userId,
      );
      setIsSelectingRole(false);
      setModalStep(1);
      pushNotice("Profile details saved");

      if (response.data.role) {
        redirectByRole(response.data.role);
      }
    } catch {
      pushRedNotice("Failed to save profile details");
    } finally {
      setLoadingUser(false);
    }
  };

  const canGoNext = fullName.trim().length > 0;

  return (
    <>
      {isSelectingRole ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900">
              Complete Your Profile
            </h2>
            <p className="mt-1 text-sm text-slate-600">Step {modalStep} of 2</p>

            {modalStep === 1 ? (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Company (optional)
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                    placeholder="Enter your company"
                  />
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                <p className="text-sm font-medium text-slate-700">
                  Select your role
                </p>
                {["admin", "manager", "viewer"].map((roleOption) => (
                  <button
                    key={roleOption}
                    type="button"
                    onClick={() => setSelectedRole(roleOption)}
                    className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${
                      selectedRole === roleOption
                        ? "border-sky-500 bg-sky-50 text-sky-700"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setModalStep((prev) => Math.max(1, prev - 1))}
                disabled={modalStep === 1}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>

              {modalStep === 1 ? (
                <button
                  type="button"
                  onClick={() => setModalStep(2)}
                  disabled={!canGoNext}
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRoleModalSubmit}
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Save & Continue
                </button>
              )}
            </div>

            {error ? (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Login;

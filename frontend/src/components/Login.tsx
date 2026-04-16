import { useAccount, useChainId, useSignMessage, useWalletClient } from "wagmi";
import { SiweMessage } from "siwe";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserProvider } from "ethers";
import type { AuthResponse, NonceResponse } from "../../../shared/auth/type";
import axios from "axios";
import type { AxiosError } from "axios";
import { useAuth } from "../contexts/AuthContext";
import type { Role } from "../../../shared/role/type";

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

  const redirectByRole = (role: Role) => {
    console.log("User role:", role);
    if (role === "DEVELOPER") {
      navigate("/developer/overview");
      return;
    }
    navigate("/user/overview");
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

      const { isAuthorized, role, userId, username } = jwtRes.data;

      if (!isAuthorized) {
        await handleSiwe();
        return;
      }

      if (role === "GUEST") {
        setAuthState(isAuthorized, "GUEST", userId, username);
        pushNotice("Please complete onboarding");
        navigate("/onboarding");
        return;
      }

      if (!role) {
        throw new Error("User role is missing");
      }

      setAuthState(isAuthorized, role, userId, username);
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
      const nonceRes = await axios.get<NonceResponse>(
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

  return error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null;
};

export default Login;

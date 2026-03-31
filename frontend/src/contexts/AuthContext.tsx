import { useContext, createContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import type { ReactNode } from "react";
import { useAccount, useDisconnect } from "wagmi";
import type { AuthResponse } from "../../../shared/auth/type";

type AuthContextValue = {
  isAuthorized: boolean;
  role: string | null;
  userId: string | null;
  setAuthState: (
    isAuthorized: boolean,
    role?: string | null,
    userId?: string | null,
  ) => void;
  clearAuthState: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

type Props = {
  children: ReactNode; //ReactNode support string | number | JSX | null | array | etc.
};

export const AuthProvider = ({ children }: Props) => {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const setAuthState = (
    isAuthorized: boolean,
    role: string | null = null,
    userId: string | null = null,
  ) => {
    setIsAuthorized(isAuthorized);
    setRole(role);
    setUserId(userId);
  };

  const clearAuthState = () => {
    disconnect();
    setIsAuthorized(false);
    setRole(null);
    setUserId(null);
  };

  useEffect(() => {
    let isActive = true;
    if (!isConnected) {
      clearAuthState();
      return;
    }
    const checkAuth = async () => {
      try {
        const response = await axios.get<AuthResponse>(
          `${API_BASE_URL}/api/auth/is-authorized`,
          { withCredentials: true },
        );
        if (!isActive) return;
        console.log("Auth status:", response.data);

        setAuthState(
          response.data.isAuthorized,
          response.data.role,
          response.data.userId,
        );
      } catch (error) {
        console.error("Error checking auth status:", error);
        clearAuthState();
      }
    };
    if (isConnected) {
      checkAuth();
    }

    return () => {
      isActive = false;
    };
  }, [isConnected]);

  const value = useMemo(
    () => ({
      isAuthorized,
      role,
      userId,
      setAuthState,
      clearAuthState,
    }),
    [isAuthorized, role, userId, isConnected],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};

export default AuthProvider;

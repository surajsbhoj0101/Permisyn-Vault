import { useContext, createContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import type { ReactNode } from "react";
import { useAccount } from "wagmi";
import { SiweMessage } from "siwe";
import type { AuthResponse } from "../../../shared/auth/type";

const AuthContext = createContext(null);
const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

type Props = {
  children: ReactNode; //ReactNode support string | number | JSX | null | array | etc.
};

const AuthProvider = ({ children }: Props) => {
  const { isConnected } = useAccount();
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

        setAuthState(
          response.data.isAuthorized,
          response.data.role,
          response.data.userId,
        );
      } catch (error) {
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
    [isAuthorized, role, userId],
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

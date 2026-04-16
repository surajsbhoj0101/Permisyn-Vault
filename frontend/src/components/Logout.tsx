import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export function Logout() {
  const { clearAuthState } = useAuth();

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthState();
      window.location.assign("/");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="saas-btn-secondary rounded-xl px-3 py-2 text-sm font-semibold transition"
    >
      Logout
    </button>
  );
}

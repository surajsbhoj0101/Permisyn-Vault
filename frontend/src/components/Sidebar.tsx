import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Shield,
  Lock,
  BarChart3,
  Settings,
  ChevronDown,
} from "lucide-react";
import { Logout } from "./Logout";

const developerMenu = [
  { label: "Overview", icon: Home, path: "/developer/overview" },
  { label: "Manage Apps", icon: Shield, path: "/developer/manage-apps" },
  { label: "Sessions", icon: Lock, path: "/developer/sessions" },
  { label: "Access Logs", icon: BarChart3, path: "/developer/access-logs" },
  { label: "Settings", icon: Settings, path: "/developer/settings" },
];

const userMenu = [
  { label: "My Sessions", icon: Lock, path: "/user/sessions" },
  { label: "Access Logs", icon: BarChart3, path: "/user/access-logs" },
  { label: "Settings", icon: Settings, path: "/user/settings" },
];

function Sidebar() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedProfile, setExpandedProfile] = useState(false);
  const { role, username, userId, isAuthorized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = role === "DEVELOPER" ? developerMenu : userMenu;
  const displayName = username ? `@${username}` : `user-${userId?.slice(0, 8)}`;

  useEffect(() => {
    const idx = navItems.findIndex((item) => item.path === location.pathname);
    if (idx !== -1) {
      setActiveIndex(idx);
    }
  }, [location.pathname, navItems]);

  return (
    <aside
      className="sticky top-0 h-screen overflow-y-auto border-r bg-linear-to-b from-white via-white to-slate-50 px-4 py-6"
      style={{ borderColor: "var(--border)" }}
    >
      <div
        className="mb-8 space-y-2 border-b pb-6"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="px-2">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.08em] text-slate-700">
            Permisyn Vault
          </h2>
          <p
            className="text-xs uppercase tracking-[0.08em]"
            style={{ color: "var(--muted)" }}
          >
            Developer Workspace
          </p>
        </div>
      </div>

      <nav className="space-y-2 pb-32">
        {navItems.map((item, idx) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`group flex hover:cursor-pointer w-full items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-left text-base font-semibold transition-all duration-200 hover:bg-blue-50 hover:shadow-md hover:scale-105 active:scale-95 border-l-4 ${
              activeIndex === idx
                ? "bg-blue-100 text-blue-600 border-blue-600"
                : "border-transparent"
            }`}
            style={activeIndex === idx ? {} : { color: "var(--text)" }}
          >
            <span className="flex items-center gap-3">
              <item.icon className="h-5 w-5 transition-all duration-200 group-hover:scale-110 group-hover:text-blue-600" />
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div
        className="fixed bottom-0 left-0 w-[20%] border-t bg-white p-4"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          type="button"
          onClick={() => setExpandedProfile((prev) => !prev)}
          className="saas-card w-full rounded-2xl p-4 transition-all duration-200 hover:shadow-lg hover:bg-blue-50"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col items-start text-left">
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text)" }}
              >
                {displayName}
              </p>
              <p
                className="text-xs uppercase tracking-wide"
                style={{ color: "var(--muted)" }}
              >
                {role || "UNASSIGNED"}
              </p>
            </div>
            <ChevronDown
              className={`h-5 w-5 transition-all duration-300 ${
                expandedProfile ? "rotate-180" : ""
              }`}
              style={{ color: "var(--muted)" }}
            />
          </div>

          {expandedProfile ? (
            <div
              className="mt-3 border-t pt-3"
              style={{ borderColor: "var(--border)" }}
            >
              {isAuthorized ? (
                <Logout />
              ) : (
                <p className="text-xs text-red-600">Not logged in</p>
              )}
            </div>
          ) : null}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

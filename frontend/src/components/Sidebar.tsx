import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Shield,
  Clock3,
  BarChart3,
  Settings,
  ChevronDown,
  Database,
} from "lucide-react";
import PermisynLogo from "./PermisynLogo";
import { Logout } from "./Logout";

const developerMenu = [
  { label: "Overview", icon: Home, path: "/developer/overview" },
  { label: "Manage Apps", icon: Shield, path: "/developer/manage-apps" },
  { label: "Access Logs", icon: BarChart3, path: "/developer/access-logs" },
];

const userMenu = [
  { label: "Overview", icon: Home, path: "/user/overview" },
  { label: "Add Record", icon: Database, path: "/user/add-record" },
  { label: "Sessions", icon: Clock3, path: "/user/sessions" },
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
      className="saas-scrollbar sticky top-0 h-screen overflow-y-auto border-r bg-[rgba(8,16,39,0.42)] px-4 py-6 backdrop-blur-xl"
      style={{ borderColor: "var(--border)" }}
    >
      <div
        className="mb-8 space-y-2 border-b pb-6"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3 px-2">
          <PermisynLogo />
          <div>
            <h2
              className="text-sm font-extrabold uppercase tracking-[0.08em]"
              style={{ color: "var(--text)" }}
            >
              Permisyn Vault
            </h2>
            <p
              className="text-xs uppercase tracking-[0.08em]"
              style={{ color: "var(--muted)" }}
            >
              {role === "DEVELOPER" ? "Developer Workspace" : "User Workspace"}
            </p>
          </div>
        </div>
      </div>

      <nav className="space-y-2 pb-32">
        <p
          className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: "var(--muted)" }}
        >
          Navigation
        </p>
        {navItems.map((item, idx) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`group flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition hover:cursor-pointer ${
              activeIndex === idx
                ? "border-[rgba(163,201,255,0.56)] bg-[linear-gradient(145deg,rgba(219,236,255,0.24),rgba(171,209,255,0.2))] text-(--text) shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_12px_24px_rgba(7,17,38,0.28)]"
                : "border-[rgba(141,174,238,0.24)] bg-[linear-gradient(145deg,rgba(221,235,255,0.09),rgba(177,210,255,0.08))] shadow-[0_10px_20px_rgba(4,12,30,0.2)] hover:border-[rgba(173,205,255,0.46)]"
            }`}
            style={activeIndex === idx ? {} : { color: "var(--text)" }}
          >
            <span className="flex items-center gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg neo-inset">
                <item.icon className="h-4 w-4" />
              </span>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div
        className="sticky bottom-0 border-t bg-[rgba(7,17,40,0.36)] p-2 backdrop-blur-lg"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          type="button"
          onClick={() => setExpandedProfile((prev) => !prev)}
          className="saas-card w-full rounded-2xl p-4"
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

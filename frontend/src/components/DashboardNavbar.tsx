import { useMemo, useState } from "react";
import { Bell, Search, UserCircle2, ChevronDown, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Logout } from "./Logout";

interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: "info" | "warning" | "error" | "success";
}

const initialAlerts: Notification[] = [
  {
    id: "1",
    message: "New role request submitted",
    timestamp: new Date(),
    read: false,
    type: "info",
  },
  {
    id: "2",
    message: "Two OTP retries from same IP",
    timestamp: new Date(Date.now() - 5 * 60000),
    read: false,
    type: "warning",
  },
  {
    id: "3",
    message: "Policy sync completed",
    timestamp: new Date(Date.now() - 15 * 60000),
    read: false,
    type: "success",
  },
];

const formatRole = (role: string | null) => {
  if (!role) return "UNASSIGNED";
  return role.replace(/_/g, " ");
};

const getTimeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

function DashboardNavbar() {
  const [searchText, setSearchText] = useState("");
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [notifications, setNotifications] =
    useState<Notification[]>(initialAlerts);
  const { role, username, userId, isAuthorized } = useAuth();

  const displayName = useMemo(() => {
    if (username?.trim()) {
      return `@${username.trim()}`;
    }
    if (userId) {
      return `user-${userId.slice(0, 8)}`;
    }
    return "@guest";
  }, [username, userId]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-emerald-50 border-emerald-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <header
      className="sticky top-0 z-20 border-b bg-white/92 backdrop-blur-lg"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div
          className="flex min-w-60 flex-1 items-center gap-2 rounded-xl border bg-white px-3 py-2"
          style={{ borderColor: "var(--border)" }}
        >
          <Search className="h-4 w-4" style={{ color: "var(--muted)" }} />
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-(--muted)"
            style={{ color: "var(--text)" }}
            placeholder="Search users, policies, logs..."
            aria-label="Search dashboard"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              type="button"
              className="saas-btn-secondary relative inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 hover:shadow-md hover:bg-blue-50"
              onClick={() => {
                setOpenNotifications((prev) => !prev);
                setOpenProfile(false);
              }}
              aria-label="Toggle notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {openNotifications ? (
              <div
                className="saas-card absolute right-0 top-11 w-96 rounded-2xl shadow-2xl overflow-hidden z-50"
                style={{ borderColor: "var(--border)" }}
              >
                <div
                  className="flex items-center justify-between border-b px-4 py-3"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--text)" }}
                    >
                      Notifications
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      {unreadCount} unread
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell
                        className="mx-auto h-8 w-8 mb-2"
                        style={{ color: "var(--muted)" }}
                      />
                      <p style={{ color: "var(--muted)" }} className="text-sm">
                        No notifications
                      </p>
                    </div>
                  ) : (
                    <div
                      className="divide-y"
                      style={{ borderColor: "var(--border)" }}
                    >
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 transition-all hover:bg-slate-50 cursor-pointer border-l-4 ${
                            notification.read
                              ? "border-transparent"
                              : "border-blue-500"
                          } ${getNotificationColor(notification.type)}`}
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p
                                className={`text-sm font-medium ${
                                  notification.read
                                    ? ""
                                    : "font-semibold text-blue-600"
                                }`}
                                style={
                                  notification.read
                                    ? { color: "var(--text)" }
                                    : {}
                                }
                              >
                                {notification.message}
                              </p>
                              <p
                                className="text-xs mt-1"
                                style={{ color: "var(--muted)" }}
                              >
                                {getTimeAgo(notification.timestamp)}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification.id);
                              }}
                              className="text-slate-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div
            className="h-6 border-l-2"
            style={{ borderColor: "var(--border)" }}
          ></div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setOpenProfile((prev) => !prev);
                setOpenNotifications(false);
              }}
              className="saas-btn-secondary hover:cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 hover:shadow-md hover:bg-blue-50"
              style={{ borderColor: "var(--border)" }}
              aria-label="Toggle profile menu"
            >
              <UserCircle2
                className="h-5 w-5"
                style={{ color: "var(--brand)" }}
              />
              <div className="leading-tight text-left">
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  {displayName}
                </p>
              </div>
              <ChevronDown
                className="h-4 w-4 transition-all duration-300"
                style={{ color: "var(--muted)" }}
              />
            </button>

            {openProfile ? (
              <div
                className="saas-card absolute right-0 top-12 w-64 rounded-xl p-3"
                style={{ borderColor: "var(--border)" }}
              >
                <p
                  className="text-xs uppercase tracking-[0.12em]"
                  style={{ color: "var(--muted)" }}
                >
                  Account
                </p>
                <p
                  className="mt-2 text-sm font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  {displayName}
                </p>
                <p
                  className="text-xs uppercase"
                  style={{ color: "var(--muted)" }}
                >
                  {formatRole(role)}
                </p>

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
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

export default DashboardNavbar;

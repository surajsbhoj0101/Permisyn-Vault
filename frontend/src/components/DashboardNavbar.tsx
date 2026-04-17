import { useRef, useEffect } from "react";
import { Bell, Search } from "lucide-react";

type DashboardNavbarProps = {
  sectionLabel?: string;
  title?: string;
  searchPlaceholder?: string;
  onSearch?: (q: string) => void;
  debounceMs?: number;
};

function DashboardNavbar({
  sectionLabel = "Developer Console",
  title = "Permission Operations",
  searchPlaceholder = "Search apps, policies...",
  onSearch,
  debounceMs = 250,
}: DashboardNavbarProps) {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  return (
    <header
      className="sticky top-0 z-20 border-b bg-[rgba(7,16,39,0.38)] px-5 py-4 backdrop-blur-xl"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mx-auto flex w-full max-w-325 items-center justify-between gap-4">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-[0.12em]"
            style={{ color: "var(--muted)" }}
          >
            {sectionLabel}
          </p>
          <h2
            className="text-lg font-extrabold"
            style={{ color: "var(--text)" }}
          >
            {title}
          </h2>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div
            className="neo-inset flex items-center gap-2 px-3 py-2"
            style={{ borderColor: "var(--border)" }}
          >
            <Search className="h-4 w-4" style={{ color: "var(--muted)" }} />
            <input
              className="w-52 bg-transparent text-sm outline-none"
              placeholder={searchPlaceholder}
              style={{ color: "var(--text)" }}
              aria-label="Global search"
              onChange={(e) => {
                if (!onSearch) return;
                if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
                timeoutRef.current = window.setTimeout(() => {
                  onSearch(e.target.value || "");
                }, debounceMs) as unknown as number;
              }}
            />
          </div>

          <span
            className="neo-pill inline-flex items-center gap-2 px-2.5 py-1 text-xs font-semibold"
            style={{ color: "var(--brand)" }}
          >
            <span className="neo-dot" />
            System Live
          </span>

          <button
            type="button"
            className="neo-surface p-2"
            style={{ borderColor: "var(--border)", color: "var(--muted)" }}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default DashboardNavbar;

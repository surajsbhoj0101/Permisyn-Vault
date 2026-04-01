import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Menu, X, Zap, Wallet } from "lucide-react";
import { Logout } from "./Logout";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#docs" },
  { label: "Companies", href: "#companies" },
];

function CustomConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div className="w-full">
            {!connected ? (
              <button
                onClick={openConnectModal}
                className="saas-btn-primary w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition md:w-auto"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex w-full flex-col items-stretch gap-2 md:w-auto md:flex-row md:items-center">
                <button
                  onClick={openChainModal}
                  className="saas-btn-secondary inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition"
                >
                  <Zap className="h-4 w-4" />
                  <span>{chain.name}</span>
                </button>

                <button
                  onClick={openAccountModal}
                  className="saas-btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition"
                >
                  <Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {account.displayName}
                  </span>
                  <span className="sm:hidden">
                    {account.displayName?.slice(0, 6)}...
                  </span>
                </button>

                <Logout />
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-30 border-b bg-white/88 px-4 py-3 backdrop-blur-xl" style={{ borderColor: "var(--border)" }}>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[linear-gradient(135deg,#2844b8,#3c63f3)] text-sm font-bold text-white">
            PV
          </div>
          <span className="text-sm font-extrabold tracking-[0.06em] sm:text-base" style={{ color: "var(--text)" }}>
            PERMISYN
          </span>
        </div>

        <div className="hidden items-center gap-1 rounded-2xl border bg-white p-1 md:flex" style={{ borderColor: "var(--border)" }}>
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-xl px-3 py-2 text-sm font-semibold transition"
              style={{ color: "var(--muted)" }}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <CustomConnectButton />
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="rounded-xl border bg-white p-2 md:hidden"
          style={{ borderColor: "var(--border)", color: "var(--text)" }}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {isMenuOpen && (
        <div className="saas-card mx-auto mt-3 w-full max-w-6xl rounded-2xl p-3 md:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm font-semibold transition"
                style={{ color: "var(--text)" }}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="mt-3 border-t pt-3" style={{ borderColor: "var(--border)" }}>
            <CustomConnectButton />
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

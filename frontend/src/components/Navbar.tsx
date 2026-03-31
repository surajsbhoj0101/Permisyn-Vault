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
          <div>
            {!connected ? (
              <button
                onClick={openConnectModal}
                className="rounded-lg bg-linear-to-r from-teal-700 to-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:from-teal-800 hover:to-cyan-700"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={openChainModal}
                  className="flex items-center gap-2 rounded-lg bg-linear-to-r from-slate-700 to-slate-800 px-3 py-2 text-sm font-medium text-white transition duration-200 hover:from-slate-600 hover:to-slate-700 hover:shadow-lg"
                >
                  <Zap className="h-4 w-4" />
                  <span>{chain.name}</span>
                </button>

                <button
                  onClick={openAccountModal}
                  className="flex items-center gap-2 rounded-lg bg-linear-to-r from-teal-700 to-cyan-600 px-3 py-2 text-sm font-medium text-white transition duration-200 hover:from-teal-800 hover:to-cyan-700 hover:shadow-lg"
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
    <nav className="sticky top-0 z-30 border-b border-teal-100/90 bg-linear-to-r from-white/90 via-teal-50/70 to-cyan-50/75 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center">
          <span className="bg-linear-to-r from-teal-700 to-cyan-600 bg-clip-text text-base font-extrabold tracking-wide text-transparent sm:text-lg">
            Permisyn Vault
          </span>
        </div>

        <div className="hidden items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
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
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 md:hidden"
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
        <div className="mx-auto mt-3 w-full max-w-6xl rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="mt-3 pt-3">
            <CustomConnectButton />
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

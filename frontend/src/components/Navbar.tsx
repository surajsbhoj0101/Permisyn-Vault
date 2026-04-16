import { useLayoutEffect, useRef, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import gsap from "gsap";
import { Menu, X, Zap, Wallet } from "lucide-react";
import { Logout } from "./Logout";
import logo from "../assets/images/permisyn-logo.svg";

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
                className="saas-btn-primary saas-btn-future w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition md:w-auto"
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
  const navRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (!navRef.current) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      window.dispatchEvent(new Event("navbar:intro:done"));
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          window.dispatchEvent(new Event("navbar:intro:done"));
        },
      });

      tl.fromTo(
        "[data-nav-shell]",
        { y: -28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, clearProps: "opacity,transform" },
      )
        .fromTo(
          "[data-nav-logo]",
          { x: -18, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.35, clearProps: "opacity,transform" },
          "-=0.2",
        )
        .fromTo(
          "[data-nav-link]",
          { y: -10, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.3,
            stagger: 0.06,
            clearProps: "opacity,transform",
          },
          "-=0.18",
        )
        .fromTo(
          "[data-nav-connect]",
          { x: 18, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.34, clearProps: "opacity,transform" },
          "-=0.24",
        );
    }, navRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <nav
      ref={navRef}
      data-nav-shell
      className="sticky top-0 z-30 border-b bg-transparent px-4 py-3"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between ">
        <div className="flex items-center gap-3">
          <div data-nav-logo className="neo-surface relative  ">
            <img
              src={logo}
              alt="Permisyn Vault logo"
              className="h-10 w-full object-contain"
            />
          </div>
        </div>

        <div
          className="neo-surface hidden items-center gap-1 p-1 md:flex"
          style={{ borderColor: "var(--border)" }}
        >
          {navItems.map((item) => (
            <a
              key={item.label}
              data-nav-link
              href={item.href}
              className="rounded-xl px-3 py-2 text-sm font-semibold transition hover:bg-[rgba(115,186,255,0.16)]"
              style={{ color: "var(--muted)" }}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div data-nav-connect className="hidden md:block">
          <CustomConnectButton />
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="neo-surface p-2 md:hidden"
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
                className="rounded-xl px-3 py-2 text-sm font-semibold transition hover:bg-[rgba(134,173,246,0.15)]"
                style={{ color: "var(--text)" }}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div
            className="mt-3 border-t pt-3"
            style={{ borderColor: "var(--border)" }}
          >
            <CustomConnectButton />
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

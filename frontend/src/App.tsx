import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  CheckCircle2,
  LockKeyhole,
  ShieldCheck,
  Zap,
  Wallet,
} from "lucide-react";
import Login from "./components/Login";

function HeroConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        mounted,
        openAccountModal,
        openChainModal,
        openConnectModal,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              className="rounded-xl bg-linear-to-r from-teal-700 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-100 transition hover:from-teal-800 hover:to-cyan-700"
            >
              Connect Wallet
            </button>
          );
        }

        return (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={openChainModal}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              <Zap className="h-4 w-4" />
              {chain.name}
            </button>
            <button
              onClick={openAccountModal}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Wallet className="h-4 w-4" />
              {account.displayName}
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

function App() {
  const [loadingUser, setLoadingUser] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [redNotice, setRedNotice] = useState<string | null>(null);

  return (
    <main className="text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-200/80">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-teal-100/70 blur-3xl" />
          <div className="absolute right-0 top-6 h-72 w-72 rounded-full bg-cyan-100/65 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(30,41,59,0.05)_1px,transparent_0)] bg-size-[24px_24px] opacity-40" />
        </div>

        <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 pb-20 pt-8 md:px-6 md:pb-24 md:pt-14 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <Login
              setLoadingUser={setLoadingUser}
              setNotice={setNotice}
              setRedNotice={setRedNotice}
            />

            {loadingUser ? (
              <p className="mb-3 text-sm text-slate-500">
                Checking wallet session...
              </p>
            ) : null}

            {notice ? (
              <p className="mb-3 text-sm text-emerald-700">{notice}</p>
            ) : null}

            {redNotice ? (
              <p className="mb-3 text-sm text-red-700">{redNotice}</p>
            ) : null}

            <p className="inline-flex rounded-full border border-teal-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
              Consent Infrastructure for Web3 SaaS
            </p>

            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Trust-Centered Access,
              <span className="block bg-linear-to-r from-teal-700 to-cyan-600 bg-clip-text text-transparent">
                Built for Product Teams.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
              Permisyn gives your app a secure identity and consent workflow
              with wallet-based authentication, role-aware onboarding, and
              auditable permission controls.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <HeroConnectButton />
              <a
                href="#features"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Explore Features
              </a>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Connect wallet to get started.
            </p>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">
              <p className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Fast role onboarding
              </p>
              <p className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Wallet-first verification
              </p>
            </div>
          </div>

          <div className="grid gap-4" aria-hidden="true" id="features">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Security
              </p>
              <p className="mt-2 flex items-center gap-2 text-lg font-bold text-slate-900">
                <LockKeyhole className="h-5 w-5 text-teal-700" />
                SIWE-Based Authentication
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Users prove wallet ownership before any onboarding or permission
                action is allowed.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Governance
              </p>
              <p className="mt-2 flex items-center gap-2 text-lg font-bold text-slate-900">
                <ShieldCheck className="h-5 w-5 text-teal-700" />
                Account & Role Profiles
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Distinct User and Developer paths keep consent ownership and
                data access responsibilities clear.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;

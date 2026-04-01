import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  CircleGauge,
  FileLock2,
  Layers3,
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
              className="saas-btn-primary rounded-xl px-6 py-3 text-sm font-semibold shadow-lg shadow-blue-100 transition"
            >
              Connect Wallet
            </button>
          );
        }

        return (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={openChainModal}
              className="saas-btn-secondary flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition"
            >
              <Zap className="h-4 w-4" />
              {chain.name}
            </button>
            <button
              onClick={openAccountModal}
              className="saas-btn-primary flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition"
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
    <main className="saas-shell relative min-h-screen" style={{ color: "var(--text)" }}>
      <section className="relative overflow-hidden border-b" style={{ borderColor: "var(--border)" }}>
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 pb-16 pt-8 md:px-6 md:pb-20 md:pt-14 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div className="saas-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.11em]" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
              Permission Infrastructure
            </p>

            <Login
              setLoadingUser={setLoadingUser}
              setNotice={setNotice}
              setRedNotice={setRedNotice}
            />

            {loadingUser ? (
              <p className="mb-3 mt-4 text-sm" style={{ color: "var(--muted)" }}>
                Checking wallet session...
              </p>
            ) : null}

            {notice ? (
              <p className="mb-3 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {notice}
              </p>
            ) : null}

            {redNotice ? (
              <p className="mb-3 mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {redNotice}
              </p>
            ) : null}

            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-[3.45rem]">
              Access Intelligence,
              <span className="block bg-[linear-gradient(120deg,#2d4cc9,#3c63f3,#3b82f6)] bg-clip-text text-transparent">
                Built Like a Modern SaaS.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base sm:text-lg" style={{ color: "var(--muted)" }}>
              Permisyn gives your app a secure identity and consent workflow
              with wallet-based authentication, role-aware onboarding, and
              audit-ready permission controls.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <HeroConnectButton />
              <a
                href="#features"
                className="saas-btn-secondary rounded-xl px-6 py-3 text-sm font-semibold transition"
              >
                Explore Features
              </a>
            </div>

            <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
              Connect wallet to get started.
            </p>

            <div className="mt-6 flex flex-wrap gap-4 text-sm" style={{ color: "var(--muted)" }}>
              <p className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" style={{ color: "var(--ok)" }} />
                Fast role onboarding
              </p>
              <p className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" style={{ color: "var(--ok)" }} />
                Wallet-first verification
              </p>
            </div>
          </div>

          <div className="saas-card saas-fade-up saas-stagger-1 rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--muted)" }}>
                Security Posture
              </p>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                Live
              </span>
            </div>

            <p className="mt-4 text-4xl font-extrabold">98.2%</p>
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
              Verified consent sessions in the last 24 hours
            </p>

            <div className="mt-6 space-y-3">
              {["Role claims synced", "Policy checks passing", "Audit trail active"].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-xl border bg-white px-3 py-2"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{item}</span>
                  <CheckCircle2 className="h-4 w-4" style={{ color: "var(--ok)" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative mx-auto w-full max-w-6xl px-4 py-14 md:px-6 md:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Core Platform Capabilities</h2>
            <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--muted)" }}>
              Stripe-like clarity for access orchestration and data permissions.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Policy Engine",
              desc: "Define role and permission constraints with deterministic wallet identity checks.",
            },
            {
              icon: Layers3,
              title: "Onboarding Flows",
              desc: "Progressive onboarding with role capture, OTP verification, and clear next-step guidance.",
            },
            {
              icon: FileLock2,
              title: "Audit Readiness",
              desc: "Every grant, consent, and verification event is logged and easy to inspect.",
            },
          ].map((feature, idx) => (
            <article
              key={feature.title}
              className={`saas-card saas-fade-up rounded-2xl p-5 ${idx === 1 ? "saas-stagger-1" : idx === 2 ? "saas-stagger-2" : ""}`}
            >
              <feature.icon className="h-5 w-5" style={{ color: "var(--brand)" }} />
              <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
              <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto w-full max-w-6xl px-4 pb-8 md:px-6">
        <div className="saas-card rounded-3xl p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-[1.2fr_.8fr] md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--muted)" }}>Pricing</p>
              <h3 className="mt-2 text-2xl font-bold">Simple model for teams shipping trust-first products</h3>
              <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                Start with essential auth + onboarding and scale into custom policy controls.
              </p>
            </div>
            <div className="rounded-2xl border bg-white p-5" style={{ borderColor: "var(--border)" }}>
              <p className="text-sm" style={{ color: "var(--muted)" }}>Starter</p>
              <p className="mt-1 text-3xl font-extrabold">$49</p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>per month / workspace</p>
            </div>
          </div>
        </div>
      </section>

      <section id="docs" className="mx-auto w-full max-w-6xl px-4 pb-8 md:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          <a
            href="#"
            className="saas-card saas-fade-up saas-stagger-1 group rounded-2xl p-5 transition hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Developer Docs</span>
              <ArrowUpRight className="h-4 w-4 transition" style={{ color: "var(--muted)" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--brand)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--muted)"} />
            </div>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>Integration guides, SIWE flow, and role lifecycle references.</p>
          </a>

          <a
            href="#"
            className="saas-card saas-fade-up saas-stagger-2 group rounded-2xl p-5 transition hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">API Reference</span>
              <ArrowUpRight className="h-4 w-4 transition" style={{ color: "var(--muted)" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--brand)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--muted)"} />
            </div>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>Auth endpoints, OTP controls, and onboarding contract details.</p>
          </a>
        </div>
      </section>

      <section id="companies" className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Session Stability", value: "99.9%", icon: CircleGauge },
            { label: "Policy Throughput", value: "12k/day", icon: BarChart3 },
            { label: "Avg. Verification", value: "3.7s", icon: Zap },
            { label: "Enterprise Ready", value: "SOC Path", icon: ShieldCheck },
          ].map((item, idx) => (
            <article
              key={item.label}
              className={`saas-card saas-fade-up rounded-2xl p-4 ${idx === 1 ? "saas-stagger-1" : idx >= 2 ? "saas-stagger-2" : ""}`}
            >
              <item.icon className="h-4 w-4" style={{ color: "var(--brand)" }} />
              <p className="mt-3 text-2xl font-extrabold">{item.value}</p>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{item.label}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import gsap from "gsap";
import {
  BadgeCheck,
  CheckCircle2,
  Database,
  FileCheck2,
  LockKeyhole,
  Shield,
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
              className="saas-btn-primary saas-btn-future rounded-xl px-6 py-3 text-sm font-semibold shadow-lg shadow-blue-100 transition"
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
  const [heroIntroReady, setHeroIntroReady] = useState(false);
  const [heroPulseIndex, setHeroPulseIndex] = useState(0);
  const [postureSignalIndex, setPostureSignalIndex] = useState(0);

  const heroSectionRef = useRef<HTMLElement | null>(null);
  const heroPulseTextRef = useRef<HTMLSpanElement | null>(null);

  const heroPulsePhrases = [
    "Progressive consent checks",
    "Role-aware policy decisions",
    "Tamper-evident audit history",
    "Wallet-first user identity",
  ];

  const postureSignals = [
    "Session integrity checks synced",
    "Consent ledger snapshots verified",
    "Revocation queue processing nominal",
    "Audit stream heartbeat healthy",
  ];

  const heroTitlePrimary = "User-Controlled";
  const heroTitleAccent = "Data Access";

  const heroVisibilityStyle = heroIntroReady
    ? { opacity: 1, visibility: "visible" as const }
    : {
        opacity: 0,
        visibility: "hidden" as const,
        pointerEvents: "none" as const,
      };

  const renderHeroLetters = (text: string, extraClassName?: string) => {
    return text.split("").map((char, idx) => {
      if (char === " ") {
        return (
          <span
            key={`${text}-space-${idx}`}
            className="inline-block"
            aria-hidden="true"
          >
            &nbsp;
          </span>
        );
      }

      return (
        <span
          key={`${text}-${char}-${idx}`}
          data-hero-letter
          className={`inline-block will-change-transform ${extraClassName ?? ""}`.trim()}
        >
          {char}
        </span>
      );
    });
  };

  useEffect(() => {
    const onNavDone = () => setHeroIntroReady(true);

    window.addEventListener("navbar:intro:done", onNavDone, { once: true });
    const fallbackTimer = window.setTimeout(() => {
      setHeroIntroReady(true);
    }, 950);

    return () => {
      window.removeEventListener("navbar:intro:done", onNavDone);
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    if (!heroIntroReady) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setHeroPulseIndex((prev) => (prev + 1) % heroPulsePhrases.length);
    }, 2300);

    return () => window.clearInterval(intervalId);
  }, [heroIntroReady, heroPulsePhrases.length]);

  useEffect(() => {
    if (!heroIntroReady) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setPostureSignalIndex((prev) => (prev + 1) % postureSignals.length);
    }, 2400);

    return () => window.clearInterval(intervalId);
  }, [heroIntroReady, postureSignals.length]);

  useEffect(() => {
    if (!heroIntroReady || !heroPulseTextRef.current) {
      return;
    }

    gsap.killTweensOf(heroPulseTextRef.current);
    gsap.fromTo(
      heroPulseTextRef.current,
      { y: 18, autoAlpha: 0, filter: "blur(3px)" },
      {
        y: 0,
        autoAlpha: 1,
        filter: "blur(0px)",
        duration: 0.55,
        ease: "power3.out",
      },
    );
  }, [heroIntroReady, heroPulseIndex]);

  useLayoutEffect(() => {
    if (!heroIntroReady || !heroSectionRef.current) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from("[data-hero-pill]", { y: 12, autoAlpha: 0, duration: 0.45 })
        .fromTo(
          "[data-hero-letter]",
          { y: 34, opacity: 0, filter: "blur(3px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.58,
            stagger: 0.03,
            clearProps: "opacity,transform,filter",
          },
          "-=0.2",
        )
        .fromTo(
          "[data-hero-copy]",
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, clearProps: "opacity,transform" },
          "-=0.35",
        )
        .fromTo(
          "[data-hero-pulse]",
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.42, clearProps: "opacity,transform" },
          "-=0.3",
        )
        .fromTo(
          "[data-hero-cta]",
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, clearProps: "opacity,transform" },
          "-=0.25",
        )
        .from(
          "[data-hero-status]",
          {
            y: 34,
            autoAlpha: 0,
            rotateX: -8,
            transformOrigin: "top center",
            duration: 0.7,
          },
          "-=0.45",
        );
    }, heroSectionRef);

    return () => {
      ctx.revert();
    };
  }, [heroIntroReady]);

  useEffect(() => {
    if (!heroIntroReady || !heroSectionRef.current) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      return;
    }

    const letters = Array.from(
      heroSectionRef.current.querySelectorAll<HTMLElement>(
        "[data-hero-letter]",
      ),
    );

    if (!letters.length) {
      return;
    }

    let activeIndex = 0;
    const intervalId = window.setInterval(() => {
      const activeLetter = letters[activeIndex % letters.length];
      gsap.fromTo(
        activeLetter,
        { y: 0 },
        {
          y: -5,
          duration: 0.16,
          repeat: 1,
          yoyo: true,
          ease: "power1.inOut",
        },
      );
      activeIndex += 1;
    }, 110);

    return () => {
      window.clearInterval(intervalId);
      gsap.killTweensOf(letters);
    };
  }, [heroIntroReady]);

  useEffect(() => {
    if (!heroIntroReady || !heroSectionRef.current) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.to("[data-posture-ring]", {
        rotate: 360,
        duration: 14,
        ease: "none",
        repeat: -1,
      });

      gsap.to("[data-posture-glow]", {
        scale: 1.08,
        opacity: 0.34,
        duration: 1.35,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.fromTo(
        "[data-posture-bar-fill]",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.9,
          ease: "power2.out",
          stagger: 0.1,
          transformOrigin: "left center",
        },
      );
    }, heroSectionRef);

    return () => {
      ctx.revert();
    };
  }, [heroIntroReady]);

  const features = [
    {
      title: "User-Owned Data Vault",
      description:
        "Users store personal data in one place and remain in control of access.",
      icon: Shield,
    },
    {
      title: "Explicit Consent Requests",
      description:
        "Companies request access and users approve, reject, or revoke at any time.",
      icon: FileCheck2,
    },
    {
      title: "Transparent Audit Trail",
      description:
        "Every decision is recorded in the database, with optional on-chain hash proof.",
      icon: Database,
    },
  ];

  return (
    <main
      className="saas-shell relative min-h-screen"
      style={{ color: "var(--text)" }}
    >
      <section
        ref={heroSectionRef}
        className="relative overflow-hidden border-b"
        style={{ borderColor: "var(--border)", ...heroVisibilityStyle }}
        aria-hidden={!heroIntroReady}
      >
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 pb-16 pt-8 md:px-6 md:pb-20 md:pt-14 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div className="saas-fade-up">
            <p
              data-hero-pill
              className="neo-pill inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-[0.11em]"
              style={{ color: "var(--muted)" }}
            >
              Permisyn Vault
            </p>

            <Login
              setLoadingUser={setLoadingUser}
              setNotice={setNotice}
              setRedNotice={setRedNotice}
            />

            {loadingUser ? (
              <p
                className="mb-3 mt-4 text-sm"
                style={{ color: "var(--muted)" }}
              >
                Checking wallet session...
              </p>
            ) : null}

            {notice ? (
              <p
                className="mb-3 mt-4 rounded-xl border px-3 py-2 text-sm"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--brand-soft)",
                  color: "var(--text)",
                }}
              >
                {notice}
              </p>
            ) : null}

            {redNotice ? (
              <p
                className="mb-3 mt-4 rounded-xl border px-3 py-2 text-sm"
                style={{
                  borderColor: "rgba(255,150,170,0.4)",
                  background: "var(--danger-soft)",
                  color: "#ffd9e2",
                }}
              >
                {redNotice}
              </p>
            ) : null}

            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-[3.45rem]">
              <span className="block">
                {renderHeroLetters(heroTitlePrimary, "saas-text-gradient")}
              </span>
              <span className="block">
                {renderHeroLetters(heroTitleAccent, "saas-text-gradient")}
              </span>
            </h1>

            <p
              data-hero-copy
              className="mt-5 max-w-2xl text-base sm:text-lg"
              style={{ color: "var(--muted)" }}
            >
              Permisyn Vault lets individuals store personal data and control
              who can access it through explicit, trackable consent.
            </p>

            <p
              data-hero-pulse
              className="mt-3 text-sm"
              style={{ color: "var(--muted)" }}
            >
              Workflow pulse:
              <span
                ref={heroPulseTextRef}
                className="ml-2 inline-block min-w-66 font-semibold"
                style={{ color: "#bfe0ff" }}
              >
                {heroPulsePhrases[heroPulseIndex]}
              </span>
            </p>

            <div data-hero-cta className="mt-8 flex flex-wrap gap-3">
              <HeroConnectButton />
              <a
                href="#features"
                className="saas-btn-secondary rounded-xl px-6 py-3 text-sm font-semibold transition"
              >
                View Platform
              </a>
            </div>

            <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
              Connect your wallet to start your vault and consent workflow.
            </p>

            <div
              className="mt-6 flex flex-wrap gap-4 text-sm"
              style={{ color: "var(--muted)" }}
            >
              <p className="inline-flex items-center gap-2">
                <CheckCircle2
                  className="h-4 w-4"
                  style={{ color: "var(--ok)" }}
                />
                Approve or reject requests instantly
              </p>
              <p className="inline-flex items-center gap-2">
                <CheckCircle2
                  className="h-4 w-4"
                  style={{ color: "var(--ok)" }}
                />
                Optional on-chain hash proof
              </p>
            </div>
          </div>

          <div
            data-hero-status
            className="saas-card saas-card-glow saas-fade-up saas-stagger-1 rounded-3xl p-6"
          >
            <div className="flex items-center justify-between">
              <p
                className="text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--muted)" }}
              >
                Security Posture
              </p>
              <span className="neo-badge px-2.5 py-1 text-xs font-semibold">
                Live
              </span>
            </div>

            <div className="mt-5 grid grid-cols-[auto_1fr] items-center gap-4">
              <div
                className="relative grid h-24 w-24 place-items-center rounded-full border"
                style={{ borderColor: "rgba(153,192,255,0.35)" }}
              >
                <div
                  data-posture-glow
                  className="absolute inset-2 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(82,168,255,0.33) 0%, rgba(82,168,255,0.04) 72%, transparent 100%)",
                    opacity: 0.18,
                  }}
                />
                <div
                  data-posture-ring
                  className="absolute inset-1 rounded-full border border-dashed"
                  style={{ borderColor: "rgba(163,193,255,0.46)" }}
                />
                <div className="text-center leading-tight">
                  <p className="text-2xl font-extrabold">99.97%</p>
                  <p
                    className="text-[10px] uppercase tracking-[0.15em]"
                    style={{ color: "var(--muted)" }}
                  >
                    Integrity
                  </p>
                </div>
              </div>

              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  Runtime Trust Signal
                </p>
                <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                  {postureSignals[postureSignalIndex]}
                </p>
                <div className="mt-3 space-y-2">
                  {[
                    { label: "Auth", width: "98%" },
                    { label: "Consent", width: "94%" },
                    { label: "Audit", width: "97%" },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="grid grid-cols-[52px_1fr] items-center gap-2"
                    >
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "var(--muted)" }}
                      >
                        {metric.label}
                      </span>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(177,208,255,0.18)]">
                        <div
                          data-posture-bar-fill
                          className="h-full rounded-full"
                          style={{
                            width: metric.width,
                            background:
                              "linear-gradient(90deg, rgba(83,170,255,0.94), rgba(255,167,108,0.9))",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="saas-kpi saas-card-glow">
                <p
                  className="text-xs uppercase tracking-widest"
                  style={{ color: "var(--muted)" }}
                >
                  Requests today
                </p>
                <p className="mt-1 text-xl font-extrabold">482</p>
              </div>
              <div className="saas-kpi saas-card-glow">
                <p
                  className="text-xs uppercase tracking-widest"
                  style={{ color: "var(--muted)" }}
                >
                  Revocations
                </p>
                <p className="mt-1 text-xl font-extrabold">27</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="relative mx-auto w-full max-w-6xl px-4 py-14 md:px-6 md:py-20"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.12em]"
              style={{ color: "var(--muted)" }}
            >
              Core Platform
            </p>
            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">
              Designed For Serious Production Workloads
            </h2>
          </div>
          <div
            className="neo-pill inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold"
            style={{ color: "var(--muted)" }}
          >
            <BadgeCheck className="h-3.5 w-3.5" />
            Ownership, control, and visibility
          </div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="saas-card p-5">
              <div className="inline-flex rounded-xl bg-(--brand-soft) p-2">
                <feature.icon
                  className="h-5 w-5"
                  style={{ color: "var(--brand-dark)" }}
                />
              </div>
              <h3 className="mt-4 text-lg font-extrabold">{feature.title}</h3>
              <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="companies"
        className="border-y bg-[rgba(12,30,59,0.26)] backdrop-blur-xl"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm md:px-6">
          <p style={{ color: "var(--muted)" }}>
            Trusted by security-forward teams:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Nordpoint",
              "StackField",
              "Veridata",
              "OpsHarbor",
              "LedgerAxis",
            ].map((name) => (
              <span
                key={name}
                className="neo-pill px-3 py-1.5 font-semibold"
                style={{ color: "var(--text)" }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6 md:py-20"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              name: "Starter",
              price: "$49",
              desc: "For small teams validating workflows.",
            },
            {
              name: "Growth",
              price: "$199",
              desc: "For shipping production permissioning.",
            },
            {
              name: "Enterprise",
              price: "Custom",
              desc: "For advanced compliance and scale.",
            },
          ].map((plan, idx) => (
            <article key={plan.name} className="saas-card p-6">
              {idx === 1 ? (
                <span className="neo-badge px-3 py-1 text-xs font-semibold">
                  Most Adopted
                </span>
              ) : null}
              <h3 className="mt-3 text-xl font-extrabold">{plan.name}</h3>
              <p className="mt-2 text-3xl font-extrabold">{plan.price}</p>
              <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                {plan.desc}
              </p>
              <button className="saas-btn-secondary mt-5 w-full rounded-xl px-4 py-2.5 text-sm font-semibold">
                Choose {plan.name}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section
        id="docs"
        className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-6 md:pb-20"
      >
        <div className="saas-card grid gap-5 p-6 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              Implementation Ready
            </h2>
            <p
              className="mt-2 text-sm sm:text-base"
              style={{ color: "var(--muted)" }}
            >
              Ship wallet-first authentication and policy controls with clear
              integration guides for backend teams.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "API Reference",
                "SIWE Guide",
                "Role Model",
                "Audit Events",
              ].map((item) => (
                <span
                  key={item}
                  className="neo-pill px-3 py-1.5 text-xs font-semibold"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="saas-panel p-4">
            <p
              className="text-xs font-semibold uppercase tracking-[0.12em]"
              style={{ color: "var(--muted)" }}
            >
              Security Highlights
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                "Nonce-backed sign-in challenge",
                "HTTP-only session lifecycle",
                "Role-aware onboarding gates",
              ].map((item) => (
                <li
                  key={item}
                  className="inline-flex items-center gap-2"
                  style={{ color: "var(--text)" }}
                >
                  <LockKeyhole
                    className="h-4 w-4"
                    style={{ color: "var(--brand)" }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;

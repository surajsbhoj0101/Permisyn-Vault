import { ConnectButton } from '@rainbow-me/rainbowkit'
import { CheckCircle2 } from 'lucide-react'

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
        const ready = mounted
        const connected = ready && account && chain

        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              className="rounded-xl bg-gradient-to-r from-blue-700 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:from-blue-800 hover:to-sky-600"
            >
              Connect Wallet
            </button>
          )
        }

        return (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={openChainModal}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              {chain.name}
            </button>
            <button
              onClick={openAccountModal}
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              {account.displayName}
            </button>
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

function App() {
  return (
    <main className="bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white via-sky-50/40 to-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-12 h-80 w-80 rounded-full bg-sky-200/45 blur-3xl" />
          <div className="absolute right-0 top-4 h-72 w-72 rounded-full bg-blue-200/35 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.06)_1px,transparent_0)] bg-[size:26px_26px] opacity-30" />
        </div>

        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-20 md:px-6 md:py-28 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-sky-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
              SaaS permission platform
            </p>

            <h1 className="mt-5 max-w-3xl font-['Inter'] text-4xl font-[700] leading-tight sm:text-5xl lg:text-6xl">
              Own Your Data.
              <span className="block bg-gradient-to-r from-blue-700 to-sky-500 bg-clip-text text-transparent">
                Control Your Consent.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl font-['Inter'] text-base font-[400] text-slate-600 sm:text-lg">
              A modern consent layer for web3 apps. Connect a wallet, verify ownership, and manage permission access from one clean interface.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <HeroConnectButton />
              <a
                href="#"
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Learn More
              </a>
            </div>

            <p className="mt-3 text-sm text-slate-500">Connect wallet to get started.</p>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">
              <p className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Fast onboarding
              </p>
              <p className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Wallet-first security
              </p>
            </div>
          </div>

          <div className="hidden lg:block" aria-hidden="true" />
        </div>
      </section>
    </main>
  )
}

export default App

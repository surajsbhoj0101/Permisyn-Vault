import { useState } from 'react'
import lightLogo from '../assets/images/lightLogo.png'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Menu, X } from 'lucide-react'

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: '#docs' },
  { label: 'Companies', href: '#companies' },
]

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
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div>
            {!connected ? (
              <button
                onClick={openConnectModal}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={openChainModal}
                  className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white"
                >
                  {chain.name}
                </button>

                <button
                  onClick={openAccountModal}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white"
                >
                  {account.displayName}
                </button>
              </div>
            )}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-20 bg-white/20 px-4 py-3 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img className="h-8" src={lightLogo} alt="Permisyn logo" />
        </div>

        <div className="hidden items-center gap-2 rounded-full bg-white/40 p-1 backdrop-blur md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
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
          className="rounded-lg bg-white/40 p-2 text-slate-700 backdrop-blur md:hidden"
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="mx-auto mt-3 w-full max-w-6xl rounded-xl bg-white/45 p-3 shadow-sm backdrop-blur md:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
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
  )
}

export default Navbar
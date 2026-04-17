import { useMemo, useEffect, useState } from "react";
import { getAddress } from "ethers";
import {
  AuthFlow,
  ConsentRequest,
  SDKClient,
  type AuthStatus,
  type AuthenticatedUser,
} from "../../../../sdk/dist/index.js";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export default function SDKPlayground() {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [onboardingResult, setOnboardingResult] = useState<AuthStatus | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const client = useMemo(
    () =>
      new SDKClient({
        apiBaseUrl: API_BASE_URL,
        formatAddress: (address) => getAddress(address),
        appId: import.meta.env.VITE_APP_ID,
        apiKey: import.meta.env.VITE_API_KEY,
      }),
    [],
  );

  useEffect(() => {
    console.log("Authentication State Changed:");
    console.log("User:", user);
    console.log("Onboarding Result:", onboardingResult);
    console.log("Error:", error);
  }, [user, onboardingResult, error]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(168,196,255,0.22),transparent_40%),linear-gradient(180deg,#f7fbff_0%,#edf4ff_100%)] px-4 py-8 md:px-8">
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <AuthFlow
          client={client}
          connectLabel="Connect Wallet to Get Started"
          onAuthenticated={(authenticatedUser) => {
            setUser(authenticatedUser);
            setError(null);
          }}
          onOnboardingRequired={(authenticatedUser) => {
            setUser(authenticatedUser);
            setOnboardingResult(null);
            setError(null);
          }}
          onOnboardingSuccess={(auth) => {
            setOnboardingResult(auth);
            setError(null);
          }}
          onError={(caughtError) => {
            setUser(null);
            setOnboardingResult(null);
            setError(caughtError.message);
          }}
        />
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {user?.user.walletAddress ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
          <ConsentRequest
            client={client}
            userWalletAddress={user.user.walletAddress}
            defaultPurpose="Requesting app access for the signed-in wallet."
            onError={(caughtError) => {
              setError(caughtError.message);
            }}
          />
        </div>
      ) : null}
    </main>
  );
}

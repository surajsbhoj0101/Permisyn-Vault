# Permisyn SDK

Production-ready TypeScript SDK with a strict three-layer architecture:

- `core/`: internal wallet, signing, API, and validation logic
- `client/`: public `SDKClient` API
- `ui/`: optional React UI components that depend on the client only

## Folder Structure

```text
sdk/
├── core/
│   ├── wallet.ts
│   └── sign.ts
├── client/
│   └── SDKClient.ts
├── ui/
│   ├── AuthFlow.tsx
│   ├── ConnectButton.tsx
│   ├── UserOnboardingFlow.tsx
│   └── react-shim.d.ts
├── index.ts
├── package.json
├── tsconfig.base.json
├── tsconfig.json
└── README.md
```

## Public API

Only the client and UI layers are exported.

```ts
import { SDKClient, AuthFlow, ConnectButton } from "@permisyn/sdk";
```

## Usage Without UI

```ts
import { SDKClient } from "@permisyn/sdk";

const client = new SDKClient({
  apiBaseUrl: "https://api.example.com",
});

const authenticatedUser = await client.login();
```

## Usage With UI

```tsx
import { SDKClient, AuthFlow } from "@permisyn/sdk";

const client = new SDKClient({
  apiBaseUrl: "https://api.example.com",
});

export function LoginScreen() {
  return (
    <AuthFlow
      client={client}
      onAuthenticated={(result) => {
        console.log("Authenticated user", result.user);
      }}
      onOnboardingSuccess={(auth) => {
        console.log("Onboarding complete", auth);
      }}
    />
  );
}
```

`AuthFlow` starts with wallet verification and automatically shows `UserOnboardingFlow` when the authenticated account is still `GUEST` or has no assigned role yet.

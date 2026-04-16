import type { ConnectedWallet } from "./wallet";

export interface InternalClientConfig {
  apiBaseUrl: string;
  walletProvider?: {
    request<TResult>(args: {
      method: string;
      params?: readonly unknown[] | object;
    }): Promise<TResult>;
  };
  authEndpoint?: string;
  nonceEndpoint?: string;
  authStatusEndpoint?: string;
  formatAddress?: (address: string) => string;
  fetch?: typeof fetch;
  appName?: string;
}

export interface AuthenticatedUser {
  isAuthorized: boolean;
  user: {
    id: string;
    walletAddress: string;
    role?: string | null;
    displayName?: string;
    username?: string | null;
    [key: string]: unknown;
  };
}

export interface SiwePayload {
  domain: string;
  address: string;
  statement: string;
  uri: string;
  version: "1";
  chainId: number;
  nonce: string;
  issuedAt: string;
}

interface AuthenticateWalletInput {
  apiBaseUrl: string;
  authEndpoint: string;
  authStatusEndpoint: string;
  address: string;
  message: SiwePayload;
  signature: string;
  fetcher?: typeof fetch;
}

export class SignatureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SignatureError";
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export function validateClientConfig(config: InternalClientConfig): void {
  if (!config.apiBaseUrl || typeof config.apiBaseUrl !== "string") {
    throw new AuthenticationError("`apiBaseUrl` is required.");
  }

  try {
    new URL(config.apiBaseUrl);
  } catch {
    throw new AuthenticationError("`apiBaseUrl` must be a valid URL.");
  }
}

export function createLoginMessage(
  address: string,
  appName = "Permisyn SDK",
  chainId?: string,
  domain?: string,
  uri?: string,
  nonce?: string,
): SiwePayload {
  if (!address || typeof address !== "string") {
    throw new SignatureError("A wallet address is required to build the login message.");
  }

  if (!nonce) {
    throw new SignatureError("A nonce is required to build a SIWE login message.");
  }

  const resolvedDomain = domain ?? resolveBrowserDomain();
  const resolvedUri = uri ?? resolveBrowserUri();
  const resolvedChainId = normalizeChainId(chainId);
  return {
    domain: resolvedDomain,
    address,
    statement: `Sign in to ${appName}.`,
    uri: resolvedUri,
    version: "1",
    chainId: resolvedChainId,
    nonce,
    issuedAt: new Date().toISOString(),
  };
}

export function prepareLoginMessage(message: SiwePayload): string {
  return [
    `${message.domain} wants you to sign in with your Ethereum account:`,
    message.address,
    "",
    message.statement,
    "",
    `URI: ${message.uri}`,
    `Version: ${message.version}`,
    `Chain ID: ${message.chainId}`,
    `Nonce: ${message.nonce}`,
    `Issued At: ${message.issuedAt}`,
  ].join("\n");
}

export async function signMessage(
  wallet: ConnectedWallet,
  message: string,
): Promise<string> {
  if (!message.trim()) {
    throw new SignatureError("Cannot sign an empty message.");
  }

  try {
    return await wallet.provider.request<string>({
      method: "personal_sign",
      params: [message, wallet.address],
    });
  } catch {
    try {
      return await wallet.provider.request<string>({
        method: "personal_sign",
        params: [wallet.address, message],
      });
    } catch {
      throw new SignatureError("Wallet signature request was rejected or failed.");
    }
  }
}

export async function fetchNonce(
  apiBaseUrl: string,
  nonceEndpoint: string,
  fetcher?: typeof fetch,
): Promise<string> {
  const resolvedFetcher = fetcher ?? globalThis.fetch;

  if (typeof resolvedFetcher !== "function") {
    throw new AuthenticationError(
      "No fetch implementation available. Pass `fetch` in the SDK config.",
    );
  }

  const nonceResponse = await resolvedFetcher(new URL(nonceEndpoint, apiBaseUrl), {
    method: "GET",
    credentials: "include",
  });

  if (!nonceResponse.ok) {
    throw await buildAuthenticationError(nonceResponse, "Failed to fetch SIWE nonce");
  }

  const nonceData = (await nonceResponse.json()) as { nonce?: string };

  if (!nonceData.nonce || typeof nonceData.nonce !== "string") {
    throw new AuthenticationError("Nonce response shape is invalid.");
  }

  return nonceData.nonce;
}

export async function authenticateWallet(
  input: AuthenticateWalletInput,
): Promise<AuthenticatedUser> {
  const fetcher = input.fetcher ?? globalThis.fetch;

  if (typeof fetcher !== "function") {
    throw new AuthenticationError(
      "No fetch implementation available. Pass `fetch` in the SDK config.",
    );
  }

  const response = await fetcher(new URL(input.authEndpoint, input.apiBaseUrl), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      message: input.message,
      signature: input.signature,
    }),
  });

  if (!response.ok) {
    throw await buildAuthenticationError(response, "Authentication failed");
  }

  const authStatusResponse = await fetcher(
    new URL(input.authStatusEndpoint, input.apiBaseUrl),
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!authStatusResponse.ok) {
    throw await buildAuthenticationError(
      authStatusResponse,
      "Authentication succeeded, but fetching auth state failed",
    );
  }

  const authState = (await authStatusResponse.json()) as {
    isAuthorized?: boolean;
    userId?: string | null;
    role?: string | null;
    username?: string | null;
  };

  if (!authState.isAuthorized || typeof authState.userId !== "string") {
    throw new AuthenticationError("Authentication completed, but auth state is invalid.");
  }

  return {
    isAuthorized: true,
    user: {
      id: authState.userId,
      walletAddress: input.address.toLowerCase(),
      role: authState.role ?? null,
      username: authState.username ?? null,
      displayName: authState.username ?? undefined,
    },
  };
}

function normalizeChainId(chainId?: string): number {
  if (!chainId) {
    return 1;
  }

  return chainId.startsWith("0x") ? Number.parseInt(chainId, 16) : Number(chainId);
}

function resolveBrowserDomain(): string {
  if (typeof window !== "undefined" && window.location.host) {
    return window.location.host;
  }

  throw new AuthenticationError("Unable to resolve the current domain for SIWE.");
}

function resolveBrowserUri(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  throw new AuthenticationError("Unable to resolve the current URI for SIWE.");
}

async function buildAuthenticationError(
  response: Response,
  fallbackMessage: string,
): Promise<AuthenticationError> {
  try {
    const data = (await response.json()) as { error?: string };
    if (typeof data.error === "string" && data.error.trim().length > 0) {
      return new AuthenticationError(data.error);
    }
  } catch {
    // Ignore JSON parsing issues and use the fallback message below.
  }

  return new AuthenticationError(`${fallbackMessage} with status ${response.status}.`);
}

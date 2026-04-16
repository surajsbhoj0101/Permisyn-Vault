import {
  authenticateWallet,
  createLoginMessage,
  fetchNonce,
  prepareLoginMessage,
  type AuthenticatedUser,
  type InternalClientConfig,
  signMessage,
  validateClientConfig,
} from "../core/sign";
import { connectWallet, type WalletProvider } from "../core/wallet";

export interface AuthStatus {
  isAuthorized: boolean;
  role: string | null;
  userId: string | null;
  username: string | null;
}

export interface CompleteUserOnboardingInput {
  username: string;
  email: string;
}

export interface SDKClientConfig {
  apiBaseUrl: string;
  authEndpoint?: string;
  nonceEndpoint?: string;
  authStatusEndpoint?: string;
  appName?: string;
  walletProvider?: WalletProvider;
  formatAddress?: (address: string) => string;
  fetch?: typeof fetch;
}

export interface LoginOptions {
  message?: ReturnType<typeof createLoginMessage>;
}

export class SDKClient {
  private readonly config: Required<
    Pick<
      SDKClientConfig,
      "apiBaseUrl" | "authEndpoint" | "nonceEndpoint" | "authStatusEndpoint" | "appName"
      | "formatAddress"
    >
  > &
    Omit<
      SDKClientConfig,
      "apiBaseUrl" | "authEndpoint" | "nonceEndpoint" | "authStatusEndpoint" | "appName" | "formatAddress"
    >;

  constructor(config: SDKClientConfig) {
    const normalizedConfig: InternalClientConfig = {
      ...config,
      authEndpoint: config.authEndpoint ?? "/api/auth/verify",
      nonceEndpoint: config.nonceEndpoint ?? "/api/auth/get-nonce",
      authStatusEndpoint: config.authStatusEndpoint ?? "/api/auth/is-authorized",
      appName: config.appName ?? "Permisyn SDK",
      formatAddress: config.formatAddress ?? ((address) => address),
    };

    validateClientConfig(normalizedConfig);

    this.config = normalizedConfig as SDKClient["config"];
  }

  async login(options: LoginOptions = {}): Promise<AuthenticatedUser> {
    const wallet = await connectWallet({
      provider: this.config.walletProvider,
    });
    const formattedAddress = this.config.formatAddress(wallet.address);
    const normalizedWallet = {
      ...wallet,
      address: formattedAddress,
    };

    const nonce = await fetchNonce(
      this.config.apiBaseUrl,
      this.config.nonceEndpoint,
      this.config.fetch,
    );

    const message =
      options.message ??
      createLoginMessage(
        normalizedWallet.address,
        this.config.appName,
        normalizedWallet.chainId,
        undefined,
        undefined,
        nonce,
      );

    const signature = await signMessage(normalizedWallet, prepareLoginMessage(message));

    return authenticateWallet({
      apiBaseUrl: this.config.apiBaseUrl,
      authEndpoint: this.config.authEndpoint,
      authStatusEndpoint: this.config.authStatusEndpoint,
      address: normalizedWallet.address,
      message,
      signature,
      fetcher: this.config.fetch,
    });
  }

  async getAuthStatus(): Promise<AuthStatus> {
    return this.requestJson<AuthStatus>(this.config.authStatusEndpoint, {
      method: "GET",
    });
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    const normalizedUsername = username.trim();

    if (!normalizedUsername) {
      throw new Error("Username is required.");
    }

    const response = await this.requestJson<{ isTaken: boolean }>(
      `/api/auth/check-username/${encodeURIComponent(normalizedUsername)}`,
      {
        method: "GET",
      },
    );

    return response.isTaken;
  }

  async checkEmailAvailability(email: string): Promise<boolean> {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      throw new Error("Email is required.");
    }

    const response = await this.requestJson<{ isTaken: boolean }>(
      `/api/auth/check-email/${encodeURIComponent(normalizedEmail)}`,
      {
        method: "GET",
      },
    );

    return response.isTaken;
  }

  async requestOtp(email: string): Promise<{ success: boolean; message?: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      throw new Error("Email is required.");
    }

    return this.requestJson<{ success: boolean; message?: string }>(
      "/api/auth/request-otp",
      {
        method: "POST",
        body: JSON.stringify({ email: normalizedEmail }),
      },
    );
  }

  async verifyOtp(email: string, otp: string): Promise<{ success: boolean; message?: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOtp = otp.trim();

    if (!normalizedEmail || !normalizedOtp) {
      throw new Error("Email and OTP are required.");
    }

    return this.requestJson<{ success: boolean; message?: string }>(
      "/api/auth/verify-otp",
      {
        method: "POST",
        body: JSON.stringify({
          email: normalizedEmail,
          otp: normalizedOtp,
        }),
      },
    );
  }

  async completeUserOnboarding(
    input: CompleteUserOnboardingInput,
  ): Promise<AuthStatus> {
    const normalizedUsername = input.username.trim();
    const normalizedEmail = input.email.trim().toLowerCase();

    if (!normalizedUsername || !normalizedEmail) {
      throw new Error("Username and email are required.");
    }

    await this.requestJson<AuthStatus>("/api/auth/set-role", {
      method: "POST",
      body: JSON.stringify({
        username: normalizedUsername,
        email: normalizedEmail,
        role: "USER",
      }),
    });

    return this.getAuthStatus();
  }

  private async requestJson<T>(path: string, init: RequestInit): Promise<T> {
    const fetcher = this.config.fetch ?? globalThis.fetch;

    if (typeof fetcher !== "function") {
      throw new Error("No fetch implementation available. Pass `fetch` in the SDK config.");
    }

    const response = await fetcher(new URL(path, this.config.apiBaseUrl), {
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      ...init,
    });

    const data = (await response.json().catch(() => null)) as
      | { error?: string }
      | T
      | null;

    if (!response.ok) {
      const message =
        data && typeof data === "object" && "error" in data && typeof data.error === "string"
          ? data.error
          : `Request failed with status ${response.status}.`;
      throw new Error(message);
    }

    return data as T;
  }
}

export type { AuthenticatedUser };

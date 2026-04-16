type WalletRequestArguments = {
  method: string;
  params?: readonly unknown[] | object;
};

export interface WalletProvider {
  request<TResult>(args: WalletRequestArguments): Promise<TResult>;
}

export interface ConnectedWallet {
  address: string;
  chainId?: string;
  provider: WalletProvider;
}

export interface ConnectWalletOptions {
  provider?: WalletProvider;
}

export class WalletConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WalletConnectionError";
  }
}

export function resolveWalletProvider(
  provider?: WalletProvider,
): WalletProvider {
  if (provider) {
    return provider;
  }

  const globalScope = globalThis as typeof globalThis & {
    ethereum?: WalletProvider;
  };

  if (globalScope.ethereum) {
    return globalScope.ethereum;
  }

  throw new WalletConnectionError(
    "No wallet provider found. Pass `walletProvider` in the SDK config or install an injected wallet.",
  );
}

export async function connectWallet(
  options: ConnectWalletOptions = {},
): Promise<ConnectedWallet> {
  const provider = resolveWalletProvider(options.provider);

  const accounts = await provider.request<string[]>({
    method: "eth_requestAccounts",
  });

  if (!Array.isArray(accounts) || accounts.length === 0) {
    throw new WalletConnectionError("Wallet did not return an account.");
  }

  const [address] = accounts;

  if (typeof address !== "string" || address.trim().length === 0) {
    throw new WalletConnectionError("Wallet returned an invalid account.");
  }

  let chainId: string | undefined;

  try {
    chainId = await provider.request<string>({ method: "eth_chainId" });
  } catch {
    chainId = undefined;
  }

  return {
    address,
    chainId,
    provider,
  };
}

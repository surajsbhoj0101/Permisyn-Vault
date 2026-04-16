export class WalletConnectionError extends Error {
    constructor(message) {
        super(message);
        this.name = "WalletConnectionError";
    }
}
export function resolveWalletProvider(provider) {
    if (provider) {
        return provider;
    }
    const globalScope = globalThis;
    if (globalScope.ethereum) {
        return globalScope.ethereum;
    }
    throw new WalletConnectionError("No wallet provider found. Pass `walletProvider` in the SDK config or install an injected wallet.");
}
export async function connectWallet(options = {}) {
    const provider = resolveWalletProvider(options.provider);
    const accounts = await provider.request({
        method: "eth_requestAccounts",
    });
    if (!Array.isArray(accounts) || accounts.length === 0) {
        throw new WalletConnectionError("Wallet did not return an account.");
    }
    const [address] = accounts;
    if (typeof address !== "string" || address.trim().length === 0) {
        throw new WalletConnectionError("Wallet returned an invalid account.");
    }
    let chainId;
    try {
        chainId = await provider.request({ method: "eth_chainId" });
    }
    catch {
        chainId = undefined;
    }
    return {
        address,
        chainId,
        provider,
    };
}
//# sourceMappingURL=wallet.js.map
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
export declare class WalletConnectionError extends Error {
    constructor(message: string);
}
export declare function resolveWalletProvider(provider?: WalletProvider): WalletProvider;
export declare function connectWallet(options?: ConnectWalletOptions): Promise<ConnectedWallet>;
export {};
//# sourceMappingURL=wallet.d.ts.map
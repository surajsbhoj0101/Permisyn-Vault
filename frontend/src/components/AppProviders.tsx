import type { ReactNode  } from "react";
import "@rainbow-me/rainbowkit/styles.css"
import {
    getDefaultConfig, //configure blockchain networks, wallet connectors, and other settings for RainbowKit + wagmi.
    RainbowKitProvider, //React context provider that wraps your app to supply RainbowKit’s wallet connection functionality
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { baseSepolia } from "viem/chains";
//QueryClient — creates an instance of React Query’s core client, which manages all your queries, caching, and data syncing.
//QueryClientProvider — a React context provider that wraps your app and makes the QueryClient available to all components for using React Query features.

const projectId = import.meta.env.VITE_PROJECT_ID as string;
const config = getDefaultConfig({
    appName: "Permisyn_Vault",
    projectId: projectId,//WalletConnect Cloud project ID
    chains: [baseSepolia],
    ssr: false, // If your dApp uses server side rendering (SSR)
});

type Props = {
    children: ReactNode;
}
//ReactNode support string | number | JSX | null | array | etc.

const AppProviders = ({ children }: Props) => {
    return (
        <WagmiProvider config={config}>
            <RainbowKitProvider modalSize="compact" 
            >
                {children}
            </RainbowKitProvider>
        </WagmiProvider>
    );
}

export default AppProviders


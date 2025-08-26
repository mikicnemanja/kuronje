import { getDefaultConfig } from "@rainbow-me/rainbowkit";

export const config = getDefaultConfig({
  appName: "Kuronje NFT Collection",
  projectId: "YOUR_PROJECT_ID", // Optional for local dev
  chains: [
    {
      id: 31337,
      name: "Anvil",
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: {
        default: {
          http: ["http://localhost:8545"],
          // Development settings for better nonce handling
          batch: {
            multicall: false, // Disable batching for development
          },
          retryCount: 1, // Fewer retries for faster feedback
        },
      },
      // Add block time for better nonce handling
      blockExplorers: {
        default: { name: "Local", url: "http://localhost:8545" },
      },
    },
    {
      id: 11155111,
      name: "Sepolia",
      nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: {
        default: { http: ["YOUR_SEPOLIA_RPC_URL"] },
      },
    },
  ],
  // Add better connection handling
  multiInjectedProviderDiscovery: false,
  pollingInterval: 2000, // Faster polling for development (2 seconds)
  // Ensure fresh data fetching
  syncConnectedChain: true,
  // Development-friendly settings
  ...(process.env.NODE_ENV === "development" && {
    cacheTime: 1000, // Shorter cache time in development
  }),
});

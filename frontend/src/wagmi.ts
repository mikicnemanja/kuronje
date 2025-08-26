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
        default: { http: ["http://localhost:8545"] },
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
});

import "@rainbow-me/rainbowkit/styles.css";
import "./rainbowkit-custom.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { PonderProvider } from "@ponder/react";
import { config } from "./wagmi";
import { client } from "./lib/ponder";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <PonderProvider client={client}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </PonderProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

import { createConfig, http } from "wagmi";
import { localhost, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [localhost, sepolia],
  connectors: [injected()],
  transports: {
    [localhost.id]: http("http://localhost:8545"),
    [sepolia.id]: http("YOUR_SEPOLIA_RPC_URL"),
  },
});

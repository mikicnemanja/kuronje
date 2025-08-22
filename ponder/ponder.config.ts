import { createConfig } from "ponder";
import { KuronjeNFTABI } from "../contracts/KuronjeNFTABI";
import { contractAddress } from "../contracts/contract-address.json";

export default createConfig({
  chains: {
    anvil: {
      id: 31337,
      rpc: process.env.PONDER_RPC_URL_31337,
      disableCache: true, // Only for anvil
    },
  },
  contracts: {
    KuronjeNFT: {
      chain: "anvil",
      abi: KuronjeNFTABI,
      address: contractAddress as `0x${string}`,
      startBlock: 0, // Anvil will always start at 0
    },
  },
});

import { createConfig } from "ponder";
import { KuronjeNFTABI } from "../contracts/KuronjeNFTABI";
import KuronjeDeploy from "../lib/foundry-devops/broadcast/DeployStuff.s.sol/31337/run-1700448371.json";
import { getAddress, hexToNumber } from "viem";

const address = getAddress(
  KuronjeDeploy.transactions[0]!.contractAddress as `0x${string}`
);

// Anvil will always start at 0
const startBlock = hexToNumber(
  KuronjeDeploy.receipts[0]!.blockNumber as `0x${string}`
);

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
      address: address,
      startBlock: 0, // Anvil will always start at 0
    },
  },
});

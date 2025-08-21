import { createConfig } from "ponder";
import KuronjeABI from "../contracts/KuronjeABI.json";
import contractAddressData from "../contracts/contract-address.json";
import { Abi } from "viem";

export default createConfig({
  chains: {
    anvil: {
      id: 31337,
      rpc: process.env.PONDER_RPC_URL_31337,
    },
  },
  contracts: {
    ERC721: {
      chain: "anvil",
      abi: KuronjeABI as Abi,
      address: contractAddressData.contractAddress as `0x${string}`,
      startBlock: 0,
      endBlock: "latest",
    },
  },
});

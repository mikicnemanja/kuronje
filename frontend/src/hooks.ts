import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import { useState, useCallback, useEffect } from "react";
import KuronjeNFTABI from "./abi.json";
import contractAddressData from "./contract-address.json";

const contractAddress = contractAddressData.contractAddress as `0x${string}`;

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface NFTToken {
  tokenId: number;
  isRevealed: boolean;
  metadata?: NFTMetadata;
}

// Add this function to fetch real metadata from IPFS
const fetchMetadataFromIPFS = async (
  uri: string
): Promise<NFTMetadata | null> => {
  try {
    // Convert IPFS URI to HTTP gateway URL
    const httpUrl = uri.replace(
      "ipfs://",
      "https://gateway.pinata.cloud/ipfs/"
    );
    console.log("Fetching metadata from:", httpUrl);

    const response = await fetch(httpUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const metadata = await response.json();

    // Convert image IPFS URI to HTTP URL as well
    if (metadata.image && metadata.image.startsWith("ipfs://")) {
      metadata.image = metadata.image.replace(
        "ipfs://",
        "https://gateway.pinata.cloud/ipfs/"
      );
    }

    return metadata;
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return null;
  }
};

// Query Hooks (Read Operations)
export const useKuronjeBalance = (userAddress?: `0x${string}`) => {
  return useReadContract({
    address: contractAddress,
    abi: KuronjeNFTABI,
    functionName: "balanceOf",
    args: [userAddress],
    query: {
      enabled: !!userAddress,
    },
  });
};

export const useKuronjeTotalSupply = () => {
  return useReadContract({
    address: contractAddress,
    abi: KuronjeNFTABI,
    functionName: "s_totalTokenAmount",
  });
};

export const useTokenOwner = (tokenId: number, enabled = true) => {
  return useReadContract({
    address: contractAddress,
    abi: KuronjeNFTABI,
    functionName: "ownerOf",
    args: [tokenId],
    query: {
      enabled: enabled && tokenId !== undefined,
    },
  });
};

export const useIsTokenRevealed = (tokenId: number, enabled = true) => {
  return useReadContract({
    address: contractAddress,
    abi: KuronjeNFTABI,
    functionName: "s_tokenIdRevealed",
    args: [tokenId],
    query: {
      enabled: enabled && tokenId !== undefined,
    },
  });
};

export const useTokenMetadataId = (tokenId: number, enabled = true) => {
  return useReadContract({
    address: contractAddress,
    abi: KuronjeNFTABI,
    functionName: "s_tokenIdToMetadataId",
    args: [tokenId],
    query: {
      enabled: enabled && tokenId !== undefined,
    },
  });
};

// Mutation Hooks (Write Operations)
export const useMintKuronje = () => {
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mintNft = useCallback(() => {
    if (error) reset(); // Clear previous errors

    writeContract(
      {
        address: contractAddress,
        abi: KuronjeNFTABI,
        functionName: "mintNft",
      },
      {
        onError: (error) => {
          console.log("Mint transaction rejected or failed:", error);
        },
        onSuccess: (hash) => {
          console.log("Mint transaction submitted successfully:", hash);
        },
      }
    );
  }, [writeContract, error, reset]);

  return {
    mintNft,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
    reset,
  };
};

export const useRevealToken = () => {
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const revealToken = useCallback(
    (tokenId: number) => {
      if (error) reset(); // Clear previous errors

      writeContract(
        {
          address: contractAddress,
          abi: KuronjeNFTABI,
          functionName: "revealToken",
          args: [tokenId],
        },
        {
          onError: (error) => {
            console.log("Reveal transaction rejected or failed:", error);
          },
          onSuccess: (hash) => {
            console.log("Reveal transaction submitted successfully:", hash);
          },
        }
      );
    },
    [writeContract, error, reset]
  );

  return {
    revealToken,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
    reset,
  };
};

// Complex Composite Hook
export const useUserKuronjeNFTs = (userAddress?: `0x${string}`) => {
  const [userNFTs, setUserNFTs] = useState<NFTToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const publicClient = usePublicClient();

  const { data: balance, refetch: refetchBalance } =
    useKuronjeBalance(userAddress);
  const { data: totalSupply, refetch: refetchTotalSupply } =
    useKuronjeTotalSupply();

  const fetchUserNFTs = useCallback(async () => {
    if (!userAddress || !totalSupply || !publicClient) {
      console.log("Missing requirements:", {
        userAddress,
        totalSupply,
        publicClient: !!publicClient,
      });
      return;
    }

    setIsLoading(true);
    const tokens: NFTToken[] = [];

    console.log(
      `Checking ${Number(totalSupply)} tokens for address ${userAddress}`
    );

    try {
      // Check each token to see if user owns it
      for (let i = 0; i < Number(totalSupply); i++) {
        try {
          // Check token owner using wagmi's publicClient
          const owner = (await publicClient.readContract({
            address: contractAddress,
            abi: KuronjeNFTABI,
            functionName: "ownerOf",
            args: [i],
          })) as string;

          if (owner && owner.toLowerCase() === userAddress.toLowerCase()) {
            console.log(`Found token ${i} owned by user`);

            // Check if token is revealed
            const isRevealed = (await publicClient.readContract({
              address: contractAddress,
              abi: KuronjeNFTABI,
              functionName: "s_tokenIdRevealed",
              args: [i],
            })) as boolean;

            // Get the tokenURI from smart contract
            const tokenURI = (await publicClient.readContract({
              address: contractAddress,
              abi: KuronjeNFTABI,
              functionName: "tokenURI",
              args: [i],
            })) as string;

            console.log(`Token ${i} URI:`, tokenURI);
            console.log(`Token ${i} isRevealed:`, isRevealed);

            // Fetch real metadata from IPFS
            const metadata = await fetchMetadataFromIPFS(tokenURI);

            if (metadata) {
              console.log(`Token ${i} metadata:`, metadata);
              console.log(`Token ${i} image URL:`, metadata.image);
            } else {
              console.log(`Token ${i} metadata fetch failed`);
            }

            if (metadata) {
              // Successfully fetched real metadata from IPFS
              tokens.push({
                tokenId: i,
                isRevealed: Boolean(isRevealed),
                metadata,
              });
            } else {
              // Fallback to placeholder if IPFS fetch fails
              const fallbackMetadata: NFTMetadata = {
                name: isRevealed
                  ? `Kuronje #${i} - Revealed`
                  : "Kuronje Mystery Box",
                description: isRevealed
                  ? "A revealed Kuronje NFT"
                  : "A mysterious Kuronje waiting to be revealed...",
                image: isRevealed
                  ? "/placeholder-revealed.png"
                  : "/placeholder-mystery.png",
                attributes: [
                  {
                    trait_type: "Status",
                    value: isRevealed ? "Revealed" : "Unrevealed",
                  },
                  { trait_type: "Token ID", value: i.toString() },
                ],
              };

              tokens.push({
                tokenId: i,
                isRevealed: Boolean(isRevealed),
                metadata: fallbackMetadata,
              });
            }
          }
        } catch (error) {
          // Token doesn't exist or error fetching, skip
          console.log(`Error fetching token ${i}:`, error);
          continue;
        }
      }

      console.log(`Found ${tokens.length} tokens owned by user`);
      setUserNFTs(tokens);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, totalSupply, publicClient]);

  // Auto-refresh when balance or total supply changes
  useEffect(() => {
    fetchUserNFTs();
  }, [fetchUserNFTs]);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([refetchBalance(), refetchTotalSupply()]);
      // Small delay to ensure contract state is updated
      setTimeout(() => {
        fetchUserNFTs();
      }, 1000);
    } catch (error) {
      console.error("Error refreshing data:", error);
      setIsLoading(false);
    }
  }, [refetchBalance, refetchTotalSupply, fetchUserNFTs]);

  return {
    userNFTs,
    isLoading,
    balance: balance ? Number(balance) : 0,
    totalSupply: totalSupply ? Number(totalSupply) : 0,
    refetch: fetchUserNFTs,
    refreshAll,
  };
};

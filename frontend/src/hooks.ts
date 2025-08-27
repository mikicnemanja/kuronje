import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useChainId,
} from "wagmi";
import { useState, useCallback, useEffect, useRef } from "react";
import { usePonderQuery } from "@ponder/react";
import { eq, sql, asc } from "@ponder/client";

import contractAddressData from "../../contracts/contract-address.json";
import { KuronjeNFTABI } from "../../contracts/KuronjeNFTABI";
import { schema } from "./lib/ponder";

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

// Query Hooks (Read Operations) - Using Ponder React Hooks with SQL
export const useKuronjeBalance = (userAddress?: `0x${string}`) => {
  const query = usePonderQuery({
    queryFn: (db) => {
      return db.execute(sql`
        SELECT token_count 
        FROM account 
        WHERE address = ${userAddress}
      `);
    },
    enabled: !!userAddress,
  });

  return {
    data:
      ((query.data as Record<string, unknown>[])?.[0]?.token_count as number) ??
      0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useKuronjeTotalSupply = () => {
  const query = usePonderQuery({
    queryFn: (db) => {
      return db.execute(sql`
        SELECT id 
        FROM token
      `);
    },
  });

  return {
    data: Array.isArray(query.data) ? query.data.length : 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// Mutation Hooks (Write Operations)
export const useMintKuronje = () => {
  const { address: walletAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const lastTransactionRef = useRef<string | null>(null);
  const isTransactionInProgressRef = useRef<boolean>(false);

  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
    timeout: 60000, // Increased timeout to 60 seconds
  });

  const mintNft = useCallback(() => {
    // Prevent duplicate transactions
    if (isTransactionInProgressRef.current || isPending || isConfirming) {
      console.log(
        "🚀 Transaction already in progress, ignoring duplicate call"
      );
      return;
    }

    if (!isConnected) {
      console.error("🚀 Wallet not connected!");
      return;
    }

    if (chainId !== 31337) {
      console.error("🚀 Wrong network! Expected 31337, got:", chainId);
      return;
    }

    // Handle specific nonce-related errors
    if (error?.message?.includes("nonce")) {
      console.log("🚀 Nonce-related error detected, clearing:", error.message);
      reset();
      // Wait a bit before allowing retry to let pending transactions settle
      setTimeout(() => {
        isTransactionInProgressRef.current = false;
      }, 2000);
      return;
    }

    if (error) {
      console.log("🚀 Resetting previous error:", error);
      reset();
    }

    isTransactionInProgressRef.current = true;

    try {
      writeContract(
        {
          address: contractAddress,
          abi: KuronjeNFTABI,
          functionName: "mintNft",
          // Force wagmi to fetch fresh nonce from the network
          account: walletAddress,
        },
        {
          onSuccess: (hash) => {
            console.log("🚀 Transaction submitted successfully! Hash:", hash);
            console.log(
              "🔍 NONCE DEBUG: Transaction hash for nonce verification:",
              hash
            );
            lastTransactionRef.current = hash;

            // Check transaction nonce vs expected nonce
            fetch("http://localhost:8545", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                jsonrpc: "2.0",
                method: "eth_getTransactionByHash",
                params: [hash],
                id: 1,
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                const txNonce = parseInt(data.result?.nonce || "0x0", 16);
                console.log("🔍 NONCE DEBUG: Transaction nonce:", txNonce);

                return fetch("http://localhost:8545", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    jsonrpc: "2.0",
                    method: "eth_getTransactionCount",
                    params: [walletAddress, "latest"],
                    id: 2,
                  }),
                });
              })
              .then((res) => res.json())
              .then((data) => {
                const expectedNonce = parseInt(data.result || "0x0", 16);
                console.log(
                  "🔍 NONCE DEBUG: Expected nonce by Anvil:",
                  expectedNonce
                );
                console.log(
                  "🔍 NONCE DEBUG: Nonce mismatch detected! Transaction will be stuck."
                );
              })
              .catch((error) => {
                console.error("🔍 NONCE DEBUG: Error checking nonce:", error);
              });

            // Don't reset isTransactionInProgressRef here - wait for confirmation
          },
          onError: (error) => {
            console.error("🚀 Mint transaction rejected or failed:", error);
            isTransactionInProgressRef.current = false;
          },
        }
      );
    } catch (syncError) {
      console.error("🚀 Synchronous error in writeContract:", syncError);
      isTransactionInProgressRef.current = false;
    }
  }, [
    writeContract,
    error,
    reset,
    isConnected,
    walletAddress,
    chainId,
    isPending,
    isConfirming,
  ]);

  // Reset transaction state when transaction completes or fails
  useEffect(() => {
    if (isSuccess || isReceiptError) {
      isTransactionInProgressRef.current = false;
    }
  }, [isSuccess, isReceiptError]);

  return {
    mintNft,
    isPending,
    isConfirming,
    isSuccess,
    isReceiptError,
    error,
    receiptError,
    hash,
    reset,
  };
};

export const useRevealToken = () => {
  const { address: walletAddress } = useAccount();
  const isTransactionInProgressRef = useRef<boolean>(false);

  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
    timeout: 60000, // Increased timeout to 60 seconds
  });

  const revealToken = useCallback(
    (tokenId: number) => {
      // Prevent duplicate transactions
      if (isTransactionInProgressRef.current || isPending || isConfirming) {
        return;
      }

      // Handle specific nonce-related errors
      if (error?.message?.includes("nonce")) {
        console.log(
          "🚀 Nonce-related error detected in reveal, clearing:",
          error.message
        );
        reset();
        setTimeout(() => {
          isTransactionInProgressRef.current = false;
        }, 2000);
        return;
      }

      if (error) reset(); // Clear previous errors

      isTransactionInProgressRef.current = true;

      writeContract(
        {
          address: contractAddress,
          abi: KuronjeNFTABI,
          functionName: "revealToken",
          args: [BigInt(tokenId)],
          // Force wagmi to fetch fresh nonce from the network
          account: walletAddress,
        },
        {
          onError: () => {
            isTransactionInProgressRef.current = false;
          },
        }
      );
    },
    [writeContract, error, reset, isPending, isConfirming, walletAddress]
  );

  // Reset transaction state when transaction completes or fails
  useEffect(() => {
    if (isSuccess || isReceiptError) {
      isTransactionInProgressRef.current = false;
    }
  }, [isSuccess, isReceiptError]);

  return {
    revealToken,
    isPending,
    isConfirming,
    isSuccess,
    isReceiptError,
    error,
    receiptError,
    hash,
    reset,
  };
};

// Complex Composite Hook - Using Ponder React Hooks
export const useUserKuronjeNFTs = (userAddress?: `0x${string}`) => {
  const [userNFTs, setUserNFTs] = useState<NFTToken[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  console.log("🔍 useUserKuronjeNFTs called with userAddress:", userAddress);

  const { data: balance, refetch: refetchBalance } =
    useKuronjeBalance(userAddress);

  const { data: totalSupply, refetch: refetchTotalSupply } =
    useKuronjeTotalSupply();

  // Query user's tokens from Ponder using SQL
  const {
    data: ponderTokens,
    isLoading: isLoadingPonderTokens,
    refetch: refetchPonderTokens,
  } = usePonderQuery({
    queryFn: (db) => {
      return db.query.token.findMany({
        where: eq(schema.token.owner, userAddress!),
        orderBy: asc(schema.token.id),
      });
    },
    enabled: !!userAddress,
  });

  // Process tokens and fetch metadata whenever tokens change
  useEffect(() => {
    if (!ponderTokens || isLoadingPonderTokens) {
      return;
    }

    // If data is not an array, just set empty array and exit
    if (!Array.isArray(ponderTokens)) {
      console.log("Data is not an array, setting empty NFTs");
      setUserNFTs([]);
      setIsLoadingMetadata(false);
      return;
    }

    const processTokensWithMetadata = async () => {
      setIsLoadingMetadata(true);
      const processedTokens: NFTToken[] = [];

      // Ensure we have an array to iterate over
      const tokensArray = Array.isArray(ponderTokens) ? ponderTokens : [];

      for (const token of tokensArray) {
        const tokenId = Number(token.id);
        const isRevealed = Boolean(token.isRevealed);
        const metadataId = Number(token.metadataId);

        // Generate metadata URI based on revealed status using actual contract URIs
        const metadataUri = isRevealed
          ? `ipfs://bafybeie2nvvvfj6yiwqusb72rrqd3xkmbsaqievndlpkttjaihqr7fjetq/${metadataId}.json`
          : `ipfs://bafkreic3oh7lfwipdtic6uk7r22xx2qn6yxi4htvtk2eifm3qwgffgf5wy`;

        // Fetch real metadata from IPFS
        const metadata = await fetchMetadataFromIPFS(metadataUri);

        if (metadata) {
          console.log(`Token ${tokenId} metadata:`, metadata);
          processedTokens.push({
            tokenId,
            isRevealed,
            metadata,
          });
        } else {
          // Fallback to placeholder if IPFS fetch fails
          const fallbackMetadata: NFTMetadata = {
            name: isRevealed
              ? `Kuronje #${metadataId} - Revealed`
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
              { trait_type: "Token ID", value: tokenId.toString() },
              { trait_type: "Metadata ID", value: metadataId.toString() },
            ],
          };

          processedTokens.push({
            tokenId,
            isRevealed,
            metadata: fallbackMetadata,
          });
        }
      }

      setUserNFTs(processedTokens);
      setIsLoadingMetadata(false);
    };

    processTokensWithMetadata().catch((error) => {
      console.error("Error processing tokens with metadata:", error);
      setIsLoadingMetadata(false);
      setUserNFTs([]);
    });
  }, [ponderTokens, isLoadingPonderTokens]);

  // Fallback effect to ensure loading state doesn't get stuck
  useEffect(() => {
    if (!isLoadingPonderTokens && ponderTokens !== undefined) {
      // If the main effect didn't run for some reason, ensure we're not stuck loading
      const timer = setTimeout(() => {
        if (isLoadingMetadata) {
          setIsLoadingMetadata(false);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isLoadingPonderTokens, ponderTokens, isLoadingMetadata]);

  const refreshAll = useCallback(async () => {
    setIsLoadingMetadata(true);
    try {
      await Promise.all([
        refetchBalance(),
        refetchTotalSupply(),
        refetchPonderTokens(),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoadingMetadata(false);
    }
  }, [refetchBalance, refetchTotalSupply, refetchPonderTokens]);

  return {
    userNFTs,
    isLoading: isLoadingPonderTokens || isLoadingMetadata,
    balance: balance ?? 0,
    totalSupply: totalSupply ?? 0,
    refetch: refetchPonderTokens,
    refreshAll,
  };
};

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useChainId,
} from "wagmi";
import { useState, useCallback, useEffect, useRef } from "react";
import { usePonderQuery } from "@ponder/react";
import { sql } from "@ponder/client";

import contractAddressData from "../../contracts/contract-address.json";
import { KuronjeNFTABI } from "../../contracts/KuronjeNFTABI";

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
      if (!userAddress) {
        // Return a query that results in 0
        return db.execute(sql`SELECT 0 as token_count`);
      }

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

  // Debug: Log mint hook state (remove in production)
  console.log("🚀 MINT HOOK STATE:", {
    isPending,
    isConfirming,
    isSuccess,
    isReceiptError,
    hash,
    error: error?.message,
    receiptError: receiptError?.message,
    walletAddress,
    isConnected,
    chainId,
  });

  // Enhanced debugging for transaction receipt
  if (hash) {
    console.log("🚀 Transaction hash exists:", hash);
    console.log("🚀 isConfirming:", isConfirming);
    console.log("🚀 isSuccess:", isSuccess);
    console.log("🚀 isReceiptError:", isReceiptError);
  } else {
    console.log("🚀 No transaction hash yet");
  }

  if (isReceiptError) {
    console.log("🚀 Receipt error:", receiptError);
  }

  const mintNft = useCallback(() => {
    console.log("🚀 mintNft called");

    // Prevent duplicate transactions
    if (isTransactionInProgressRef.current || isPending || isConfirming) {
      console.log(
        "🚀 Transaction already in progress, ignoring duplicate call"
      );
      return;
    }

    console.log("🚀 Contract address:", contractAddress);
    console.log("🚀 writeContract function available:", !!writeContract);
    console.log("🚀 Wallet connected:", isConnected);
    console.log("🚀 Wallet address:", walletAddress);
    console.log("🚀 Chain ID:", chainId);
    console.log("🚀 Expected chain ID: 31337");

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
      console.log("🚀 About to call writeContract with:", {
        address: contractAddress,
        functionName: "mintNft",
        walletAddress,
        chainId,
      });

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
            console.error("🚀 Error details:", {
              name: error.name,
              message: error.message,
              cause: error.cause,
            });
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
      console.log("🚀 Transaction completed, resetting state:", {
        isSuccess,
        isReceiptError,
      });
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
        console.log(
          "🚀 Reveal transaction already in progress, ignoring duplicate call"
        );
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
          onError: (error) => {
            console.log("Reveal transaction rejected or failed:", error);
            isTransactionInProgressRef.current = false;
          },
          onSuccess: (hash) => {
            console.log("Reveal transaction submitted successfully:", hash);
            // Don't reset isTransactionInProgressRef here - wait for confirmation
          },
        }
      );
    },
    [writeContract, error, reset, isPending, isConfirming, walletAddress]
  );

  // Reset transaction state when transaction completes or fails
  useEffect(() => {
    if (isSuccess || isReceiptError) {
      console.log("🚀 Reveal transaction completed, resetting state:", {
        isSuccess,
        isReceiptError,
      });
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
  const tokensQuery = usePonderQuery({
    queryFn: (db) => {
      if (!userAddress) {
        console.log("🔍 No userAddress, returning empty query");
        // Return an empty result query
        return db.execute(sql`SELECT NULL as id LIMIT 0`);
      }

      console.log("🔍 Executing token query for address:", userAddress);
      return db.execute(sql`
        SELECT id, owner, metadata_id, is_revealed, revealed_by, revealed_at, minted_at
        FROM token 
        WHERE owner = ${userAddress}
        ORDER BY id ASC
      `);
    },
    enabled: !!userAddress,
  });

  console.log("🔍 tokensQuery.isLoading:", tokensQuery.isLoading);
  console.log("🔍 tokensQuery.data:", tokensQuery.data);
  console.log("🔍 tokensQuery.error:", tokensQuery.error);

  // Process tokens and fetch metadata whenever tokens change
  useEffect(() => {
    console.log("🚀 useEffect STARTED - Latest code version");

    if (!tokensQuery.data || tokensQuery.isLoading) {
      console.log("🚀 Early return - no data or still loading");
      return;
    }

    console.log("=== DEBUG INFO ===");
    console.log("tokensQuery.data:", tokensQuery.data);
    console.log("tokensQuery.data type:", typeof tokensQuery.data);
    console.log("tokensQuery.data is array:", Array.isArray(tokensQuery.data));

    // If data is not an array, just set empty array and exit
    if (!Array.isArray(tokensQuery.data)) {
      console.log("Data is not an array, setting empty NFTs");
      setUserNFTs([]);
      setIsLoadingMetadata(false);
      return;
    }

    const processTokensWithMetadata = async () => {
      setIsLoadingMetadata(true);
      const processedTokens: NFTToken[] = [];

      // Ensure we have an array to iterate over
      const tokensArray = Array.isArray(tokensQuery.data)
        ? tokensQuery.data
        : [];

      console.log("tokensArray:", tokensArray);

      for (const token of tokensArray as Record<string, unknown>[]) {
        const tokenId = Number(token.id);
        const isRevealed = Boolean(token.is_revealed);
        const metadataId = Number(token.metadata_id);

        // Generate metadata URI based on revealed status using actual contract URIs
        const metadataUri = isRevealed
          ? `ipfs://bafybeie2nvvvfj6yiwqusb72rrqd3xkmbsaqievndlpkttjaihqr7fjetq/${metadataId}.json`
          : `ipfs://bafkreic3oh7lfwipdtic6uk7r22xx2qn6yxi4htvtk2eifm3qwgffgf5wy`;

        console.log(`Token ${tokenId} isRevealed:`, isRevealed);
        console.log(`Token ${tokenId} metadata URI:`, metadataUri);

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
              ? `Kuronje #${tokenId} - Revealed`
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
              { trait_type: "Metadat a ID", value: metadataId.toString() },
            ],
          };

          processedTokens.push({
            tokenId,
            isRevealed,
            metadata: fallbackMetadata,
          });
        }
      }

      console.log(`Processed ${processedTokens.length} tokens with metadata`);
      setUserNFTs(processedTokens);
      setIsLoadingMetadata(false);
    };

    processTokensWithMetadata().catch((error) => {
      console.error("Error processing tokens with metadata:", error);
      setIsLoadingMetadata(false);
      setUserNFTs([]);
    });
  }, [tokensQuery.data, tokensQuery.isLoading]);

  // Fallback effect to ensure loading state doesn't get stuck
  useEffect(() => {
    if (!tokensQuery.isLoading && tokensQuery.data !== undefined) {
      // If the main effect didn't run for some reason, ensure we're not stuck loading
      const timer = setTimeout(() => {
        if (isLoadingMetadata) {
          console.log("Fallback: clearing loading state");
          setIsLoadingMetadata(false);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [tokensQuery.isLoading, tokensQuery.data, isLoadingMetadata]);

  const refreshAll = useCallback(async () => {
    setIsLoadingMetadata(true);
    try {
      await Promise.all([
        refetchBalance(),
        refetchTotalSupply(),
        tokensQuery.refetch(),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoadingMetadata(false);
    }
  }, [refetchBalance, refetchTotalSupply, tokensQuery]);

  console.log(
    "🔥 LATEST CODE RUNNING - tokensQuery.isLoading: ",
    tokensQuery.isLoading
  );
  console.log(
    "🔥 LATEST CODE RUNNING - isLoadingMetadata: ",
    isLoadingMetadata
  );

  return {
    userNFTs,
    isLoading: tokensQuery.isLoading || isLoadingMetadata,
    balance: balance ?? 0,
    totalSupply: totalSupply ?? 0,
    refetch: tokensQuery.refetch,
    refreshAll,
  };
};

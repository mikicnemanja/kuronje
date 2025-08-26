import { useAccount, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useMintKuronje,
  useRevealToken,
  useUserKuronjeNFTs,
  type NFTToken,
} from "./hooks";
import BitcoinCursorFollower from "./components/BitcoinCursorFollower";
import KuronjeCard from "./components/KuronjeCard";

// Development Reset Component
const DevResetButton = () => {
  const queryClient = useQueryClient();
  const { disconnect } = useDisconnect();

  const handleReset = () => {
    console.log("🔄 Resetting frontend cache...");

    // Clear all wagmi/react-query cache
    queryClient.clear();

    // Disconnect wallet to force fresh connection
    disconnect();

    // Clear any local storage that might cache nonces
    try {
      localStorage.removeItem("wagmi.cache");
      localStorage.removeItem("wagmi.store");
      sessionStorage.clear(); // Also clear session storage
    } catch {
      console.log("No local storage to clear");
    }

    console.log("✅ Frontend reset complete - please reconnect wallet");

    // More helpful alert with instructions
    alert(`🔄 Frontend cache cleared!

📋 IMPORTANT: Also reset your wallet:

MetaMask:
1. Open MetaMask
2. Settings → Advanced
3. Click "Reset Account"
4. Reconnect wallet

This fixes nonce cache issues completely.`);
  };

  // Only show in development
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div
      style={{ position: "fixed", top: "10px", right: "10px", zIndex: 1000 }}
    >
      <button
        onClick={handleReset}
        style={{
          padding: "8px 12px",
          backgroundColor: "#ff6b6b",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "12px",
          cursor: "pointer",
          fontWeight: "bold",
          marginBottom: "5px",
          display: "block",
          width: "100%",
        }}
        title="Click this after restarting Anvil to clear frontend cache"
      >
        🔄 Reset Cache
      </button>
      <div
        style={{
          fontSize: "10px",
          color: "#666",
          textAlign: "center",
          backgroundColor: "rgba(255,255,255,0.9)",
          padding: "4px",
          borderRadius: "4px",
        }}
      >
        After cache reset:
        <br />
        Reset wallet account too!
      </div>
    </div>
  );
};

export default function App() {
  const { isConnected, address } = useAccount();

  // Custom hooks for contract interactions
  const {
    mintNft,
    isPending: isMinting,
    isConfirming: isMintConfirming,
    isSuccess: isMintSuccess,
    isReceiptError: isMintReceiptError,
    error: mintError,
    receiptError: mintReceiptError,
    reset: resetMint,
  } = useMintKuronje();

  const {
    revealToken,
    isPending: isRevealing,
    isConfirming: isRevealConfirming,
    isSuccess: isRevealSuccess,
    isReceiptError: isRevealReceiptError,
    error: revealError,
    receiptError: revealReceiptError,
    reset: resetReveal,
  } = useRevealToken();

  const { userNFTs, isLoading, balance, refreshAll } =
    useUserKuronjeNFTs(address);

  const handleMint = () => {
    mintNft();
  };

  const handleReveal = (tokenId: number) => {
    revealToken(tokenId);
  };

  // Handle successful transactions
  useEffect(() => {
    if (isMintSuccess) {
      console.log("🎉 Mint successful! Refreshing data...");
      refreshAll();
      setTimeout(() => {
        // Reset mint state after a delay to allow user to see success
        resetMint();
      }, 2000);
    }
  }, [isMintSuccess, refreshAll, resetMint]);

  useEffect(() => {
    if (isRevealSuccess) {
      console.log("🎉 Reveal successful! Refreshing data...");
      refreshAll();
      setTimeout(() => {
        // Reset reveal state after a delay
        resetReveal();
      }, 2000);
    }
  }, [isRevealSuccess, refreshAll, resetReveal]);

  // Handle receipt errors (timeouts, etc.)
  useEffect(() => {
    if (isMintReceiptError) {
      console.log("🚨 Mint receipt error (likely timeout):", mintReceiptError);
      setTimeout(() => {
        resetMint();
      }, 1000);
    }
  }, [isMintReceiptError, mintReceiptError, resetMint]);

  useEffect(() => {
    if (isRevealReceiptError) {
      console.log(
        "🚨 Reveal receipt error (likely timeout):",
        revealReceiptError
      );
      setTimeout(() => {
        resetReveal();
      }, 1000);
    }
  }, [isRevealReceiptError, revealReceiptError, resetReveal]);

  console.log(
    "isMinting , isMintConfirming , isRevealing , isRevealConfirming: ",
    isMinting,
    isMintConfirming,
    isRevealing,
    isRevealConfirming
  );

  const isAnyTransactionPending =
    isMinting || isMintConfirming || isRevealing || isRevealConfirming;
  const hasErrors =
    mintError || revealError || mintReceiptError || revealReceiptError;

  console.log("isAnyTransactionPending: ", isAnyTransactionPending);
  console.log("isLoading: ", isLoading);

  return (
    <>
      {/* Development reset button */}
      <DevResetButton />

      {/* Bitcoin background - renders behind everything */}
      <BitcoinCursorFollower />

      {!isConnected ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            width: "100vw",
            position: "relative",
            zIndex: 1,
          }}
        >
          <h1 style={{ color: "white", marginBottom: "2rem" }}>
            Kuronje NFT Collection
          </h1>

          <div
            style={{
              marginBottom: "2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h3
              style={{
                color: "white",
                marginBottom: "1rem",
                fontSize: "1.1rem",
              }}
            >
              Connect your wallet to get started:
            </h3>
            <ConnectButton />
          </div>
        </div>
      ) : (
        <div
          style={{
            minHeight: "100vh",
            width: "100vw",
            padding: "2rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <h1 style={{ color: "white", margin: 0 }}>
                Kuronje NFT Collection
              </h1>
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <ConnectButton />
              </div>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <button
                onClick={handleMint}
                disabled={isAnyTransactionPending || isLoading}
                style={{
                  padding: "1rem 2rem",
                  fontSize: "1.1rem",
                  backgroundColor:
                    isAnyTransactionPending || isLoading ? "#ccc" : "white",
                  color: "teal",
                  border: "none",
                  borderRadius: "8px",
                  cursor:
                    isAnyTransactionPending || isLoading
                      ? "not-allowed"
                      : "pointer",
                  fontWeight: "bold",
                  marginRight: "1rem",
                }}
              >
                {isMinting
                  ? "Submitting..."
                  : isMintConfirming
                  ? "Confirming..."
                  : "Mint New Kuronje"}
              </button>

              <button
                onClick={refreshAll}
                disabled={isLoading || isAnyTransactionPending}
                style={{
                  padding: "1rem 2rem",
                  fontSize: "1.1rem",
                  backgroundColor:
                    isLoading || isAnyTransactionPending
                      ? "#ccc"
                      : "darkslategray",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor:
                    isLoading || isAnyTransactionPending
                      ? "not-allowed"
                      : "pointer",
                  fontWeight: "bold",
                }}
              >
                {isLoading ? "Loading..." : "Refresh Collection"}
              </button>

              {/* Error feedback */}
              {hasErrors && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem",
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    border: "1px solid rgba(255, 0, 0, 0.3)",
                    borderRadius: "6px",
                    color: "#ff4444",
                    fontSize: "0.9rem",
                  }}
                >
                  {(() => {
                    const errorMessage =
                      (mintError || revealError)?.message || "";

                    if (
                      errorMessage.includes("rejected") ||
                      errorMessage.includes("denied")
                    ) {
                      return "Transaction was cancelled by user";
                    }

                    if (errorMessage.includes("nonce")) {
                      return "Transaction nonce issue detected. Please wait a moment and try again.";
                    }

                    if (
                      errorMessage.includes(
                        "replacement transaction underpriced"
                      )
                    ) {
                      return "Transaction is being replaced. Please wait for confirmation or try again with higher gas.";
                    }

                    if (errorMessage.includes("already known")) {
                      return "This transaction is already pending. Please wait for confirmation.";
                    }

                    return `Transaction failed: ${errorMessage}`;
                  })()}
                  <button
                    onClick={() => {
                      if (mintError) resetMint();
                      if (revealError) resetReveal();
                    }}
                    style={{
                      marginLeft: "1rem",
                      padding: "0.25rem 0.5rem",
                      fontSize: "0.8rem",
                      backgroundColor: "transparent",
                      color: "#ff4444",
                      border: "1px solid #ff4444",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>

            <div
              style={{
                color: "white",
                marginBottom: "2rem",
                fontSize: "1.1rem",
              }}
            >
              <p>
                Your NFTs: {userNFTs.length} / Balance: {balance}
              </p>
            </div>

            {userNFTs.length === 0 ? (
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  padding: "4rem",
                  borderRadius: "20px",
                  color: "#1f2937",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  textAlign: "center",
                  maxWidth: "500px",
                  margin: "0 auto",
                }}
              >
                <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📦</div>
                <h2
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "700",
                    marginBottom: "1rem",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  No Kuronje NFTs Found
                </h2>
                <p
                  style={{
                    fontSize: "1.1rem",
                    color: "#64748b",
                    marginBottom: "0",
                    lineHeight: "1.6",
                  }}
                >
                  Mint your first Kuronje NFT to start your collection!
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                  gap: "2.5rem",
                  marginTop: "2rem",
                  padding: "1rem",
                }}
              >
                {userNFTs.map((nft: NFTToken) => (
                  <KuronjeCard
                    key={nft.tokenId}
                    nft={nft}
                    onReveal={handleReveal}
                    isRevealing={isRevealing}
                    isRevealConfirming={isRevealConfirming}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

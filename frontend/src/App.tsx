import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useMintKuronje,
  useRevealToken,
  useUserKuronjeNFTs,
  type NFTToken,
} from "./hooks";
import BitcoinCursorFollower from "./components/BitcoinCursorFollower";
import KuronjeCard from "./components/KuronjeCard";

export default function App() {
  const { isConnected, address } = useAccount();

  // Custom hooks for contract interactions
  const {
    mintNft,
    isPending: isMinting,
    isConfirming: isMintConfirming,
    error: mintError,
    reset: resetMintError,
  } = useMintKuronje();

  const {
    revealToken,
    isPending: isRevealing,
    isConfirming: isRevealConfirming,
    error: revealError,
    reset: resetRevealError,
  } = useRevealToken();

  const { userNFTs, isLoading, balance, refreshAll } =
    useUserKuronjeNFTs(address);

  const handleMint = () => {
    mintNft();
  };

  const handleReveal = (tokenId: number) => {
    revealToken(tokenId);
  };

  const isAnyTransactionPending =
    isMinting || isMintConfirming || isRevealing || isRevealConfirming;
  const hasErrors = mintError || revealError;

  return (
    <>
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
                  {(mintError || revealError)?.message.includes("rejected") ||
                  (mintError || revealError)?.message.includes("denied")
                    ? "Transaction was cancelled by user"
                    : `Transaction failed: ${
                        (mintError || revealError)?.message
                      }`}
                  <button
                    onClick={() => {
                      if (mintError) resetMintError();
                      if (revealError) resetRevealError();
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

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

interface NFTToken {
  tokenId: number;
  isRevealed: boolean;
  metadata?: NFTMetadata;
}

interface KuronjeCardProps {
  nft: NFTToken;
  onReveal: (tokenId: number) => void;
  isRevealing: boolean;
  isRevealConfirming: boolean;
}

function getRarityInfo(nft: NFTToken) {
  if (!nft.isRevealed) {
    return { rarity: "mystery", emoji: "🎁", color: "rgba(255, 193, 7, 0.9)" };
  }

  const rarityAttr = nft.metadata?.attributes?.find(
    (attr) => attr.trait_type.toLowerCase() === "rarity"
  );
  const rarity = rarityAttr?.value.toLowerCase() || "common";

  switch (rarity) {
    case "common":
      return {
        rarity: "Common",
        emoji: "⚪",
        color: "rgba(156, 163, 175, 0.9)",
      };
    case "uncommon":
      return {
        rarity: "Uncommon",
        emoji: "🟢",
        color: "rgba(34, 197, 94, 0.9)",
      };
    case "rare":
      return { rarity: "Rare", emoji: "🔵", color: "rgba(59, 130, 246, 0.9)" };
    case "epic":
      return { rarity: "Epic", emoji: "🟣", color: "rgba(147, 51, 234, 0.9)" };
    default:
      return {
        rarity: "Common",
        emoji: "⚪",
        color: "rgba(156, 163, 175, 0.9)",
      };
  }
}

function getRarityGradient(nft: NFTToken) {
  if (!nft.isRevealed) {
    // Special unrevealed gradient - magical gold radiating from center
    return "radial-gradient(circle at center, rgba(255, 215, 0, 0.8) 0%, rgba(255, 193, 7, 0.6) 30%, rgba(255, 165, 0, 0.3) 60%, transparent 100%)";
  }

  // Find rarity from attributes
  const rarityAttr = nft.metadata?.attributes?.find(
    (attr) => attr.trait_type.toLowerCase() === "rarity"
  );
  const rarity = rarityAttr?.value.toLowerCase() || "common";

  switch (rarity) {
    case "common":
      return "radial-gradient(circle at center, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 30%, rgba(226, 232, 240, 0.3) 60%, transparent 100%)";
    case "uncommon":
      return "radial-gradient(circle at center, rgba(34, 197, 94, 0.8) 0%, rgba(22, 163, 74, 0.6) 30%, rgba(21, 128, 61, 0.3) 60%, transparent 100%)";
    case "rare":
      return "radial-gradient(circle at center, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.6) 30%, rgba(29, 78, 216, 0.3) 60%, transparent 100%)";
    case "epic":
      return "radial-gradient(circle at center, rgba(147, 51, 234, 0.8) 0%, rgba(126, 34, 206, 0.6) 30%, rgba(107, 33, 168, 0.3) 60%, transparent 100%)";
    default:
      // Fallback to common
      return "radial-gradient(circle at center, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 30%, rgba(226, 232, 240, 0.3) 60%, transparent 100%)";
  }
}

export default function KuronjeCard({
  nft,
  onReveal,
  isRevealing,
  isRevealConfirming,
}: KuronjeCardProps) {
  return (
    <div
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: "16px",
        padding: "0",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        textAlign: "left",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.25)",
        overflow: "hidden",
        transition:
          "transform 0.1s ease, box-shadow 0.1s ease, background-color 0.1s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 48px rgba(0,0,0,0.15)";
        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)";
        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
      }}
    >
      {/* Image Container */}
      <div
        style={{
          width: "100%",
          height: "280px",
          background: getRarityGradient(nft),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {nft.metadata?.image ? (
          <img
            src={nft.metadata.image}
            alt={nft.metadata.name || "Kuronje NFT"}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              transition: "transform 0.1s ease",
            }}
            onLoad={() => {
              console.log(
                `✅ Image loaded successfully: ${nft.metadata?.image}`
              );
            }}
            onError={(e) => {
              console.error(`❌ Image failed to load: ${nft.metadata?.image}`);
              console.error("Error details:", e);

              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              target.parentElement!.innerHTML = `
                <div style="
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  height: 100%;
                  color: white;
                  text-align: center;
                ">
                  <div style="font-size: 4rem; margin-bottom: 0.5rem;">
                    ${nft.isRevealed ? "🎭" : "📦"}
                  </div>
                  <div style="font-size: 0.9rem; opacity: 0.8;">
                    ${nft.isRevealed ? "Character Image" : "Mystery Box"}
                  </div>
                </div>
              `;
            }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "white",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "0.5rem" }}>
              {nft.isRevealed ? "🎭" : "📦"}
            </div>
            <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>
              {nft.isRevealed ? "Character Image" : "Mystery Box"}
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            backgroundColor: getRarityInfo(nft).color,
            color: "white",
            padding: "4px 8px",
            borderRadius: "12px",
            fontSize: "0.75rem",
            fontWeight: "600",
            backdropFilter: "blur(8px)",
          }}
        >
          {nft.isRevealed
            ? `${getRarityInfo(nft).emoji} ${getRarityInfo(nft).rarity}`
            : "🔒 Hidden"}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          padding: "1.5rem",
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Title */}
        <h3
          style={{
            color: "#1f2937",
            fontSize: "1.5rem",
            fontWeight: "800",
            lineHeight: "1.2",
            marginBottom: "0.5rem",
            textShadow: "0 1px 2px rgba(255, 255, 255, 0.8)",
          }}
        >
          {nft.metadata?.name || `Kuronje #${nft.tokenId}`}
        </h3>

        {/* Attributes */}
        {nft.metadata?.attributes && nft.metadata.attributes.length > 0 && (
          <div style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              {nft.metadata.attributes.map((attr, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "0.8rem",
                    color: "#1f2937",
                    fontWeight: "600",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <strong style={{ color: "#374151" }}>
                    {attr.trait_type}:
                  </strong>{" "}
                  {attr.value}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reveal Button */}
        {!nft.isRevealed && (
          <button
            onClick={() => onReveal(nft.tokenId)}
            disabled={isRevealing || isRevealConfirming}
            style={{
              width: "100%",
              padding: "12px 16px",
              background:
                isRevealing || isRevealConfirming
                  ? "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)"
                  : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor:
                isRevealing || isRevealConfirming ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "1rem",
              transition: "all 0.2s ease",
              boxShadow:
                isRevealing || isRevealConfirming
                  ? "none"
                  : "0 4px 12px rgba(245, 158, 11, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (!isRevealing && !isRevealConfirming) {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(245, 158, 11, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isRevealing && !isRevealConfirming) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(245, 158, 11, 0.3)";
              }
            }}
          >
            {isRevealing || isRevealConfirming
              ? "🔄 Revealing..."
              : "✨ Reveal This Kuronje!"}
          </button>
        )}
      </div>
    </div>
  );
}

import { Hono } from "hono";
import { cors } from "hono/cors";

type TokenData = {
  id: string;
  tokenId: number;
  owner: string;
  metadataId?: number;
  revealed: boolean;
  mintedAt: number;
  mintTxHash: string;
  blockNumber: number;
};

type CollectionStats = {
  totalSupply: number;
  totalRevealed: number;
  uniqueOwners: number;
  lastUpdated: number;
};

// Create Hono app
const app = new Hono();

// Enable CORS for frontend
app.use(
  "/*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // Vite dev server and other common ports
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: Date.now() });
});

// Get collection stats
app.get("/api/collection/stats", async (c) => {
  // TODO: This will be replaced with actual database queries once Ponder is working
  const mockStats: CollectionStats = {
    totalSupply: 0,
    totalRevealed: 0,
    uniqueOwners: 0,
    lastUpdated: Date.now(),
  };

  return c.json(mockStats);
});

// Get all tokens
app.get("/api/tokens", async (c) => {
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");
  const owner = c.req.query("owner");
  const revealed = c.req.query("revealed");

  // TODO: This will be replaced with actual database queries once Ponder is working
  const mockTokens: TokenData[] = [];

  return c.json({
    tokens: mockTokens,
    total: 0,
    limit,
    offset,
  });
});

// Get specific token by ID
app.get("/api/tokens/:tokenId", async (c) => {
  const tokenId = c.req.param("tokenId");

  if (!tokenId || isNaN(parseInt(tokenId))) {
    return c.json({ error: "Invalid token ID" }, 400);
  }

  // TODO: This will be replaced with actual database queries once Ponder is working
  return c.json({ error: "Token not found" }, 404);
});

// Get tokens owned by an address
app.get("/api/owners/:address/tokens", async (c) => {
  const address = c.req.param("address");

  if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
    return c.json({ error: "Invalid address format" }, 400);
  }

  // TODO: This will be replaced with actual database queries once Ponder is working
  const mockTokens: TokenData[] = [];

  return c.json({
    tokens: mockTokens,
    owner: address,
    count: mockTokens.length,
  });
});

// Get recent transfers
app.get("/api/transfers", async (c) => {
  const limit = parseInt(c.req.query("limit") || "50");
  const offset = parseInt(c.req.query("offset") || "0");

  // TODO: This will be replaced with actual database queries once Ponder is working
  return c.json({
    transfers: [],
    total: 0,
    limit,
    offset,
  });
});

// Get owner leaderboard
app.get("/api/owners/leaderboard", async (c) => {
  const limit = parseInt(c.req.query("limit") || "10");

  // TODO: This will be replaced with actual database queries once Ponder is working
  return c.json({
    owners: [],
    limit,
  });
});

// Error handling
app.onError((err, c) => {
  console.error("API Error:", err);
  return c.json({ error: "Internal Server Error" }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

export default app;

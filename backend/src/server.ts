import { serve } from "@hono/node-server";
import app from "./api.js";

const port = parseInt(process.env.PORT || "3001");

console.log(`🚀 Starting Kuronje NFT API server on port ${port}`);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`✅ Server is running on http://localhost:${info.port}`);
    console.log(`📊 API endpoints available:`);
    console.log(`  - GET /health - Health check`);
    console.log(`  - GET /api/collection/stats - Collection statistics`);
    console.log(`  - GET /api/tokens - Get all tokens`);
    console.log(`  - GET /api/tokens/:tokenId - Get specific token`);
    console.log(`  - GET /api/owners/:address/tokens - Get tokens by owner`);
    console.log(`  - GET /api/transfers - Get recent transfers`);
    console.log(`  - GET /api/owners/leaderboard - Get owner leaderboard`);
  }
);

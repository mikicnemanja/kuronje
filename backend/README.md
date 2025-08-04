# Kuronje NFT Backend

This backend provides indexing and API services for the Kuronje NFT project using Ponder for blockchain data indexing and Hono for serving a REST API.

## Features

- **Ponder Integration**: Indexes blockchain events from the KuronjeNFT contract
- **Hono API Server**: Provides REST endpoints for frontend consumption
- **TypeScript**: Full TypeScript support with proper typing
- **CORS Enabled**: Ready for frontend integration

## Installation

```bash
npm install
```

## Configuration

1. Update the contract address in `ponder.config.ts` with your deployed KuronjeNFT contract address
2. Modify the RPC URL in `ponder.config.ts` if not using local Anvil
3. Adjust the starting block number if needed

## Development

### Running the API Server Only

To run just the Hono API server (with mock data):

```bash
npm run dev
```

The server will start on `http://localhost:3001` with the following endpoints:

- `GET /health` - Health check
- `GET /api/collection/stats` - Collection statistics
- `GET /api/tokens` - Get all tokens (with pagination)
- `GET /api/tokens/:tokenId` - Get specific token by ID
- `GET /api/owners/:address/tokens` - Get tokens owned by address
- `GET /api/transfers` - Get recent transfer events
- `GET /api/owners/leaderboard` - Get top token holders

### Running Ponder Indexer

To start the Ponder indexer (requires deployed contract):

```bash
npm run ponder:dev
```

This will:

- Connect to your blockchain RPC
- Start indexing events from the KuronjeNFT contract
- Populate the database with real blockchain data

## API Documentation

### GET /api/collection/stats

Returns collection-wide statistics.

**Response:**

```json
{
  "totalSupply": 20,
  "totalRevealed": 5,
  "uniqueOwners": 12,
  "lastUpdated": 1640995200000
}
```

### GET /api/tokens

Returns paginated list of tokens.

**Query Parameters:**

- `limit` (default: 50) - Number of tokens to return
- `offset` (default: 0) - Number of tokens to skip
- `owner` - Filter by owner address
- `revealed` - Filter by revealed status

**Response:**

```json
{
  "tokens": [...],
  "total": 20,
  "limit": 50,
  "offset": 0
}
```

### GET /api/tokens/:tokenId

Returns specific token data.

**Response:**

```json
{
  "id": "1",
  "tokenId": 1,
  "owner": "0x123...",
  "metadataId": 5,
  "revealed": true,
  "mintedAt": 1640995200000,
  "mintTxHash": "0xabc...",
  "blockNumber": 12345
}
```

## Production

To build and run in production:

```bash
npm run build
npm start
```

## Technologies

- **[Ponder](https://ponder.sh/)** - Blockchain indexing framework
- **[Hono](https://hono.dev/)** - Lightweight web framework
- **TypeScript** - Type-safe development
- **Drizzle ORM** - Type-safe database operations (via Ponder)

## Next Steps

1. Deploy your KuronjeNFT contract and update the contract address in `ponder.config.ts`
2. Start the Ponder indexer to begin collecting blockchain data
3. The API will automatically serve real data once indexing begins
4. Integrate with your frontend application

import { onchainTable, index } from "@ponder/core";

// NFT tokens table
export const tokens = onchainTable("tokens", (t) => ({
  id: t.text().primaryKey(), // tokenId as string
  tokenId: t.bigint().notNull(),
  owner: t.hex().notNull(),
  metadataId: t.bigint(),
  revealed: t.boolean().default(false),
  mintedAt: t.bigint().notNull(),
  mintTxHash: t.hex().notNull(),
  blockNumber: t.bigint().notNull(),
}));

// Transfer events table
export const transfers = onchainTable("transfers", (t) => ({
  id: t.text().primaryKey(), // combination of txHash and logIndex
  tokenId: t.bigint().notNull(),
  from: t.hex().notNull(),
  to: t.hex().notNull(),
  timestamp: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  txHash: t.hex().notNull(),
  logIndex: t.integer().notNull(),
}));

// Approval events table
export const approvals = onchainTable("approvals", (t) => ({
  id: t.text().primaryKey(), // combination of txHash and logIndex
  tokenId: t.bigint().notNull(),
  owner: t.hex().notNull(),
  approved: t.hex().notNull(),
  timestamp: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  txHash: t.hex().notNull(),
  logIndex: t.integer().notNull(),
}));

// Collection stats
export const collection = onchainTable("collection", (t) => ({
  id: t.text().primaryKey(), // singleton record with id "kuronje"
  totalSupply: t.bigint().default(0n),
  totalRevealed: t.bigint().default(0n),
  uniqueOwners: t.bigint().default(0n),
  lastUpdated: t.bigint().notNull(),
}));

// Owner balances for quick queries
export const owners = onchainTable("owners", (t) => ({
  id: t.hex().primaryKey(), // owner address
  address: t.hex().notNull(),
  balance: t.bigint().default(0n),
  firstPurchase: t.bigint(),
  lastActivity: t.bigint().notNull(),
}));

// Indexes for better query performance
export const tokenOwnerIndex = index("token_owner_idx").on(tokens.owner);
export const transferFromIndex = index("transfer_from_idx").on(transfers.from);
export const transferToIndex = index("transfer_to_idx").on(transfers.to);

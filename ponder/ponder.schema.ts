import { onchainTable } from "ponder";

export const account = onchainTable("account", (t) => ({
  address: t.hex().primaryKey(),
  tokenCount: t.integer().notNull().default(0),
}));

export const token = onchainTable("token", (t) => ({
  id: t.bigint().primaryKey(),
  owner: t.hex().notNull(),
  metadataId: t.bigint().notNull(),
  isRevealed: t.boolean().notNull().default(false),
  revealedBy: t.hex(),
  revealedAt: t.integer(),
  mintedAt: t.integer().notNull(),
}));

export const transferEvent = onchainTable("transfer_event", (t) => ({
  id: t.text().primaryKey(),
  timestamp: t.integer().notNull(),
  from: t.hex().notNull(),
  to: t.hex().notNull(),
  tokenId: t.bigint().notNull(),
}));

export const mintEvent = onchainTable("mint_event", (t) => ({
  id: t.text().primaryKey(),
  to: t.hex().notNull(),
  tokenId: t.bigint().notNull(),
  metadataId: t.bigint().notNull(),
  timestamp: t.integer().notNull(),
  blockTimestamp: t.integer().notNull(),
}));

export const revealEvent = onchainTable("reveal_event", (t) => ({
  id: t.text().primaryKey(),
  tokenId: t.bigint().notNull(),
  metadataId: t.bigint().notNull(),
  revealer: t.hex().notNull(),
  timestamp: t.integer().notNull(),
  blockTimestamp: t.integer().notNull(),
}));

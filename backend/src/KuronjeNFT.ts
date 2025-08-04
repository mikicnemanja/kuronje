import { ponder } from "@ponder/core";
import { eq } from "drizzle-orm";
import {
  tokens,
  transfers,
  approvals,
  collection,
  owners,
} from "./ponder.schema.js";

// Handle Transfer events (mints and transfers)
ponder.on("KuronjeNFT:Transfer", async ({ event, context }) => {
  const { from, to, tokenId } = event.args;
  const { db } = context;

  // Create transfer record
  await db.insert(transfers).values({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    tokenId,
    from,
    to,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    txHash: event.transaction.hash,
    logIndex: event.log.logIndex,
  });

  // Handle mint (from address is zero)
  if (from === "0x0000000000000000000000000000000000000000") {
    await db.insert(tokens).values({
      id: tokenId.toString(),
      tokenId,
      owner: to,
      revealed: false,
      mintedAt: event.block.timestamp,
      mintTxHash: event.transaction.hash,
      blockNumber: event.block.number,
    });

    // Update collection stats
    const collectionData = await db
      .select()
      .from(collection)
      .where(eq(collection.id, "kuronje"))
      .limit(1);

    if (collectionData.length === 0) {
      // Create collection record if it doesn't exist
      await db.insert(collection).values({
        id: "kuronje",
        totalSupply: 1n,
        totalRevealed: 0n,
        uniqueOwners: 1n,
        lastUpdated: event.block.timestamp,
      });
    } else {
      // Update existing collection stats
      await db
        .update(collection)
        .set({
          totalSupply: collectionData[0].totalSupply + 1n,
          lastUpdated: event.block.timestamp,
        })
        .where(eq(collection.id, "kuronje"));
    }

    // Update or create owner record
    const ownerData = await db
      .select()
      .from(owners)
      .where(eq(owners.id, to))
      .limit(1);

    if (ownerData.length === 0) {
      await db.insert(owners).values({
        id: to,
        address: to,
        balance: 1n,
        firstPurchase: event.block.timestamp,
        lastActivity: event.block.timestamp,
      });
    } else {
      await db
        .update(owners)
        .set({
          balance: ownerData[0].balance + 1n,
          lastActivity: event.block.timestamp,
        })
        .where(eq(owners.id, to));
    }
  } else {
    // Handle regular transfer
    // Update token owner
    await db
      .update(tokens)
      .set({ owner: to })
      .where(eq(tokens.tokenId, tokenId));

    // Update from owner balance
    const fromOwner = await db
      .select()
      .from(owners)
      .where(eq(owners.id, from))
      .limit(1);
    if (fromOwner.length > 0) {
      const newFromBalance = fromOwner[0].balance - 1n;
      if (newFromBalance === 0n) {
        await db.delete(owners).where(eq(owners.id, from));
      } else {
        await db
          .update(owners)
          .set({
            balance: newFromBalance,
            lastActivity: event.block.timestamp,
          })
          .where(eq(owners.id, from));
      }
    }

    // Update to owner balance
    const toOwner = await db
      .select()
      .from(owners)
      .where(eq(owners.id, to))
      .limit(1);
    if (toOwner.length === 0) {
      await db.insert(owners).values({
        id: to,
        address: to,
        balance: 1n,
        firstPurchase: event.block.timestamp,
        lastActivity: event.block.timestamp,
      });
    } else {
      await db
        .update(owners)
        .set({
          balance: toOwner[0].balance + 1n,
          lastActivity: event.block.timestamp,
        })
        .where(eq(owners.id, to));
    }
  }
});

// Handle Approval events
ponder.on("KuronjeNFT:Approval", async ({ event, context }) => {
  const { owner, approved, tokenId } = event.args;
  const { db } = context;

  await db.insert(approvals).values({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    tokenId,
    owner,
    approved,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    txHash: event.transaction.hash,
    logIndex: event.log.logIndex,
  });
});

// Handle ApprovalForAll events
ponder.on("KuronjeNFT:ApprovalForAll", async ({ event, context }) => {
  const { owner, operator, approved } = event.args;
  const { db } = context;

  // For ApprovalForAll, we use tokenId as 0 and store operator in approved field
  await db.insert(approvals).values({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    tokenId: 0n, // Special case for ApprovalForAll
    owner,
    approved: operator,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    txHash: event.transaction.hash,
    logIndex: event.log.logIndex,
  });
});

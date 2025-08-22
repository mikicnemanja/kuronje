import { ponder } from "ponder:registry";
import schema from "ponder:schema";

// Handle Transfer events (includes mints when from = 0x0 and burns when to = 0x0)
ponder.on("KuronjeNFT:Transfer", async ({ event, context }) => {
  const { from, to, tokenId } = event.args;

  // Create accounts if they don't exist
  await context.db
    .insert(schema.account)
    .values({ address: from })
    .onConflictDoNothing();

  await context.db
    .insert(schema.account)
    .values({ address: to })
    .onConflictDoNothing();

  // Update token ownership (only for existing tokens, mints are handled by TokenMinted event)
  if (from !== "0x0000000000000000000000000000000000000000") {
    await context.db.update(schema.token, { id: tokenId }).set({ owner: to });

    // Update token counts
    await context.db
      .update(schema.account, { address: from })
      .set((row) => ({ tokenCount: row.tokenCount - 1 }));

    await context.db
      .update(schema.account, { address: to })
      .set((row) => ({ tokenCount: row.tokenCount + 1 }));
  }

  // Record transfer event
  await context.db.insert(schema.transferEvent).values({
    id: event.id,
    from,
    to,
    tokenId,
    timestamp: Number(event.block.timestamp),
  });
});

// Handle TokenMinted events
ponder.on("KuronjeNFT:TokenMinted", async ({ event, context }) => {
  const { to, tokenId, metadataId, timestamp } = event.args;

  // Create account if it doesn't exist
  await context.db
    .insert(schema.account)
    .values({ address: to })
    .onConflictDoNothing();

  // Create the token record
  await context.db.insert(schema.token).values({
    id: tokenId,
    owner: to,
    metadataId,
    isRevealed: false,
    mintedAt: Number(timestamp),
  });

  // Update account token count
  await context.db
    .update(schema.account, { address: to })
    .set((row) => ({ tokenCount: row.tokenCount + 1 }));

  // Record mint event
  await context.db.insert(schema.mintEvent).values({
    id: event.id,
    to,
    tokenId,
    metadataId,
    timestamp: Number(timestamp),
    blockTimestamp: Number(event.block.timestamp),
  });
});

// Handle TokenRevealed events
ponder.on("KuronjeNFT:TokenRevealed", async ({ event, context }) => {
  const { tokenId, metadataId, revealer, timestamp } = event.args;

  // Update the token's reveal status
  await context.db.update(schema.token, { id: tokenId }).set({
    isRevealed: true,
    revealedBy: revealer,
    revealedAt: Number(timestamp),
    metadataId, // Update metadata ID in case it changed during reveal
  });

  // Record reveal event
  await context.db.insert(schema.revealEvent).values({
    id: event.id,
    tokenId,
    metadataId,
    revealer,
    timestamp: Number(timestamp),
    blockTimestamp: Number(event.block.timestamp),
  });
});

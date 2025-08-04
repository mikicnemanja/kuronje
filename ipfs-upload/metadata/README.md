# Kuronje NFT Metadata Structure

## Overview

This metadata follows the **unrevealed/revealed** NFT pattern where all tokens start hidden and can be individually revealed.

## Structure:

### `/unrevealed.json`

- **Single file** used for ALL unrevealed tokens
- Shows mystery box image and "Unrevealed" status
- Your smart contract's `UNREVEALED_URI` points here

### `/revealed/` folder

- **30 individual files** (0.json through 29.json)
- Each file corresponds to a token ID and shows the actual character
- Your smart contract's `REVEALED_BASE_URI` points to this folder

## Upload Process:

1. **Upload mystery box image** → Get IPFS hash
2. **Upload character images** → Get IPFS hash
3. **Update metadata placeholders:**
   - In `unrevealed.json`: Replace `YOUR_MYSTERY_BOX_IPFS_HASH`
   - In all `revealed/*.json`: Replace `YOUR_IMAGES_IPFS_HASH` and `YOUR_MYSTERY_BOX_IPFS_HASH`
4. **Upload metadata folders** → Get IPFS hashes
5. **Update smart contract** with metadata hashes

## Smart Contract Integration:

```solidity
// Update these constants in KuronjeNFT.sol:
string public constant UNREVEALED_URI = "ipfs://UNREVEALED_METADATA_HASH/unrevealed.json";
string public constant REVEALED_BASE_URI = "ipfs://REVEALED_METADATA_HASH/";
```

## How it works:

- **Before reveal:** All tokens show mystery box (`UNREVEALED_URI`)
- **After reveal:** Token shows character image (`REVEALED_BASE_URI + tokenId + ".json"`)
- **All 30 tokens:** Each has a unique character image when revealed

## Find & Replace needed:

```
YOUR_MYSTERY_BOX_IPFS_HASH → QmYourActualMysteryBoxHash
YOUR_IMAGES_IPFS_HASH → QmYourActualImagesHash
```

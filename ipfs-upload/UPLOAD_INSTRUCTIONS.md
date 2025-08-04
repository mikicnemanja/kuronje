# Kuronje NFT Collection - Complete IPFS Upload Guide

This folder contains your complete NFT collection ready for IPFS upload via Pinata.

## 📁 What's included:

- **30 character image files** (28 PNG, 2 JPEG) - Your unique characters
- **30 metadata JSON files** (in `/metadata/` folder) - NFT metadata
- **1 mystery box image** (for unrevealed state)

## 🚀 Upload Process (3 Steps):

### Step 1: Upload Character Images

1. Go to [https://app.pinata.cloud](https://app.pinata.cloud)
2. Upload **ONLY the 30 character image files** (exclude metadata folder for now)
3. **Recommended:** Upload as folder to get one hash for all images
4. Copy the IPFS hash (e.g., `QmAbc123...`)

### Step 2: Upload Mystery Box Image

1. Upload `images/hidden/mystery-box-kuronje.png` separately
2. Copy this IPFS hash for the hidden image

### Step 3: Update & Upload Metadata

1. Open the `/metadata/` folder
2. **Find & Replace** in ALL 30 JSON files:
   - Replace `YOUR_IMAGES_IPFS_HASH` → your actual images folder hash
   - Replace `YOUR_HIDDEN_IPFS_HASH` → your mystery box image hash
3. Save all files
4. Upload the updated `/metadata/` folder to IPFS
5. Copy the metadata folder IPFS hash

## 🔧 Smart Contract Integration

Update your `KuronjeNFT.sol` with the metadata hash:

```solidity
string public constant REVEALED_BASE_URI = "ipfs://YOUR_METADATA_HASH/";
string public constant UNREVEALED_URI = "ipfs://YOUR_HIDDEN_HASH";
```

## 📊 Collection Stats:

- **Total tokens:** 30 (IDs 0-29)
- **Tokens with character images:** 30
- **Mystery box:** Used only for unrevealed state

## 🗺️ Token Mapping:

| Token ID | Character | Image File    |
| -------- | --------- | ------------- |
| 0        | Nemanja   | nemanja.png   |
| 1        | Zeka      | zeka.png      |
| 2        | Maksa     | maksa.jpeg    |
| 3        | Paja      | paja.png      |
| 4        | Pedja     | pedja.png     |
| 5        | Punisa    | punisa.png    |
| 6        | Stupar    | stupar.png    |
| 7        | Garic     | garic.png     |
| 8        | Cile      | cile.png      |
| 9        | Prcko     | prcko.png     |
| 10       | Marko     | marko.png     |
| 11       | Cinc      | cinc.png      |
| 12       | Dokic     | dokic.png     |
| 13       | Petra     | petra.png     |
| 14       | Salica    | salica.png    |
| 15       | Moca      | moca.png      |
| 16       | Gliga     | gliga.png     |
| 17       | Raka      | raka.png      |
| 18       | Doza      | doza.jpeg     |
| 19       | Dimitrije | dimitrije.png |
| 20       | Seba      | seba.png      |
| 21       | Jova      | jova.png      |
| 22       | Kozma     | kozma.png     |
| 23       | Obi       | obi.png       |
| 24       | Sindza    | sindza.png    |
| 25       | Moki      | moki.png      |
| 26       | Djuraga   | djuraga.png   |
| 27       | Dondur    | dondur.png    |
| 28       | Djole     | djole.png     |
| 29       | Liza      | liza.png      |

## 🎯 Final Result:

- Your NFTs will resolve metadata via: `ipfs://METADATA_HASH/{tokenId}.json`
- Each metadata file points to the correct character image
- OpenSea and other platforms will display your collection perfectly!

---

**Ready to upload! 🚀**

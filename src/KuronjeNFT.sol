// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract KuronjeNFT is ERC721, Ownable {
    using Strings for uint256;

    error KuronjeNFT__NotTokenOwner();
    error KuronjeNFT__TokenAlreadyRevealed();

    uint256 public constant COLLECTION_SIZE = 20;
    string public constant UNREVEALED_URI =
        "ipfs://bafkreic3oh7lfwipdtic6uk7r22xx2qn6yxi4htvtk2eifm3qwgffgf5wy";
    string public constant REVEALED_BASE_URI =
        "ipfs://bafybeie2nvvvfj6yiwqusb72rrqd3xkmbsaqievndlpkttjaihqr7fjetq/";

    uint256 public s_totalTokenAmount;

    mapping(uint256 => bool) public s_tokenIdRevealed;
    mapping(uint256 => uint256) public s_tokenIdToMetadataId;

    constructor() ERC721("Kuronje", "KRNJ") Ownable(msg.sender) {
        s_totalTokenAmount = 0;
    }
    function mintNft() public {
        uint256 tokenId = s_totalTokenAmount;

        // Pseudo-random metadata assignment
        uint256 randomMetadataId = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao, // Replaces block.difficulty
                    msg.sender,
                    tokenId
                )
            )
        ) % COLLECTION_SIZE;

        s_tokenIdToMetadataId[tokenId] = randomMetadataId;
        _mint(msg.sender, tokenId);
        s_totalTokenAmount++;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        _requireOwned(tokenId);

        if (!s_tokenIdRevealed[tokenId]) {
            return UNREVEALED_URI;
        }

        uint256 metadataId = s_tokenIdToMetadataId[tokenId];
        return
            string(
                abi.encodePacked(
                    REVEALED_BASE_URI,
                    metadataId.toString(),
                    ".json"
                )
            );
    }

    function revealToken(uint256 tokenId) public {
        if (ownerOf(tokenId) != msg.sender) revert KuronjeNFT__NotTokenOwner();
        if (s_tokenIdRevealed[tokenId])
            revert KuronjeNFT__TokenAlreadyRevealed();
        s_tokenIdRevealed[tokenId] = true;
    }
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract KuronjeNFT is ERC721, Ownable {
    using Strings for uint256;

    error KuronjeNFT__NotTokenOwner();
    error KuronjeNFT__TokenAlreadyRevealed();
    error KuronjeNFT__CollectionSoldOut();

    uint256 public constant COLLECTION_SIZE = 20;
    string public constant UNREVEALED_URI =
        "ipfs://bafkreic3oh7lfwipdtic6uk7r22xx2qn6yxi4htvtk2eifm3qwgffgf5wy";
    string public constant REVEALED_BASE_URI =
        "ipfs://bafybeie2nvvvfj6yiwqusb72rrqd3xkmbsaqievndlpkttjaihqr7fjetq/";

    uint256 public s_totalTokenAmount;

    mapping(uint256 => bool) public s_tokenIdRevealed;
    mapping(uint256 => uint256) public s_tokenIdToMetadataId;

    // Events for better indexing
    event TokenMinted(
        address indexed to,
        uint256 indexed tokenId,
        uint256 indexed metadataId,
        uint256 timestamp
    );

    event TokenRevealed(
        uint256 indexed tokenId,
        uint256 indexed metadataId,
        address indexed revealer,
        uint256 timestamp
    );

    constructor() ERC721("Kuronje", "KRNJ") Ownable(msg.sender) {
        s_totalTokenAmount = 0;
    }

    function mintNft() public {
        if (s_totalTokenAmount >= COLLECTION_SIZE) {
            revert KuronjeNFT__CollectionSoldOut();
        }

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

        emit TokenMinted(
            msg.sender,
            tokenId,
            randomMetadataId,
            block.timestamp
        );
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

        emit TokenRevealed(
            tokenId,
            s_tokenIdToMetadataId[tokenId],
            msg.sender,
            block.timestamp
        );
    }

    // View functions for better frontend integration
    function getTokenMetadataId(
        uint256 tokenId
    ) external view returns (uint256) {
        _requireOwned(tokenId);
        return s_tokenIdToMetadataId[tokenId];
    }

    function isTokenRevealed(uint256 tokenId) external view returns (bool) {
        _requireOwned(tokenId);
        return s_tokenIdRevealed[tokenId];
    }

    function getTotalSupply() external view returns (uint256) {
        return s_totalTokenAmount;
    }

    function getRemainingSupply() external view returns (uint256) {
        return COLLECTION_SIZE - s_totalTokenAmount;
    }

    // Batch view functions for frontend efficiency
    function getTokensByOwner(
        address owner
    ) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 index = 0;

        for (uint256 i = 0; i < s_totalTokenAmount; i++) {
            if (ownerOf(i) == owner) {
                tokenIds[index] = i;
                index++;
            }
        }

        return tokenIds;
    }

    function getTokensInfoByOwner(
        address owner
    )
        external
        view
        returns (
            uint256[] memory tokenIds,
            uint256[] memory metadataIds,
            bool[] memory revealedStatus
        )
    {
        uint256 tokenCount = balanceOf(owner);
        tokenIds = new uint256[](tokenCount);
        metadataIds = new uint256[](tokenCount);
        revealedStatus = new bool[](tokenCount);
        uint256 index = 0;

        for (uint256 i = 0; i < s_totalTokenAmount; i++) {
            if (ownerOf(i) == owner) {
                tokenIds[index] = i;
                metadataIds[index] = s_tokenIdToMetadataId[i];
                revealedStatus[index] = s_tokenIdRevealed[i];
                index++;
            }
        }

        return (tokenIds, metadataIds, revealedStatus);
    }
}

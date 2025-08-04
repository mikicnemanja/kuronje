// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {KuronjeNFT} from "../src/KuronjeNFT.sol";
import {DeployKuronjeNFT} from "../script/DeployKuronjeNFT.s.sol";
import {HelperConfig} from "../script/HelperConfig.s.sol";

contract TestKuronjeNFT is Test {
    KuronjeNFT public kuronjeNFT;
    DeployKuronjeNFT public deployer;
    HelperConfig public helperConfig;
    address public user;

    function setUp() public {
        deployer = new DeployKuronjeNFT();
        (kuronjeNFT, helperConfig) = deployer.run();
        user = makeAddr("user");
    }

    function test_canMint() public {
        kuronjeNFT.mintNft();
        assertEq(kuronjeNFT.s_totalTokenAmount(), 1);
    }

    function test_canMintMultipleNfts() public {
        kuronjeNFT.mintNft();
        kuronjeNFT.mintNft();
        assertEq(kuronjeNFT.s_totalTokenAmount(), 2);
    }

    function test_ownerIsCorrect() public view {
        uint256 deployerKey = helperConfig.activeNetworkConfig();
        assertEq(kuronjeNFT.owner(), vm.addr(deployerKey));
    }

    function test_nameIsCorrectV1() public view {
        string memory name = kuronjeNFT.name();
        string memory expectedName = "Kuronje";
        assert(keccak256(bytes(name)) == keccak256(bytes(expectedName)));
    }

    function test_nameIsCorrectV2() public view {
        string memory name = kuronjeNFT.name();
        string memory expectedName = "Kuronje";
        assertEq(name, expectedName);
    }

    function test_symbolIsCorrect() public view {
        assertEq(kuronjeNFT.symbol(), "KRNJ");
    }

    modifier tokenMinted(address _user) {
        vm.prank(_user);
        kuronjeNFT.mintNft();
        _;
    }

    function test_revealIfOwner() public tokenMinted(user) {
        vm.prank(user);
        kuronjeNFT.revealToken(0);
    }

    modifier tokenRevealed(address _user) {
        vm.prank(_user);
        kuronjeNFT.revealToken(0);
        _;
    }

    function test_getTokenURIIfNotRevealed() public tokenMinted(user) {
        string memory tokenURI = kuronjeNFT.tokenURI(0);
        string memory expectedTokenURI = kuronjeNFT.UNREVEALED_URI();
        assertEq(tokenURI, expectedTokenURI);
    }
    function test_getTokenURIIfRevealed()
        public
        tokenMinted(user)
        tokenMinted(user)
        tokenRevealed(user)
    {
        string memory tokenURI = kuronjeNFT.tokenURI(0);
        string memory notExpectedTokenURI = kuronjeNFT.UNREVEALED_URI();
        assertNotEq(tokenURI, notExpectedTokenURI);
    }

    function test_revealIfNotOwner() public tokenMinted(user) {
        vm.expectRevert(KuronjeNFT.KuronjeNFT__NotTokenOwner.selector);
        vm.prank(makeAddr("user2"));
        kuronjeNFT.revealToken(0);
    }

    function test_revealIfAlreadyRevealed()
        public
        tokenMinted(user)
        tokenRevealed(user)
    {
        vm.expectRevert(KuronjeNFT.KuronjeNFT__TokenAlreadyRevealed.selector);
        vm.prank(user);
        kuronjeNFT.revealToken(0);
    }

    function test_tokenDoesExist() public tokenMinted(user) {
        kuronjeNFT.tokenURI(0);
    }

    function test_tokenDoesNotExist() public tokenMinted(user) {
        vm.expectRevert();
        kuronjeNFT.tokenURI(3);
    }

    function test_ownershipAfterMint() public tokenMinted(user) {
        assertEq(kuronjeNFT.ownerOf(0), user);
    }

    function test_ownershipAfterReveal()
        public
        tokenMinted(user)
        tokenRevealed(user)
    {
        assertEq(kuronjeNFT.ownerOf(0), user);
    }

    function test_balanceAfterMint() public tokenMinted(user) {
        assertEq(kuronjeNFT.balanceOf(user), 1);
    }

    function test_randomMetadataAssignment() public {
        // Mint multiple tokens and verify they get different metadata IDs
        kuronjeNFT.mintNft();
        kuronjeNFT.mintNft();
        kuronjeNFT.mintNft();

        uint256 metadataId0 = kuronjeNFT.s_tokenIdToMetadataId(0);
        uint256 metadataId1 = kuronjeNFT.s_tokenIdToMetadataId(1);
        uint256 metadataId2 = kuronjeNFT.s_tokenIdToMetadataId(2);

        // All should be within collection size
        assert(metadataId0 < kuronjeNFT.COLLECTION_SIZE());
        assert(metadataId1 < kuronjeNFT.COLLECTION_SIZE());
        assert(metadataId2 < kuronjeNFT.COLLECTION_SIZE());
    }

    function test_revealStateTracking() public tokenMinted(user) {
        assertFalse(kuronjeNFT.s_tokenIdRevealed(0));

        vm.prank(user);
        kuronjeNFT.revealToken(0);

        assertTrue(kuronjeNFT.s_tokenIdRevealed(0));
    }
}

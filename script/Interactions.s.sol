// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {DevOpsTools} from "lib/foundry-devops/src/DevOpsTools.sol";
import {Script} from "forge-std/Script.sol";
import {KuronjeNFT} from "../src/KuronjeNFT.sol";

contract MintKuronjeNft is Script {
    function run() public {
        address mostRecentlyDeployedKuronjeNft = DevOpsTools
            .get_most_recent_deployment("KuronjeNFT", block.chainid);
        mintKuronjeNft(mostRecentlyDeployedKuronjeNft);
    }

    function mintKuronjeNft(address kuronjeNftAddress) public {
        vm.startBroadcast();
        KuronjeNFT(kuronjeNftAddress).mintNft();
        vm.stopBroadcast();
    }
}

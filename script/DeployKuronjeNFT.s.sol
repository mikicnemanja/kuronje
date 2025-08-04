// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {KuronjeNFT} from "../src/KuronjeNFT.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract DeployKuronjeNFT is Script {
    function run() public returns (KuronjeNFT, HelperConfig) {
        HelperConfig helperConfig = new HelperConfig();
        uint256 deployerKey = helperConfig.activeNetworkConfig();

        vm.startBroadcast(deployerKey);
        KuronjeNFT kuronjeNFT = new KuronjeNFT();
        vm.stopBroadcast();

        return (kuronjeNFT, helperConfig);
    }
}

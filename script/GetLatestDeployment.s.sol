// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {DevOpsTools} from "lib/foundry-devops/src/DevOpsTools.sol";
import {console} from "forge-std/console.sol";

contract GetLatestDeployment is Script {
    function run() external {
        address latestDeployment = DevOpsTools.get_most_recent_deployment(
            "KuronjeNFT",
            block.chainid
        );

        console.log("Latest KuronjeNFT deployment address:", latestDeployment);

        // Write to a JSON file that frontend can read
        string memory json = string(
            abi.encodePacked(
                '{"contractAddress":"',
                vm.toString(latestDeployment),
                '","chainId":',
                vm.toString(block.chainid),
                ',"timestamp":',
                vm.toString(block.timestamp),
                "}"
            )
        );

        vm.writeFile("./frontend/src/contract-address.json", json);
        console.log(
            "Contract address written to frontend/src/contract-address.json"
        );
    }
}

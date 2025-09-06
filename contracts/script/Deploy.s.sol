// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "@forge-std/Script.sol";
import {OwnedCounter} from "../src/OwnedCounter.sol";
import {SharedCounter} from "../src/SharedCounter.sol";

contract Deploy is Script {
    function run() external {
        address owner = vm.envAddress("OWNER");
        
        vm.startBroadcast();
        
        // Deploy OwnedCounter
        OwnedCounter ownedCounter = new OwnedCounter(owner);
        console.log("OwnedCounter deployed at:", address(ownedCounter));
        
        // Deploy SharedCounter
        SharedCounter sharedCounter = new SharedCounter();
        console.log("SharedCounter deployed at:", address(sharedCounter));
        
        vm.stopBroadcast();
        
        console.log("Owner address:", owner);
    }
}
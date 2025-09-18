// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "@forge-std/Script.sol";
import {OwnedCounterRegistry} from "../src/OwnedCounterRegistry.sol";
import {SharedCounterRegistry} from "../src/SharedCounterRegistry.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        // Deploy OwnedCounterRegistry
        OwnedCounterRegistry ownedCounterRegistry = new OwnedCounterRegistry();
        console.log("OwnedCounterRegistry deployed at:", address(ownedCounterRegistry));

        // Deploy SharedCounterRegistry
        SharedCounterRegistry sharedCounterRegistry = new SharedCounterRegistry();
        console.log("SharedCounterRegistry deployed at:", address(sharedCounterRegistry));

        vm.stopBroadcast();
    }
}
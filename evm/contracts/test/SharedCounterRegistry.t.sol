// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {SharedCounterRegistry} from "../src/SharedCounterRegistry.sol";

contract SharedCounterRegistryTest is Test {
    SharedCounterRegistry registry;
    address alice = address(0x1);
    address bob = address(0x2);

    function setUp() public {
        registry = new SharedCounterRegistry();
    }

    function test_InitialState() public {
        assertEq(registry.nextId(), 0);
    }

    function test_Create() public {
        vm.prank(alice);
        uint256 id = registry.create();

        assertEq(id, 1);
        assertEq(registry.nextId(), 1);
        assertEq(registry.valueOf(id), 0);
    }

    function test_CreateMultiple() public {
        vm.prank(alice);
        uint256 id1 = registry.create();

        vm.prank(bob);
        uint256 id2 = registry.create();

        assertEq(id1, 1);
        assertEq(id2, 2);
        assertEq(registry.nextId(), 2);
        assertEq(registry.valueOf(id1), 0);
        assertEq(registry.valueOf(id2), 0);
    }

    function test_Increment() public {
        vm.prank(alice);
        uint256 id = registry.create();

        vm.prank(alice);
        registry.increment(id);

        assertEq(registry.valueOf(id), 1);

        vm.prank(bob);
        registry.increment(id);

        assertEq(registry.valueOf(id), 2);
    }

    function test_SetValue() public {
        vm.prank(alice);
        uint256 id = registry.create();

        vm.prank(alice);
        registry.setValue(id, 42);

        assertEq(registry.valueOf(id), 42);

        vm.prank(bob);
        registry.setValue(id, 100);

        assertEq(registry.valueOf(id), 100);
    }

    function test_RevertOnNonexistentCounter() public {
        vm.expectRevert("nonexistent");
        registry.valueOf(1);

        vm.prank(alice);
        vm.expectRevert("nonexistent");
        registry.increment(1);

        vm.prank(alice);
        vm.expectRevert("nonexistent");
        registry.setValue(1, 42);
    }

    function test_Events() public {
        // Test Created event
        vm.expectEmit(true, false, false, false);
        emit SharedCounterRegistry.Created(1);
        vm.prank(alice);
        uint256 id = registry.create();

        // Test Incremented event
        vm.expectEmit(true, false, false, true);
        emit SharedCounterRegistry.Incremented(id, 1);
        vm.prank(alice);
        registry.increment(id);

        // Test ValueSet event
        vm.expectEmit(true, false, false, true);
        emit SharedCounterRegistry.ValueSet(id, 42);
        vm.prank(bob);
        registry.setValue(id, 42);
    }

    function test_MultipleUsersCanInteract() public {
        vm.prank(alice);
        uint256 id = registry.create();

        vm.prank(alice);
        registry.increment(id);
        assertEq(registry.valueOf(id), 1);

        vm.prank(bob);
        registry.increment(id);
        assertEq(registry.valueOf(id), 2);

        vm.prank(bob);
        registry.setValue(id, 10);
        assertEq(registry.valueOf(id), 10);

        vm.prank(alice);
        registry.increment(id);
        assertEq(registry.valueOf(id), 11);
    }
}
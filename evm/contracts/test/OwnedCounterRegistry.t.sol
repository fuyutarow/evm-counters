// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {OwnedCounterRegistry} from "../src/OwnedCounterRegistry.sol";

contract OwnedCounterRegistryTest is Test {
    OwnedCounterRegistry registry;
    address alice = address(0x1);
    address bob = address(0x2);

    function setUp() public {
        registry = new OwnedCounterRegistry();
    }

    function test_InitialState() public {
        assertEq(registry.nextId(), 0);
    }

    function test_Mint() public {
        vm.prank(alice);
        uint256 id = registry.mint();

        assertEq(id, 1);
        assertEq(registry.nextId(), 1);
        assertEq(registry.ownerOf(id), alice);
        assertEq(registry.valueOf(id), 0);
    }

    function test_MintMultiple() public {
        vm.prank(alice);
        uint256 id1 = registry.mint();

        vm.prank(bob);
        uint256 id2 = registry.mint();

        assertEq(id1, 1);
        assertEq(id2, 2);
        assertEq(registry.nextId(), 2);
        assertEq(registry.ownerOf(id1), alice);
        assertEq(registry.ownerOf(id2), bob);
    }

    function test_Increment() public {
        vm.prank(alice);
        uint256 id = registry.mint();

        vm.prank(alice);
        registry.increment(id);

        assertEq(registry.valueOf(id), 1);

        vm.prank(alice);
        registry.increment(id);

        assertEq(registry.valueOf(id), 2);
    }

    function test_SetValue() public {
        vm.prank(alice);
        uint256 id = registry.mint();

        vm.prank(alice);
        registry.setValue(id, 42);

        assertEq(registry.valueOf(id), 42);
    }

    function test_Transfer() public {
        vm.prank(alice);
        uint256 id = registry.mint();

        vm.prank(alice);
        registry.transfer(id, bob);

        assertEq(registry.ownerOf(id), bob);
    }

    function test_RevertOnNonOwnerIncrement() public {
        vm.prank(alice);
        uint256 id = registry.mint();

        vm.prank(bob);
        vm.expectRevert("not owner");
        registry.increment(id);
    }

    function test_RevertOnNonOwnerSetValue() public {
        vm.prank(alice);
        uint256 id = registry.mint();

        vm.prank(bob);
        vm.expectRevert("not owner");
        registry.setValue(id, 42);
    }

    function test_RevertOnNonOwnerTransfer() public {
        vm.prank(alice);
        uint256 id = registry.mint();

        vm.prank(bob);
        vm.expectRevert("not owner");
        registry.transfer(id, bob);
    }

    function test_RevertOnNonexistentCounter() public {
        vm.expectRevert("nonexistent");
        registry.ownerOf(1);

        vm.expectRevert("nonexistent");
        registry.valueOf(1);

        vm.prank(alice);
        vm.expectRevert("nonexistent");
        registry.increment(1);
    }

    function test_RevertOnTransferToZeroAddress() public {
        vm.prank(alice);
        uint256 id = registry.mint();

        vm.prank(alice);
        vm.expectRevert("zero addr");
        registry.transfer(id, address(0));
    }

    function test_Events() public {
        // Test Minted event
        vm.expectEmit(true, true, false, true);
        emit OwnedCounterRegistry.Minted(1, alice);
        vm.prank(alice);
        uint256 id = registry.mint();

        // Test Incremented event
        vm.expectEmit(true, false, false, true);
        emit OwnedCounterRegistry.Incremented(id, 1);
        vm.prank(alice);
        registry.increment(id);

        // Test ValueSet event
        vm.expectEmit(true, false, false, true);
        emit OwnedCounterRegistry.ValueSet(id, 42);
        vm.prank(alice);
        registry.setValue(id, 42);

        // Test Transferred event
        vm.expectEmit(true, true, true, false);
        emit OwnedCounterRegistry.Transferred(id, alice, bob);
        vm.prank(alice);
        registry.transfer(id, bob);
    }
}
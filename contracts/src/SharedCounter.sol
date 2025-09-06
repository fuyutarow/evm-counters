// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract SharedCounter {
    uint256 public count;

    event Incremented(address indexed incrementer, uint256 newCount);
    event ValueSet(address indexed setter, uint256 newCount);

    constructor() {
        count = 0;
    }

    function increment() external {
        unchecked {
            count++;
        }
        emit Incremented(msg.sender, count);
    }

    function setValue(uint256 newValue) external {
        count = newValue;
        emit ValueSet(msg.sender, newValue);
    }

    function getCount() external view returns (uint256) {
        return count;
    }
}
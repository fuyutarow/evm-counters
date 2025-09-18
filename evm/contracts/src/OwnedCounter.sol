// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract OwnedCounter is Ownable {
    uint256 public count;

    event Incremented(uint256 newCount);
    event ValueSet(uint256 newCount);

    constructor(address owner_) Ownable(owner_) {
        count = 0;
    }

    function increment() external onlyOwner {
        unchecked {
            count++;
        }
        emit Incremented(count);
    }

    function setValue(uint256 newValue) external onlyOwner {
        count = newValue;
        emit ValueSet(newValue);
    }

    function getCount() external view returns (uint256) {
        return count;
    }
}
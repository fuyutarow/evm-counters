// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract SharedCounterRegistry {
    struct Counter {
        uint64 value;
    }

    uint256 private _nextId;                 // 0は未使用
    mapping(uint256 => Counter) private _c;  // id => Counter

    event Created(uint256 indexed id);
    event Incremented(uint256 indexed id, uint64 newValue);
    event ValueSet(uint256 indexed id, uint64 newValue);

    function create() external returns (uint256 id) {
        id = ++_nextId;
        emit Created(id);
    }

    function increment(uint256 id) external {
        Counter storage ctr = _mustExist(id);
        unchecked { ctr.value += 1; }
        emit Incremented(id, ctr.value);
    }

    function setValue(uint256 id, uint64 newValue) external {
        Counter storage ctr = _mustExist(id);
        ctr.value = newValue;
        emit ValueSet(id, ctr.value);
    }

    function valueOf(uint256 id) external view returns (uint64) {
        require(id != 0 && id <= _nextId, "nonexistent");
        return _c[id].value;
    }
    function nextId() external view returns (uint256) { return _nextId; }

    // ---- internal helpers ----
    function _mustExist(uint256 id) internal view returns (Counter storage ctr) {
        require(id != 0 && id <= _nextId, "nonexistent");
        ctr = _c[id];
    }
}
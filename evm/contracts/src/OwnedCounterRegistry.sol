// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract OwnedCounterRegistry {
    struct Counter {
        address owner;
        uint64  value;
    }

    uint256 private _nextId;                 // 0は未使用
    mapping(uint256 => Counter) private _c;  // id => Counter

    event Minted(uint256 indexed id, address indexed owner);
    event Incremented(uint256 indexed id, uint64 newValue);
    event ValueSet(uint256 indexed id, uint64 newValue);
    event Transferred(uint256 indexed id, address indexed from, address indexed to);

    function mint() external returns (uint256 id) {
        id = ++_nextId;
        _c[id].owner = msg.sender;
        emit Minted(id, msg.sender);
    }

    function increment(uint256 id) external {
        Counter storage ctr = _mustBeOwner(id);
        unchecked { ctr.value += 1; }
        emit Incremented(id, ctr.value);
    }

    function setValue(uint256 id, uint64 newValue) external {
        Counter storage ctr = _mustBeOwner(id);
        ctr.value = newValue;
        emit ValueSet(id, ctr.value);
    }

    function transfer(uint256 id, address to) external {
        require(to != address(0), "zero addr");
        Counter storage ctr = _mustBeOwner(id);
        address from = ctr.owner;
        ctr.owner = to;
        emit Transferred(id, from, to);
    }

    function ownerOf(uint256 id) external view returns (address) { return _ownerOf(id); }
    function valueOf(uint256 id) external view returns (uint64)  { return _valueOf(id); }
    function nextId() external view returns (uint256)            { return _nextId; }

    // ---- internal helpers ----
    function _mustBeOwner(uint256 id) internal view returns (Counter storage ctr) {
        require(id != 0 && id <= _nextId, "nonexistent");
        ctr = _c[id];
        require(ctr.owner == msg.sender, "not owner");
    }
    function _ownerOf(uint256 id) internal view returns (address) {
        require(id != 0 && id <= _nextId, "nonexistent");
        return _c[id].owner;
    }
    function _valueOf(uint256 id) internal view returns (uint64) {
        require(id != 0 && id <= _nextId, "nonexistent");
        return _c[id].value;
    }
}
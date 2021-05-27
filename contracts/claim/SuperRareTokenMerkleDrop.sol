// contracts/claim/SuperRareTokenMerkleDrop.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.7.3;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract SuperRareTokenMerkleDrop is ContextUpgradeable, OwnableUpgradeable {
    mapping (uint256 => bytes32) public merkleRoots;
    mapping (uint256 => mapping(address => bool)) public claimed;
    IERC20Upgradeable superRareToken;
    uint256 dropId;

    /* EVENTS */
    event TokensClaimed(
        address addr,
        uint256 amount
    );

    event DropAdded(
        bytes32 root,
        uint256 id,
        uint256 amount
    );

    constructor(address _superRareToken) {
        require(_superRareToken != address(0));
        superRareToken = IERC20Upgradeable(_superRareToken);
        __Ownable_init();
    }

    /* MUTABLE */
    function claim(uint256 id, uint256 amount, bytes32[] memory proof) public {
        require(id <= dropId, "Invalid drop ID.");
        require(!claimed[id][_msgSender()], "You have already withdrawn your entitled tokens.");
        require(verifyEntitled(_msgSender(), id, amount, proof), "The proof could not be verified.");

        claimed[id][_msgSender()] = true;

        require(superRareToken.transfer(_msgSender(), amount));
        emit TokensClaimed(_msgSender(), amount);
    }

    function claimMultiple(uint256[] memory ids, uint256[] memory amounts, bytes32[][] memory proofs) public {
        uint256 payout = 0;

        // Making sure all parameters are valid before mutating storage
        for (uint i = 0; i < ids.length; i++) {
            require(ids[i] <= dropId, "Invalid drop ID.");
            require(!claimed[ids[i]][_msgSender()], "You have already withdrawn your entitled tokens.");
            require(verifyEntitled(_msgSender(), ids[i], amounts[i], proofs[i]), "The proof could not be verified.");
            payout += amounts[i];
        }

        for (uint i = 0; i < ids.length; i++) {
            claimed[ids[i]][_msgSender()] = true;
        }

        require(superRareToken.transfer(_msgSender(), payout));
        emit TokensClaimed(_msgSender(), payout);
    }

    /* GETTERS/VERIFICATION */
    function verifyEntitled(address recipient, uint256 id, uint value, bytes32[] memory proof) public view returns (bool) {
        // We need to pack the 20 bytes address to the 32 bytes value
        // to match with the proof
        bytes32 leaf = keccak256(abi.encodePacked(recipient, value));
        return verifyProof(leaf, proof, id);
    }

    function verifyProof(bytes32 leaf, bytes32[] memory proof, uint256 id) internal view returns (bool) {
        bytes32 currentHash = leaf;

        for (uint i = 0; i < proof.length; i += 1) {
            currentHash = parentHash(currentHash, proof[i]);
        }

        return currentHash == merkleRoots[id];
    }

    function parentHash(bytes32 a, bytes32 b) internal pure returns (bytes32) {
        return a < b ? keccak256(abi.encode(a, b)) : keccak256(abi.encode(b, a));
    }

    function hasClaimed(uint256 id, address _claimer) external view returns (bool) {
        return claimed[id][_claimer];
    }

    /* ADMIN */
    function addDrop(bytes32 newRoot, uint256 value) external onlyOwner {
        require(superRareToken.transferFrom(_msgSender(), address(this), value));
        dropId += 1;
        merkleRoots[dropId] = newRoot;
        emit DropAdded(newRoot, dropId, value);
    }

    function updateRoot(uint256 id, bytes32 root) external onlyOwner {
        merkleRoots[id] = root;
    }
}

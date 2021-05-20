// contracts/staking/ISuperRareStaking.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.7.3;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISuperRareStaking {
    event Staked(address indexed user, uint256 index, uint256 amount, uint256 length);
    event Unstaked(address indexed user, uint256 index, uint256 amount, uint256 length);

    function stake(uint256 amount, uint256 length) external;
    function unstake(uint256 index) external;
    function getTotalStaked() external view returns (uint256);
    function token() external view returns (address);
    function claimReward(uint256 index) external;
    function getTotalStakedByAddress(address staker) external view returns(uint256);

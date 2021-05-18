// contracts/staking/ISuperRareStaking.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.7.3;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISuperRareStaking {
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);

    function stake(uint256 amount) external;
    function unstake(uint256 amount) external;
    function totalStaked() external view returns (uint256);
    function token() external view returns (address);
}
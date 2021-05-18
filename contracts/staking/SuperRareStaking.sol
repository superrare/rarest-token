// contracts/staking/SuperRareStaking.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.7.3;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "./ISuperRareStaking.sol";

contract SuperRareStaking is ISuperRareStaking, Initializable {
  struct Stake {
	  uint256 amount;
	  uint256 startingBlock;
  }

  IERC20 stakingToken; 
  uint256 rewardRate;
  uint256 totalAmountStaked;
  mapping (address => uint256) totalStakeBalances;
  mapping (address => Stake[]) stakes;

  function initialize(address _tokenAddress) public initializer {

  }

  function stake(uint256 amount) external override {

  }
  
  function unstake(uint256 amount) external override {

  }
  
  function totalStaked() external override view returns (uint256) {

  }
  
  function token() external override view returns (address) {

  }
  
}
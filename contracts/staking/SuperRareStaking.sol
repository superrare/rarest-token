// contracts/staking/SuperRareStaking.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.7.3;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ISuperRareStaking.sol";

contract SuperRareStaking is ISuperRareStaking, Initializable, Ownable {
  struct Stake {
	  uint256 amount;
      uint256 length; // measured in days
	  uint256 startingTime;
      bool hasClaimed;
  }

  IERC20 stakingToken;
  uint256 totalStaked;

  mapping (address => uint256) totalStakeBalances;
  mapping (address => Stake[]) stakes;

  // Not exactly sure how to organize the (staking length : reward percentages) values
  uint256[] stakingLengths;
  mapping (uint256 => uint256) rewardRatios;

  function initialize(address _tokenAddress) public initializer {
      stakingToken = IERC20(_tokenAddress);
      stakingLengths = [30 days, 90 days, 180 days];
      rewardRatios[30 days] = 2;
      rewardRatios[90 days] = 5;
      rewardRatios[180 days] = 10;
  }

  function stake(uint256 amount, uint256 length) external override {
      require (amount > 0, "Must stake more than 0 tokens."); // Might change this to have some sort of minimum
      require (stakingToken.balanceOf(msg.sender) >= amount, "User does not have enough token.");
      require (rewardRatios[length] > 0, "Invalid length."); // Check that it is a valid length

      Stake memory newStake = Stake (
          amount,
          length,
          block.timestamp,
          false
      );

      stakes[msg.sender].push(newStake);
      totalStakeBalances[msg.sender] += amount;
      totalStaked += amount;

      stakingToken.transferFrom(msg.sender, address(this), amount);
      emit Staked(msg.sender, stakes[msg.sender].length, amount, length);
  }

  function unstake(uint256 index) external override {
      Stake memory currentStake = stakes[msg.sender][index];
      require (currentStake.amount > 0, "Invalid stake index or no stake.");
      require (block.timestamp >= currentStake.startingTime + currentStake.length, "Stake has not expired yet.");

      // This would make it so that a user cannot unstake unless they have claimed rewards
      require (!currentStake.hasClaimed)

      uint256 amount = currentStake.amount;
      uint256 length = currentStake.length;
      totalStaked -= amount;
      totalStakeBalances[msg.sender] -= amount;

      delete stakes[msg.sender][index];

      stakingToken.transferFrom(address(this), msg.sender, amount);

      emit Unstaked(msg.sender, index, amount, length);
  }

  function claimReward(uint256 index) external override {
      Stake memory currentStake = stakes[msg.sender][index];
      require (currentStake.amount > 0, "Invalid stake index or no stake.");
      require (block.timestamp >= currentStake.startingTime + currentStake.length, "Stake has not expired yet.");
      require (!currentStake.hasClaimed, "User has already claimed reward.");

      uint256 reward = currentStake.amount * rewardRatios[currentStake.length]/100;

      // Add minting line here.

      stakes[msg.sender][index].hasClaimed = true;
  }

  function getTotalStaked() external override view returns (uint256) {
      return totalStaked;
  }

  function token() external override view returns (address) {
      return address(stakingToken);
  }

}

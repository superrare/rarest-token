// contracts/staking/SuperRareStaking.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.7.3;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ISuperRareStaking.sol";

contract SuperRareStaking is ISuperRareStaking, Initializable, OwnableUpgradeable, PausableUpgradeable {
    using SafeMathUpgradeable for uint256;

    struct Stake {
        uint256 amount;
        uint256 length;
        uint256 startingTime;
        uint256 reward;
    }

    IERC20 stakingToken;
    uint256 totalStaked;
    uint256 totalPendingRewards;
    address poolAddress;

    mapping (address => uint256) totalStakeBalances;
    mapping (address => Stake[]) stakes;

    mapping (uint256 => uint256) public rewardRatios;

    function initialize(
        address _tokenAddress,
        address _poolAddress,
        uint256[] memory _durations,
        uint256[] memory _rates
    ) public initializer {
        require(_tokenAddress != address(0));
        require(_durations.length == _rates.length);
        for (uint256 i = 0; i < _durations.length; i++) {
            rewardRatios[_durations[i]] = _rates[i];
        }
        stakingToken = IERC20(_tokenAddress);
        poolAddress = _poolAddress;
    }

  /* MUTABLE */
    function stake(uint256 amount, uint256 length) external override whenNotPaused {
        require (amount > 0, "Must stake more than 0 tokens."); // Might change this to have some sort of minimum
        require (stakingToken.balanceOf(msg.sender) >= amount, "User does not have enough token.");
        require (rewardRatios[length] > 0, "Invalid length."); // Check that it is a valid length

        uint256 reward = amount * rewardRatios[length]/100;
        require (stakingToken.balanceOf(poolAddress) >= totalStaked + totalPendingRewards + reward,
        "Pool does not have enough liquidity.");

        Stake memory newStake = Stake (
            amount,
            length,
            block.timestamp,
            reward
        );

        stakes[msg.sender].push(newStake);
        totalStakeBalances[msg.sender] = totalStakeBalances[msg.sender].add(amount);
        totalStaked = totalStaked.add(amount);
        totalPendingRewards = totalPendingRewards.add(reward);

        stakingToken.transferFrom(msg.sender, poolAddress, amount);
        emit Staked(msg.sender, stakes[msg.sender].length, amount, length);
  }

    function unstake(uint256 index) external override {
        Stake memory currentStake = stakes[msg.sender][index];
        require (currentStake.amount > 0, "Invalid stake index or no stake.");
        require (block.timestamp >= currentStake.startingTime + currentStake.length, "Stake has not expired yet.");

        uint256 amount = currentStake.amount;
        uint256 length = currentStake.length;
        uint256 reward = currentStake.reward;

        // Delete stake entry
        delete stakes[msg.sender][index];

        // Update state variables
        totalStakeBalances[msg.sender] = totalStakeBalances[msg.sender].sub(amount);
        totalStaked = totalStaked.sub(amount);
        totalPendingRewards = totalPendingRewards.sub(reward);

        // Transfer original stake + reward
        stakingToken.transferFrom(poolAddress, msg.sender, amount+reward);

        emit Unstaked(msg.sender, index, amount, length);
    }

  /* GETTERS */
    function getTotalStaked() external override view returns (uint256) {
        return totalStaked;
    }

    function token() external override view returns (address) {
        return address(stakingToken);
    }

    function getTotalStakedByAddress(address staker) external override view returns(uint256) {
        return totalStakeBalances[staker];
    }

    function getPoolAddress() external view returns (address) {
        return poolAddress;
    }

    /* ADMIN FUNCTIONS */
    function updateRewardRatio(uint256 length, uint256 rate) external onlyOwner {
        rewardRatios[length] = rate;
    }

    function setPaused(bool _paused) external onlyOwner {
        if (_paused == paused()) {
            return;
        }

        if (_paused) {
            _pause();
        }
        else {
            _unpause();
        }
    }

    function setPoolAddress(address _poolAddress) external onlyOwner {
        poolAddress = _poolAddress;
    }
}

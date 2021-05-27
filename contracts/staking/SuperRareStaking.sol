// contracts/staking/SuperRareStaking.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ISuperRareStaking.sol";

contract SuperRareStaking is
    ISuperRareStaking,
    Initializable,
    OwnableUpgradeable,
    PausableUpgradeable
{
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

    mapping(address => uint256) totalStakeBalances;
    mapping(address => Stake[]) stakes;

    mapping(uint256 => uint256) public rewardRatios;

    function initialize(
        address _tokenAddress,
        address _poolAddress,
        uint256[] memory _durations,
        uint256[] memory _rates
    ) public initializer {
        require(
            _tokenAddress != address(0), 
            "initializer:tokenAddress cant be 0"    
        );
        require(
            _poolAddress != address(0),
            "initializer:poolAddress cant be 0"
        );
        require(
            _poolAddress != address(this),
            "initializer:poolAddress cant be staking contract"
        );
        require(
            _durations.length == _rates.length,
            "initializer:duration length should equal rates length"
        );
        for (uint256 i = 0; i < _durations.length; i++) {
            rewardRatios[_durations[i]] = _rates[i];
        }
        __Ownable_init();
        __Pausable_init();
        stakingToken = IERC20(_tokenAddress);
        poolAddress = _poolAddress;
    }

    /* MUTABLE */
    function stake(uint256 amount, uint256 length)
        external
        override
        whenNotPaused
    {
        require(amount > 0, "stake:Must stake more than 0 tokens."); // Might change this to have some sort of minimum
        require(
            stakingToken.balanceOf(msg.sender) >= amount,
            "stake:User does not have enough token."
        );
        require(rewardRatios[length] > 0, "stake:Invalid length."); // Check that it is a valid length

        uint256 reward = (amount * rewardRatios[length]) / 100;

        // This is based on the fact that the pool is not the staking contract
        require(
            stakingToken.balanceOf(poolAddress) >=
                totalPendingRewards.add(reward),
            "stake:Pool does not have enough liquidity."
        );

        Stake memory newStake = Stake(amount, length, block.timestamp, reward);

        stakes[msg.sender].push(newStake);
        totalStakeBalances[msg.sender] = totalStakeBalances[msg.sender].add(
            amount
        );
        totalStaked = totalStaked.add(amount);
        totalPendingRewards = totalPendingRewards.add(reward);

        stakingToken.transferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, stakes[msg.sender].length, amount, length);
    }

    function unstake(uint256 index) external override {
        require(
            stakes[msg.sender].length > index,
            "unstake:Stake index out of bounds."
        );
        Stake memory currentStake = stakes[msg.sender][index];
        require(currentStake.amount > 0, "unstake:Stake was already withdrawn.");
        require(
            block.timestamp >= currentStake.startingTime.add(currentStake.length),
            "unstake:Stake has not expired yet."
        );

        // Delete stake entry
        delete stakes[msg.sender][index];

        totalStakeBalances[msg.sender] = totalStakeBalances[msg.sender].sub(
            currentStake.amount
        );
        totalStaked = totalStaked.sub(currentStake.amount);
        totalPendingRewards = totalPendingRewards.sub(currentStake.reward);

        // Transfer original stake + reward
        stakingToken.transfer(msg.sender, currentStake.amount);
        stakingToken.transferFrom(poolAddress, msg.sender, currentStake.reward);

        emit Unstaked(msg.sender, index, currentStake.amount, currentStake.length);
    }

    /* GETTERS */
    function getTotalStaked() external view override returns (uint256) {
        return totalStaked;
    }

    function token() external view override returns (address) {
        return address(stakingToken);
    }

    function getTotalStakedByAddress(address staker)
        external
        view
        override
        returns (uint256)
    {
        return totalStakeBalances[staker];
    }

    function getPoolAddress() external view returns (address) {
        return poolAddress;
    }

    /* ADMIN FUNCTIONS */
    function updateRewardRatio(uint256 length, uint256 rate)
        external
        onlyOwner
    {
        rewardRatios[length] = rate;
    }

    function setPaused(bool _paused) external onlyOwner {
        if (_paused == paused()) {
            return;
        }

        if (_paused) {
            _pause();
        } else {
            _unpause();
        }
    }

    function setPoolAddress(address _poolAddress) external onlyOwner {
        require(
            _poolAddress != address(0),
            "initializer:poolAddress cant be 0"
        );
        require(
            _poolAddress != address(this),
            "initializer:poolAddress cant be staking contract"
        );
        poolAddress = _poolAddress;
    }
}

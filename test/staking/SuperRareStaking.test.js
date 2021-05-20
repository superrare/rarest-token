// test/staking/SuperRareStaking.test.js
const hre = require("hardhat");
const { expect } = require('chai');
const { ethers } = require('hardhat');
const { expectRevert } = require('@openzeppelin/test-helpers');

const advanceTime = async (seconds) => {
  await hre.ethers.provider.send("evm_increaseTime", [seconds]);
  await hre.ethers.provider.send("evm_mine");
};

describe('SuperRareStaking', function () {
  before(async function () {
    this.SuperRareTokenContractFactory = await ethers.getContractFactory('SuperRareToken');
    this.SuperRareStakingContractFactory = await ethers.getContractFactory('SuperRareStaking');
  })

  beforeEach(async function () {
    const [owner] = await ethers.getSigners();

    this.superRareToken = await this.SuperRareTokenContractFactory.deploy();
    await this.superRareToken.deployed();
    await this.superRareToken.init(owner.address);

    this.superRareStaking = await this.SuperRareStakingContractFactory.deploy();
    await this.superRareStaking.deployed();
    await this.superRareStaking.initialize(
      this.superRareToken.address,
      this.superRareStaking.address,
      // Time in Seconds [30 days, 90 days, 180 days]
      [2592000, 7776000, 15552000], 
      [2, 5, 10]
    );
  });

  describe('Initialization', function () {
    it('Staking Contract Initialized Correctly', async function() {
      // Arrange
      const srTokenAddress = this.superRareToken.address;
      const rewards = [2, 5, 10];
      
      // Act
      const stakingTokenAddress = await this.superRareStaking.token();
      const thirtyDayRate = (await this.superRareStaking.rewardRatios(2592000)).toNumber();
      const ninetyDayRate = (await this.superRareStaking.rewardRatios(7776000)).toNumber();
      const oneEightyDayRate = (await this.superRareStaking.rewardRatios(15552000)).toNumber();
      
      // Assert
      expect(stakingTokenAddress).to.equal(srTokenAddress);
      expect(thirtyDayRate).to.equal(rewards[0]);
      expect(ninetyDayRate).to.equal(rewards[1]);
      expect(oneEightyDayRate).to.equal(rewards[2]);
    });
  });

  describe('Admin Functions', function () {

  });

  describe('Stake', function () {
    it('Single User - success', async function() {
      // Arrange 
      const [owner] = await ethers.getSigners();
      const durations = [2592000, 7776000, 15552000];
      await this.superRareToken.transfer(this.superRareStaking.address, "100000000000000000000000");
      await this.superRareToken.approve(this.superRareStaking.address, "1000000000000000000000000");
  
      // Act
      await this.superRareStaking.stake("10000000000000000000", durations[0]);
      const amtStakedByUser = (await this.superRareStaking.getTotalStakedByAddress(owner.address)).toString();
      const totalStaked = (await this.superRareStaking.getTotalStaked()).toString();
  
      // Assert
      expect(amtStakedByUser).to.equal("10000000000000000000");
      expect(totalStaked).to.equal("10000000000000000000");
    });
  
    it('Single User - not enough tokens', async function() {
      // Arrange 
      const [_, addr1] = await ethers.getSigners();
      const durations = [2592000, 7776000, 15552000];
      await this.superRareToken.transfer(this.superRareStaking.address, "100000000000000000000000");
      await this.superRareToken.approve(this.superRareStaking.address, "1000000000000000000000000");
  
      // Act
      await expectRevert(
        this.superRareStaking.connect(addr1).stake("10000000000000000000", durations[0]),
        "User does not have enough token."
      );
      const amtStakedByUser = (await this.superRareStaking.getTotalStakedByAddress(addr1.address)).toString();
      const totalStaked = (await this.superRareStaking.getTotalStaked()).toString();
  
      // Assert
      expect(amtStakedByUser).to.equal("0");
      expect(totalStaked).to.equal("0");
    });
  
    it('Single User - cant stake 0 tokens', async function() {
      // Arrange 
      const [owner] = await ethers.getSigners();
      const durations = [2592000, 7776000, 15552000];
      await this.superRareToken.transfer(this.superRareStaking.address, "100000000000000000000000");
      await this.superRareToken.approve(this.superRareStaking.address, "1000000000000000000000000");
  
      // Act
      await expectRevert(
        this.superRareStaking.stake("0", durations[0]),
        "Must stake more than 0 tokens."
      );
      const amtStakedByUser = (await this.superRareStaking.getTotalStakedByAddress(owner.address)).toString();
      const totalStaked = (await this.superRareStaking.getTotalStaked()).toString();
  
      // Assert
      expect(amtStakedByUser).to.equal("0");
      expect(totalStaked).to.equal("0");
    });

    it('Single User - duration must be valid length', async function() {
      // Arrange 
      const [owner] = await ethers.getSigners();
      const durations = [2592000, 7776000, 15552000];
      await this.superRareToken.transfer(this.superRareStaking.address, "100000000000000000000000");
      await this.superRareToken.approve(this.superRareStaking.address, "1000000000000000000000000");
  
      // Act
      await expectRevert(
        this.superRareStaking.stake("10000000000000000000", durations[0] - 1),
        "Invalid length."
      );
      const amtStakedByUser = (await this.superRareStaking.getTotalStakedByAddress(owner.address)).toString();
      const totalStaked = (await this.superRareStaking.getTotalStaked()).toString();
  
      // Assert
      expect(amtStakedByUser).to.equal("0");
      expect(totalStaked).to.equal("0");
    });
  
    it('Multi User - success', async function() {
      // Arrange 
      const [owner, addr1] = await ethers.getSigners();
      const durations = [2592000, 7776000, 15552000];
      await this.superRareToken.transfer(this.superRareStaking.address, "100000000000000000000000");
      await this.superRareToken.transfer(addr1.address, "500000000000000000000000");
      await this.superRareToken.approve(this.superRareStaking.address, "500000000000000000000000");
      await this.superRareToken.connect(addr1).approve(this.superRareStaking.address, "500000000000000000000000");
  
      // Act
      await this.superRareStaking.stake("10000000000000000000", durations[0]);
      await this.superRareStaking.connect(addr1).stake("10000000000000000000", durations[0]);
      const amtStakedByUser1 = (await this.superRareStaking.getTotalStakedByAddress(owner.address)).toString();
      const amtStakedByUser2 = (await this.superRareStaking.getTotalStakedByAddress(addr1.address)).toString();
      const totalStaked = (await this.superRareStaking.getTotalStaked()).toString();
  
      // Assert
      expect(amtStakedByUser1).to.equal("10000000000000000000");
      expect(amtStakedByUser2).to.equal("10000000000000000000");
      expect(totalStaked).to.equal("20000000000000000000");
    });

    it('Pool Doesnt Have Enough Liquidity', async function() {
      // Arrange 
      const [owner] = await ethers.getSigners();
      const durations = [2592000, 7776000, 15552000];
      await this.superRareToken.approve(this.superRareStaking.address, "1000000000000000000000000");
  
      // Act
      await expectRevert(
        this.superRareStaking.stake("10000000000000000000", durations[0]),
        "Pool doesnt have enough tokens to pay staking reward."
      );
      const amtStakedByUser = (await this.superRareStaking.getTotalStakedByAddress(owner.address)).toString();
      const totalStaked = (await this.superRareStaking.getTotalStaked()).toString();
  
      // Assert
      expect(amtStakedByUser).to.equal("0");
      expect(totalStaked).to.equal("0");
    });
  });

  describe('Unstake', async function () {
    it('Single User - success', async function () {
      // Arrange 
      const [_, addr1] = await ethers.getSigners();
      const durations = [2592000, 7776000, 15552000];
      await this.superRareToken.transfer(this.superRareStaking.address, "100000000000000000000000");
      await this.superRareToken.transfer(addr1.address, "1000");
      await this.superRareToken.connect(addr1).approve(this.superRareStaking.address, "1000000000000000000000000");
      await this.superRareStaking.connect(addr1).stake("1000", durations[0]);
  
      // Act
      const amtStakedByUserBefore = (await this.superRareStaking.getTotalStakedByAddress(addr1.address)).toString();
      const totalStakedBefore = (await this.superRareStaking.getTotalStaked()).toString();
      await advanceTime(durations[0]);
      await this.superRareStaking.connect(addr1).unstake(0);
      const amtStakedByUserAfter = (await this.superRareStaking.getTotalStakedByAddress(addr1.address)).toString();
      const totalStakedAfter = (await this.superRareStaking.getTotalStaked()).toString();
      const balanceOfUser = (await this.superRareToken.balanceOf(addr1.address)).toString();
  
      // Assert
      expect(amtStakedByUserBefore).to.equal("1000");
      expect(totalStakedBefore).to.equal("1000");
      expect(amtStakedByUserAfter).to.equal("0");
      expect(totalStakedAfter).to.equal("0");
      expect(balanceOfUser).to.equal("1020");
    });

    it('Single User - Time Not Up', async function () {
      // Arrange 
      const [_, addr1] = await ethers.getSigners();
      const durations = [2592000, 7776000, 15552000];
      await this.superRareToken.transfer(this.superRareStaking.address, "100000000000000000000000");
      await this.superRareToken.transfer(addr1.address, "1000");
      await this.superRareToken.connect(addr1).approve(this.superRareStaking.address, "1000000000000000000000000");
      await this.superRareStaking.connect(addr1).stake("1000", durations[0]);
  
      // Act
      const amtStakedByUserBefore = (await this.superRareStaking.getTotalStakedByAddress(addr1.address)).toString();
      const totalStakedBefore = (await this.superRareStaking.getTotalStaked()).toString();
      await expectRevert(
        this.superRareStaking.connect(addr1).unstake(0),
        "Stake has not expired yet."
      );
      const amtStakedByUserAfter = (await this.superRareStaking.getTotalStakedByAddress(addr1.address)).toString();
      const totalStakedAfter = (await this.superRareStaking.getTotalStaked()).toString();
      const balanceOfUser = (await this.superRareToken.balanceOf(addr1.address)).toString();
  
      // Assert
      expect(amtStakedByUserBefore).to.equal("1000");
      expect(totalStakedBefore).to.equal("1000");
      expect(amtStakedByUserAfter).to.equal("1000");
      expect(totalStakedAfter).to.equal("1000");
      expect(balanceOfUser).to.equal("0");
    });

    it('Single User - Cant Unstake If Not Staked', async function () {
      // Arrange 
      const [_, addr1] = await ethers.getSigners();
      await this.superRareToken.transfer(this.superRareStaking.address, "100000000000000000000000");
      await this.superRareToken.transfer(addr1.address, "1000");
      await this.superRareToken.connect(addr1).approve(this.superRareStaking.address, "1000000000000000000000000");
  
      // Act
      const amtStakedByUserBefore = (await this.superRareStaking.getTotalStakedByAddress(addr1.address)).toString();
      const totalStakedBefore = (await this.superRareStaking.getTotalStaked()).toString();
      await expectRevert(
        this.superRareStaking.connect(addr1).unstake(0),
        "Invalid stake index or no stake."
      );
      const amtStakedByUserAfter = (await this.superRareStaking.getTotalStakedByAddress(addr1.address)).toString();
      const totalStakedAfter = (await this.superRareStaking.getTotalStaked()).toString();
      const balanceOfUser = (await this.superRareToken.balanceOf(addr1.address)).toString();
  
      // Assert
      expect(amtStakedByUserBefore).to.equal("0");
      expect(totalStakedBefore).to.equal("0");
      expect(amtStakedByUserAfter).to.equal("0");
      expect(totalStakedAfter).to.equal("0");
      expect(balanceOfUser).to.equal("0");
    });

    it('Single User - Cant Unstake NonExistent Stake', async function () {
      // Arrange 
      const [_, addr1] = await ethers.getSigners();
      const durations = [2592000, 7776000, 15552000];
      await this.superRareToken.transfer(this.superRareStaking.address, "100000000000000000000000");
      await this.superRareToken.transfer(addr1.address, "1000");
      await this.superRareToken.connect(addr1).approve(this.superRareStaking.address, "1000000000000000000000000");
      await this.superRareStaking.connect(addr1).stake("1000", durations[0]);
  
      // Act
      const amtStakedByUserBefore = (await this.superRareStaking.getTotalStakedByAddress(addr1.address)).toString();
      const totalStakedBefore = (await this.superRareStaking.getTotalStaked()).toString();
      await expectRevert(
        this.superRareStaking.connect(addr1).unstake(1),
        "Invalid stake index or no stake."
      );
      const amtStakedByUserAfter = (await this.superRareStaking.getTotalStakedByAddress(addr1.address)).toString();
      const totalStakedAfter = (await this.superRareStaking.getTotalStaked()).toString();
      const balanceOfUser = (await this.superRareToken.balanceOf(addr1.address)).toString();
  
      // Assert
      expect(amtStakedByUserBefore).to.equal("0");
      expect(totalStakedBefore).to.equal("0");
      expect(amtStakedByUserAfter).to.equal("0");
      expect(totalStakedAfter).to.equal("0");
      expect(balanceOfUser).to.equal("0");
    });

    it('Multi User - success', async function () {
      // Arrange 
      const [_, addr1, addr2] = await ethers.getSigners();
      const durations = [2592000, 7776000, 15552000];
      await this.superRareToken.transfer(this.superRareStaking.address, "100000000000000000000000");
      await this.superRareToken.transfer(addr1.address, "1000");
      await this.superRareToken.transfer(addr2.address, "2000");
      await this.superRareToken.connect(addr1).approve(this.superRareStaking.address, "1000000000000000000000000");
      await this.superRareToken.connect(addr2).approve(this.superRareStaking.address, "1000000000000000000000000");
      await this.superRareStaking.connect(addr1).stake("1000", durations[0]);
      await this.superRareStaking.connect(addr2).stake("2000", durations[1]);
      const timeDiff = durations[1] - durations[0];
  
      // Act
      const amtStakedByUser1Before = (await this.superRareStaking.getTotalStakedByAddress(addr1.address)).toString();
      const amtStakedByUser2Before = (await this.superRareStaking.getTotalStakedByAddress(addr2.address)).toString();
      const totalStakedBefore = (await this.superRareStaking.getTotalStaked()).toString();
      
      await advanceTime(durations[0]);
      await this.superRareStaking.connect(addr1).unstake(0);

      const amtStakedByUser1Mid = (await this.superRareStaking.getTotalStakedByAddress(addr1.address)).toString();
      const amtStakedByUser2Mid = (await this.superRareStaking.getTotalStakedByAddress(addr2.address)).toString();
      const totalStakedMid = (await this.superRareStaking.getTotalStaked()).toString();
      const balanceOfUser1Mid = (await this.superRareToken.balanceOf(addr1.address)).toString();
      const balanceOfUser2Mid = (await this.superRareToken.balanceOf(addr2.address)).toString();

      await advanceTime(timeDiff);
      await this.superRareStaking.connect(addr2).unstake(0);

      const amtStakedByUser1After = (await this.superRareStaking.getTotalStakedByAddress(addr1.address)).toString();
      const amtStakedByUser2After = (await this.superRareStaking.getTotalStakedByAddress(addr2.address)).toString();
      const totalStakedAfter = (await this.superRareStaking.getTotalStaked()).toString();
      const balanceOfUser1After = (await this.superRareToken.balanceOf(addr1.address)).toString();
      const balanceOfUser2After = (await this.superRareToken.balanceOf(addr2.address)).toString();
  
      // Assert
      expect(amtStakedByUser1Before).to.equal("1000");
      expect(amtStakedByUser2Before).to.equal("2000");
      expect(totalStakedBefore).to.equal("3000");
      
      expect(amtStakedByUser1Mid).to.equal("0");
      expect(amtStakedByUser2Mid).to.equal("2000");
      expect(totalStakedMid).to.equal("2000");
      expect(balanceOfUser1Mid).to.equal("1020");
      expect(balanceOfUser2Mid).to.equal("0");

      expect(amtStakedByUser1After).to.equal("0");
      expect(amtStakedByUser2After).to.equal("0");
      expect(totalStakedAfter).to.equal("0");
      expect(balanceOfUser1After).to.equal("1020");
      expect(balanceOfUser2After).to.equal("2100");
    });
  });
});

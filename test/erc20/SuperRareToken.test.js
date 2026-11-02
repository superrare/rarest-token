// test/erc20/SuperRareToken.test.js
const { expect } = require('chai');
const { ethers } = require("hardhat");
const { expectRevert } = require('@openzeppelin/test-helpers');

describe('SuperRareToken', function () {
  before(async function () {
    this.SuperRareToken = await ethers.getContractFactory('SuperRareToken');
  });

  beforeEach(async function () {
    this.superRareToken = await this.SuperRareToken.deploy();
    await this.superRareToken.deployed();
  });

  it('Token init - fail', async function () {
    await expectRevert(
      this.superRareToken.init(ethers.constants.AddressZero),
      "Owner cant be 0 address."
    )
  });

  it('Token Properties Setup Correctly', async function () {
    const [owner] = await ethers.getSigners();
    await this.superRareToken.init(owner.address);

    expect((await this.superRareToken.symbol())).to.equal('RARE');
    expect((await this.superRareToken.name())).to.equal('SuperRare');
    expect((await this.superRareToken.totalSupply())).to.equal('1000000000000000000000000');
  });

  it('Token Roles Setup Correctly', async function () {
    const [owner, addr1] = await ethers.getSigners();
    await this.superRareToken.init(owner.address);
    const adminRole = await this.superRareToken.DEFAULT_ADMIN_ROLE();
    const minterRole = await this.superRareToken.MINTER_ROLE();
    const pauserRole = await this.superRareToken.PAUSER_ROLE();

    expect((await this.superRareToken.hasRole(adminRole, owner.address))).to.equal(true);
    expect((await this.superRareToken.hasRole(minterRole, owner.address))).to.equal(true);
    expect((await this.superRareToken.hasRole(pauserRole, owner.address))).to.equal(true);

    expect((await this.superRareToken.hasRole(adminRole, addr1.address))).to.equal(false);
    expect((await this.superRareToken.hasRole(minterRole, addr1.address))).to.equal(false);
    expect((await this.superRareToken.hasRole(pauserRole, addr1.address))).to.equal(false);
  });

  it('Token Minting Functionality', async function () {
    const [owner, addr1] = await ethers.getSigners();
    await this.superRareToken.init(owner.address);
    const newMint = '20000000000000000000000';
    const minterRole = await this.superRareToken.MINTER_ROLE();

    await this.superRareToken.mint(addr1.address, newMint);

    expect((await this.superRareToken.balanceOf(addr1.address))).to.equal(newMint);

    await this.superRareToken.revokeRole(minterRole, owner.address);

    await expectRevert(
      this.superRareToken.mint(addr1.address, newMint),
      "ERC20PresetMinterPauser: must have minter role to mint"
    );
  });

  it('Token Pausing Functionality', async function () {
    const [owner, addr1] = await ethers.getSigners();
    await this.superRareToken.init(owner.address);
    const amnt = '20000000000000000000000';
    const pauserRole = await this.superRareToken.PAUSER_ROLE();

    expect((await this.superRareToken.paused())).to.equal(false);

    await this.superRareToken.pause();

    expect((await this.superRareToken.paused())).to.equal(true);

    await expectRevert(
      this.superRareToken.transfer(addr1.address, amnt),
      "ERC20Pausable: token transfer while paused"
    );

    await this.superRareToken.unpause();

    expect((await this.superRareToken.paused())).to.equal(false);

    await this.superRareToken.revokeRole(pauserRole, owner.address);

    await expectRevert(
      this.superRareToken.pause(),
      "ERC20PresetMinterPauser: must have pauser role to pause"
    );
  });
});

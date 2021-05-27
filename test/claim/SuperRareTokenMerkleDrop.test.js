// test/claim/SuperRareTokenMerkleDrop.test.js
const { expect } = require('chai');
const { ethers } = require('hardhat');
const { expectRevert } = require('@openzeppelin/test-helpers');

describe('SuperRareTokenMerkleDrop', function () {
  beforeEach(async function () {
    this.SuperRareToken = await ethers.getContractFactory('SuperRareToken');
    this.SuperRareTokenMerkleDrop = await ethers.getContractFactory('SuperRareTokenMerkleDrop');
    const [owner] = await ethers.getSigners();

    this.superRareToken = await this.SuperRareToken.deploy();
    await this.superRareToken.deployed();
    await this.superRareToken.init(owner.address);

    const merkleRoot = "0x23aefae04ed373d0de991f6220a536e67c4a84dac6065a16d5445c0eed8a5eaf";
    this.superRareTokenMerkleDrop = await this.SuperRareTokenMerkleDrop.deploy(this.superRareToken.address, merkleRoot);
  });

  it('Update Merkle Root', async function () {
    const newMerkleRoot = "0x1c4e89f92fcfbc3d7512bac19f1723e373feb94d6bf683c5cbfd110a0fd6e360";
    await this.superRareTokenMerkleDrop.updateMerkleRoot(newMerkleRoot);
    expect(await this.superRareTokenMerkleDrop._merkleRoot()).to.eq(newMerkleRoot);
  });

  it('Attempt to Update Merkle Root from Non-Owner Address', async function () {
    const [_, addr1] = await ethers.getSigners();
    const newMerkleRoot = "0x1c4e89f92fcfbc3d7512bac19f1723e373feb94d6bf683c5cbfd110a0fd6e360";
    await expectRevert(
      this.superRareTokenMerkleDrop.connect(addr1).updateMerkleRoot(newMerkleRoot),
      "Must be owner of the contract."
    );
  });
});

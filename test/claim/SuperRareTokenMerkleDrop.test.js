// test/claim/SuperRareTokenMerkleDrop.test.js
const { expect } = require('chai');
const { ethers } = require('hardhat');
const { expectRevert } = require('@openzeppelin/test-helpers');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const tokens = require('./tokens.json');

describe('SuperRareTokenMerkleDrop', function () {
  before(async function () {
    this.SuperRareToken = await ethers.getContractFactory('SuperRareToken');
    this.SuperRareTokenMerkleDrop = await ethers.getContractFactory('SuperRareTokenMerkleDrop');
    const [owner] = await ethers.getSigners();
    this.superRareToken = await this.SuperRareToken.deploy();
    await this.superRareToken.deployed();
    await this.superRareToken.init(owner.address);
  });

  beforeEach(async function () {
    const merkleRoot = "0x23aefae04ed373d0de991f6220a536e67c4a84dac6065a16d5445c0eed8a5eaf";
    this.superRareTokenMerkleDrop = await this.SuperRareTokenMerkleDrop.deploy(this.superRareToken.address, merkleRoot);
  });

  it('Update Merkle Root', async function () {
    const newMerkleRoot = "0x1c4e89f92fcfbc3d7512bac19f1723e373feb94d6bf683c5cbfd110a0fd6e360";
    await this.superRareTokenMerkleDrop.updateMerkleRoot(newMerkleRoot);
    expect(await this.superRareTokenMerkleDrop.claimRoot()).to.eq(newMerkleRoot);
  });

  it('Attempt to Update Merkle Root from Non-Owner Address', async function () {
    const [_, addr1] = await ethers.getSigners();
    const newMerkleRoot = "0x1c4e89f92fcfbc3d7512bac19f1723e373feb94d6bf683c5cbfd110a0fd6e360";
    await expectRevert(
      this.superRareTokenMerkleDrop.connect(addr1).updateMerkleRoot(newMerkleRoot),
      "Must be owner of the contract."
    );
  });

  it('Deploy - fail - 0 token Address', async function () {
    const zeroAddress = ethers.constants.AddressZero;
    const merkleRoot = "0x23aefae04ed373d0de991f6220a536e67c4a84dac6065a16d5445c0eed8a5eaf";
    
    await expectRevert(
      this.SuperRareTokenMerkleDrop.deploy(zeroAddress, merkleRoot),
      "Token address cant be 0 address."
    );
  });

  it('Deploy - fail - 0 Merkle Root', async function () {
    const tokenAddress = "0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0";
    const merkleRoot = ethers.constants.HashZero;
    
    await expectRevert(
      this.SuperRareTokenMerkleDrop.deploy(tokenAddress, merkleRoot),
      "MerkleRoot cant be empty."
    );
  });

  it('Successfull Claim', async function () {
    const [owner] = await ethers.getSigners();
    
    const hashToken = (account, amount) => {
      return ethers.utils.solidityKeccak256(['address', 'uint256'], 
        [account, amount]).slice(2);
    }

    const sortedTokens = Object.entries(tokens).sort();
    const hashedTokens = sortedTokens.map(e => hashToken(...e));

    const merkleTree = new MerkleTree(
      hashedTokens,
      keccak256,
      { sortPairs: true }
    );

    const root = merkleTree.getHexRoot();
    const leaf = hashToken(...sortedTokens[4]);
    const proof = merkleTree.getHexProof(leaf);

    expect(merkleTree.verify(proof, leaf, root)).to.equal(true);

    const merkleDrop = await this.SuperRareTokenMerkleDrop.deploy(this.superRareToken.address, root);

    await this.superRareToken.transfer(merkleDrop.address, 100000);

    expect((await this.superRareToken.balanceOf(merkleDrop.address)).toString()).to.equal('100000');

    await merkleDrop.claim(10000, proof);

    expect((await this.superRareToken.balanceOf(merkleDrop.address)).toString()).to.equal('90000');
    expect((await this.superRareToken.balanceOf(owner.address)).toString()).to.equal('999999999999999999910000');
  });
});

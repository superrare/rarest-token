// test/erc20/SuperRareToken.test.js
const { expect } = require('chai');
const { ethers } = require("hardhat");
const { expectRevert } = require('@openzeppelin/test-helpers');

describe('SuperRareToken', function () {
  beforeEach(async function () {
    const [owner] = await ethers.getSigners();
    this.Registry = await ethers.getContractFactory('Registry');
    this.registry = await this.Registry.deploy();
    await this.registry.deployed();
    await this.registry.initialize();
  });

  it('Removing a contract does not leave a gap in storage', async function () {
      // Use dummy test addresses
      const addr1 = "0xc0ffee254729296a45a3885639AC7E10F9d54979";
      const addr2 = "0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E";

      const contractName = ethers.utils.formatBytes32String("contract1");

      await this.registry.addContract(contractName, addr1);
      await this.registry.upgradeContract(contractName, addr2);
      expect(await this.registry.getContractVersionCount(contractName)).to.eq(2);

      await this.registry.removeContract(contractName);
      expect(await this.registry.getContractVersionCount(contractName)).to.eq(1);
  });

});

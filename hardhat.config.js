// hardhat.config.js
require("@nomiclabs/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");
const { ropstenNodeUrl, rinkebyNodeUrl, privateKey } = require('./secrets.json');

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.7.3",
  networks: {
    ropsten: {
      url: ropstenNodeUrl,
      accounts: [`0x${privateKey}`],
      gasMultiplier: 2,
      timeout: 100000
    },
    rinkeby: {
      url: rinkebyNodeUrl,
      accounts: [`0x${privateKey}`],
      gasMultiplier: 2,
      timeout: 100000
    }
  }
};
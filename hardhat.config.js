// hardhat.config.js
require("@nomiclabs/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-waffle");
<<<<<<< HEAD
=======
//const { ropstenNodeUrl, rinkebyNodeUrl, privateKey } = require('./secrets.json');
>>>>>>> 9f6f923 (Start implementation)

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.7.3",
  networks: {
<<<<<<< HEAD
=======
    // ropsten: {
    //   url: ropstenNodeUrl,
    //   accounts: [`0x${privateKey}`]
    // },
    // rinkeby: {
    //   url: rinkebyNodeUrl,
    //   accounts: [`0x${privateKey}`]
    // }
>>>>>>> 9f6f923 (Start implementation)
  }
};

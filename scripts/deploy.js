const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );

  const Token = await ethers.getContractFactory("SuperRareToken");

  const proxy = await upgrades.deployProxy(Token, [deployer.address], {initializer: 'init'});
  
  await proxy.deployed();

  console.log("Token address:", proxy.address);
};

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
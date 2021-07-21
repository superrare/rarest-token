const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account: ",
    deployer.address
  );

  console.log("Deploying Token Contract...");

  const Token = await ethers.getContractFactory("SuperRareToken");
  const tokenProxy = await upgrades.deployProxy(Token, [deployer.address], { initializer: 'init' });
  await tokenProxy.deployed();

  console.log("Token Proxy address: ", tokenProxy.address);
};

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
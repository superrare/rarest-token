const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const newToken = await ethers.getContractFactory("SuperRareToken");
  const upgradedToken = await upgrades.upgradeProxy('0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', newToken);

  await upgradedToken.deployed();

  console.log("Updated token impl at address: ", upgradedToken.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const newToken = await ethers.getContractFactory("SuperRareToken");
  const upgradedToken = await upgrades.upgradeProxy('0xcb35043Ca7742773F543BDFc4BB5e0b350018C49', newToken);

  await upgradedToken.deployed();

  console.log("Updated token impl")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
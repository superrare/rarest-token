const { ethers, upgrades } = require("hardhat");

async function main() {
  const newTokenImplAddress;

  const newToken = await ethers.getContractFactory("SuperRareToken");
  const upgradedToken = await upgrades.upgradeProxy(newTokenImplAddress, newToken);

  await upgradedToken.deployed();

  console.log("Updated token impl at address: ", upgradedToken.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
const { ethers, upgrades } = require("hardhat");

async function main() {
  const newStakingImplAddress;

  const newStaking = await ethers.getContractFactory("SuperRareStaking");
  const upgradedToken = await upgrades.upgradeProxy(newStakingImplAddress, newToken);

  await upgradedToken.deployed();

  console.log("Updated token impl at address: ", upgradedToken.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
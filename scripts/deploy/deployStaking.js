const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  // Corresponds to solidity 30 days, 90 days, 180 days
  const durations = [2592000, 7776000, 15552000];
  const rates = [2, 5, 11];
  const tokenAddress = ""

  console.log(
    "Deploying contracts with the account: ",
    deployer.address
  );

  console.log("Deploying Staking Contract...");

  const Staking = await ethers.getContractFactory("SuperRareStaking");
  const stakingProxy = await upgrades.deployProxy(Staking, { initializer: false });
  await stakingProxy.deployed();
  await stakingProxy.initialize(tokenAddress, stakingProxy.address, durations, rates);

  console.log("Staking Proxy Address: ", stakingProxy.address);

};

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
// scripts/prepare_upgrade.js
async function main() {
  const proxyAddress;
 
  const Staking = await ethers.getContractFactory("SuperRareStaking");
  console.log("Preparing upgrade...");
  const newStakingImplAddr = await upgrades.prepareUpgrade(proxyAddress, Staking);
  console.log("SuperRareStaking at:", newStakingImplAddr);
}
 
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

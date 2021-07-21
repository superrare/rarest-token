const { ethers, upgrades } = require("hardhat");

async function main() {
  const tokenAddress = "0xD2e214C431E8402D5cbF43fB6D8eA6C6BaB9AD82";

  console.log("Deploying Claim Contract...");

  const Claim = await ethers.getContractFactory("SuperRareTokenMerkleDrop");
  const claimInstance = await Claim.deploy(tokenAddress, "0x6c79abbfe82eba285e5c9ada79522fa06572120ccd3c7189a2c62eaec7878ca5");
  await claimInstance.deployed();

  console.log("Claim address: ", claimInstance.address);
};

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
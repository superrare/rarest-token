// scripts/ownership.transferClaimOwnership.js

const { ethers, upgrades } = require("hardhat");

async function main() {
  const newOwner = "";
  const tokenClaimAddress = "";
 
  console.log("Transferring ownership of ProxyAdmin...");
  // // The owner of the ProxyAdmin can upgrade our contracts
  // await upgrades.admin.transferProxyAdminOwnership(newOwner);

  const TokenMerkleClaim = await ethers.getContractFactory("SuperRareTokenMerkleDrop");

  const claimInstance = await TokenMerkleClaim.attach(tokenClaimAddress);

  await claimInstance.transferOwnership(newOwner);

  console.log("Transferred ownership of ProxyAdmin to:", newOwner);
}
 
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
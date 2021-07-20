// scripts/ownership.transferProxyOwnership.js

const { ethers, upgrades } = require("hardhat");

async function main() {
  const newOwner = "";
  const proxyAdminAddress = "";
 
  console.log("Transferring ownership of ProxyAdmin...");
  // // The owner of the ProxyAdmin can upgrade our contracts
  // await upgrades.admin.transferProxyAdminOwnership(newOwner);

  const ProxyAdmin = await ethers.getContractFactory("ProxyAdmin");

  const proxyAdminInstance = await ProxyAdmin.attach(proxyAdminAddress);

  await proxyAdminInstance.transferOwnership(newOwner);

  console.log("Transferred ownership of ProxyAdmin to:", newOwner);
}
 
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
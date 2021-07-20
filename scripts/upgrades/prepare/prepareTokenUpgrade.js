// scripts/prepare_upgrade.js
async function main() {
  const proxyAddress;
 
  const Token = await ethers.getContractFactory("SuperRareToken");
  console.log("Preparing upgrade...");
  const newTokenImplAddr = await upgrades.prepareUpgrade(proxyAddress, Token);
  console.log("SuperRareToken at:", newTokenImplAddr);
}
 
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

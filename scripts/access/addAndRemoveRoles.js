const { ethers } = require("hardhat");
const keccak256 = require("keccak256");

async function main() {
  const gnosisSafeAddress = "";
  const tokenContractAddress = "";
  const minterRole = keccak256("MINTER_ROLE");
  const pauserRole = keccak256("PAUSER_ROLE");
  const defaultAdminRole = "0x0000000000000000000000000000000000000000000000000000000000000000";

  const [deployer] = await ethers.getSigners();
  
  const Token = await ethers.getContractFactory("SuperRareToken");
  const tokenInstance = await Token.attach(tokenContractAddress);

  await tokenInstance.grantRole(minterRole, gnosisSafeAddress);
  await tokenInstance.grantRole(pauserRole, gnosisSafeAddress);
  await tokenInstance.grantRole(defaultAdminRole, gnosisSafeAddress);

  await tokenInstance.renounceRole(minterRole, deployer.address);
  await tokenInstance.renounceRole(pauserRole, deployer.address);
  await tokenInstance.renounceRole(defaultAdminRole, deployer.address);
}

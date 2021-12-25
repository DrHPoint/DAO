import { task } from "hardhat/config";
//import { parseUnits } from "ethers/lib/utils";
//import { ethers } from "hardhat";
//import { hexConcat } from "@ethersproject/bytes";

task("createProposal", "Create new Proposal", async (args, hre) => {
  const [addr1, addr2, ...addrs] = await hre.ethers.getSigners();

  //const token = await hre.ethers.getContractAt("MyToken", process.env.TOKEN_ADDR as string);
  const dao = await hre.ethers.getContractAt("DAO", process.env.DAO_ADDR as string);
  await dao.connect(addr1).createProposal("0xa9059cbb000000000000000000000000da591c6ead892a6e67cad2c79ab5b38aa662a0e20000000000000000000000000000000000000000000000008ac7230489e80000", 
    "Transfer 1000 tokens to addr2 from DAO", process.env.TOKEN_ADDR as string);

  console.log('createProposal task Done!'); 
});
import { task } from "hardhat/config";

task("checkEnding", "check ending in a certain proposal")
.addParam("idProposal", "id proposal")
.setAction(async (taskArgs, hre) =>{
  const [addr1, addr2, ...addrs] = await hre.ethers.getSigners();

  const dao = await hre.ethers.getContractAt("DAO", process.env.DAO_ADDR as string);
  await dao.connect(addr1).checkEnding(taskArgs.idProposal);

  console.log('checkEnding task Done!'); 
});
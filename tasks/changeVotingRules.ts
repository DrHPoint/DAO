import { task } from "hardhat/config";

task("changeVotingRules", "change voting rules")
.addParam("procentQuorum", "new proposals procent quorum")
.addParam("duration", "new proposals duration in days")
.setAction(async (taskArgs, hre) =>{
  const [addr1, addr2, ...addrs] = await hre.ethers.getSigners();

  const dao = await hre.ethers.getContractAt("DAO", process.env.DAO_ADDR as string);
  await dao.changeVotingRules(taskArgs.procentQuorum, taskArgs.duration);

  console.log('changeVotingRules task Done!'); 
});
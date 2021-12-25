import { task } from "hardhat/config";

task("vote", "vote to a certain proposal")
.addParam("idProposal", "id proposal")
.addParam("decision", "user's decision")
.setAction(async (taskArgs, hre) =>{
  const [addr1, addr2, ...addrs] = await hre.ethers.getSigners();

  const dao = await hre.ethers.getContractAt("DAO", process.env.DAO_ADDR as string);
  await dao.connect(addr1).vote(taskArgs.idProposal, taskArgs.decision);

  console.log('vote task Done!'); 
});
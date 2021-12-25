import { task } from "hardhat/config";

task("execute", "tried to execute bytecode in a certain proposale")
.addParam("idProposal", "id proposal")
.setAction(async (taskArgs, hre) =>{
  const [addr1, addr2, ...addrs] = await hre.ethers.getSigners();

  const dao = await hre.ethers.getContractAt("DAO", process.env.DAO_ADDR as string);
  await dao.connect(addr1).execute(taskArgs.idProposal);

  console.log('execute task Done!'); 
});
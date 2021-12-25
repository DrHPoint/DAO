import { task } from "hardhat/config";
import { parseUnits } from "ethers/lib/utils";

task("withdraw", "withdraw tokens from DAO")
.addParam("amount", "amount tokens to withdraw")
.setAction(async (taskArgs, hre) =>{
  const [addr1, addr2, ...addrs] = await hre.ethers.getSigners();

  const dao = await hre.ethers.getContractAt("DAO", process.env.DAO_ADDR as string);
  await dao.connect(addr1).withdraw(parseUnits(taskArgs.amount, 18));

  console.log('withdraw task Done!'); 
});
import { task } from "hardhat/config";
import { parseUnits } from "ethers/lib/utils";

task("deposite", "deposite tokens to DAO")
.addParam("amount", "amount token to deposite")
.setAction(async (args, hre) =>{
  const [addr1, addr2, ...addrs] = await hre.ethers.getSigners();

  const dao = await hre.ethers.getContractAt("DAO", process.env.DAO_ADDR as string);
  await dao.connect(addr2).deposite(parseUnits(args.amount, 18));

  console.log('deposite task Done!'); 
});


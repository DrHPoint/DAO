import { task } from "hardhat/config";
import { parseUnits } from "ethers/lib/utils";

task("deposite1", "deposite tokens to DAO", async (args, hre) =>{
  const [addr1, addr2, ...addrs] = await hre.ethers.getSigners();

  const dao = await hre.ethers.getContractAt("DAO", process.env.DAO_ADDR as string);
  await dao.connect(addr1).deposite(parseUnits("100", 18));

  console.log('deposite1 task Done!'); 
});


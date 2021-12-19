const { DAO_ADDR, TOKEN_ADDR } = process.env;
import { task } from "hardhat/config";
import { config as dotenvConfig } from 'dotenv';
dotenvConfig();
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-web3";

task("changeVotingRules", "change voting rules")
.addParam("procentQuorum", "new proposals procent quorum")
.addParam("duration", "new proposals duration in days")
.setAction(async (taskArgs, hre) =>{
  const [addr1, addr2, ...addrs] = await hre.ethers.getSigners();

  const dao = await hre.ethers.getContractAt("DAO", DAO_ADDR as string);
  await dao.changeVotingRules(taskArgs.procentQuorum, taskArgs.duration);

  console.log('changeVotingRules task Done!'); 
});
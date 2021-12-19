const { DAO_ADDR, TOKEN_ADDR } = process.env;
import { task } from "hardhat/config";
import { config as dotenvConfig } from 'dotenv';
dotenvConfig();
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-web3";

task("delegate", "delegate tokens to someone in some proposale")
.addParam("idProposal", "id proposal")
.addParam("voting", "address of trusted user")
.setAction(async (taskArgs, hre) =>{
  const [addr1, addr2, ...addrs] = await hre.ethers.getSigners();

  const dao = await hre.ethers.getContractAt("DAO", DAO_ADDR as string);
  await dao.connect(addr1).delegate(taskArgs.idProposal, taskArgs.voting);

  console.log('delegate task Done!'); 
});
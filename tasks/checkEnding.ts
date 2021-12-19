const { DAO_ADDR, TOKEN_ADDR } = process.env;
import { task } from "hardhat/config";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { hexConcat } from "@ethersproject/bytes";
import { config as dotenvConfig } from 'dotenv';
dotenvConfig();
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-web3";

task("checkEnding", "check ending in a certain proposal")
.addParam("idProposal", "id proposal")
.setAction(async (taskArgs, hre) =>{
  const [addr1, addr2, ...addrs] = await hre.ethers.getSigners();

  const dao = await hre.ethers.getContractAt("DAO", DAO_ADDR as string);
  await dao.connect(addr1).checkEnding(taskArgs.idProposal);

  console.log('checkEnding task Done!'); 
});
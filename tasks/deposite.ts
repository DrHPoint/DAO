const { DAO_ADDR, TOKEN_ADDR } = process.env;
import { task } from "hardhat/config";
import { config as dotenvConfig } from 'dotenv';
dotenvConfig();
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { hexConcat } from "@ethersproject/bytes";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-web3";

task("deposite", "deposite tokens to DAO")
.addParam("addr", "user address")
.addParam("amount", "amount token to deposite")
.setAction(async (taskArgs, hre) =>{
  const [addr1, addr2, ...addrs] = await hre.ethers.getSigners();

  const dao = await hre.ethers.getContractAt("DAO", DAO_ADDR as string);
  await dao.connect(taskArgs.addr).deposite(parseUnits(taskArgs.amount, 18));

  console.log('deposite task Done!'); 
});


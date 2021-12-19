import { config as dotenvConfig } from 'dotenv';
dotenvConfig();
import { task } from "hardhat/config";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { hexConcat } from "@ethersproject/bytes";
import "@nomiclabs/hardhat-waffle";
import "solidity-coverage";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-web3";
import "./tasks";

const { MNEMONIC, INFURA_URL, TOKEN_ADDR, DAO_ADDR } = process.env;

task("createProposal", "Create new Proposal", async (args, hre) => {
  const [addr1, addr2, ...addrs] = await hre.ethers.getSigners();

  //const token = await hre.ethers.getContractAt("MyToken", TOKEN_ADDR as string);
  const dao = await hre.ethers.getContractAt("DAO", DAO_ADDR as string);

  await dao.createProposal("0xa9059cbb000000000000000000000000da591c6ead892a6e67cad2c79ab5b38aa662a0e20000000000000000000000000000000000000000000000008ac7230489e80000", "Transfer 1000 tokens to addr2 from DAO", TOKEN_ADDR as string);

  console.log('createProposal task Done!'); 

});





// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 export default {
  solidity: "0.8.1",
  networks: {
    rinkeby: {
      // gas: 5000000,
      // gasPrice: 20000000000,
      url: INFURA_URL,
      accounts: { 
        mnemonic: MNEMONIC
      },
    }
  }
};

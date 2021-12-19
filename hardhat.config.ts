import { config as dotenvConfig } from 'dotenv';
dotenvConfig();
import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "solidity-coverage";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-web3";
import "./tasks";

const { MNEMONIC, INFURA_URL, TOKEN_ADDR } = process.env;

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
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

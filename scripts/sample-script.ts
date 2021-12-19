const hre = require("hardhat");
const { TOKEN_ADDR } = process.env;

async function main() {
  
  const DAO = await hre.ethers.getContractFactory("DAO");
  const dao = await DAO.deploy(TOKEN_ADDR, 30, 3);

  await dao.deployed();

  console.log("DAO deployed to:", dao.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

import { expect } from "chai";
import { Contract, ContractFactory, Signer, utils } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

let DAO : ContractFactory;
let dao : Contract;
let MyToken : ContractFactory;
let token : Contract;
let addr1: Signer;

describe("DAO", function () {

  beforeEach(async () => {
    DAO = await ethers.getContractFactory("DAO");
    dao = await DAO.deploy();
  });

  describe("someFunction", () => {
    it("should created new Proposal, get votes and end proposal with transfer tokens to addr3", async () => {
      await dao.deployed();
      

      ethers.provider.send("evm_increaseTime", [3 * 86400]); //Увеличение даты
      ethers.provider.send("evm_mine", []);

      await expect(dao.updateLuckyNumber(8, 99)).to.be.revertedWith(
        "Not your previous lucky number."
      );
    });

    it("should update their lucky number, when given the exact existing lucky number stored", async () => {
      await dao.deployed();
      await dao.saveLuckyNumber(2);

      await dao.updateLuckyNumber(2, 22);
      const newLuckyNumber = await dao.getMyLuckyNumber();

      expect(newLuckyNumber).to.be.not.undefined;
      expect(newLuckyNumber).to.be.not.null;
      expect(newLuckyNumber.toNumber()).to.be.equal(22);
    });
  });











  it("Should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!");
    await greeter.deployed();

    expect(await greeter.greet()).to.equal("Hello, world!");

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});

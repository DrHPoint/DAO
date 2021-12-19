import { expect } from "chai";
import { Contract, ContractFactory, Signer, utils } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { hexConcat } from "@ethersproject/bytes";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

let DAO : ContractFactory;
let dao : Contract;
let MyToken : ContractFactory;
let token : Contract;
let owner: SignerWithAddress;
let addr1: SignerWithAddress;
let addr2: SignerWithAddress;
let addr3: SignerWithAddress;

describe("DAO", function () {

  beforeEach(async () => {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    MyToken = await ethers.getContractFactory("MyToken");
    token = await MyToken.connect(owner).deploy();
    DAO = await ethers.getContractFactory("DAO");
    dao = await DAO.connect(owner).deploy(token.address, 30, 3);
  });

  describe("someFunction", () => {
    it("should created new Proposal, get votes, finish voting in advance with transfer tokens to token address", async () => {
      await token.deployed();
      await dao.deployed();
      const transferToken1 = await token.connect(owner).transfer(addr1.address, parseUnits("4000", 18));
      await transferToken1.wait();
      const transferToken2 = await token.connect(owner).transfer(addr2.address, parseUnits("5000", 18));
      await transferToken2.wait();
      const transferToken3 = await token.connect(owner).transfer(dao.address, parseUnits("1000", 18));
      await transferToken3.wait();
      const allowance1 = await token.connect(addr1).approve(dao.address, parseUnits("4000", 18));
      await allowance1.wait();
      const allowance2 = await token.connect(addr2).approve(dao.address, parseUnits("5000", 18));
      await allowance2.wait();
      const deposite1 = await dao.connect(addr1).deposite(parseUnits("4000", 18));
      await deposite1.wait();
      const deposite2 = await dao.connect(addr2).deposite(parseUnits("5000", 18));
      await deposite2.wait();
      const res = hexConcat([
        '0xa9059cbb', 
        ethers.utils.defaultAbiCoder.encode(["address", "uint256"], 
        [addr2.address, parseUnits("1000", 18)])]);
      const newProposal = await dao.connect(addr2).createProposal(res, "Перевод с баланса ДАО 1000 токенов мне, addr2", token.address);
      await newProposal.wait();
      //expect(await dao.getStatusProposal(0)).to.equal(true);
      const vote1 = await dao.connect(addr1).vote(0, true);
      await vote1.wait();
      const vote2 = await dao.connect(addr2).vote(0, true);
      await vote2.wait();
      const execute = await dao.connect(addr2).execute(0);
      await execute.wait();
      expect(await token.balanceOf(addr2.address)).to.equal(parseUnits("1000", 18));

      
    });

    /*it("should update their lucky number, when given the exact existing lucky number stored", async () => {
      await dao.deployed();
      await dao.saveLuckyNumber(2);

      await dao.updateLuckyNumber(2, 22);
      const newLuckyNumber = await dao.getMyLuckyNumber();

      expect(newLuckyNumber).to.be.not.undefined;
      expect(newLuckyNumber).to.be.not.null;
      expect(newLuckyNumber.toNumber()).to.be.equal(22);
    });
  });








  await expect(dao.updateLuckyNumber(8, 99)).to.be.revertedWith(
        "Not your previous lucky number."
      );


  it("Should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!");
    await greeter.deployed();

    expect(await greeter.greet()).to.equal("Hello, world!");

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });*/
});
})



//ethers.provider.send("evm_increaseTime", [3 * 86400]); //Увеличение даты
//ethers.provider.send("evm_mine", []);
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

  describe("Proposals and success", () => {
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
      const newProposal = await dao.connect(addr2).createProposal(res, "Transfer of 1000 tokens from the balance of the DAO to me, addr2", token.address);
      await newProposal.wait();
      const vote1 = await dao.connect(addr1).vote(0, true);
      await vote1.wait();
      const vote2 = await dao.connect(addr2).vote(0, true);
      await vote2.wait();
      const execute = await dao.connect(addr2).execute(0);
      await execute.wait();
      await ethers.provider.send("evm_increaseTime", [3 * 86400]);
      await ethers.provider.send("evm_mine", []);
      const withdraw1 = await dao.connect(addr2).withdraw(parseUnits("5000", 18))
      await withdraw1.wait();
      expect(await token.balanceOf(addr2.address)).to.equal(parseUnits("6000", 18));
    });

    it("should created new Proposal, get votes and finish voting after 3 days with dont execute proposal", async () => {
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
      const newProposal = await dao.connect(addr2).createProposal(res, "Transfer of 1000 tokens from the balance of the DAO to me, addr2", token.address);
      await newProposal.wait();
      const vote1 = await dao.connect(addr1).vote(0, false);
      await vote1.wait();
      const vote2 = await dao.connect(addr2).vote(0, true);
      await vote2.wait();
      await ethers.provider.send("evm_increaseTime", [3 * 86400]);
      await ethers.provider.send("evm_mine", []);
      const checkEnd = await dao.checkEnding(0);
      await checkEnd.wait();
      expect(await token.balanceOf(addr2.address)).to.equal(parseUnits("0", 18));
    });


    it("should created new Proposal, get votes, finish voting in advance with dont execute proposal", async () => {
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
      const newProposal = await dao.connect(addr2).createProposal(res, "Transfer of 1000 tokens from the balance of the DAO to me, addr2", token.address);
      await newProposal.wait();
      const vote1 = await dao.connect(addr1).vote(0, false);
      await vote1.wait();
      const vote2 = await dao.connect(addr2).vote(0, false);
      await vote2.wait();
      expect(await token.balanceOf(addr2.address)).to.equal(parseUnits("0", 18));
    });


    it("test3 + new Proposal and tried to withdraw tokens", async () => {
      await token.deployed();
      await dao.deployed();
      const transferToken1 = await token.connect(owner).transfer(addr1.address, parseUnits("3000", 18));
      await transferToken1.wait();
      const transferToken2 = await token.connect(owner).transfer(addr2.address, parseUnits("5000", 18));
      await transferToken2.wait();
      const transferToken3 = await token.connect(owner).transfer(dao.address, parseUnits("2000", 18));
      await transferToken3.wait();
      const allowance1 = await token.connect(addr1).approve(dao.address, parseUnits("3000", 18));
      await allowance1.wait();
      const allowance2 = await token.connect(addr2).approve(dao.address, parseUnits("5000", 18));
      await allowance2.wait();
      const deposite1 = await dao.connect(addr1).deposite(parseUnits("3000", 18));
      await deposite1.wait();
      const deposite2 = await dao.connect(addr2).deposite(parseUnits("5000", 18));
      await deposite2.wait();
      const res = hexConcat([
        '0xa9059cbb', 
        ethers.utils.defaultAbiCoder.encode(["address", "uint256"], 
        [addr2.address, parseUnits("1000", 18)])]);
      const newProposal = await dao.connect(addr2).createProposal(res, "Transfer of 1000 tokens from the balance of the DAO to me, addr2", token.address);
      await newProposal.wait();
      const vote1 = await dao.connect(addr1).vote(0, false);
      await vote1.wait();
      const vote2 = await dao.connect(addr2).vote(0, false);
      await vote2.wait();
      const newProposal2 = await dao.connect(addr2).createProposal(res, "Transfer again of 1000 tokens from the balance of the DAO to me, addr2", token.address);
      await newProposal2.wait();
      const vote2Again = await dao.connect(addr2).vote(1, true);
      await vote2Again.wait();
      await expect(dao.connect(addr2).withdraw(parseUnits("5000", 18))).to.be.revertedWith("Not all voting completed");
    });


    it("test3 + changing voting rules and new Proposal and tried to withdraw tokens", async () => {
      await token.deployed();
      await dao.deployed();
      const transferToken1 = await token.connect(owner).transfer(addr1.address, parseUnits("3000", 18));
      await transferToken1.wait();
      const transferToken2 = await token.connect(owner).transfer(addr2.address, parseUnits("5000", 18));
      await transferToken2.wait();
      const transferToken3 = await token.connect(owner).transfer(dao.address, parseUnits("2000", 18));
      await transferToken3.wait();
      const allowance1 = await token.connect(addr1).approve(dao.address, parseUnits("3000", 18));
      await allowance1.wait();
      const allowance2 = await token.connect(addr2).approve(dao.address, parseUnits("5000", 18));
      await allowance2.wait();
      const deposite1 = await dao.connect(addr1).deposite(parseUnits("3000", 18));
      await deposite1.wait();
      const deposite2 = await dao.connect(addr2).deposite(parseUnits("5000", 18));
      await deposite2.wait();
      const res = hexConcat([
        '0xa9059cbb', 
        ethers.utils.defaultAbiCoder.encode(["address", "uint256"], 
        [addr2.address, parseUnits("1000", 18)])]);
      const newProposal = await dao.connect(addr2).createProposal(res, "Transfer of 1000 tokens from the balance of the DAO to me, addr2", token.address);
      await newProposal.wait();
      const vote1 = await dao.connect(addr1).vote(0, false);
      await vote1.wait();
      const vote2 = await dao.connect(addr2).vote(0, false);
      await vote2.wait();
      const changeRules = await dao.connect(owner).changeVotingRules(30, 1);
      await changeRules.wait();
      const newProposal2 = await dao.connect(addr2).createProposal(res, "Transfer again of 1000 tokens from the balance of the DAO to me, addr2", token.address);
      await newProposal2.wait();
      const vote2Again = await dao.connect(addr2).vote(1, true);
      await vote2Again.wait();
      await ethers.provider.send("evm_increaseTime", [3 * 86400]);
      await ethers.provider.send("evm_mine", []);
      const checkEnd = await dao.checkEnding(1);
      await checkEnd.wait();
      const execute = await dao.connect(addr2).execute(1);
      await execute.wait();
      const withdraw1 = await dao.connect(addr2).withdraw(parseUnits("5000", 18))
      await withdraw1.wait();
      expect(await token.balanceOf(addr2.address)).to.equal(parseUnits("6000", 18));
    });

    
  });





  describe("Check requires", () => {
    it("deposite more than expected", async () => {
      await token.deployed();
      await dao.deployed();
      const transferToken1 = await token.connect(owner).transfer(addr1.address, parseUnits("4000", 18));
      await transferToken1.wait();
      const allowance1 = await token.connect(addr1).approve(dao.address, parseUnits("4000", 18));
      await allowance1.wait();
      await expect(dao.connect(addr1).deposite(parseUnits("6000", 18))).to.be.reverted;
    });

    it("call a non-existent proposal", async () => {
      await token.deployed();
      await dao.deployed();
      const transferToken1 = await token.connect(owner).transfer(addr1.address, parseUnits("4000", 18));
      await transferToken1.wait();
      const allowance1 = await token.connect(addr1).approve(dao.address, parseUnits("4000", 18));
      await allowance1.wait();
      const deposite1 = await dao.connect(addr1).deposite(parseUnits("4000", 18));
      await deposite1.wait();
      await expect(dao.connect(addr1).vote(0, true)).to.be.revertedWith("Proposal doesn't exist");
    });    

    it("tried to vote in finished proposal", async () => {
      await token.deployed();
      await dao.deployed();
      const transferToken1 = await token.connect(owner).transfer(addr1.address, parseUnits("8000", 18));
      await transferToken1.wait();
      const transferToken2 = await token.connect(owner).transfer(addr2.address, parseUnits("1000", 18));
      await transferToken2.wait();
      const transferToken3 = await token.connect(owner).transfer(dao.address, parseUnits("1000", 18));
      await transferToken3.wait();
      const allowance1 = await token.connect(addr1).approve(dao.address, parseUnits("8000", 18));
      await allowance1.wait();
      const allowance2 = await token.connect(addr2).approve(dao.address, parseUnits("1000", 18));
      await allowance2.wait();
      const deposite1 = await dao.connect(addr1).deposite(parseUnits("8000", 18));
      await deposite1.wait();
      const deposite2 = await dao.connect(addr2).deposite(parseUnits("1000", 18));
      await deposite2.wait();
      const res = hexConcat([
        '0xa9059cbb', 
        ethers.utils.defaultAbiCoder.encode(["address", "uint256"], 
        [addr2.address, parseUnits("1000", 18)])]);
      const newProposal = await dao.connect(addr2).createProposal(res, "Transfer of 1000 tokens from the balance of the DAO to me, addr2", token.address);
      await newProposal.wait();
      const vote1 = await dao.connect(addr1).vote(0, true);
      await vote1.wait();
      await expect(dao.connect(addr2).vote(0, true)).to.be.revertedWith("Proposal is over");
    }); 
    
    it("tried to vote in finished proposal after 3 days", async () => {
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
      const newProposal = await dao.connect(addr2).createProposal(res, "Transfer of 1000 tokens from the balance of the DAO to me, addr2", token.address);
      await newProposal.wait();
      const vote1 = await dao.connect(addr1).vote(0, true);
      await vote1.wait();
      await ethers.provider.send("evm_increaseTime", [3 * 86400]);
      await ethers.provider.send("evm_mine", []);
      await expect(dao.connect(addr2).vote(0, true)).to.be.revertedWith("Proposal is over");
    }); 

    it("tried change with another address", async () => {
      await token.deployed();
      await dao.deployed();
      await expect(dao.connect(addr1).changeVotingRules(30, 1)).to.be.revertedWith("Person doesnt have the CHAIR_PERSON role");
    });

    it("tried to withdraw more token, than on balance", async () => {
      await token.deployed();
      await dao.deployed();
      await expect(dao.connect(addr1).withdraw(parseUnits("5000", 18))).to.be.revertedWith("Not enough tokens");
    });

    it("tried to withdraw more token, than on DAO's balance", async () => {
      await token.deployed();
      await dao.deployed();
      const transferToken1 = await token.connect(owner).transfer(addr1.address, parseUnits("4000", 18));
      await transferToken1.wait();
      const transferToken2 = await token.connect(owner).transfer(addr2.address, parseUnits("5000", 18));
      await transferToken2.wait();
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
        [addr2.address, parseUnits("9000", 18)])]);
      const newProposal = await dao.connect(addr2).createProposal(res, "Transfer of 9000 tokens from the balance of the DAO to me, addr2", token.address);
      await newProposal.wait();
      const vote1 = await dao.connect(addr1).vote(0, true);
      await vote1.wait();
      const vote2 = await dao.connect(addr2).vote(0, true);
      await vote2.wait();
      const execute = await dao.connect(addr2).execute(0);
      await execute.wait();
      await ethers.provider.send("evm_increaseTime", [3 * 86400]);
      await ethers.provider.send("evm_mine", []);
      await expect(dao.connect(addr2).withdraw(parseUnits("5000", 18))).to.be.reverted;
    });

    it("tried to delegate someone, how already voted", async () => {
      await token.deployed();
      await dao.deployed();
      const transferToken1 = await token.connect(owner).transfer(addr1.address, parseUnits("4000", 18));
      await transferToken1.wait();
      const transferToken2 = await token.connect(owner).transfer(addr2.address, parseUnits("5000", 18));
      await transferToken2.wait();
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
        [addr2.address, parseUnits("9000", 18)])]);
      const newProposal = await dao.connect(addr2).createProposal(res, "Transfer of 9000 tokens from the balance of the DAO to me, addr2", token.address);
      await newProposal.wait();
      const vote1 = await dao.connect(addr1).vote(0, true);
      await vote1.wait();
      await expect(dao.connect(addr2).delegate(0, addr1.address)).to.be.revertedWith("The delegee has already voted");
    });

    it("tried to delegate someone, without deposite tokens", async () => {
      await token.deployed();
      await dao.deployed();
      const transferToken1 = await token.connect(owner).transfer(addr1.address, parseUnits("4000", 18));
      await transferToken1.wait();
      const transferToken2 = await token.connect(owner).transfer(addr2.address, parseUnits("5000", 18));
      await transferToken2.wait();
      const allowance1 = await token.connect(addr1).approve(dao.address, parseUnits("4000", 18));
      await allowance1.wait();
      const allowance2 = await token.connect(addr2).approve(dao.address, parseUnits("5000", 18));
      await allowance2.wait();
      const deposite1 = await dao.connect(addr1).deposite(parseUnits("4000", 18));
      await deposite1.wait();
      const res = hexConcat([
        '0xa9059cbb', 
        ethers.utils.defaultAbiCoder.encode(["address", "uint256"], 
        [addr2.address, parseUnits("9000", 18)])]);
      const newProposal = await dao.connect(addr2).createProposal(res, "Transfer of 9000 tokens from the balance of the DAO to me, addr2", token.address);
      await newProposal.wait();
      await expect(dao.connect(addr2).delegate(0, addr1.address)).to.be.revertedWith("Not enough tokens");
    });

    it("tried to execute finished proposal with more against votes", async () => {
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
      const newProposal = await dao.connect(addr2).createProposal(res, "Transfer of 1000 tokens from the balance of the DAO to me, addr2", token.address);
      await newProposal.wait();
      const vote1 = await dao.connect(addr1).vote(0, false);
      await vote1.wait();
      const vote2 = await dao.connect(addr2).vote(0, false);
      await vote2.wait();
      await expect(dao.connect(addr2).execute(0)).to.be.revertedWith("Not executable");
    });

    it("tried to execute proposal with absurd conditions", async () => {
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
        [addr2.address, parseUnits("100000", 18)])]);
      const newProposal = await dao.connect(addr2).createProposal(res, "Transfer of 100000 tokens from the balance of the DAO to me, addr2", token.address);
      await newProposal.wait();
      const vote1 = await dao.connect(addr1).vote(0, true);
      await vote1.wait();
      const vote2 = await dao.connect(addr2).vote(0, true);
      await vote2.wait();
      await expect(dao.connect(addr2).execute(0)).to.be.revertedWith("execute: call failed");
    });

    it("tried to check not finished proposal", async () => {
      await token.deployed();
      await dao.deployed();
      const res = hexConcat([
        '0xa9059cbb', 
        ethers.utils.defaultAbiCoder.encode(["address", "uint256"], 
        [addr2.address, parseUnits("100000", 18)])]);
      const newProposal = await dao.connect(addr2).createProposal(res, "Transfer of 100000 tokens from the balance of the DAO to me, addr2", token.address);
      await newProposal.wait();
      const checkEnd = await dao.checkEnding(0);
      await checkEnd.wait();
    });

  });

})



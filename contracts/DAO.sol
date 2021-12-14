//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DAO {

    struct Proposal { 
        bytes byteCode;
        string description;
        address recipient;
        uint256 minimumQuorum;
        uint256 minimumAccept;
        mapping (address => Account) accounts;
        bool status;
        uint256 voteAccept;
        uint256 voteAgainst;
        string dateBeggining;
        string dateEnding;
    }

    struct Account {
        uint256 balance;
        uint256 weight;
        bool vote;
    }

    mapping (address => uint256) private tokens;
    mapping (address => bool) private locks;
    mapping (uint256 => Proposal) public proposals;
    address public tokenAddress;
    address public owner;
    uint256 public currentProposal;


    constructor(address _tokenAddress) {
        owner = msg.sender;
        tokenAddress = _tokenAddress;
    }

    function newProposal(bytes memory _byteCode, string memory _description, address _recipient, uint256 procentQuorum, uint256 _minimumAccept) public {
        currentProposal++;
        proposals[currentProposal].byteCode = _byteCode;
        proposals[currentProposal].description = _description;
        proposals[currentProposal].recipient = _recipient;
        proposals[currentProposal].minimumQuorum = IERC20(tokenAddress).totalSupply() * procentQuorum;
        proposals[currentProposal].minimumAccept = _minimumAccept;
        proposals[currentProposal].voteAccept = 0;
        proposals[currentProposal].voteAgainst = 0;
        proposals[currentProposal].dateBeggining = "";
        proposals[currentProposal].dateEnding = "";
    }
    
    function deposite(uint256 amount) public {
        require(IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount), "Deposite failed");
        tokens[msg.sender] = amount;
        locks[msg.sender] = true;
    }
    
    function depositeBack(uint256 amount) public {
        require(tokens[msg.sender] >= amount, "Not enough tokens");
        require(locks[msg.sender] = true, "Not all voting completed");
        require(IERC20(tokenAddress).transfer(address(this), amount), "Deposite failed");
        tokens[msg.sender] -= amount;
    }

    function delegate(uint256 idProposal, address voting, uint256 amount) public{
        require(proposals[idProposal].accounts[msg.sender].vote = false, "Voting has already taken place");
        require(proposals[idProposal].accounts[voting].vote = false, "The trustee has already voted");
        require(tokens[msg.sender] - proposals[idProposal].accounts[msg.sender].balance >= amount, "Not enough tokens");
        proposals[idProposal].accounts[voting].weight += amount;
        proposals[idProposal].accounts[msg.sender].balance += amount;
    }
    
    function vote(uint256 idProposal) public {
        require(proposals[idProposal].accounts[msg.sender].vote = false, "Voting has already taken place");
        
    }
    
    
    
}

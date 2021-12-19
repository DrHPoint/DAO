//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.1;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";


contract DAO is AccessControl {

    bytes32 public constant CHAIR_PERSON = keccak256("CHAIR_PERSON");
    mapping (address => uint256) private tokens;
    mapping (address => uint256) private locks;
    mapping (uint256 => Proposal) public proposals;
    address public tokenAddress;
    uint256 public currentProposal = 0;
    uint256 public immutable procentAccept = 70;
    uint256 public procentQuorum;
    uint256 private i;
    uint256 public duration;


    constructor(address _tokenAddress, uint256 _procentQuorum, uint256 _duration) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CHAIR_PERSON, msg.sender);
        tokenAddress = _tokenAddress;
        procentQuorum = _procentQuorum;
        duration = _duration * 1 days;
    }

    modifier forCurrentProposal (uint256 _idProposal) {
        require(_idProposal < currentProposal, "Proposal doesn't exist");
        require(proposals[_idProposal].status == true, "Proposal is over");
        _;
   }    

    event NewProposal(uint256 _indexProposal, bytes _byteCode, string _description, address indexed _recipient);
    event CloseProposal(uint256 _indexProposal, uint256 _voteAccept, uint256 _voteAgainst);
    event Vote(uint256 _indexProposal, address _voting, uint256 _weight, bool _accept);

    
    struct Proposal { 
        bytes byteCode;
        string description;
        address recipient;
        uint256 minimumQuorum;
        uint256 controlPackage;
        mapping (address => Account) accounts;
        bool status;
        bool isExecutable;
        uint256 voteAccept;
        uint256 voteAgainst;
        uint256 dateBeggining;
        uint256 dateEnding;
    }

    struct Account {
        uint256 votesIn;
        uint256 weight;
        bool vote;
    }

    function createProposal(bytes memory _byteCode, string memory _description, address _recipient) external {
        Proposal storage proposal = proposals[currentProposal];
        proposal.byteCode = _byteCode;
        proposal.description = _description;
        proposal.recipient = _recipient;
        proposal.minimumQuorum = IERC20(tokenAddress).totalSupply() * procentQuorum / 100;
        proposal.controlPackage = IERC20(tokenAddress).totalSupply() / 2 + 1;
        proposal.status = true;
        proposal.dateBeggining = block.timestamp;
        proposal.dateEnding = proposal.dateBeggining + duration;
        emit NewProposal(currentProposal, _byteCode, _description, _recipient);
        currentProposal = currentProposal + 1;
    }

    function changeVotingRules(uint256 _procentQuorum, uint256 _duration) external {
        require(hasRole(CHAIR_PERSON, msg.sender), "Person doesnt have the CHAIR_PERSON role");
        procentQuorum = _procentQuorum;
        duration = _duration * 1 days;
    }
    
    function deposite(uint256 _amount) external {
        require(IERC20(tokenAddress).transferFrom(msg.sender, address(this), _amount));
        tokens[msg.sender] += _amount;
    }
    
    function withdraw(uint256 _amount) external {
        require(tokens[msg.sender] >= _amount, "Not enough tokens");
        require(locks[msg.sender] < block.timestamp, "Not all voting completed");
        require(IERC20(tokenAddress).transfer(msg.sender, _amount));
        tokens[msg.sender] -= _amount;
    }

    function delegate(uint256 _idProposal, address _voting) public forCurrentProposal(_idProposal){
        require(proposals[_idProposal].dateEnding > block.timestamp, "Proposal is over");
        Account storage account = proposals[_idProposal].accounts[msg.sender];
        Account storage dAccount = proposals[_idProposal].accounts[_voting];
        require(dAccount.vote == false, "The delegee has already voted");
        require(tokens[msg.sender] - account.votesIn > 0, "Not enough tokens");
        dAccount.weight += tokens[msg.sender] - account.votesIn;
        account.votesIn = tokens[msg.sender];
        if (locks[msg.sender] < proposals[_idProposal].dateEnding)
            locks[msg.sender] = proposals[_idProposal].dateEnding;
    }
    
    function vote(uint256 _idProposal, bool _accept) external {
        delegate(_idProposal, msg.sender);
        Account storage account = proposals[_idProposal].accounts[msg.sender];
        if (_accept) 
            proposals[_idProposal].voteAccept += account.weight;
        else
            proposals[_idProposal].voteAgainst += account.weight;
        account.vote = true;
        emit Vote(_idProposal, msg.sender, account.weight, _accept);
        checkVotes(_idProposal);
    }

    function checkVotes(uint256 _idProposal) private {
        Proposal storage proposal = proposals[_idProposal];
        if ((proposals[_idProposal].dateEnding < block.timestamp) || (proposal.voteAccept >= proposal.controlPackage))
        {
            endProposal(_idProposal);
            if ((proposal.voteAccept + proposal.voteAgainst) * procentAccept / 100 <= proposal.voteAccept)
                proposal.isExecutable = true;            
        }
        else if (proposal.voteAgainst >= proposal.controlPackage)
            endProposal(_idProposal);
    }

    function endProposal(uint256 _idProposal) private {
        Proposal storage proposal = proposals[_idProposal];
        proposal.status = false;
        emit CloseProposal(_idProposal, proposal.voteAccept, proposal.voteAgainst);
    }

    function checkEnding(uint256 _idProposal) external forCurrentProposal(_idProposal){
        if(proposals[_idProposal].dateEnding < block.timestamp)
            checkVotes(_idProposal);
    }

    function execute(uint256 _idProposal) external {
        Proposal storage proposal = proposals[_idProposal];
        require (proposal.isExecutable, "Not executable");
        (bool success, ) = proposal.recipient.call(proposal.byteCode);
        require (success, "execute: call failed");
    }
}

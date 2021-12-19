//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.1;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**  
* @title DAO Standard Contract for Creating and Controlling Proposals.
* @author Pavel E. Hrushchev (DrHPoint).
* @notice You can use this contract to create and control votes.
* @dev All function calls are currently implemented without side effects. 
*/
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

    /** 
    *@dev The constructor provides the address of the tokens with which the DAO will work (_tokenAddress), 
    as well as the minimum percentage for considering the decision (_procentQuorum) and the duration of the vote (_duration).
    * @param _tokenAddress is the address of the tokens with which the DAO will work.
    * @param _procentQuorum is minimum percentage for considering the decision.
    * @param _duration is Decimals of the token (how many the whole token is being divided).
    */  
    constructor(address _tokenAddress, uint256 _procentQuorum, uint256 _duration) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CHAIR_PERSON, msg.sender);
        tokenAddress = _tokenAddress;
        procentQuorum = _procentQuorum;
        duration = _duration * 1 days;
    }

    ///@dev modifier to check _idProposal and status of this proposal
    modifier forCurrentProposal (uint256 _idProposal) {
        require(_idProposal < currentProposal, "Proposal doesn't exist");
        require(proposals[_idProposal].status == true, "Proposal is over");
        _;
   }    
    /** 
    * @notice This event shows under what number the vote was created (_indexProposal), 
    the bytecode that will be executed upon successful completion (_byteCode), 
    what it does upon the assurance of the creator (_description), and at what address it will be executed (_recipient).
    * @dev Nothing unusual. Standard event with two addresses and the amount of tokens for which the transaction is made.
    * @param _indexProposal is the index of Proposal.
    * @param _byteCode is the bytecode that will be executed upon successful completion.
    * @param _description is what (_byteCode) does upon the assurance of the creator.
    * @param _recipient is the address where DAO will call (_byteCode).
    */
    event NewProposal(uint256 _indexProposal, bytes _byteCode, string _description, address indexed _recipient);

    /** 
    * @notice This event shows which number the voting was completed (_indexProposal), 
    with how many positive votes (_voteAccept) and votes against (_voteAgainst).
    * @dev Nothing unusual. Standard event with two addresses and the amount of tokens for which the transaction is made.
    * @param _indexProposal is the index of Proposal.
    * @param _voteAccept is the amount of possitive votes.
    * @param _voteAgainst is the amount of votes against.
    */
    event CloseProposal(uint256 _indexProposal, uint256 _voteAccept, uint256 _voteAgainst);

    /** 
    * @notice This event shows in the voting under which number (_indexProposal) a person with a certain address (_voting) 
    voted with a certain number of votes (_weight) with a certain decision (_accept).
    * @dev Nothing unusual. Standard event with two addresses and the amount of tokens for which the transaction is made.
    * @param _indexProposal is the index of Proposal.
    * @param _voting is the address of voted person.
    * @param _weight is the value of person's vote.
    * @param _accept is the person's decision.
    */
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

    /**  
    * @notice This function creates a new vote with the proposed bytecode (_byteCode), 
    an explanation of what the voting is for (_description)
    and the address where the vote will be taken ().
    * @dev Standart create proposal function without any complexity.
    * @param _byteCode - is the bytecode that will be executed upon successful completion.
    * @param _description - is what (_byteCode) does upon the assurance of the creator.
    * @param _recipient - is the address where DAO will call (_byteCode).
    */
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

    /**  
    * @notice This function changes the voting rules with the proposed values 
    of the minimum accepted votes (_procentQuorum), as well as the duration of the proposals (_duration).
    * @dev Standart change voting rules function without any complexity, except require role.
    * @param _procentQuorum - is the new minimum accepted votes.
    * @param _duration - is the new duration of the proposals.
    */
    function changeVotingRules(uint256 _procentQuorum, uint256 _duration) external {
        require(hasRole(CHAIR_PERSON, msg.sender), "Person doesnt have the CHAIR_PERSON role");
        procentQuorum = _procentQuorum;
        duration = _duration * 1 days;
    }
    
    /**  
    * @notice This function transfers a certain number (_amount) of tokens to the balance of the contract for voting.
    * @dev Standart deposite function without any complexity, except require approve transfer by the user.
    * @param _amount - is the amount of token, that user want to deposite.
    */
    function deposite(uint256 _amount) external {
        require(IERC20(tokenAddress).transferFrom(msg.sender, address(this), _amount));
        tokens[msg.sender] += _amount;
    }
    
    /**  
    * @notice This function transfers a certain number (_amount) of tokens to the balance of user from DAO balance.
    * @dev Standart withdraw function without any complexity. except requires of user's balance on DAO.
    * @param _amount - is the amount of token, that user want to withdraw.
    */
    function withdraw(uint256 _amount) external {
        require(tokens[msg.sender] >= _amount, "Not enough tokens");
        require(locks[msg.sender] < block.timestamp, "Not all voting completed");
        require(IERC20(tokenAddress).transfer(msg.sender, _amount));
        tokens[msg.sender] -= _amount;
    }

    /**  
    * @notice This function allows you to entrust your tokens to a user with a specific address (_idProposal)
    during the voting under a specific number (_voting).
    * @dev Standart delegate function without any complexity, except requires in modificator.
    * @param _idProposal - The address of proposals where the client trust his tokens.
    * @param _voting - The number of proposal during which the user trusts his tokens.
    */
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
    
    /**  
    * @notice This function allows you to vote in a vote under a specific number (_idProposal) with a specific decision (_accept).
    * @dev Standart vote function without any complexity, except requires in delegate function.
    * @param _idProposal - The address of proposals where the client votes.
    * @param _accept - the user decision.
    */
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

    /**  
    * @notice This function checks the function with a specific number (_idProposal) for signs of finishing.
    * @dev Standart check function about proposal without any complexity.
    * @param _idProposal - The number of proposal that you want to check.
    */
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


    /**  
    * @notice This function ends the voting with a certain number (_idProposal) and reports this in the event
    * @dev Standart view balance function without any complexity.
    * @param _idProposal - The number of the proposal to be closed.
    */
    function endProposal(uint256 _idProposal) private {
        Proposal storage proposal = proposals[_idProposal];
        proposal.status = false;
        emit CloseProposal(_idProposal, proposal.voteAccept, proposal.voteAgainst);
    }

    /**  
    * @notice This function checks the deadline for voting with a specific number (_idProposal) 
    and calls the completion function when the deadline is exceeded.
    * @dev Standart check ending function without any complexity.
    * @param _idProposal - The number of proposal that you want to check.
    */
    function checkEnding(uint256 _idProposal) external forCurrentProposal(_idProposal){
        if(proposals[_idProposal].dateEnding < block.timestamp)
            checkVotes(_idProposal);
    }

    /**  
    * @notice This function allows you to execute the proposals bytecode under a specific number (_idProposal)
    upon successful completion of this proposal.
    * @dev Standart execute function without any complexity, except requires.
    * @param _idProposal - The number of the function whose bytecode the user wants to call.
    */
    function execute(uint256 _idProposal) external {
        Proposal storage proposal = proposals[_idProposal];
        require (proposal.isExecutable, "Not executable");
        (bool success, ) = proposal.recipient.call(proposal.byteCode);
        require (success, "execute: call failed");
        proposal.isExecutable = false;
    }
}

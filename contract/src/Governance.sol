//SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {LiquidityPool} from "./LiquidityPool.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Governance is Ownable(msg.sender) {
    LiquidityPool public pool;
    constructor(LiquidityPool _pool) {
        pool = _pool;
        }
    uint public proposalCount;
    struct Proposal {
        uint id;
        address proposer;
        uint yesVotes;
        uint noVotes;
        string description;
        bool executed;
        uint newFee;
    }
    mapping(uint => mapping(address => bool)) public hasVoted;
    mapping(uint => Proposal) public proposals;

    event ProposalCreated(uint id, address proposer, string description, uint newFee);
    event VoteCast(uint proposalId, address voter, bool support);
    event ProposalExecuted(uint id);

    function createProposal(string memory description, uint newFee) external {
        proposalCount++;
        proposals[proposalCount]=Proposal({
            id:proposalCount,
            proposer:msg.sender,
            yesVotes:0,
            noVotes:0,
            description:description,
            executed:false,
            newFee:newFee
        });
        emit ProposalCreated(proposalCount, msg.sender, description, newFee);
    }
    function vote(uint proposalId, bool support) external{
        require(proposals[proposalId].executed==false, "Proposal already executed");
        require(hasVoted[proposalId][msg.sender]==false, "Already voted");
        hasVoted[proposalId][msg.sender]=true;
        if(support){
            proposals[proposalId].yesVotes++;
        }else{
            proposals[proposalId].noVotes++;
        }
        emit VoteCast(proposalId, msg.sender, support);
    }
    function executeProposal(uint proposalId) external onlyOwner{
        require(proposals[proposalId].executed==false, "Proposal already executed");
        require(proposals[proposalId].yesVotes>proposals[proposalId].noVotes, "Proposal failed");
        proposals[proposalId].executed=true;
        pool.setNewFee(proposals[proposalId].newFee);
        emit ProposalExecuted(proposalId);
    }
}


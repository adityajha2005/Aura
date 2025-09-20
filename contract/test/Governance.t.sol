//SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "forge-std/Test.sol";
import {LiquidityPool} from "../src/LiquidityPool.sol";
import {Governance} from "../src/Governance.sol";
import {TestTokens} from "../src/TestTokens.sol";

contract GovernanceTest is Test {
    LiquidityPool pool;
    Governance gov;
    TestTokens tokenA;
    TestTokens tokenB;
    address voter1 = address(0x1);
    address voter2 = address(0x2);

    function setUp() public {
        tokenA = new TestTokens("TokenA","A");
        tokenB = new TestTokens("TokenB","B");
        pool = new LiquidityPool(tokenA, tokenB);
        gov = new Governance(pool);
        pool.transferOwnership(address(gov));
    }

    function testCreateProposalIncrementsCountAndStoresData() public {
        gov.createProposal("set fee to 50", 50);
        assertEq(gov.proposalCount(), 1);
        (uint id, address proposer, uint yesVotes, uint noVotes, string memory description, bool executed, uint newFee) = gov.proposals(1);
        assertEq(id, 1);
        assertEq(proposer, address(this));
        assertEq(yesVotes, 0);
        assertEq(noVotes, 0);
        assertEq(keccak256(bytes(description)), keccak256(bytes("set fee to 50")));
        assertEq(executed, false);
        assertEq(newFee, 50);
    }

    function testVoteAndPreventDoubleVote() public {
        gov.createProposal("p", 10);
        gov.vote(1, true);
        vm.expectRevert(bytes("Already voted"));
        gov.vote(1, true);
        (,,uint yesVotes,uint noVotes,,,) = gov.proposals(1);
        assertEq(yesVotes, 1);
        assertEq(noVotes, 0);
    }

    function testVoteRevertsIfExecuted() public {
        gov.createProposal("p", 10);
        gov.vote(1, true);
        vm.prank(gov.owner());
        gov.executeProposal(1);
        vm.expectRevert(bytes("Proposal already executed"));
        gov.vote(1, true);
    }

    function testExecuteProposalOnlyOwner() public {
        gov.createProposal("p", 40);
        gov.vote(1, true);
        vm.prank(voter1);
        vm.expectRevert();
        gov.executeProposal(1);
        vm.prank(gov.owner());
        gov.executeProposal(1);
        assertEq(pool.fee(), 40);
        (,,,,,bool executed,) = gov.proposals(1);
        assertEq(executed, true);
    }

    function testExecuteProposalFailsIfNotEnoughYes() public {
        gov.createProposal("p", 70);
        gov.vote(1, false);
        vm.expectRevert(bytes("Proposal failed"));
        gov.executeProposal(1);
    }

    function testExecuteProposalRevertsIfAlreadyExecuted() public {
        gov.createProposal("p", 20);
        gov.vote(1, true);
        address o = gov.owner();
        vm.prank(o);
        gov.executeProposal(1);
        vm.expectRevert(bytes("Proposal already executed"));
        vm.prank(o);
        gov.executeProposal(1);
    }
}



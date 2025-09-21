"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useGovernance } from "@/hooks/useGovernance";
import { formatEther } from "viem";
import toast from "react-hot-toast";
import ProposalCreationForm from "./ProposalCreationForm";
import ProposalsList from "./ProposalsList";
import ContractTest from "./ContractTest";
import DelegationHelper from "./DelegationHelper";

export default function GovernanceInterface() {
  const { address, isConnected } = useAccount();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const {
    proposals,
    userBalance,
    userVotingPower,
    loading,
    isPending,
    vote,
    executeProposal,
    fetchProposals,
  } = useGovernance();


  const handleVote = async (proposalId: number, support: boolean) => {
    const voteType = support ? "For" : "Against";
    const loadingToast = toast.loading(`Voting ${voteType} proposal #${proposalId}...`);
    
    try {
      await vote(proposalId, support);
      await fetchProposals();
      
      toast.success(`Successfully voted ${voteType} proposal #${proposalId}!`, {
        id: loadingToast,
      });
    } catch (error) {
      console.error("Failed to vote:", error);
      toast.error(`Failed to vote ${voteType} proposal #${proposalId}. Please try again.`, {
        id: loadingToast,
      });
    }
  };

  const handleExecuteProposal = async (proposalId: number) => {
    const loadingToast = toast.loading(`Executing proposal #${proposalId}...`);
    
    try {
      await executeProposal(proposalId);
      await fetchProposals();
      
      toast.success(`Successfully executed proposal #${proposalId}!`, {
        id: loadingToast,
      });
    } catch (error) {
      console.error("Failed to execute proposal:", error);
      toast.error(`Failed to execute proposal #${proposalId}. Please try again.`, {
        id: loadingToast,
      });
    }
  };

  const handleProposalCreated = () => {
    fetchProposals();
    setShowCreateForm(false);
  };


  if (!isConnected) {
    return (
      <div className="min-h-screen relative overflow-hidden pt-20">
        <div className="relative z-20 max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4">Governance</h1>
            <p className="text-gray-300 text-lg">
              Please connect your wallet to participate in governance.
            </p>
            <button
              onClick={() => toast.error("Please connect your wallet first!")}
              className="mt-4 px-6 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 font-medium rounded-xl transition-all duration-300"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pt-20">
      {/* Static 3D Glass Cards Background */}
      <div className="absolute inset-0 z-0" style={{ perspective: "1000px" }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-28 h-36 bg-white/2 backdrop-blur-sm rounded-xl border border-white/5 shadow-xl`}
            style={{
              left: `${12 + i * 15}%`,
              top: `${68 + (i % 2) * 8}%`,
              transform: `translateY(-50%) rotateY(${
                (i - 2.5) * 12
              }deg) rotateX(6deg) scale(0.75)`,
              transformOrigin: "center center",
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1
            className="text-5xl font-bold text-white mb-4"
            style={{
              fontFamily: "var(--font-tt-firs-neue), Arial, sans-serif",
            }}
          >
            Governance
          </h1>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Shape the future of Aura Protocol. Vote on AI-generated proposals
            and participate in decentralized governance decisions. Every vote counts equally!
          </p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {parseFloat(userBalance).toLocaleString()}
            </div>
            <div className="text-gray-300 text-sm">AURA Tokens</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {parseFloat(userVotingPower).toLocaleString()}
            </div>
            <div className="text-gray-300 text-sm">Voting Power</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {proposals.length}
            </div>
            <div className="text-gray-300 text-sm">Total Proposals</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {proposals.filter(p => p.proposer.toLowerCase() === address?.toLowerCase()).length}
            </div>
            <div className="text-gray-300 text-sm">Proposals Created</div>
          </div>
        </div>

        {/* Contract Test - Temporary for debugging */}
        <ContractTest />

        {/* Delegation Helper */}
        <DelegationHelper onDelegationComplete={() => {}} />

        {/* Create Proposal Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-8 py-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-500/30 text-blue-400 font-medium rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Proposal
            </div>
          </button>
          <p className="text-gray-400 text-sm mt-2">
            Create a proposal to change protocol parameters (requires 1,000+ AURA tokens)
          </p>
        </div>

        {/* Proposals List */}
        <ProposalsList
          onVote={handleVote}
          onExecute={handleExecuteProposal}
          isPending={isPending}
        />

        {/* Proposal Creation Form Modal */}
        {showCreateForm && (
          <ProposalCreationForm
            onProposalCreated={handleProposalCreated}
            onClose={() => setShowCreateForm(false)}
          />
        )}
      </div>
    </div>
  );
}

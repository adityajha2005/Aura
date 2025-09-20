"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useGovernance } from "@/hooks/useGovernance";
import { formatEther } from "viem";
import toast from "react-hot-toast";

export default function GovernanceInterface() {
  const { address, isConnected } = useAccount();
  const [userVotedStatus, setUserVotedStatus] = useState<Record<number, boolean>>({});

  const {
    proposals,
    proposalCount,
    userBalance,
    userVotingPower,
    votingPowerPercentage,
    loading,
    isPending,
    isConfirming,
    isConfirmed,
    vote,
    executeProposal,
    fetchProposals,
    getProposalStatus,
    hasUserVoted,
    getTimeRemaining,
    getProposalStatusText,
  } = useGovernance();


  // Check user's voting status
  useEffect(() => {
    if (address) {
      // Check voting status for all proposals
      const checkVotingStatus = async () => {
        const statusMap: Record<number, boolean> = {};
        for (const proposal of proposals) {
          const voted = await hasUserVoted(proposal.id);
          statusMap[proposal.id] = voted;
        }
        setUserVotedStatus(statusMap);
      };
      
      checkVotingStatus();
    }
  }, [address, proposals]);


  const handleVote = async (proposalId: number, support: boolean) => {
    const voteType = support ? "For" : "Against";
    const loadingToast = toast.loading(`Voting ${voteType} proposal #${proposalId}...`);
    
    try {
      await vote(proposalId, support);
      await fetchProposals();
      // Update local voting status
      setUserVotedStatus(prev => ({ ...prev, [proposalId]: true }));
      
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {parseFloat(userBalance).toLocaleString()}
            </div>
            <div className="text-gray-300 text-sm">AURA Tokens</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {Object.values(userVotedStatus).filter(Boolean).length}
            </div>
            <div className="text-gray-300 text-sm">Votes Cast</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {proposals.filter(p => p.proposer.toLowerCase() === address?.toLowerCase()).length}
            </div>
            <div className="text-gray-300 text-sm">Proposals Created</div>
          </div>
        </div>

        {/* No tabs needed - just show proposals */}

        {/* Proposals */}
        <div className="space-y-6">
            {loading ? (
              <div className="text-center text-gray-300">Loading proposals...</div>
            ) : proposals.length === 0 ? (
              <div className="text-center text-gray-300">No proposals found.</div>
            ) : (
              proposals.map((proposal) => {
                const status = getProposalStatusText(proposal);
                const timeRemaining = getTimeRemaining(proposal.endTime);
                const hasVoted = userVotedStatus[proposal.id];
                const totalVotes = proposal.yesVotes + proposal.noVotes;
                const yesPercentage = totalVotes > 0 ? Number((proposal.yesVotes * 10000n) / totalVotes) / 100 : 0;
                const noPercentage = totalVotes > 0 ? Number((proposal.noVotes * 10000n) / totalVotes) / 100 : 0;

                return (
                  <div
                    key={proposal.id}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">
                            Proposal #{proposal.id}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              status === "Active"
                                ? "bg-green-500/20 text-green-400"
                                : status === "Passed"
                                ? "bg-blue-500/20 text-blue-400"
                                : status === "Upcoming"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : status === "Executed"
                                ? "bg-purple-500/20 text-purple-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {status}
                          </span>
                          {hasVoted && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                              Voted
                            </span>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm mb-3">
                          {proposal.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>ID: #{proposal.id}</span>
                          <span>Proposer: {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</span>
                          <span>New Fee: {Number(proposal.newFee)} basis points</span>
                          <span>Ends: {timeRemaining}</span>
                        </div>
                      </div>
                    </div>

                    {/* Voting Progress */}
                    {status !== "Upcoming" && totalVotes > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-green-400">
                            For: {formatEther(proposal.yesVotes)} ({yesPercentage.toFixed(1)}%)
                          </span>
                          <span className="text-red-400">
                            Against: {formatEther(proposal.noVotes)} ({noPercentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                          <div className="h-full flex">
                            <div
                              className="bg-green-500"
                              style={{ width: `${yesPercentage}%` }}
                            ></div>
                            <div
                              className="bg-red-500"
                              style={{ width: `${noPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-center text-gray-300 text-xs mt-1">
                          {formatEther(totalVotes)} total votes
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {status === "Active" && !hasVoted && (
                        <>
                          <button
                            onClick={() => handleVote(proposal.id, true)}
                            disabled={isPending}
                            className="flex-1 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 font-medium py-3 rounded-xl transition-all duration-300 disabled:opacity-50"
                          >
                            {isPending ? "Voting..." : "Vote For"}
                          </button>
                          <button
                            onClick={() => handleVote(proposal.id, false)}
                            disabled={isPending}
                            className="flex-1 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 font-medium py-3 rounded-xl transition-all duration-300 disabled:opacity-50"
                          >
                            {isPending ? "Voting..." : "Vote Against"}
                          </button>
                        </>
                      )}
                      
                      {status === "Passed" && !proposal.executed && (
                        <button
                          onClick={() => handleExecuteProposal(proposal.id)}
                          disabled={isPending}
                          className="flex-1 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 font-medium py-3 rounded-xl transition-all duration-300 disabled:opacity-50"
                        >
                          {isPending ? "Executing..." : "Execute Proposal"}
                        </button>
                      )}
                      
                      <button className="px-6 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-xl transition-all duration-300">
                        Details
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
      </div>
    </div>
  );
}

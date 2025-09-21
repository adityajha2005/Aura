"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { useGovernance } from "@/hooks/useGovernance";
import { formatEther } from "viem";
import toast from "react-hot-toast";
import { motion, useInView } from "framer-motion";

export default function GovernanceInterface() {
  const { address, isConnected } = useAccount();
  const [userVotedStatus, setUserVotedStatus] = useState<
    Record<number, boolean>
  >({});

  // Animation refs
  const statsRef = useRef(null);
  const proposalsRef = useRef(null);

  // Viewport detection
  const isStatsInView = useInView(statsRef, { once: true, margin: "-100px" });
  const isProposalsInView = useInView(proposalsRef, {
    once: true,
    margin: "-100px",
  });

  const {
    proposals,
    userBalance,
    loading,
    isPending,
    vote,
    executeProposal,
    fetchProposals,
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
  }, [address, proposals, hasUserVoted]);

  const handleVote = async (proposalId: number, support: boolean) => {
    const voteType = support ? "For" : "Against";
    const loadingToast = toast.loading(
      `Voting ${voteType} proposal #${proposalId}...`
    );

    try {
      await vote(proposalId, support);
      await fetchProposals();
      // Update local voting status
      setUserVotedStatus((prev) => ({ ...prev, [proposalId]: true }));

      toast.success(`Successfully voted ${voteType} proposal #${proposalId}!`, {
        id: loadingToast,
      });
    } catch (error) {
      console.error("Failed to vote:", error);
      toast.error(
        `Failed to vote ${voteType} proposal #${proposalId}. Please try again.`,
        {
          id: loadingToast,
        }
      );
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
      toast.error(
        `Failed to execute proposal #${proposalId}. Please try again.`,
        {
          id: loadingToast,
        }
      );
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen relative overflow-hidden pt-20">
        <div className="relative z-20 max-w-7xl mx-auto px-4 py-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, filter: "blur(20px)", y: -30 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1
              className="text-5xl font-bold text-white mb-4"
              initial={{ opacity: 0, filter: "blur(20px)", y: -20 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Governance
            </motion.h1>
            <motion.p
              className="text-gray-300 text-lg"
              initial={{ opacity: 0, filter: "blur(15px)", y: -15 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Please connect your wallet to participate in governance.
            </motion.p>
            <motion.button
              onClick={() => toast.error("Please connect your wallet first!")}
              className="mt-4 px-6 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 font-medium rounded-xl transition-all duration-300"
              initial={{ opacity: 0, filter: "blur(10px)", y: -10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Connect Wallet
            </motion.button>
          </motion.div>
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
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, filter: "blur(20px)", y: -30 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1
            className="text-5xl font-bold text-white mb-4"
            style={{
              fontFamily: "var(--font-tt-firs-neue), Arial, sans-serif",
            }}
            initial={{ opacity: 0, filter: "blur(20px)", y: -20 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Governance
          </motion.h1>
          <motion.p
            className="text-gray-300 text-lg max-w-3xl mx-auto"
            initial={{ opacity: 0, filter: "blur(15px)", y: -15 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Shape the future of Aura Protocol. Vote on AI-generated proposals
            and participate in decentralized governance decisions. Every vote
            counts equally!
          </motion.p>
        </motion.div>

        {/* User Stats */}
        <motion.div
          ref={statsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, filter: "blur(20px)", y: 50 }}
          animate={
            isStatsInView
              ? { opacity: 1, filter: "blur(0px)", y: 0 }
              : { opacity: 0, filter: "blur(20px)", y: 50 }
          }
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center"
            initial={{ opacity: 0, filter: "blur(15px)", x: -30 }}
            animate={
              isStatsInView
                ? { opacity: 1, filter: "blur(0px)", x: 0 }
                : { opacity: 0, filter: "blur(15px)", x: -30 }
            }
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="text-2xl font-bold text-white mb-1">
              {parseFloat(userBalance).toLocaleString()}
            </div>
            <div className="text-gray-300 text-sm">AURA Tokens</div>
          </motion.div>
          <motion.div
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center"
            initial={{ opacity: 0, filter: "blur(15px)", y: 30 }}
            animate={
              isStatsInView
                ? { opacity: 1, filter: "blur(0px)", y: 0 }
                : { opacity: 0, filter: "blur(15px)", y: 30 }
            }
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="text-2xl font-bold text-green-400 mb-1">
              {Object.values(userVotedStatus).filter(Boolean).length}
            </div>
            <div className="text-gray-300 text-sm">Votes Cast</div>
          </motion.div>
          <motion.div
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center"
            initial={{ opacity: 0, filter: "blur(15px)", x: 30 }}
            animate={
              isStatsInView
                ? { opacity: 1, filter: "blur(0px)", x: 0 }
                : { opacity: 0, filter: "blur(15px)", x: 30 }
            }
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {
                proposals.filter(
                  (p) => p.proposer.toLowerCase() === address?.toLowerCase()
                ).length
              }
            </div>
            <div className="text-gray-300 text-sm">Proposals Created</div>
          </motion.div>
        </motion.div>

        {/* No tabs needed - just show proposals */}

        {/* Proposals */}
        <motion.div
          ref={proposalsRef}
          className="space-y-6"
          initial={{ opacity: 0, filter: "blur(20px)", y: 50 }}
          animate={
            isProposalsInView
              ? { opacity: 1, filter: "blur(0px)", y: 0 }
              : { opacity: 0, filter: "blur(20px)", y: 50 }
          }
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {loading ? (
            <motion.div
              className="text-center text-gray-300"
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={
                isProposalsInView
                  ? { opacity: 1, filter: "blur(0px)" }
                  : { opacity: 0, filter: "blur(10px)" }
              }
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Loading proposals...
            </motion.div>
          ) : proposals.length === 0 ? (
            <motion.div
              className="text-center text-gray-300"
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={
                isProposalsInView
                  ? { opacity: 1, filter: "blur(0px)" }
                  : { opacity: 0, filter: "blur(10px)" }
              }
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              No proposals found.
            </motion.div>
          ) : (
            proposals.map((proposal, index) => {
              const status = getProposalStatusText(proposal);
              const timeRemaining = getTimeRemaining(proposal.endTime);
              const hasVoted = userVotedStatus[proposal.id];
              const totalVotes = proposal.yesVotes + proposal.noVotes;
              const yesPercentage =
                totalVotes > 0
                  ? Number((proposal.yesVotes * BigInt(10000)) / totalVotes) /
                    100
                  : 0;
              const noPercentage =
                totalVotes > 0
                  ? Number((proposal.noVotes * BigInt(10000)) / totalVotes) /
                    100
                  : 0;

              return (
                <motion.div
                  key={proposal.id}
                  className="group relative overflow-hidden"
                  initial={{ opacity: 0, filter: "blur(15px)", y: 30 }}
                  animate={
                    isProposalsInView
                      ? { opacity: 1, filter: "blur(0px)", y: 0 }
                      : { opacity: 0, filter: "blur(15px)", y: 30 }
                  }
                  transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                >
                  {/* Gradient border effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-sm group-hover:blur-none transition-all duration-500"></div>

                  {/* Main card */}
                  <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500 group-hover:transform group-hover:scale-[1.02]">
                    {/* Header with enhanced styling */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          {/* Proposal number with icon */}
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-purple-600 rounded-2xl flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-white mb-1">
                                Proposal #{proposal.id}
                              </h3>
                              <div className="text-sm text-gray-400">
                                ID: #{proposal.id} • New Fee:{" "}
                                {Number(proposal.newFee)} bp
                              </div>
                            </div>
                          </div>

                          {/* Status badges */}
                          <div className="flex flex-col gap-2">
                            <span
                              className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm ${
                                status === "Active"
                                  ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                  : status === "Passed"
                                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                  : status === "Upcoming"
                                  ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                                  : status === "Executed"
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                  : "bg-red-500/20 text-red-300 border border-red-500/30"
                              }`}
                            >
                              {status}
                            </span>
                            {hasVoted && (
                              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-sm">
                                ✓ Voted
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description with better styling */}
                        <div className="mb-6">
                          <p className="text-gray-200 text-base leading-relaxed">
                            {proposal.description}
                          </p>
                        </div>

                        {/* Proposer and time info */}
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-6">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-gray-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            </div>
                            <span>
                              Proposer: {proposal.proposer.slice(0, 6)}...
                              {proposal.proposer.slice(-4)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>Ends: {timeRemaining}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Voting Progress */}
                    {status !== "Upcoming" && totalVotes > 0 && (
                      <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-400 mb-1">
                              {yesPercentage.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-300">For</div>
                            <div className="text-xs text-gray-400">
                              {formatEther(proposal.yesVotes)} votes
                            </div>
                          </div>

                          <div className="flex-1 mx-8">
                            <div className="relative">
                              <div className="w-full bg-white/5 rounded-full h-4 overflow-hidden border border-white/10">
                                <div className="h-full flex">
                                  <div
                                    className="bg-gradient-to-r from-green-400 to-green-600 transition-all duration-1000 ease-out"
                                    style={{ width: `${yesPercentage}%` }}
                                  ></div>
                                  <div
                                    className="bg-gradient-to-r from-red-400 to-red-600 transition-all duration-1000 ease-out"
                                    style={{ width: `${noPercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="text-center text-white font-semibold text-sm mt-2">
                                {formatEther(totalVotes)} Total Votes
                              </div>
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-400 mb-1">
                              {noPercentage.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-300">Against</div>
                            <div className="text-xs text-gray-400">
                              {formatEther(proposal.noVotes)} votes
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Enhanced Action Buttons */}
                    <div className="flex gap-4">
                      {status === "Active" && !hasVoted && (
                        <>
                          <button
                            onClick={() => handleVote(proposal.id, true)}
                            disabled={isPending}
                            className="flex-1 group/btn relative overflow-hidden bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 border border-green-500/40 text-green-300 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              {isPending ? "Voting..." : "Vote For"}
                            </div>
                          </button>
                          <button
                            onClick={() => handleVote(proposal.id, false)}
                            disabled={isPending}
                            className="flex-1 group/btn relative overflow-hidden bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 border border-red-500/40 text-red-300 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              {isPending ? "Voting..." : "Vote Against"}
                            </div>
                          </button>
                        </>
                      )}

                      {status === "Passed" && !proposal.executed && (
                        <button
                          onClick={() => handleExecuteProposal(proposal.id)}
                          disabled={isPending}
                          className="flex-1 group/btn relative overflow-hidden bg-gradient-to-r from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 border border-purple-500/40 text-purple-300 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                            {isPending ? "Executing..." : "Execute Proposal"}
                          </div>
                        </button>
                      )}

                      <button className="px-8 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium py-4 rounded-2xl transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Details
                        </div>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </div>
  );
}

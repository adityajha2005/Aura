"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { useGovernance } from "@/hooks/useGovernance";
import { formatEther } from "viem";
import toast from "react-hot-toast";


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
    const loadingToast = toast.loading(
      `Voting ${voteType} proposal #${proposalId}...`
    );

    try {
      await vote(proposalId, support);
      await fetchProposals();

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

            <div className="text-2xl font-bold text-white mb-1">
              {parseFloat(userBalance).toLocaleString()}
            </div>
            <div className="text-gray-300 text-sm">AURA Tokens</div>

            <div className="text-2xl font-bold text-green-400 mb-1">
              {proposals.length}
            </div>

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


      </div>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { useAccount } from "wagmi";
import { useGovernance } from "@/hooks/useGovernance";
import { motion, useInView } from "motion/react";
import toast from "react-hot-toast";
import ProposalCreationForm from "./ProposalCreationForm";
import ProposalsList from "./ProposalsList";
import ContractTest from "./ContractTest";
import DelegationHelper from "./DelegationHelper";

export default function GovernanceInterface() {
  const { address, isConnected } = useAccount();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Animation refs
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const mainContentRef = useRef(null);
  const sidebarRef = useRef(null);

  // Viewport detection
  const heroInView = useInView(heroRef, {
    once: true,
    margin: "0px 0px -100px 0px",
  });
  const statsInView = useInView(statsRef, {
    once: true,
    margin: "0px 0px -50px 0px",
  });
  const mainContentInView = useInView(mainContentRef, {
    once: true,
    margin: "0px 0px -50px 0px",
  });
  const sidebarInView = useInView(sidebarRef, {
    once: true,
    margin: "0px 0px -50px 0px",
  });

  const {
    proposals,
    userBalance,
    userVotingPower,
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
        <motion.div
          ref={heroRef}
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={
            heroInView
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0, y: 20, filter: "blur(10px)" }
          }
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1
            className="text-5xl font-bold text-white mb-4"
            style={{
              fontFamily: "var(--font-tt-firs-neue), Arial, sans-serif",
            }}
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={
              heroInView
                ? { opacity: 1, y: 0, filter: "blur(0px)" }
                : { opacity: 0, y: 30, filter: "blur(10px)" }
            }
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            Governance
          </motion.h1>
          <motion.p
            className="text-gray-300 text-lg max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={
              heroInView
                ? { opacity: 1, y: 0, filter: "blur(0px)" }
                : { opacity: 0, y: 20, filter: "blur(10px)" }
            }
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            Shape the future of Aura Protocol. Vote on AI-generated proposals
            and participate in decentralized governance decisions. Every vote
            counts equally!
          </motion.p>
        </motion.div>

        {/* User Stats */}
        <motion.div
          ref={statsRef}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={
            statsInView
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0, y: 30, filter: "blur(10px)" }
          }
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          {[
            {
              value: parseFloat(userBalance).toLocaleString(),
              label: "AURA Tokens",
              color: "text-white",
            },
            {
              value: parseFloat(userVotingPower).toLocaleString(),
              label: "Voting Power",
              color: "text-purple-400",
            },
            {
              value: proposals.length,
              label: "Total Proposals",
              color: "text-green-400",
            },
            {
              value: proposals.filter(
                (p) => p.proposer.toLowerCase() === address?.toLowerCase()
              ).length,
              label: "Proposals Created",
              color: "text-blue-400",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center"
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={
                statsInView
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, y: 20, filter: "blur(10px)" }
              }
              transition={{
                duration: 0.6,
                delay: 0.3 + index * 0.1,
                ease: "easeOut",
              }}
            >
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-gray-300 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Layout: 3/4 Left + 1/4 Right */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Section (3/4 width) - Main Content */}
          <motion.div
            ref={mainContentRef}
            className="w-full lg:w-3/4"
            initial={{ opacity: 0, x: -30, filter: "blur(10px)" }}
            animate={
              mainContentInView
                ? { opacity: 1, x: 0, filter: "blur(0px)" }
                : { opacity: 0, x: -30, filter: "blur(10px)" }
            }
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            {/* Contract Test - Temporary for debugging */}
            <motion.div
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={
                mainContentInView
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, y: 20, filter: "blur(10px)" }
              }
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              <ContractTest />
            </motion.div>

            {/* Delegation Helper */}
            <motion.div
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={
                mainContentInView
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, y: 20, filter: "blur(10px)" }
              }
              transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            >
              <DelegationHelper onDelegationComplete={() => {}} />
            </motion.div>

            {/* Create Proposal Button */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={
                mainContentInView
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, y: 20, filter: "blur(10px)" }
              }
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            >
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-8 py-4 bg-gradient-to-r from-red-600/20 to-red-500/20 hover:from-red-600/30 hover:to-red-500/30 border border-red-500/30 text-red-400 font-medium rounded-xl transition-all duration-300 transform hover:scale-105"
              >
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create New Proposal
                </div>
              </button>
              <p className="text-gray-400 text-sm mt-2">
                Create a proposal to change protocol parameters (requires 1,000+
                AURA tokens)
              </p>
            </motion.div>

            {/* Full proposals list for mobile */}
            <motion.div
              className="block lg:hidden"
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={
                mainContentInView
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, y: 20, filter: "blur(10px)" }
              }
              transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
            >
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Active Proposals
                </h3>
                <ProposalsList
                  onVote={handleVote}
                  onExecute={handleExecuteProposal}
                  isPending={isPending}
                  compact={false}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Right Section (1/4 width) - Voting Section - Desktop Only */}
          <motion.div
            ref={sidebarRef}
            className="hidden lg:block w-1/4"
            initial={{ opacity: 0, x: 30, filter: "blur(10px)" }}
            animate={
              sidebarInView
                ? { opacity: 1, x: 0, filter: "blur(0px)" }
                : { opacity: 0, x: 30, filter: "blur(10px)" }
            }
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <motion.div
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sticky top-8"
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={
                sidebarInView
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, y: 20, filter: "blur(10px)" }
              }
              transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            >
              <motion.h3
                className="text-xl font-semibold text-white mb-4 text-center"
                initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                animate={
                  sidebarInView
                    ? { opacity: 1, y: 0, filter: "blur(0px)" }
                    : { opacity: 0, y: 10, filter: "blur(5px)" }
                }
                transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
              >
                Active Proposals
              </motion.h3>
              <motion.div
                className="max-h-[600px] overflow-y-auto pr-2"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor:
                    "rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.1)",
                }}
                initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                animate={
                  sidebarInView
                    ? { opacity: 1, y: 0, filter: "blur(0px)" }
                    : { opacity: 0, y: 10, filter: "blur(5px)" }
                }
                transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
              >
                <ProposalsList
                  onVote={handleVote}
                  onExecute={handleExecuteProposal}
                  isPending={isPending}
                  compact={true}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

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

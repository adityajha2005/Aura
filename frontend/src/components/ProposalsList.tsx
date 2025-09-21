"use client";

import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESSES } from "@/config/contracts";
import GovernanceABI from "@/abis/Governance.json";
import ProposalCard from "./ProposalCard";

interface ProposalsListProps {
  onVote: (proposalId: number, support: boolean) => Promise<void>;
  onExecute: (proposalId: number) => Promise<void>;
  isPending: boolean;
}

export default function ProposalsList({ onVote, onExecute, isPending }: ProposalsListProps) {
  // Get proposal count
  const { data: proposalCount, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.Governance,
    abi: GovernanceABI,
    functionName: "proposalCount",
  });

  // Debug logging
  console.log("ProposalsList Debug:", {
    proposalCount,
    isLoading,
    error,
    contractAddress: CONTRACT_ADDRESSES.Governance
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        <p className="text-gray-300 mt-4">Loading proposals...</p>
      </div>
    );
  }

  if (!proposalCount || Number(proposalCount) === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-4">No proposals found</div>
        <p className="text-gray-500 mb-4">Be the first to create a proposal!</p>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-blue-400 text-sm">
            <strong>Debug Info:</strong><br/>
            Proposal Count: {proposalCount?.toString() || "undefined"}<br/>
            Loading: {isLoading ? "Yes" : "No"}<br/>
            Error: {error ? error.message : "None"}
          </p>
        </div>
      </div>
    );
  }

  // Create array of proposal IDs
  const proposalIds = Array.from({ length: Number(proposalCount) }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {proposalIds.map((proposalId) => (
        <ProposalCard
          key={proposalId}
          proposalId={proposalId}
          onVote={onVote}
          onExecute={onExecute}
          isPending={isPending}
        />
      ))}
    </div>
  );
}

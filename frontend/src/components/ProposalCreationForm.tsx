"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { CONTRACT_ADDRESSES } from "@/config/contracts";
import GovernanceABI from "@/abis/Governance.json";
import toast from "react-hot-toast";

interface ProposalCreationFormProps {
  onProposalCreated: () => void;
  onClose: () => void;
}

export default function ProposalCreationForm({ onProposalCreated, onClose }: ProposalCreationFormProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const [formData, setFormData] = useState({
    description: "",
    newFee: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!formData.newFee.trim()) {
      newErrors.newFee = "New fee is required";
    } else {
      const fee = parseInt(formData.newFee);
      if (isNaN(fee) || fee < 0 || fee > 10000) {
        newErrors.newFee = "Fee must be between 0 and 10000 basis points (0-100%)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error("Please connect your wallet first!");
      return;
    }

    if (!validateForm()) {
      return;
    }

    const loadingToast = toast.loading("Creating proposal...");

    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.Governance as `0x${string}`,
        abi: GovernanceABI as any,
        functionName: "createProposal",
        args: [formData.description.trim(), BigInt(formData.newFee)],
        chainId,
        account: address as `0x${string}`,
      });
    } catch (error) {
      console.error("Error creating proposal:", error);
      toast.error("Failed to create proposal. Please try again.", {
        id: loadingToast,
      });
    }
  };

  // Handle transaction confirmation
  if (isConfirmed && hash) {
    toast.success("Proposal created successfully!", { id: hash });
    onProposalCreated();
    onClose();
  }

  if (error) {
    console.error("Proposal creation error:", error);
    toast.error(`Failed to create proposal: ${error.message || "Unknown error"}`);
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Create New Proposal</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Proposal Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this proposal aims to achieve..."
              className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 ${
                errors.description ? "border-red-500/50" : "border-white/20"
              }`}
              rows={4}
            />
            {errors.description && (
              <p className="text-red-400 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* New Fee Field */}
          <div>
            <label htmlFor="newFee" className="block text-sm font-medium text-gray-300 mb-2">
              New Fee (Basis Points) *
            </label>
            <div className="relative">
              <input
                type="number"
                id="newFee"
                value={formData.newFee}
                onChange={(e) => setFormData(prev => ({ ...prev, newFee: e.target.value }))}
                placeholder="e.g., 300 (for 3%)"
                min="0"
                max="10000"
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 ${
                  errors.newFee ? "border-red-500/50" : "border-white/20"
                }`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                bp
              </div>
            </div>
            {errors.newFee && (
              <p className="text-red-400 text-sm mt-1">{errors.newFee}</p>
            )}
            <p className="text-gray-400 text-xs mt-1">
              Basis points: 100 = 1%, 300 = 3%, 1000 = 10%
            </p>
          </div>

          {/* Requirements Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <h3 className="text-blue-400 font-medium mb-2">Requirements</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• You need at least 1,000 AURA tokens to create a proposal</li>
              <li>• Voting period is 7 days</li>
              <li>• Proposals require more "For" votes than "Against" to pass</li>
              <li>• Anyone can vote if they have voting power</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-xl transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || isConfirming}
              className="flex-1 px-6 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending || isConfirming ? "Creating..." : "Create Proposal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

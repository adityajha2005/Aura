"use client";

import { useState } from "react";

export default function GovernancePage() {
  const [selectedTab, setSelectedTab] = useState("proposals");

  const proposals = [
    {
      id: "AIP-001",
      title: "Implement AI Fee Optimization for AVAX-USDC Pair",
      description:
        "Proposal to enable dynamic fee adjustment based on AI analysis for improved liquidity provider returns",
      status: "Active",
      votesFor: 12450000,
      votesAgainst: 2340000,
      totalVotes: 14790000,
      endDate: "2025-09-25",
      proposer: "0x1234...5678",
    },
    {
      id: "AIP-002",
      title: "Treasury Fund Allocation for Security Audits",
      description:
        "Allocate 500,000 AURA tokens from treasury for quarterly security audits of protocol smart contracts",
      status: "Passed",
      votesFor: 18500000,
      votesAgainst: 1200000,
      totalVotes: 19700000,
      endDate: "2025-09-18",
      proposer: "0xabcd...efgh",
    },
    {
      id: "AIP-003",
      title: "Launch Magic Links v2 with Enhanced Security",
      description:
        "Upgrade Magic Links system with multi-signature support and enhanced encryption protocols",
      status: "Upcoming",
      votesFor: 0,
      votesAgainst: 0,
      totalVotes: 0,
      endDate: "2025-09-30",
      proposer: "0x9999...1111",
    },
  ];

  const userTokens = 25000;
  const votingPower = (userTokens / 100000000) * 100; // Percentage of total supply

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
            Shape the future of Aura Protocol. Vote on proposals, submit ideas,
            and participate in decentralized governance decisions.
          </p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {userTokens.toLocaleString()}
            </div>
            <div className="text-gray-300 text-sm">AURA Tokens</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {votingPower.toFixed(3)}%
            </div>
            <div className="text-gray-300 text-sm">Voting Power</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">7</div>
            <div className="text-gray-300 text-sm">Votes Cast</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">2</div>
            <div className="text-gray-300 text-sm">Proposals Created</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-1 flex">
            {["proposals", "create", "delegate"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-6 py-2 rounded-full transition-all duration-300 capitalize ${
                  selectedTab === tab
                    ? "bg-white/20 text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Proposals Tab */}
        {selectedTab === "proposals" && (
          <div className="space-y-6">
            {proposals.map((proposal) => (
              <div
                key={proposal.id}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {proposal.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          proposal.status === "Active"
                            ? "bg-green-500/20 text-green-400"
                            : proposal.status === "Passed"
                            ? "bg-blue-500/20 text-blue-400"
                            : proposal.status === "Upcoming"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {proposal.status}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">
                      {proposal.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>ID: {proposal.id}</span>
                      <span>Proposer: {proposal.proposer}</span>
                      <span>Ends: {proposal.endDate}</span>
                    </div>
                  </div>
                </div>

                {/* Voting Progress */}
                {proposal.status !== "Upcoming" && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-green-400">
                        For: {proposal.votesFor.toLocaleString()}
                      </span>
                      <span className="text-red-400">
                        Against: {proposal.votesAgainst.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div className="h-full flex">
                        <div
                          className="bg-green-500"
                          style={{
                            width: `${
                              (proposal.votesFor / proposal.totalVotes) * 100
                            }%`,
                          }}
                        ></div>
                        <div
                          className="bg-red-500"
                          style={{
                            width: `${
                              (proposal.votesAgainst / proposal.totalVotes) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-center text-gray-300 text-xs mt-1">
                      {proposal.totalVotes.toLocaleString()} total votes
                    </div>
                  </div>
                )}

                {/* Vote Buttons */}
                {proposal.status === "Active" && (
                  <div className="flex gap-3">
                    <button className="flex-1 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 font-medium py-3 rounded-xl transition-all duration-300">
                      Vote For
                    </button>
                    <button className="flex-1 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 font-medium py-3 rounded-xl transition-all duration-300">
                      Vote Against
                    </button>
                    <button className="px-6 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-xl transition-all duration-300">
                      Details
                    </button>
                  </div>
                )}

                {proposal.status === "Upcoming" && (
                  <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-xl transition-all duration-300">
                    View Details
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Create Tab */}
        {selectedTab === "create" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-8">
                Create New Proposal
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">
                    Proposal Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter proposal title"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">
                    Category
                  </label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-white/30">
                    <option value="">Select category</option>
                    <option value="protocol">Protocol Upgrade</option>
                    <option value="treasury">Treasury Management</option>
                    <option value="parameters">Parameter Changes</option>
                    <option value="partnership">Partnerships</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">
                    Description
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Provide detailed description of your proposal..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 outline-none focus:border-white/30 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      Voting Duration
                    </label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-white/30">
                      <option value="3">3 Days</option>
                      <option value="7">7 Days</option>
                      <option value="14">14 Days</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      Required Quorum
                    </label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-white/30">
                      <option value="5">5% of total supply</option>
                      <option value="10">10% of total supply</option>
                      <option value="15">15% of total supply</option>
                    </select>
                  </div>
                </div>

                <div className="bg-yellow-500/20 border border-yellow-300/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-yellow-300 text-sm font-medium">
                      Proposal Requirements
                    </span>
                  </div>
                  <div className="text-yellow-200 text-sm">
                    • Minimum 10,000 AURA tokens required to create proposal
                    <br />
                    • Proposal will be reviewed by community before voting
                    begins
                    <br />• Implementation requires 51% approval and minimum
                    quorum
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all duration-300">
                  Submit Proposal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delegate Tab */}
        {selectedTab === "delegate" && (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h3 className="text-2xl font-semibold text-white mb-6">
                  Delegate Your Votes
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      Delegate Address
                    </label>
                    <input
                      type="text"
                      placeholder="0x..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 outline-none focus:border-white/30"
                    />
                  </div>

                  <div className="bg-blue-500/20 border border-blue-300/30 rounded-xl p-4">
                    <div className="text-blue-300 text-sm">
                      <strong>Current Delegation:</strong>
                      <br />
                      You have delegated to:{" "}
                      <code className="text-blue-200">0x1234...5678</code>
                      <br />
                      Delegated voting power:{" "}
                      <strong>{userTokens.toLocaleString()} AURA</strong>
                    </div>
                  </div>

                  <button className="w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 font-medium py-3 rounded-xl transition-all duration-300">
                    Update Delegation
                  </button>

                  <button className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 font-medium py-3 rounded-xl transition-all duration-300">
                    Revoke Delegation
                  </button>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h3 className="text-2xl font-semibold text-white mb-6">
                  Top Delegates
                </h3>

                <div className="space-y-3">
                  {[
                    {
                      address: "0xabcd...1234",
                      votes: "12.5M AURA",
                      proposals: 15,
                    },
                    {
                      address: "0xefgh...5678",
                      votes: "8.2M AURA",
                      proposals: 8,
                    },
                    {
                      address: "0xijkl...9012",
                      votes: "6.7M AURA",
                      proposals: 12,
                    },
                    {
                      address: "0xmnop...3456",
                      votes: "4.1M AURA",
                      proposals: 6,
                    },
                  ].map((delegate, index) => (
                    <div
                      key={index}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center"
                    >
                      <div>
                        <div className="text-white font-medium">
                          {delegate.address}
                        </div>
                        <div className="text-gray-300 text-sm">
                          {delegate.proposals} proposals voted
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">
                          {delegate.votes}
                        </div>
                        <button className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
                          Delegate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

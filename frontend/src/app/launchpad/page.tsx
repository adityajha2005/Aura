"use client";

import { useState } from "react";

export default function LaunchpadPage() {
  const [selectedTab, setSelectedTab] = useState("projects");

  const projects = [
    {
      name: "DefiProtocol",
      status: "Active",
      raised: "$2.4M",
      target: "$5M",
      progress: 48,
      riskScore: "Low",
      participants: 1247,
    },
    {
      name: "GameFi Arena",
      status: "Upcoming",
      raised: "$0",
      target: "$3M",
      progress: 0,
      riskScore: "Medium",
      participants: 0,
    },
    {
      name: "NFT Market",
      status: "Completed",
      raised: "$8M",
      target: "$8M",
      progress: 100,
      riskScore: "Low",
      participants: 3421,
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden pt-20">
      {/* Static 3D Glass Cards Background */}
      <div className="absolute inset-0 z-0" style={{ perspective: "1000px" }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-28 h-36 bg-white/2 backdrop-blur-sm rounded-xl border border-white/5 shadow-xl`}
            style={{
              left: `${10 + i * 15}%`,
              top: `${65 + (i % 2) * 8}%`,
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
            Fair Launchpad
          </h1>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Launch your project with confidence. Our AI-powered launchpad
            provides security analysis, automated liquidity bootstrapping, and
            anti-rug pull mechanisms.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-1 flex">
            {["projects", "launch", "security"].map((tab) => (
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

        {/* Projects Tab */}
        {selectedTab === "projects" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-white">
                Active & Upcoming Projects
              </h2>
              <button className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white px-6 py-2 rounded-full transition-all duration-300">
                Launch Project
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-white">
                      {project.name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        project.status === "Active"
                          ? "bg-green-500/20 text-green-400"
                          : project.status === "Upcoming"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-300">Progress</span>
                        <span className="text-white">
                          {project.raised} / {project.target}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-red-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-gray-300 text-xs">Risk Score</div>
                        <div
                          className={`text-sm font-medium ${
                            project.riskScore === "Low"
                              ? "text-green-400"
                              : project.riskScore === "Medium"
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {project.riskScore}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-300 text-xs">
                          Participants
                        </div>
                        <div className="text-white text-sm font-medium">
                          {project.participants.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 rounded-xl transition-all duration-300">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Launch Tab */}
        {selectedTab === "launch" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-8">
                Launch Your Project
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      Project Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter project name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 outline-none focus:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      Funding Target
                    </label>
                    <input
                      type="number"
                      placeholder="Target amount in USD"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 outline-none focus:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      Token Contract
                    </label>
                    <input
                      type="text"
                      placeholder="0x..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 outline-none focus:border-white/30"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      Launch Duration
                    </label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-white/30">
                      <option value="">Select duration</option>
                      <option value="7">7 days</option>
                      <option value="14">14 days</option>
                      <option value="30">30 days</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      Liquidity Lock Period
                    </label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-white/30">
                      <option value="">Select lock period</option>
                      <option value="6">6 months</option>
                      <option value="12">12 months</option>
                      <option value="24">24 months</option>
                    </select>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-300/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <span className="text-purple-300 text-sm font-medium">
                        AI Security Analysis
                      </span>
                    </div>
                    <div className="text-white text-sm">
                      Contract will be analyzed automatically
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full mt-8 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all duration-300">
                Submit for Review
              </button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {selectedTab === "security" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h3 className="text-2xl font-semibold text-white mb-6">
                AI Security Features
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">
                      Contract Vulnerability Scan
                    </h4>
                    <p className="text-gray-300 text-sm">
                      AI analyzes smart contracts for common vulnerabilities and
                      exploits
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">
                      Liquidity Lock Enforcement
                    </h4>
                    <p className="text-gray-300 text-sm">
                      Automatic liquidity locking prevents rug pulls and ensures
                      market stability
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">
                      Team Verification
                    </h4>
                    <p className="text-gray-300 text-sm">
                      Multi-factor verification of project teams and backgrounds
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h3 className="text-2xl font-semibold text-white mb-6">
                Security Stats
              </h3>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    99.8%
                  </div>
                  <div className="text-gray-300">Security Accuracy Rate</div>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">0</div>
                  <div className="text-gray-300">Successful Rug Pulls</div>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-400 mb-2">
                    847
                  </div>
                  <div className="text-gray-300">Projects Analyzed</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

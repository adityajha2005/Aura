"use client";

import { useState } from "react";

export default function AIDexPage() {
  const [selectedTab, setSelectedTab] = useState("trade");

  return (
    <div className="min-h-screen relative overflow-hidden pt-20">
      {/* Static 3D Glass Cards Background */}
      <div className="absolute inset-0 z-0" style={{ perspective: "1000px" }}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-32 h-40 bg-white/2 backdrop-blur-sm rounded-xl border border-white/5 shadow-xl`}
            style={{
              left: `${15 + i * 20}%`,
              top: `${60 + (i % 2) * 10}%`,
              transform: `translateY(-50%) rotateY(${
                (i - 2) * 15
              }deg) rotateX(8deg) scale(0.8)`,
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
            AI-Governed DEX
          </h1>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Experience the future of decentralized trading with our AI-powered
            exchange that optimizes fees in real-time based on market
            conditions.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-1 flex">
            {["trade", "analytics", "fees"].map((tab) => (
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

        {/* Trading Interface */}
        {selectedTab === "trade" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Swap Card */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h3 className="text-2xl font-semibold text-white mb-6">
                  Swap Tokens
                </h3>

                {/* From Token */}
                <div className="mb-4">
                  <label className="text-gray-300 text-sm mb-2 block">
                    From
                  </label>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                      <span className="text-white font-medium">AVAX</span>
                    </div>
                    <input
                      type="number"
                      placeholder="0.0"
                      className="bg-transparent text-white text-xl text-right outline-none"
                    />
                  </div>
                </div>

                {/* Swap Arrow */}
                <div className="flex justify-center my-4">
                  <button className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-full p-2 transition-all duration-300">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  </button>
                </div>

                {/* To Token */}
                <div className="mb-6">
                  <label className="text-gray-300 text-sm mb-2 block">To</label>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full"></div>
                      <span className="text-white font-medium">AURA</span>
                    </div>
                    <input
                      type="number"
                      placeholder="0.0"
                      className="bg-transparent text-white text-xl text-right outline-none"
                    />
                  </div>
                </div>

                {/* AI Fee Display */}
                <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-300/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-purple-300 text-sm font-medium">
                      AI-Optimized Fee
                    </span>
                  </div>
                  <div className="text-white text-lg font-semibold">
                    0.15% (Dynamic)
                  </div>
                  <div className="text-gray-300 text-xs">
                    Fee reduced due to high liquidity
                  </div>
                </div>

                {/* Swap Button */}
                <button className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all duration-300">
                  Swap Tokens
                </button>
              </div>
            </div>

            {/* Market Stats */}
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Market Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">24h Volume</span>
                    <span className="text-white font-semibold">$2.4M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">TVL</span>
                    <span className="text-white font-semibold">$12.8M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Active Pairs</span>
                    <span className="text-white font-semibold">42</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  AI Insights
                </h3>
                <div className="space-y-3">
                  <div className="text-green-400 text-sm">
                    • Optimal trading conditions detected
                  </div>
                  <div className="text-yellow-400 text-sm">
                    • Moderate volatility expected
                  </div>
                  <div className="text-blue-400 text-sm">
                    • Fee optimization active
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {selectedTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h3 className="text-2xl font-semibold text-white mb-6">
                Trading Analytics
              </h3>
              <div className="h-64 bg-white/5 rounded-xl flex items-center justify-center">
                <span className="text-gray-400">
                  Analytics Chart Placeholder
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h3 className="text-2xl font-semibold text-white mb-6">
                AI Performance
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">
                    Fee Optimization Accuracy
                  </span>
                  <span className="text-green-400 font-semibold">94.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">LP Returns Improvement</span>
                  <span className="text-green-400 font-semibold">+18.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Trades Processed</span>
                  <span className="text-white font-semibold">125,847</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fees Tab */}
        {selectedTab === "fees" && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-2xl font-semibold text-white mb-6">
              Dynamic Fee Structure
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  0.05%
                </div>
                <div className="text-gray-300">Low Volatility</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  0.15%
                </div>
                <div className="text-gray-300">Current Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">
                  0.30%
                </div>
                <div className="text-gray-300">High Volatility</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

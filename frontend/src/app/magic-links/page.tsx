"use client";

import { useState } from "react";

export default function MagicLinksPage() {
  const [selectedTab, setSelectedTab] = useState("send");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("AVAX");
  const [generatedLink, setGeneratedLink] = useState("");

  const handleGenerateLink = () => {
    const linkId = Math.random().toString(36).substring(2, 15);
    setGeneratedLink(`https://aura.app/claim/${linkId}`);
  };

  const recentLinks = [
    {
      id: "1",
      amount: "100 AVAX",
      status: "Claimed",
      recipient: "alice@example.com",
      date: "2h ago",
    },
    {
      id: "2",
      amount: "50 USDC",
      status: "Pending",
      recipient: "Magic Link",
      date: "1d ago",
    },
    {
      id: "3",
      amount: "25 AURA",
      status: "Claimed",
      recipient: "+1234567890",
      date: "3d ago",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden pt-20">
      {/* Static 3D Glass Cards Background */}
      <div className="absolute inset-0 z-0" style={{ perspective: "1000px" }}>
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-24 h-32 bg-white/2 backdrop-blur-sm rounded-xl border border-white/5 shadow-xl`}
            style={{
              left: `${8 + i * 14}%`,
              top: `${70 + (i % 2) * 6}%`,
              transform: `translateY(-50%) rotateY(${
                (i - 3) * 10
              }deg) rotateX(5deg) scale(0.7)`,
              transformOrigin: "center center",
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1
            className="text-5xl font-bold text-white mb-4"
            style={{
              fontFamily: "var(--font-tt-firs-neue), Arial, sans-serif",
            }}
          >
            Magic Links
          </h1>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Send crypto to anyone with just a link. No wallet setup required.
            Perfect for onboarding new users to the crypto ecosystem.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-1 flex">
            {["send", "claim", "history"].map((tab) => (
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

        {/* Send Tab */}
        {selectedTab === "send" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-8">
                Create Magic Link
              </h2>

              <div className="space-y-6">
                {/* Token Selection */}
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">
                    Select Token
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["AVAX", "USDC", "AURA"].map((tokenOption) => (
                      <button
                        key={tokenOption}
                        onClick={() => setToken(tokenOption)}
                        className={`p-4 rounded-xl border transition-all duration-300 ${
                          token === tokenOption
                            ? "bg-white/20 border-white/30 text-white"
                            : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        <div className="text-center">
                          <div
                            className={`w-8 h-8 rounded-full mx-auto mb-2 ${
                              tokenOption === "AVAX"
                                ? "bg-red-500"
                                : tokenOption === "USDC"
                                ? "bg-blue-500"
                                : "bg-purple-500"
                            }`}
                          ></div>
                          <span className="font-medium">{tokenOption}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">
                    Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 outline-none focus:border-white/30"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300">
                      {token}
                    </span>
                  </div>
                </div>

                {/* Link Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <h4 className="text-white font-medium mb-2">Expiration</h4>
                    <select className="w-full bg-transparent text-white outline-none">
                      <option value="1h">1 Hour</option>
                      <option value="24h">24 Hours</option>
                      <option value="7d">7 Days</option>
                      <option value="never">Never</option>
                    </select>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <h4 className="text-white font-medium mb-2">Uses</h4>
                    <select className="w-full bg-transparent text-white outline-none">
                      <option value="1">Single Use</option>
                      <option value="5">5 Uses</option>
                      <option value="unlimited">Unlimited</option>
                    </select>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateLink}
                  className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all duration-300"
                >
                  Generate Magic Link
                </button>

                {/* Generated Link */}
                {generatedLink && (
                  <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-300/30 rounded-xl p-4">
                    <h4 className="text-purple-300 font-medium mb-2">
                      Your Magic Link
                    </h4>
                    <div className="bg-white/10 rounded-lg p-3 mb-3">
                      <code className="text-white text-sm break-all">
                        {generatedLink}
                      </code>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition-all duration-300">
                        Copy Link
                      </button>
                      <button className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition-all duration-300">
                        Share
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Claim Tab */}
        {selectedTab === "claim" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-semibold text-white mb-8">
                Claim Tokens
              </h2>

              <div className="space-y-6">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Have a Magic Link?
                  </h3>
                  <p className="text-gray-300">
                    Paste your magic link below to claim your tokens
                  </p>
                </div>

                <input
                  type="text"
                  placeholder="Paste magic link here..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 outline-none focus:border-white/30"
                />

                <div className="text-center text-gray-300 text-sm">
                  <p>Or scan QR code with your phone camera</p>
                </div>

                <div className="w-32 h-32 bg-white/10 rounded-xl mx-auto flex items-center justify-center">
                  <span className="text-gray-400 text-sm">QR Code</span>
                </div>

                <button className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all duration-300">
                  Claim Tokens
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {selectedTab === "history" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-6">
                Recent Magic Links
              </h2>

              <div className="space-y-4">
                {recentLinks.map((link) => (
                  <div
                    key={link.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-purple-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {link.amount}
                        </div>
                        <div className="text-gray-300 text-sm">
                          {link.recipient}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium mb-1 ${
                          link.status === "Claimed"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {link.status}
                      </div>
                      <div className="text-gray-400 text-xs">{link.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Benefits Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">
              No Wallet Required
            </h3>
            <p className="text-gray-300 text-sm">
              Recipients don&apos;t need a crypto wallet to receive tokens
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-400"
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
            </div>
            <h3 className="text-white font-semibold mb-2">Instant Transfer</h3>
            <p className="text-gray-300 text-sm">
              Send crypto instantly with just a shareable link
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Mass Adoption</h3>
            <p className="text-gray-300 text-sm">
              Perfect for onboarding new users to crypto
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import {
  useMagicLinkEscrow,
  useCreateEscrow,
  useClaimEscrow,
  useCancelEscrow,
  useExpireEscrow,
  useEscrowDetails,
  useEscrowValidation,
  type EscrowDetails,
  type CreateEscrowParams,
  type ClaimEscrowParams,
  type CancelEscrowParams,
} from '@/hooks/useMagicLinkEscrow';
import { CONTRACT_ADDRESSES } from '@/config/contracts';

// Token options for the escrow
const TOKEN_OPTIONS = [
  { symbol: 'AVAX', address: '0x0000000000000000000000000000000000000000', color: 'bg-red-500' },
  { symbol: 'TEST', address: CONTRACT_ADDRESSES.TestTokens, color: 'bg-blue-500' },
  { symbol: 'AGOV', address: CONTRACT_ADDRESSES.AuraGovernanceToken, color: 'bg-purple-500' },
];

// Simple EscrowPreview component
function EscrowPreview({ escrowId }: { escrowId: number }) {
  const { escrowDetails, isLoading, error } = useEscrowDetails(escrowId);

  const getTokenSymbol = (tokenAddress: string) => {
    const token = TOKEN_OPTIONS.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
    return token ? token.symbol : 'Unknown';
  };

  if (isLoading) {
    return <div className="text-gray-300 text-sm">Loading escrow details...</div>;
  }

  if (error || !escrowDetails) {
    return <div className="text-red-300 text-sm">Failed to load escrow details</div>;
  }

  const isExpired = Date.now() / 1000 > Number(escrowDetails.expirationTime);
  const status = escrowDetails.claimed ? "Claimed" : 
                escrowDetails.cancelled ? "Cancelled" : 
                isExpired ? "Expired" : "Active";

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">Amount:</span>
        <span className="text-white">
          {formatEther(escrowDetails.amount)} {getTokenSymbol(escrowDetails.token)}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">Status:</span>
        <span className={`${
          status === "Active" ? "text-green-400" :
          status === "Claimed" ? "text-blue-400" :
          "text-red-400"
        }`}>
          {status}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">Expires:</span>
        <span className="text-white">
          {new Date(Number(escrowDetails.expirationTime) * 1000).toLocaleDateString()}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">Sender:</span>
        <span className="text-white font-mono text-xs">
          {escrowDetails.sender.slice(0, 6)}...{escrowDetails.sender.slice(-4)}
        </span>
      </div>
    </div>
  );
}

// Expiration time options
const EXPIRATION_OPTIONS = [
  { label: '1 Hour', value: 3600 },
  { label: '24 Hours', value: 86400 },
  { label: '7 Days', value: 604800 },
  { label: '30 Days', value: 2592000 },
];

// EscrowCard component for displaying individual escrows
interface EscrowCardProps {
  escrow: EscrowDetails;
  escrowId: number;
  onClaim: (params: ClaimEscrowParams) => void;
  onCancel: (params: CancelEscrowParams) => void;
  onExpire: (escrowId: number) => void;
  isClaiming: boolean;
  isCancelling: boolean;
  isExpiring: boolean;
  userAddress?: string;
  isDemoMode?: boolean;
}

function EscrowCard({
  escrow,
  escrowId,
  onClaim,
  onCancel,
  onExpire,
  isClaiming,
  isCancelling,
  isExpiring,
  userAddress,
  isDemoMode = false,
}: EscrowCardProps) {
  const [secret, setSecret] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);

  const getTokenSymbol = (tokenAddress: string) => {
    const token = TOKEN_OPTIONS.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
    return token ? token.symbol : 'Unknown';
  };

  const getTokenColor = (tokenAddress: string) => {
    const token = TOKEN_OPTIONS.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
    return token ? token.color : 'bg-gray-500';
  };

  const getEscrowStatus = () => {
    if (escrow.claimed) return "Claimed";
    if (escrow.cancelled) return "Cancelled";
    if (Date.now() / 1000 > Number(escrow.expirationTime)) return "Expired";
    return "Active";
  };

  const status = getEscrowStatus();
  const isSender = userAddress?.toLowerCase() === escrow.sender.toLowerCase();
  const isExpired = Date.now() / 1000 > Number(escrow.expirationTime);

  const handleClaim = () => {
    if (secret.trim()) {
      onClaim({ escrowId, secret: secret.trim() });
      setSecret('');
      setShowClaimForm(false);
    }
  };

  const handleCancel = () => {
    onCancel({ escrowId });
  };

  const handleExpire = () => {
    onExpire(escrowId);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${getTokenColor(escrow.token)} rounded-full flex items-center justify-center`}>
            <span className="text-white font-bold text-sm">{getTokenSymbol(escrow.token)}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {formatEther(escrow.amount)} {getTokenSymbol(escrow.token)}
            </h3>
            <p className="text-gray-400 text-sm">ID: #{escrowId}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            status === "Active"
              ? "bg-green-500/20 text-green-400"
              : status === "Claimed"
              ? "bg-blue-500/20 text-blue-400"
              : status === "Cancelled"
              ? "bg-red-500/20 text-red-400"
              : "bg-gray-500/20 text-gray-400"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-300 text-xs">Sender</div>
            <div className="text-white font-mono text-xs truncate">
              {escrow.sender.slice(0, 6)}...{escrow.sender.slice(-4)}
            </div>
          </div>
          <div>
            <div className="text-gray-300 text-xs">Expires</div>
            <div className="text-white text-xs">
              {new Date(Number(escrow.expirationTime) * 1000).toLocaleDateString()}
            </div>
          </div>
        </div>

        {status === "Active" && !isSender && (
          <div className="space-y-2">
            {!showClaimForm ? (
              <button
                onClick={() => setShowClaimForm(true)}
                disabled={isDemoMode}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 text-white py-2 rounded-xl transition-all duration-300"
              >
                {isDemoMode ? "Demo Mode" : "Claim Escrow"}
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter secret to claim"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  disabled={isDemoMode}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-400 outline-none focus:border-white/30 text-sm disabled:opacity-50"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleClaim}
                    disabled={isClaiming || !secret.trim() || isDemoMode}
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 text-white py-2 rounded-xl transition-all duration-300"
                  >
                    {isDemoMode ? "Demo Mode" : isClaiming ? "Claiming..." : "Claim"}
                  </button>
                  <button
                    onClick={() => setShowClaimForm(false)}
                    className="px-4 bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {status === "Active" && isSender && (
          <div className="space-y-2">
            <button
              onClick={handleCancel}
              disabled={isCancelling || isDemoMode}
              className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:opacity-50 text-white py-2 rounded-xl transition-all duration-300"
            >
              {isDemoMode ? "Demo Mode" : isCancelling ? "Cancelling..." : "Cancel Escrow"}
            </button>
            {isExpired && (
              <button
                onClick={handleExpire}
                disabled={isExpiring || isDemoMode}
                className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 disabled:opacity-50 text-white py-2 rounded-xl transition-all duration-300"
              >
                {isDemoMode ? "Demo Mode" : isExpiring ? "Expiring..." : "Expire Escrow"}
              </button>
            )}
          </div>
        )}

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 rounded-xl transition-all duration-300"
        >
          {showDetails ? "Hide Details" : "View Details"}
        </button>

        {showDetails && (
          <div className="mt-4 p-4 bg-white/5 rounded-xl space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Token Address:</span>
              <span className="text-white font-mono text-xs">{escrow.token}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Sender:</span>
              <span className="text-white font-mono text-xs">{escrow.sender}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Secret Hash:</span>
              <span className="text-white font-mono text-xs">{escrow.secretHash.slice(0, 10)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Expiration:</span>
              <span className="text-white text-xs">
                {new Date(Number(escrow.expirationTime) * 1000).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main MagicLinkEscrow component
export default function MagicLinkEscrow() {
  const { address } = useAccount();
  const [selectedTab, setSelectedTab] = useState("create");
  const [formData, setFormData] = useState({
    token: TOKEN_OPTIONS[0].address,
    amount: '',
    expiration: EXPIRATION_OPTIONS[1].value,
    secret: '',
    recipientEmail: '',
  });
  const [createdEscrowId, setCreatedEscrowId] = useState<number | null>(null);
  const [createdEscrowSecret, setCreatedEscrowSecret] = useState<string>('');
  const [claimFormData, setClaimFormData] = useState({
    escrowId: '',
    secret: '',
  });

  // Hooks
  const {
    escrows,
    userEscrows,
    escrowCount,
    maxExpiration,
    loading: escrowsLoading,
    error: escrowsError,
    refetch,
  } = useMagicLinkEscrow();

  const {
    createEscrow,
    isPending: isCreating,
    isConfirming: isConfirmingCreate,
    isSuccess: isCreateSuccess,
    error: createError,
  } = useCreateEscrow();

  const {
    claimEscrow,
    isPending: isClaiming,
    isConfirming: isConfirmingClaim,
    isSuccess: isClaimSuccess,
    error: claimError,
  } = useClaimEscrow();

  const {
    cancelEscrow,
    isPending: isCancelling,
    isSuccess: isCancelSuccess,
  } = useCancelEscrow();

  const {
    expireEscrow,
    isPending: isExpiring,
    isSuccess: isExpireSuccess,
  } = useExpireEscrow();

  const { 
    generateSecret, 
    validateSecret, 
    validateAmount, 
    validateExpirationTime,
    generateMagicLink,
    sendEmail 
  } = useEscrowValidation();

  // Generate secret on component mount (only once)
  useEffect(() => {
    if (!formData.secret) {
      setFormData(prev => ({ ...prev, secret: generateSecret() }));
    }
  }, []); // Empty dependency array - only run once on mount

  // Check for URL parameters to auto-fill claim form
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const claimEscrowId = urlParams.get('claim');
      const claimSecret = urlParams.get('secret');
      
      if (claimEscrowId && claimSecret) {
        const decodedSecret = decodeURIComponent(claimSecret);
        
        setClaimFormData({
          escrowId: claimEscrowId,
          secret: decodedSecret,
        });
        setSelectedTab('claim');
      }
    }
  }, []);

  // Reset form on successful creation and capture escrow ID
  useEffect(() => {
    if (isCreateSuccess) {
      // The new escrow ID is escrowCount + 1 (since contract increments before storing)
      const newEscrowId = escrowCount + 1;
      
      setCreatedEscrowId(newEscrowId);
      setCreatedEscrowSecret(formData.secret); // Store the secret used for creation
      
      // Don't reset form immediately if there's an email to send
      if (!formData.recipientEmail) {
        setFormData({
          token: TOKEN_OPTIONS[0].address,
          amount: '',
          expiration: EXPIRATION_OPTIONS[1].value,
          secret: '', // Clear secret, let the mount effect generate a new one
          recipientEmail: '',
        });
      }
      refetch();
    }
  }, [isCreateSuccess, escrowCount, refetch]);

  // Refetch on other successful operations
  useEffect(() => {
    if (isClaimSuccess || isCancelSuccess || isExpireSuccess) {
      refetch();
    }
  }, [isClaimSuccess, isCancelSuccess, isExpireSuccess, refetch]);

  const handleCreateEscrow = async () => {
    if (!validateAmount(formData.amount) || !validateSecret(formData.secret)) {
      console.error('Validation failed:', { 
        amount: formData.amount, 
        secret: formData.secret,
        amountValid: validateAmount(formData.amount),
        secretValid: validateSecret(formData.secret)
      });
      return;
    }

    const expirationTime = formData.expiration === 0 ? 0 : Math.floor(Date.now() / 1000) + formData.expiration;
    
    if (expirationTime > 0 && !validateExpirationTime(expirationTime, maxExpiration)) {
      console.error('Expiration validation failed:', { expirationTime, maxExpiration });
      return;
    }

    console.log('Creating escrow with params:', {
      token: formData.token,
      amount: formData.amount,
      expirationTime,
      secret: formData.secret,
      isETH: formData.token === '0x0000000000000000000000000000000000000000',
    });

    const params: CreateEscrowParams = {
      token: formData.token,
      amount: formData.amount,
      expirationTime,
      secret: formData.secret,
    };

    await createEscrow(params);
  };

  const handleClaimEscrow = async (params: ClaimEscrowParams) => {
    await claimEscrow(params);
  };

  const handleCancelEscrow = async (params: CancelEscrowParams) => {
    await cancelEscrow(params);
  };

  const handleExpireEscrow = async (escrowId: number) => {
    await expireEscrow(escrowId);
  };

  const handleSendEmail = () => {
    if (!createdEscrowId || !address || !formData.recipientEmail) return;

    const expirationTime = formData.expiration === 0 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days default
      : new Date(Date.now() + formData.expiration * 1000);
    
    const magicLink = generateMagicLink(createdEscrowId, createdEscrowSecret);
    const tokenSymbol = getTokenSymbol(formData.token);

    sendEmail(
      formData.recipientEmail,
      formData.amount,
      tokenSymbol,
      magicLink,
      address,
      expirationTime
    );

    // Clear the email field after a short delay to ensure email is sent first
    setTimeout(() => {
      setFormData(prev => ({ ...prev, recipientEmail: '' }));
    }, 100);
  };

  const getTokenSymbol = (tokenAddress: string) => {
    const token = TOKEN_OPTIONS.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
    return token ? token.symbol : 'Unknown';
  };

  const isDemoMode = !address;

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
            Magic Link Escrow
          </h1>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Create secure, time-locked escrows with secret-based claiming. Send crypto to anyone with just a link.
          </p>
          {isDemoMode && (
            <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
              <p className="text-yellow-300 text-sm">
                Demo Mode: Connect your wallet to interact with real contracts
              </p>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-1 flex">
            {["create", "claim", "my-escrows", "all-escrows"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-6 py-2 rounded-full transition-all duration-300 capitalize ${
                  selectedTab === tab
                    ? "bg-white/20 text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Create Tab */}
        {selectedTab === "create" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-8">
                Create Magic Link Escrow
              </h2>

              <div className="space-y-6">
                {/* Token Selection */}
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">
                    Select Token
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {TOKEN_OPTIONS.map((token) => (
                      <button
                        key={token.symbol}
                        onClick={() => setFormData(prev => ({ ...prev, token: token.address }))}
                        className={`p-4 rounded-xl border transition-all duration-300 ${
                          formData.token === token.address
                            ? "bg-white/20 border-white/30 text-white"
                            : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        <div className="text-center">
                          <div className={`w-8 h-8 ${token.color} rounded-full mx-auto mb-2`}></div>
                          <span className="font-medium">{token.symbol}</span>
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
                      step="0.001"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.0"
                      disabled={isDemoMode}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 outline-none focus:border-white/30 disabled:opacity-50"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300">
                      {getTokenSymbol(formData.token)}
                    </span>
                  </div>
                </div>

                {/* Expiration Time */}
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">
                    Expiration Time
                  </label>
                  <select
                    value={formData.expiration}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiration: parseInt(e.target.value) }))}
                    disabled={isDemoMode}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-white/30 disabled:opacity-50"
                  >
                    {EXPIRATION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-gray-800">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Secret */}
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">
                    Secret (for claiming)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.secret}
                      onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
                      placeholder="Enter secret or generate one"
                      disabled={isDemoMode}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 outline-none focus:border-white/30 disabled:opacity-50"
                    />
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, secret: generateSecret() }))}
                      disabled={isDemoMode}
                      className="px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 disabled:opacity-50"
                    >
                      Generate
                    </button>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">
                    Share this secret with the recipient to claim the escrow
                  </p>
                </div>

                {/* Recipient Email (Optional) */}
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">
                    Send via Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.recipientEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                    placeholder="recipient@example.com"
                    disabled={isDemoMode}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 outline-none focus:border-white/30 disabled:opacity-50"
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    If provided, we&apos;ll open your email client with a pre-filled message containing the magic link
                  </p>
                </div>

                {/* Create Button */}
                <button
                  onClick={handleCreateEscrow}
                  disabled={isCreating || isConfirmingCreate || !formData.amount || !formData.secret || isDemoMode}
                  className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-all duration-300"
                >
                  {isDemoMode 
                    ? "Demo Mode" 
                    : isCreating || isConfirmingCreate 
                    ? "Creating Escrow..." 
                    : "Create Magic Link Escrow"
                  }
                </button>

                {/* Error Display */}
                {(createError || escrowsError) && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                    <p className="text-red-300 text-sm">
                      {createError?.message || escrowsError}
                    </p>
                  </div>
                )}

                {/* Success Display with Email Option */}
                {isCreateSuccess && (
                  <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-green-300 text-sm font-medium mb-2">
                          🎉 Escrow created successfully!
                        </p>
                        <p className="text-green-200 text-xs mb-3">
                          Your magic link escrow has been created. You can now share the secret with the recipient or send it via email.
                        </p>
                        
                        {formData.recipientEmail && createdEscrowId && (
                          <div className="space-y-2">
                            <p className="text-green-200 text-xs">
                              📧 Ready to send to: {formData.recipientEmail}
                            </p>
                            <button
                              onClick={handleSendEmail}
                              disabled={isDemoMode}
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg transition-all duration-300 text-sm"
                            >
                              {isDemoMode ? "Demo Mode" : "📧 Send Magic Link Email"}
                            </button>
                          </div>
                        )}
                        
                        {createdEscrowId && createdEscrowSecret && (
                          <div className="mt-3 p-2 bg-white/10 rounded-lg">
                            <p className="text-green-200 text-xs mb-1">Magic Link:</p>
                            <code className="text-green-100 text-xs break-all">
                              {generateMagicLink(createdEscrowId, createdEscrowSecret)}
                            </code>
                          </div>
                        )}
                        
                        <p className="text-green-200 text-xs mt-2">
                          Check &quot;My Escrows&quot; tab to view and manage your escrow.
                        </p>
                      </div>
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
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-8">
                Claim Magic Link Escrow
              </h2>

              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-10 h-10 text-white"
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
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Have a Magic Link?
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Enter the escrow details to claim your tokens
                  </p>
                </div>

                {/* Escrow ID Input */}
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">
                    Escrow ID
                  </label>
                  <input
                    type="number"
                    value={claimFormData.escrowId}
                    onChange={(e) => setClaimFormData(prev => ({ ...prev, escrowId: e.target.value }))}
                    placeholder="Enter escrow ID"
                    disabled={isDemoMode}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 outline-none focus:border-white/30 disabled:opacity-50"
                  />
                </div>

                {/* Secret Input */}
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">
                    Secret
                  </label>
                  <input
                    type="text"
                    value={claimFormData.secret}
                    onChange={(e) => setClaimFormData(prev => ({ ...prev, secret: e.target.value }))}
                    placeholder="Enter the secret provided by the sender"
                    disabled={isDemoMode}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 outline-none focus:border-white/30 disabled:opacity-50"
                  />
                </div>

                {/* Escrow Preview */}
                {claimFormData.escrowId && parseInt(claimFormData.escrowId) > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <h4 className="text-white font-medium mb-2">Escrow Preview</h4>
                    <EscrowPreview escrowId={parseInt(claimFormData.escrowId)} />
                  </div>
                )}

                {/* Claim Button */}
                <button
                  onClick={() => handleClaimEscrow({ 
                    escrowId: parseInt(claimFormData.escrowId), 
                    secret: claimFormData.secret 
                  })}
                  disabled={
                    isClaiming || 
                    isConfirmingClaim || 
                    !claimFormData.escrowId || 
                    !claimFormData.secret || 
                    isDemoMode
                  }
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-all duration-300"
                >
                  {isDemoMode 
                    ? "Demo Mode" 
                    : isClaiming || isConfirmingClaim 
                    ? "Claiming Escrow..." 
                    : "🎁 Claim Tokens"
                  }
                </button>

                {/* Error Display */}
                {claimError && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                    <p className="text-red-300 text-sm">
                      {claimError.message}
                    </p>
                  </div>
                )}

                {/* Success Display */}
                {isClaimSuccess && (
                  <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
                    <p className="text-green-300 text-sm">
                      🎉 Tokens claimed successfully! Check your wallet balance.
                    </p>
                  </div>
                )}

                <div className="text-center text-gray-400 text-sm">
                  <p>Don&apos;t have the secret? Contact the person who sent you the magic link.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Escrows Tab */}
        {selectedTab === "my-escrows" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-6">
                My Escrows ({userEscrows.length})
              </h2>

              {escrowsLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-300">Loading your escrows...</div>
                </div>
              ) : userEscrows.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-300">You haven&apos;t created any escrows yet.</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userEscrows
                    .map((escrowId) => {
                      // Contract uses 1-based indexing, so escrowId is the actual contract ID
                      // Array is 0-based, so we need to subtract 1 to get the array index
                      const escrow = escrows[escrowId - 1];
                      return escrow ? { escrow, escrowId } : null;
                    })
                    .filter((item): item is { escrow: EscrowDetails; escrowId: number } => item !== null)
                    .map(({ escrow, escrowId }) => (
                      <EscrowCard
                        key={escrowId}
                        escrow={escrow}
                        escrowId={escrowId}
                        onClaim={handleClaimEscrow}
                        onCancel={handleCancelEscrow}
                        onExpire={handleExpireEscrow}
                        isClaiming={isClaiming}
                        isCancelling={isCancelling}
                        isExpiring={isExpiring}
                        userAddress={address}
                        isDemoMode={isDemoMode}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* All Escrows Tab */}
        {selectedTab === "all-escrows" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-6">
                All Escrows ({escrows.filter(escrow => {
                  const isExpired = Date.now() / 1000 > Number(escrow.expirationTime);
                  return escrow.claimed || (!escrow.cancelled && !isExpired);
                }).length})
              </h2>

              {escrowsLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-300">Loading escrows...</div>
                </div>
              ) : escrows.filter(escrow => {
                const isExpired = Date.now() / 1000 > Number(escrow.expirationTime);
                return escrow.claimed || (!escrow.cancelled && !isExpired);
              }).length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-300">No active or claimed escrows found.</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {escrows
                    .map((escrow, index) => ({ escrow, escrowId: index + 1 }))
                    .filter(({ escrow }) => {
                      // Show only claimed or active escrows (not cancelled or expired)
                      const isExpired = Date.now() / 1000 > Number(escrow.expirationTime);
                      return escrow.claimed || (!escrow.cancelled && !isExpired);
                    })
                    .map(({ escrow, escrowId }) => (
                      <EscrowCard
                        key={escrowId}
                        escrow={escrow}
                        escrowId={escrowId}
                        onClaim={handleClaimEscrow}
                        onCancel={handleCancelEscrow}
                        onExpire={handleExpireEscrow}
                        isClaiming={isClaiming}
                        isCancelling={isCancelling}
                        isExpiring={isExpiring}
                        userAddress={address}
                        isDemoMode={isDemoMode}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        )}


        {/* Benefits Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
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
              Secret-Based Security
            </h3>
            <p className="text-gray-300 text-sm">
              Only those with the secret can claim the escrow funds
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Time-Locked</h3>
            <p className="text-gray-300 text-sm">
              Automatic expiration ensures funds don&apos;t get stuck forever
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
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Multi-Token Support</h3>
            <p className="text-gray-300 text-sm">
              Support for ETH and ERC20 tokens with easy claiming
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

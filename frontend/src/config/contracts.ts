// Contract addresses and configuration for Avalanche Fuji Testnet
export const CHAIN_ID = 43113;
export const NETWORK_NAME = "Avalanche Fuji Testnet";
export const CURRENCY = "AVAX";

// Contract addresses from deployment
export const CONTRACT_ADDRESSES = {
  TestTokens: "0x246B2a6C376Df8299C90A717aE4661599F636BDD",
  AuraGovernanceToken: "0x9947056cC11E283617De19336236Da8f4CcE8BD2", 
  LPToken: "0xD9E8A86205a881072924981d3e6124183C8C5a27",
  LiquidityPool: "0x8bCcb416986C47aBb7CD2C2D57135C0f5405A7d3",
  Governance: "0xb0E19E6795F38a66bf5bbB6fC5F314E16BCbAFE9",
  Launchpad: "0x105E62d8d558a68587a61610e89BcA5D368A0C9e",
  MagicLinkEscrow: "0x60dA497b872642B25aff3d202ca162590c2888b2"
} as const;

// Contract metadata
export const CONTRACT_METADATA = {
  TestTokens: {
    name: "Test Token",
    symbol: "TEST",
    decimals: 18,
    description: "Base test token for the platform"
  },
  AuraGovernanceToken: {
    name: "Aura Governance Token", 
    symbol: "AGOV",
    decimals: 18,
    description: "Governance token with voting capabilities"
  },
  LPToken: {
    name: "Aura LP Token",
    symbol: "ALP", 
    decimals: 18,
    description: "Liquidity provider token representing pool shares"
  },
  LiquidityPool: {
    description: "Main AMM liquidity pool for token swaps",
    tokenA: CONTRACT_ADDRESSES.TestTokens,
    tokenB: CONTRACT_ADDRESSES.AuraGovernanceToken,
    lpToken: CONTRACT_ADDRESSES.LPToken,
    initialFee: 30 // basis points
  },
  Governance: {
    description: "DAO governance system for protocol management",
    votingPeriod: 604800, // 7 days in seconds
    linkedLiquidityPool: CONTRACT_ADDRESSES.LiquidityPool,
    linkedGovernanceToken: CONTRACT_ADDRESSES.AuraGovernanceToken
  },
  Launchpad: {
    description: "Platform for launching new tokens with liquidity provision",
    baseToken: CONTRACT_ADDRESSES.TestTokens,
    linkedLiquidityPool: CONTRACT_ADDRESSES.LiquidityPool,
    launchFee: 1000 // basis points (10%)
  },
  MagicLinkEscrow: {
    description: "Escrow system for secure token transfers via magic links",
    defaultExpiration: 2592000, // 30 days in seconds
    maxExpiration: 31536000 // 365 days in seconds
  }
} as const;

// Deployment information
export const DEPLOYMENT_INFO = {
  deployer: "0x0003613a5FBbdB74c7E5af87AB1D6338453391A3",
  deploymentDate: "2025-09-20",
  deploymentBlock: 46176037,
  transactionHashes: {
    TestTokens: "0xb7d7736dbb0760c848c437e5c219dc52c2cf03ee2643c1237684d033607c3fcb",
    AuraGovernanceToken: "0x5224f5092065acebbf06b9150636c7dc587e4adebe2e1090a2e1dd3b239440b3",
    LPToken: "0x3b32675402e62c85ded5741153283cec601c79b7032b992d91b833284b3dd1e8",
    LiquidityPool: "0x34e7471478b66e9132d43c58566fe8adcfeb078cfad32c4e366ea3421fb66aea",
    Governance: "0xd6353d09e11986df2faccabf352bdc850087983e8979e2fe356b34247b2eb9c7",
    Launchpad: "0xe7f3215409fde6b477c6fdf5d7a3791e18ff94c272fc053700c2121c316fa9bf",
    MagicLinkEscrow: "0x0c7760e29bb5340a5682cc7dfc855b59c70aed7a3bcdcc93f6f9f42342fe2a8b"
  }
} as const;

// Helper function to get contract address by name
export function getContractAddress(contractName: keyof typeof CONTRACT_ADDRESSES): string {
  return CONTRACT_ADDRESSES[contractName];
}

// Helper function to get contract metadata
export function getContractMetadata(contractName: keyof typeof CONTRACT_METADATA) {
  return CONTRACT_METADATA[contractName];
}

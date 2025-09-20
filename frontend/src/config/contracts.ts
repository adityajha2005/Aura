// Contract addresses and configuration for Avalanche Fuji Testnet
export const CHAIN_ID = 43113;
export const NETWORK_NAME = "Avalanche Fuji Testnet";
export const CURRENCY = "AVAX";

// Contract addresses from deployment
export const CONTRACT_ADDRESSES = {
  TestTokens: "0xcEBD597dF2819853bB337b23117FA9369Ab8C2a0",
  AuraGovernanceToken: "0x038EDCeC11e286068C1ebF8bd4A16336365080Df", 
  LPToken: "0xb7ed5c8d30B53beA831e840bC2b82B3Fb954FC7D",
  LiquidityPool: "0x90DDF033591582512A4EA2De46B1D2fac8901895",
  Governance: "0x324f8aaB44d2BFc93E062B7A9b1edcc93c268605",
  Launchpad: "0xE6B8d115432E0D412213c53C298661352f81A6dB",
  MagicLinkEscrow: "0x3375Bf8Bf1Fc2E7C197eD66DB53E90568473BA60"
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
  deploymentBlock: 46172601,
  transactionHashes: {
    TestTokens: "0x7e7f7f630eb75408d5f844aea95b5654cc6365f66975fd194a408e04f5ea6811",
    AuraGovernanceToken: "0x2b28050b227bde6b70fbd6916b7f326fdba1768ca27c34dcdd0a6942dc70a00a",
    LPToken: "0xccd2cf5051ba0cc85ff3a6681c45cf1320cec400f7376b3079c02f7330030369",
    LiquidityPool: "0x2759119ac56a120514df3b975bb0ae48a343db34d1544ef37fb6e54337e510ec",
    Governance: "0xf4299b4bc8a8890be89e674e37ca33459e6bcb4543dfae800303b810b31ba957",
    Launchpad: "0xb52cf1e3e5b202463fb30b3c6f7f01f0daac85bd53cb7484fa0b66541ba15cbf",
    MagicLinkEscrow: "0xafd668c4ea8479e50d2bbea81b5cf43f3a3114f6e68d8e04e422ae6e9105756b"
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

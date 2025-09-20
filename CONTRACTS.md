# Aura Protocol - Smart Contract Integration Guide

This document provides comprehensive information about the deployed smart contracts on Avalanche Fuji Testnet and how to integrate them into your frontend application.

## 🌐 Network Information

- **Network**: Avalanche Fuji Testnet
- **Chain ID**: 43113
- **Currency**: AVAX
- **Deployment Block**: 46176037
- **Deployment Date**: September 20, 2025
- **Deployer**: `0x0003613a5FBbdB74c7E5af87AB1D6338453391A3`

## 📋 Deployed Contracts

### Core Tokens

#### 1. TestTokens (Base Token)
- **Address**: `0x246B2a6C376Df8299C90A717aE4661599F636BDD`
- **Name**: Test Token
- **Symbol**: TEST
- **Decimals**: 18
- **Description**: Base test token for the platform
- **Transaction**: `0xb7d7736dbb0760c848c437e5c219dc52c2cf03ee2643c1237684d033607c3fcb`

#### 2. AuraGovernanceToken (Governance Token)
- **Address**: `0x9947056cC11E283617De19336236Da8f4CcE8BD2`
- **Name**: Aura Governance Token
- **Symbol**: AGOV
- **Decimals**: 18
- **Initial Supply**: 1,000,000 AGOV
- **Description**: Governance token with voting capabilities
- **Transaction**: `0x5224f5092065acebbf06b9150636c7dc587e4adebe2e1090a2e1dd3b239440b3`

#### 3. LPToken (Liquidity Provider Token)
- **Address**: `0xD9E8A86205a881072924981d3e6124183C8C5a27`
- **Name**: Aura LP Token
- **Symbol**: ALP
- **Decimals**: 18
- **Description**: Liquidity provider token representing pool shares
- **Transaction**: `0x3b32675402e62c85ded5741153283cec601c79b7032b992d91b833284b3dd1e8`

### Core Protocol Contracts

#### 4. LiquidityPool (AMM)
- **Address**: `0x8bCcb416986C47aBb7CD2C2D57135C0f5405A7d3`
- **Token A**: `0x246B2a6C376Df8299C90A717aE4661599F636BDD` (TEST)
- **Token B**: `0x9947056cC11E283617De19336236Da8f4CcE8BD2` (AGOV)
- **LP Token**: `0xD9E8A86205a881072924981d3e6124183C8C5a27` (ALP)
- **Initial Fee**: 30 basis points (0.3%)
- **Description**: Main AMM liquidity pool for token swaps
- **Transaction**: `0x34e7471478b66e9132d43c58566fe8adcfeb078cfad32c4e366ea3421fb66aea`

#### 5. Governance (DAO)
- **Address**: `0xb0E19E6795F38a66bf5bbB6fC5F314E16BCbAFE9`
- **Linked Liquidity Pool**: `0x8bCcb416986C47aBb7CD2C2D57135C0f5405A7d3`
- **Linked Governance Token**: `0x9947056cC11E283617De19336236Da8f4CcE8BD2`
- **Voting Period**: 7 days (604,800 seconds)
- **Description**: DAO governance system for protocol management
- **Transaction**: `0xd6353d09e11986df2faccabf352bdc850087983e8979e2fe356b34247b2eb9c7`

#### 6. Launchpad (Token Launch Platform)
- **Address**: `0x105E62d8d558a68587a61610e89BcA5D368A0C9e`
- **Base Token**: `0x246B2a6C376Df8299C90A717aE4661599F636BDD` (TEST)
- **Linked Liquidity Pool**: `0x8bCcb416986C47aBb7CD2C2D57135C0f5405A7d3`
- **Launch Fee**: 1000 basis points (10%)
- **Description**: Platform for launching new tokens with liquidity provision
- **Transaction**: `0xe7f3215409fde6b477c6fdf5d7a3791e18ff94c272fc053700c2121c316fa9bf`

#### 7. MagicLinkEscrow (Escrow System) ⚠️ **UPDATED**
- **Address**: `0x60dA497b872642B25aff3d202ca162590c2888b2`
- **Default Expiration**: 30 days (2,592,000 seconds)
- **Max Expiration**: 365 days (31,536,000 seconds)
- **Description**: Escrow system for secure token transfers via magic links
- **Transaction**: `0x0c7760e29bb5340a5682cc7dfc855b59c70aed7a3bcdcc93f6f9f42342fe2a8b`
- **⚠️ BREAKING CHANGE**: `claimEscrow` function now accepts `bytes32 secret` instead of `string memory secret`

## 🔗 Contract Relationships

```
Governance
├── Controls: LiquidityPool
├── Uses: AuraGovernanceToken, LiquidityPool

LiquidityPool
├── Managed by: Governance
├── Tokens: TestTokens, AuraGovernanceToken
├── LP Token: LPToken

Launchpad
├── Uses: TestTokens, LiquidityPool
├── Creates: New LiquidityPool instances, New LPToken instances

LPToken
├── Owned by: LiquidityPool
├── Represents: LiquidityPool shares
```

## 📁 File Structure

```
/
├── contracts.json                    # Complete contract configuration
├── abis/                            # Contract ABIs
│   ├── TestTokens.json
│   ├── AuraGovernanceToken.json
│   ├── LPToken.json
│   ├── LiquidityPool.json
│   ├── Governance.json
│   ├── Launchpad.json
│   └── MagicLinkEscrow.json         # ⚠️ UPDATED ABI
└── frontend/src/
    ├── config/
    │   ├── contracts.ts             # Contract addresses & metadata
    │   └── abis.ts                  # ABI imports & exports
    └── abis/                        # Frontend ABI files
        ├── TestTokens.json
        ├── AuraGovernanceToken.json
        ├── LPToken.json
        ├── LiquidityPool.json
        ├── Governance.json
        ├── Launchpad.json
        └── MagicLinkEscrow.json     # ⚠️ UPDATED ABI
```

## 🛠 Frontend Integration

### Import Contract Configuration

```typescript
import { CONTRACT_ADDRESSES, CONTRACT_METADATA, getContractAddress } from '@/config/contracts';
import { ABIS, getContractABI } from '@/config/abis';

// Get contract address
const escrowAddress = getContractAddress('MagicLinkEscrow');

// Get contract ABI
const escrowABI = getContractABI('MagicLinkEscrow');
```

### Using with wagmi/viem

```typescript
import { useContractRead, useContractWrite } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { MagicLinkEscrowABI } from '@/config/abis';

// Read contract data
const { data: defaultExpiration } = useContractRead({
  address: CONTRACT_ADDRESSES.MagicLinkEscrow,
  abi: MagicLinkEscrowABI,
  functionName: 'DEFAULT_EXPIRATION',
});

// Write to contract - ⚠️ NOTE: secret parameter is now bytes32
const { write: claimEscrow } = useContractWrite({
  address: CONTRACT_ADDRESSES.MagicLinkEscrow,
  abi: MagicLinkEscrowABI,
  functionName: 'claimEscrow',
});

// Usage example - convert string to bytes32
const secretBytes32 = ethers.utils.formatBytes32String("mySecret123");
claimEscrow({ args: [escrowId, secretBytes32] });
```

## ⚠️ **BREAKING CHANGES**

### MagicLinkEscrow Contract Update

The `claimEscrow` function signature has changed:

**OLD** (Previous deployment):
```solidity
function claimEscrow(uint256 escrowId, string memory secret) external nonReentrant
```

**NEW** (Current deployment):
```solidity
function claimEscrow(uint256 escrowId, bytes32 secret) external nonReentrant
```

### Frontend Migration Guide

If you were previously using the MagicLinkEscrow contract, you need to update your frontend code:

**Before:**
```typescript
// Old way - passing string
const secret = "mySecret123";
claimEscrow({ args: [escrowId, secret] });
```

**After:**
```typescript
// New way - convert string to bytes32
const secret = ethers.utils.formatBytes32String("mySecret123");
claimEscrow({ args: [escrowId, secret] });

// Or using viem
import { stringToBytes } from 'viem';
const secret = stringToBytes("mySecret123", { size: 32 });
claimEscrow({ args: [escrowId, secret] });
```

## 🔧 Key Contract Functions

### MagicLinkEscrow (Updated)
- `createEscrow(...)` - Create new escrow
- `claimEscrow(uint256, bytes32)` - ⚠️ **UPDATED**: Now accepts bytes32 secret
- `cancelEscrow(uint256)` - Cancel escrow
- `expireEscrow(uint256)` - Expire escrow and refund
- `getEscrow(uint256)` - Get escrow details

### Other Contracts (Unchanged)
- **TestTokens & AuraGovernanceToken (ERC20)**: Standard ERC20 functions
- **LiquidityPool (AMM)**: `addLiquidity`, `removeLiquidity`, `swap`, `getReserves`
- **Governance (DAO)**: `propose`, `vote`, `execute`, `getVotingPower`
- **Launchpad**: `createLaunch`, `contribute`, `finalizeLaunch`, `cancelLaunch`

## 📊 Gas Usage Information

| Contract | Deployment Gas |
|----------|----------------|
| TestTokens | 612,137 |
| AuraGovernanceToken | 1,961,952 |
| LPToken | 614,626 |
| LiquidityPool | 940,618 |
| Governance | 975,676 |
| Launchpad | 2,692,038 |
| MagicLinkEscrow | 1,109,791 |

## 🔍 Verification

All contracts have been deployed successfully on Avalanche Fuji Testnet. You can verify the contracts on [Snowtrace Fuji](https://testnet.snowtrace.io/) using the transaction hashes provided above.

## 🚀 Next Steps

1. **Update Frontend**: Update any existing MagicLinkEscrow integrations to use `bytes32` instead of `string`
2. **Test Integration**: Test all contract interactions with the new addresses
3. **UI Updates**: Ensure UI components handle the new parameter type correctly
4. **Documentation**: Update any API documentation that references the old function signature

## ⚠️ Important Notes

- **BREAKING CHANGE**: MagicLinkEscrow `claimEscrow` function now requires `bytes32` parameter
- All contracts are deployed on **Testnet** - use testnet AVAX for transactions
- The Launchpad contract was deployed with `--skip-size-check` flag due to size constraints
- Contract ownership and permissions have been properly configured
- All contract relationships have been established and verified

## 📞 Support

For any issues with contract integration or deployment, refer to the deployment logs in `/contract/broadcast/Deploy.s.sol/43113/run-latest.json`.

---

**Last Updated**: September 20, 2025  
**Deployment Block**: 46176037  
**Status**: ✅ All contracts successfully deployed and verified
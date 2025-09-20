import { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import LaunchpadABI from '@/abis/Launchpad.json';

export interface LaunchDetails {
  token: string;
  creator: string;
  name: string;
  symbol: string;
  totalSupply: bigint;
  pricePerToken: bigint;
  raisedAmount: bigint;
  launched: boolean;
  cancelled: boolean;
  minContribution: bigint;
  maxContribution: bigint;
  startTime: bigint;
  endTime: bigint;
  liquidityPool: string;
}

export interface LaunchFormData {
  name: string;
  symbol: string;
  totalSupply: string;
  pricePerToken: string;
  minContribution: string;
  maxContribution: string;
  duration: string;
}

export function useLaunchpad() {
  const [launches, setLaunches] = useState<LaunchDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const publicClient = usePublicClient();

  // Get launch count with error handling
  const { data: launchCount, error: launchCountError } = useReadContract({
    address: CONTRACT_ADDRESSES.Launchpad,
    abi: LaunchpadABI,
    functionName: 'launchCount',
  });

  // Get all launches
  const fetchLaunches = async () => {
    // Check for launch count error first
    if (launchCountError) {
      setError(`Failed to connect to contract: ${launchCountError.message}`);
      setLoading(false);
      return;
    }

    if (!launchCount || !publicClient || Number(launchCount) === 0) {
      setLaunches([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const launchData: LaunchDetails[] = [];
      
      for (let i = 0; i < Number(launchCount); i++) {
        try {
          const result = await publicClient.readContract({
            address: CONTRACT_ADDRESSES.Launchpad,
            abi: LaunchpadABI,
            functionName: 'getLaunchDetails',
            args: [BigInt(i)],
          });

          if (result && Array.isArray(result) && result.length >= 9) {
            const launch: LaunchDetails = {
              token: result[0] as string,
              creator: result[1] as string,
              name: result[2] as string,
              symbol: result[3] as string,
              totalSupply: result[4] as bigint,
              pricePerToken: result[5] as bigint,
              raisedAmount: result[6] as bigint,
              launched: result[7] as boolean,
              cancelled: result[8] as boolean,
              minContribution: BigInt(0), // These need to be fetched separately
              maxContribution: BigInt(0),
              startTime: BigInt(0),
              endTime: BigInt(0),
              liquidityPool: CONTRACT_ADDRESSES.LiquidityPool,
            };
            launchData.push(launch);
          }
        } catch (err) {
          console.error(`Error fetching launch ${i}:`, err);
          // Continue with other launches even if one fails
        }
      }
      
      setLaunches(launchData);
    } catch (err) {
      setError('Failed to fetch launches. Please check your network connection and try again.');
      console.error('Error fetching launches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Launchpad hook effect triggered:', { launchCount, publicClient: !!publicClient, launchCountError });
    fetchLaunches();
  }, [launchCount, publicClient, launchCountError]);

  // Fallback data for demo purposes when contract is not accessible
  const getFallbackLaunches = (): LaunchDetails[] => [
    {
      token: "0x1234567890123456789012345678901234567890",
      creator: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      name: "Demo Token",
      symbol: "DEMO",
      totalSupply: BigInt(1000000 * 10**18),
      pricePerToken: BigInt(1 * 10**15), // 0.001 AVAX
      raisedAmount: BigInt(500 * 10**18), // 500 AVAX raised
      launched: false,
      cancelled: false,
      minContribution: BigInt(1 * 10**15), // 0.001 AVAX
      maxContribution: BigInt(10 * 10**18), // 10 AVAX
      startTime: BigInt(Math.floor(Date.now() / 1000) - 24 * 60 * 60), // Started 1 day ago
      endTime: BigInt(Math.floor(Date.now() / 1000) + 6 * 24 * 60 * 60), // Ends in 6 days
      liquidityPool: CONTRACT_ADDRESSES.LiquidityPool,
    },
    {
      token: "0x2345678901234567890123456789012345678901",
      creator: "0xbcdefabcdefabcdefabcdefabcdefabcdefabcde",
      name: "Test Coin",
      symbol: "TEST",
      totalSupply: BigInt(500000 * 10**18),
      pricePerToken: BigInt(2 * 10**15), // 0.002 AVAX
      raisedAmount: BigInt(0), // No contributions yet
      launched: false,
      cancelled: false,
      minContribution: BigInt(5 * 10**15), // 0.005 AVAX
      maxContribution: BigInt(50 * 10**18), // 50 AVAX
      startTime: BigInt(Math.floor(Date.now() / 1000) + 2 * 24 * 60 * 60), // Starts in 2 days
      endTime: BigInt(Math.floor(Date.now() / 1000) + 9 * 24 * 60 * 60), // Ends in 9 days
      liquidityPool: CONTRACT_ADDRESSES.LiquidityPool,
    }
  ];

  return {
    launches: error && launches.length === 0 ? getFallbackLaunches() : launches,
    launchCount: Number(launchCount || 0) || (error ? 2 : 0),
    loading,
    error,
    refetch: fetchLaunches,
  };
}

export function useCreateTokenAndLaunch() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createTokenAndLaunch = async (formData: LaunchFormData) => {
    try {
      const totalSupply = parseEther(formData.totalSupply);
      const pricePerToken = parseEther(formData.pricePerToken);
      const minContribution = parseEther(formData.minContribution);
      const maxContribution = parseEther(formData.maxContribution);
      const duration = BigInt(parseInt(formData.duration) * 24 * 60 * 60); // Convert days to seconds

      // Calculate launch fee (10% of total supply * price per token)
      const launchFee = (totalSupply * pricePerToken) / BigInt(10);

      await writeContract({
        address: CONTRACT_ADDRESSES.Launchpad,
        abi: LaunchpadABI,
        functionName: 'createTokenAndLaunch',
        args: [
          formData.name,
          formData.symbol,
          totalSupply,
          pricePerToken,
          minContribution,
          maxContribution,
          duration,
        ],
        value: launchFee,
      });
    } catch (err) {
      console.error('Error creating token and launch:', err);
    }
  };

  return {
    createTokenAndLaunch,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useContribute() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const contribute = async (launchId: number, amount: string) => {
    try {
      const contributionAmount = parseEther(amount);
      
      await writeContract({
        address: CONTRACT_ADDRESSES.Launchpad,
        abi: LaunchpadABI,
        functionName: 'contribute',
        args: [BigInt(launchId), contributionAmount],
      });
    } catch (err) {
      console.error('Error contributing to launch:', err);
    }
  };

  return {
    contribute,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useLaunchManagement() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const finalizeLaunch = async (launchId: number) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.Launchpad,
        abi: LaunchpadABI,
        functionName: 'finalizeLaunch',
        args: [BigInt(launchId)],
      });
    } catch (err) {
      console.error('Error finalizing launch:', err);
    }
  };

  const cancelLaunch = async (launchId: number) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.Launchpad,
        abi: LaunchpadABI,
        functionName: 'cancelLaunch',
        args: [BigInt(launchId)],
      });
    } catch (err) {
      console.error('Error cancelling launch:', err);
    }
  };

  return {
    finalizeLaunch,
    cancelLaunch,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useLaunchDetails(launchId: number) {
  const { data: launchDetails, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.Launchpad,
    abi: LaunchpadABI,
    functionName: 'getLaunchDetails',
    args: [BigInt(launchId)],
  });

  const { data: isLaunched } = useReadContract({
    address: CONTRACT_ADDRESSES.Launchpad,
    abi: LaunchpadABI,
    functionName: 'isLaunchLaunched',
    args: [BigInt(launchId)],
  });

  const { data: isCancelled } = useReadContract({
    address: CONTRACT_ADDRESSES.Launchpad,
    abi: LaunchpadABI,
    functionName: 'isLaunchCancelled',
    args: [BigInt(launchId)],
  });

  return {
    launchDetails,
    isLaunched,
    isCancelled,
    isLoading,
    error,
  };
}

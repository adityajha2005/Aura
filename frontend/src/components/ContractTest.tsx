import { useState } from 'react';
import { usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import LaunchpadABI from '@/abis/Launchpad.json';

export function ContractTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);
  const publicClient = usePublicClient();

  const testContract = async () => {
    if (!publicClient) {
      setTestResult('No public client available');
      return;
    }

    setIsTesting(true);
    setTestResult('Testing contract connection...');

    try {
      // Test basic contract call
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.Launchpad,
        abi: LaunchpadABI,
        functionName: 'launchCount',
      });

      setTestResult(`✅ Contract accessible! Launch count: ${result}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResult(`❌ Contract error: ${errorMessage}`);
      console.error('Contract test error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-6">
      <h3 className="text-white font-semibold mb-2">Contract Connection Test</h3>
      <button
        onClick={testContract}
        disabled={isTesting}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm"
      >
        {isTesting ? 'Testing...' : 'Test Contract'}
      </button>
      {testResult && (
        <div className="mt-2 text-sm text-gray-300">
          {testResult}
        </div>
      )}
    </div>
  );
}

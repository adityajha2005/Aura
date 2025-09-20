import { useChainId, usePublicClient } from 'wagmi';

export function NetworkStatus() {
  const chainId = useChainId();
  const publicClient = usePublicClient();

  const isCorrectNetwork = chainId === 43113; // Avalanche Fuji Testnet
  const networkName = chainId === 43113 ? 'Avalanche Fuji Testnet' : `Chain ID: ${chainId}`;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`px-4 py-2 rounded-full text-sm font-medium ${
        isCorrectNetwork 
          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
          : 'bg-red-500/20 text-red-400 border border-red-500/30'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isCorrectNetwork ? 'bg-green-400' : 'bg-red-400'
          }`} />
          <span>{networkName}</span>
        </div>
        {!publicClient && (
          <div className="text-xs text-yellow-400 mt-1">
            RPC Connection: Disconnected
          </div>
        )}
      </div>
    </div>
  );
}

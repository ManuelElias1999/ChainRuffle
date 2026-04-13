import { useAccount, useChainId, useDisconnect } from 'wagmi';
import { getChainById } from '../config/chains';

export function useWallet() {
  const { address, isConnected, connector, status } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();

  const currentChain = getChainById(chainId);

  return {
    address,
    isConnected,
    connector,
    status,
    chainId,
    currentChain,
    disconnect,
  };
}
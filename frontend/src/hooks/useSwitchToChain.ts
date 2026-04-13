import { useSwitchChain } from 'wagmi';
import { CHAIN_CONFIG, type SupportedChainKey } from '../config/chains';

export function useSwitchToChain() {
  const { switchChain, isPending, error } = useSwitchChain();

  const switchToChain = (chainKey: SupportedChainKey) => {
    const chainId = CHAIN_CONFIG[chainKey].chainId;
    switchChain({ chainId });
  };

  return {
    switchToChain,
    isSwitching: isPending,
    switchError: error,
  };
}
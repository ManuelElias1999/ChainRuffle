import type { SupportedChainKey } from '../config/chains';
import { CHAIN_CONFIG } from '../config/chains';

export function isCorrectNetwork(
  selectedChain: SupportedChainKey,
  currentChainId?: number
) {
  if (!currentChainId) return false;
  return CHAIN_CONFIG[selectedChain].chainId === currentChainId;
}
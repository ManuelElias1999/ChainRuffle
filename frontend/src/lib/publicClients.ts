import { createPublicClient, http } from 'viem';
import { baseSepolia, avalancheFuji, arbitrumSepolia } from 'viem/chains';
import { CHAIN_CONFIG, type SupportedChainKey } from '../config/chains';

const clients = {
  base: createPublicClient({
    chain: baseSepolia,
    transport: http(CHAIN_CONFIG.base.rpcUrl),
  }),
  avalanche: createPublicClient({
    chain: avalancheFuji,
    transport: http(CHAIN_CONFIG.avalanche.rpcUrl),
  }),
  arbitrum: createPublicClient({
    chain: arbitrumSepolia,
    transport: http(CHAIN_CONFIG.arbitrum.rpcUrl),
  }),
} as const;

export function getPublicClient(chainKey: SupportedChainKey) {
  return clients[chainKey];
}
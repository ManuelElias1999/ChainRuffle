import { CHAIN_CONFIG, type SupportedChainKey } from '../config/chains';
import { chainRaffleAbi } from '../contracts/chainRaffleAbi';
import { erc20Abi } from '../contracts/erc20Abi';

export function getRaffleContract(chainKey: SupportedChainKey) {
  const chain = CHAIN_CONFIG[chainKey];

  return {
    address: chain.raffleAddress,
    abi: chainRaffleAbi,
  };
}

export function getUSDCContract(chainKey: SupportedChainKey) {
  const chain = CHAIN_CONFIG[chainKey];

  return {
    address: chain.usdcAddress,
    abi: erc20Abi,
  };
}
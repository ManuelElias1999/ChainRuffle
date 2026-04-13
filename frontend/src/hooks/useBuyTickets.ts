import { useWriteContract } from 'wagmi';
import type { SupportedChainKey } from '../config/chains';
import { getRaffleContract } from '../lib/contracts';

type BuyTicketsParams = {
  chainKey: SupportedChainKey;
  lotteryId: bigint;
  quantity: number;
};

export function useBuyTickets() {
  const {
    writeContractAsync,
    isPending: isBuyPending,
    error: buyError,
  } = useWriteContract();

  const buyTicketsAsync = async ({ chainKey, lotteryId, quantity }: BuyTicketsParams) => {
    const raffle = getRaffleContract(chainKey);

    return writeContractAsync({
      ...raffle,
      functionName: 'buyTickets',
      args: [lotteryId, BigInt(quantity)],
    });
  };

  return {
    buyTicketsAsync,
    isBuying: isBuyPending,
    buyError,
  };
}
import { useWriteContract } from 'wagmi';
import type { SupportedChainKey } from '../config/chains';
import { getRaffleContract } from '../lib/contracts';

type CloseLotteryParams = {
  chainKey: SupportedChainKey;
  lotteryId: bigint;
};

export function useCloseLottery() {
  const {
    writeContractAsync,
    isPending: isClosePending,
    error: closeError,
  } = useWriteContract();

  const closeLotteryAsync = async ({ chainKey, lotteryId }: CloseLotteryParams) => {
    const raffle = getRaffleContract(chainKey);

    return writeContractAsync({
      ...raffle,
      functionName: 'closeLottery',
      args: [lotteryId],
    });
  };

  return {
    closeLotteryAsync,
    isClosing: isClosePending,
    closeError,
  };
}
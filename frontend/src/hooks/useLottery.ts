import { useCallback, useEffect, useState } from 'react';
import type { SupportedChainKey } from '../config/chains';
import { getRaffleContract } from '../lib/contracts';
import { mapLotteryFromContract } from '../lib/lotteryMappers';
import { getPublicClient } from '../lib/publicClients';

type UseLotteryParams = {
  lotteryId?: bigint;
  chainKey: SupportedChainKey;
};

export function useLottery({ lotteryId, chainKey }: UseLotteryParams) {
  const [lottery, setLottery] = useState<ReturnType<typeof mapLotteryFromContract> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const refetch = useCallback(async () => {
    if (lotteryId === undefined) {
      setLottery(null);
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const client = getPublicClient(chainKey);
      const contract = getRaffleContract(chainKey);

      const data = await client.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'getLottery',
        args: [lotteryId],
      });

      const mapped = mapLotteryFromContract(data as any, chainKey);
      setLottery(mapped);
      return mapped;
    } catch (err) {
      console.error(`[useLottery:${chainKey}]`, err);
      setError(err);
      setLottery(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [lotteryId, chainKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    lottery,
    isLoading,
    error,
    refetch,
  };
}
import { useCallback, useEffect, useState } from 'react';
import type { SupportedChainKey } from '../config/chains';
import { getRaffleContract } from '../lib/contracts';
import { getPublicClient } from '../lib/publicClients';

type UseLotteryMetricsParams = {
  lotteryId?: bigint;
  chainKey: SupportedChainKey;
};

type LotteryMetricsState = {
  remainingTickets: bigint | null;
  currentPool: bigint | null;
  maxPool: bigint | null;
};

export function useLotteryMetrics({
  lotteryId,
  chainKey,
}: UseLotteryMetricsParams) {
  const [data, setData] = useState<LotteryMetricsState>({
    remainingTickets: null,
    currentPool: null,
    maxPool: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const refetch = useCallback(async () => {
    if (lotteryId === undefined) {
      setData({
        remainingTickets: null,
        currentPool: null,
        maxPool: null,
      });
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const client = getPublicClient(chainKey);
      const contract = getRaffleContract(chainKey);

      const [remainingTickets, currentPool, maxPool] = await Promise.all([
        client.readContract({
          address: contract.address,
          abi: contract.abi,
          functionName: 'remainingTickets',
          args: [lotteryId],
        }),
        client.readContract({
          address: contract.address,
          abi: contract.abi,
          functionName: 'currentPool',
          args: [lotteryId],
        }),
        client.readContract({
          address: contract.address,
          abi: contract.abi,
          functionName: 'maxPool',
          args: [lotteryId],
        }),
      ]);

      const next = {
        remainingTickets: remainingTickets as bigint,
        currentPool: currentPool as bigint,
        maxPool: maxPool as bigint,
      };

      setData(next);
      return next;
    } catch (err) {
      console.error(`[useLotteryMetrics:${chainKey}]`, err);
      setError(err);
      setData({
        remainingTickets: null,
        currentPool: null,
        maxPool: null,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [lotteryId, chainKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    ...data,
    isLoading,
    error,
    refetch,
  };
}
import { useCallback, useEffect, useState } from 'react';
import type { SupportedChainKey } from '../config/chains';
import { getRaffleContract } from '../lib/contracts';
import { getPublicClient } from '../lib/publicClients';

type UseLotteryParticipantsParams = {
  lotteryId?: bigint;
  chainKey?: SupportedChainKey;
  page?: bigint;
  pageSize?: bigint;
};

type ParticipantsState = {
  wallets: `0x${string}`[];
  ticketCounts: bigint[];
};

export function useLotteryParticipants({
  lotteryId,
  chainKey = 'base',
  page = 0n,
  pageSize = 25n,
}: UseLotteryParticipantsParams) {
  const [data, setData] = useState<ParticipantsState>({
    wallets: [],
    ticketCounts: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const refetch = useCallback(async () => {
    if (lotteryId === undefined) {
      setData({ wallets: [], ticketCounts: [] });
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const client = getPublicClient(chainKey);
      const contract = getRaffleContract(chainKey);

      const result = await client.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'getParticipantsPage',
        args: [lotteryId, page, pageSize],
      });

      const wallets = (result?.[0] ?? []) as `0x${string}`[];
      const ticketCounts = (result?.[1] ?? []) as bigint[];

      const next = { wallets, ticketCounts };
      setData(next);
      return next;
    } catch (err) {
      console.error(`[useLotteryParticipants:${chainKey}]`, err);
      setError(err);
      setData({ wallets: [], ticketCounts: [] });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [lotteryId, chainKey, page, pageSize]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    wallets: data.wallets,
    ticketCounts: data.ticketCounts,
    isLoading,
    error,
    refetch,
  };
}
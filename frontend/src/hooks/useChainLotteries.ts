import { useEffect, useState } from 'react';
import { getRaffleContract } from '../lib/contracts';
import { mapLotteryFromContract } from '../lib/lotteryMappers';
import type { Lottery } from '../types/lottery';
import type { SupportedChainKey } from '../config/chains';
import { getPublicClient } from '../lib/publicClients';

export function useChainLotteries(chainKey: SupportedChainKey) {
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const loadLotteries = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const client = getPublicClient(chainKey);
      const contract = getRaffleContract(chainKey);

      const total = await client.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: 'totalLotteries',
      });
      console.log(`[${chainKey}] totalLotteries:`, total.toString());

      const totalNumber = Number(total);

      if (!Number.isFinite(totalNumber) || totalNumber <= 0) {
        setLotteries([]);
        return;
      }

      const ids = Array.from({ length: totalNumber }, (_, i) => BigInt(i + 1));

      const results = await Promise.allSettled(
        ids.map((id) =>
          client.readContract({
            address: contract.address,
            abi: contract.abi,
            functionName: 'getLottery',
            args: [id],
          })
        )
      );

      const mapped: Lottery[] = [];

      for (const result of results) {
        if (result.status === 'fulfilled') {
          mapped.push(mapLotteryFromContract(result.value as any, chainKey));
        } else {
          console.warn(`[${chainKey}] No se pudo leer una lotería`, result.reason);
        }
      }

      setLotteries(mapped);
    } catch (err) {
      console.error(`[${chainKey}] Error cargando loterías`, err);
      setError(err);
      setLotteries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLotteries();
  }, [chainKey]);

  return {
    lotteries,
    openLotteries: lotteries.filter((lottery) => lottery.isOpen),
    isLoading,
    error,
    refetch: loadLotteries,
  };
}
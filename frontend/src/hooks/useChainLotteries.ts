import { useCallback, useEffect, useState } from 'react';
import { getRaffleContract } from '../lib/contracts';
import { mapLotteryFromContract } from '../lib/lotteryMappers';
import type { Lottery } from '../types/lottery';
import type { SupportedChainKey } from '../config/chains';
import { getPublicClient } from '../lib/publicClients';

export function useChainLotteries(chainKey: SupportedChainKey) {
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const loadLotteries = useCallback(async () => {
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

      setLotteries((prev) => {
        const prevMap = new Map<string, Lottery>(
          prev.map((lottery) => [lottery.id.toString(), lottery])
        );

        const nextMap = new Map<string, Lottery>();

        ids.forEach((id, index) => {
          const result = results[index];
          const idKey = id.toString();

          if (result.status === 'fulfilled') {
            const mapped = mapLotteryFromContract(result.value as any, chainKey);
            nextMap.set(idKey, mapped);
          } else {
            console.warn(`[${chainKey}] No se pudo leer la lotería ${idKey}`, result.reason);

            const previousLottery = prevMap.get(idKey);
            if (previousLottery) {
              nextMap.set(idKey, previousLottery);
            }
          }
        });

        const merged = Array.from(nextMap.values()).sort((a, b) => Number(b.id - a.id));
        return merged;
      });
    } catch (err) {
      console.error(`[${chainKey}] Error cargando loterías`, err);
      setError(err);
      // mantener últimos datos buenos
    } finally {
      setIsLoading(false);
    }
  }, [chainKey]);

  useEffect(() => {
    loadLotteries();
  }, [loadLotteries]);

  return {
    lotteries,
    openLotteries: lotteries.filter((lottery) => lottery.isOpen),
    isLoading,
    error,
    refetch: loadLotteries,
  };
}
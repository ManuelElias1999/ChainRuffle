import { useEffect, useMemo, useRef, useState } from 'react';
import type { Address } from 'viem';
import { getPublicClient } from '../lib/publicClients';
import { getRaffleContract } from '../lib/contracts';
import type { Lottery } from '../types/lottery';

type ParticipationMap = Record<string, bigint>;

export function useParticipationMap(lotteries: Lottery[], address?: Address) {
  const [participationMap, setParticipationMap] = useState<ParticipationMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const requestKey = useMemo(() => {
    const ids = lotteries.map((l) => `${l.chain}:${l.id.toString()}`).join('|');
    return `${address ?? 'no-address'}::${ids}::${refreshNonce}`;
  }, [lotteries, address, refreshNonce]);

  const lastLoadedKeyRef = useRef<string>('');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!address || lotteries.length === 0) {
        setParticipationMap({});
        setIsLoading(false);
        setHasError(false);
        lastLoadedKeyRef.current = requestKey;
        return;
      }

      if (lastLoadedKeyRef.current === requestKey) return;

      try {
        setIsLoading(true);
        setHasError(false);

        const results = await Promise.all(
          lotteries.map(async (lottery) => {
            try {
              const client = getPublicClient(lottery.chain);
              const contract = getRaffleContract(lottery.chain);

              const tickets = (await client.readContract({
                address: contract.address,
                abi: contract.abi,
                functionName: 'ticketsByUser',
                args: [lottery.id, address],
              })) as bigint;

              return {
                key: `${lottery.chain}:${lottery.id.toString()}`,
                tickets,
              };
            } catch (err) {
              console.error(
                `[useParticipationMap] ${lottery.chain}:${lottery.id.toString()}`,
                err
              );
              return {
                key: `${lottery.chain}:${lottery.id.toString()}`,
                tickets: 0n,
              };
            }
          })
        );

        if (cancelled) return;

        const nextMap: ParticipationMap = {};
        for (const item of results) {
          nextMap[item.key] = item.tickets;
        }

        setParticipationMap(nextMap);
        lastLoadedKeyRef.current = requestKey;
      } catch (err) {
        if (cancelled) return;
        console.error('[useParticipationMap] global error', err);
        setHasError(true);
        setParticipationMap({});
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [requestKey, lotteries, address]);

  return {
    participationMap,
    isLoading,
    hasError,
    refetch: async () => {
      setRefreshNonce((prev) => prev + 1);
    },
  };
}
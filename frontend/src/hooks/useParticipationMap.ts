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

        const results = await Promise.allSettled(
          lotteries.map(async (lottery) => {
            const client = getPublicClient(lottery.chain);
            const contract = getRaffleContract(lottery.chain);
            const key = `${lottery.chain}:${lottery.id.toString()}`;

            let tickets = 0n;

            // 1) Intentar por ticketsByUser
            try {
              const readTickets = (await client.readContract({
                address: contract.address,
                abi: contract.abi,
                functionName: 'ticketsByUser',
                args: [lottery.id, address],
              })) as bigint;

              tickets = readTickets;
            } catch (err) {
              console.error(`[useParticipationMap:ticketsByUser] ${key}`, err);
            }

            // 2) Fallback: revisar participants page
            if (tickets === 0n) {
              try {
                const participantLimit =
                  lottery.uniqueParticipants > 0n ? lottery.uniqueParticipants : 50n;

                const page = (await client.readContract({
                  address: contract.address,
                  abi: contract.abi,
                  functionName: 'getParticipantsPage',
                  args: [lottery.id, 0n, participantLimit],
                })) as readonly [readonly `0x${string}`[], readonly bigint[]];

                const wallets = page[0] ?? [];
                const ticketCounts = page[1] ?? [];

                const index = wallets.findIndex(
                  (wallet) => wallet.toLowerCase() === address.toLowerCase()
                );

                if (index >= 0) {
                  tickets = ticketCounts[index] ?? 0n;
                }
              } catch (err) {
                console.error(`[useParticipationMap:getParticipantsPage] ${key}`, err);
              }
            }

            return {
              key,
              tickets,
            };
          })
        );

        if (cancelled) return;

        setParticipationMap((prev) => {
          const nextMap: ParticipationMap = { ...prev };

          results.forEach((result, index) => {
            const lottery = lotteries[index];
            const key = `${lottery.chain}:${lottery.id.toString()}`;

            if (result.status === 'fulfilled') {
              nextMap[key] = result.value.tickets;
            } else {
              console.error(`[useParticipationMap] ${key}`, result.reason);
              if (!(key in nextMap)) {
                nextMap[key] = 0n;
              }
            }
          });

          return nextMap;
        });

        lastLoadedKeyRef.current = requestKey;
      } catch (err) {
        if (cancelled) return;
        console.error('[useParticipationMap] global error', err);
        setHasError(true);
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
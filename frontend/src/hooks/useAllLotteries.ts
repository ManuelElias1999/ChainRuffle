import { useCallback, useEffect, useRef } from 'react';
import { useChainLotteries } from './useChainLotteries';

export function useAllLotteries() {
  const base = useChainLotteries('base');
  const avalanche = useChainLotteries('avalanche');
  const arbitrum = useChainLotteries('arbitrum');

  const lotteries = [
    ...base.lotteries,
    ...avalanche.lotteries,
    ...arbitrum.lotteries,
  ];

  const openLotteries = lotteries.filter((lottery) => lottery.isOpen);

  const isLoading = base.isLoading || avalanche.isLoading || arbitrum.isLoading;

  const errors = {
    base: base.error,
    avalanche: avalanche.error,
    arbitrum: arbitrum.error,
  };

  const hasError = Boolean(base.error || avalanche.error || arbitrum.error);

  const refetch = useCallback(async () => {
    await Promise.all([
      Promise.resolve(base.refetch()),
      Promise.resolve(avalanche.refetch()),
      Promise.resolve(arbitrum.refetch()),
    ]);
  }, [base.refetch, avalanche.refetch, arbitrum.refetch]);

  const didSoftRefreshRef = useRef(false);

  useEffect(() => {
    if (didSoftRefreshRef.current) return;
    didSoftRefreshRef.current = true;

    let cancelled = false;

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const run = async () => {
      await sleep(1800);

      if (!cancelled) {
        await refetch();
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [refetch]);

  return {
    lotteries,
    openLotteries,
    isLoading,
    hasError,
    errors,
    refetch,
  };
}
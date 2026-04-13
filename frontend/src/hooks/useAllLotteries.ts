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

  const refetch = () => {
    base.refetch();
    avalanche.refetch();
    arbitrum.refetch();
  };

  return {
    lotteries,
    openLotteries,
    isLoading,
    hasError,
    errors,
    refetch,
  };
}
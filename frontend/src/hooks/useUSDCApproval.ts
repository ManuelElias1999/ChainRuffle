import { useReadContract, useWriteContract } from 'wagmi';
import type { Address } from 'viem';
import type { SupportedChainKey } from '../config/chains';
import { getUSDCContract, getRaffleContract } from '../lib/contracts';

type UseUSDCApprovalParams = {
  chainKey: SupportedChainKey;
  owner?: Address;
  requiredAmount: bigint;
};

export function useUSDCApproval({
  chainKey,
  owner,
  requiredAmount,
}: UseUSDCApprovalParams) {
  const usdc = getUSDCContract(chainKey);
  const raffle = getRaffleContract(chainKey);

  const {
    data: allowance,
    refetch: refetchAllowance,
    isLoading: isAllowanceLoading,
  } = useReadContract({
    ...usdc,
    functionName: 'allowance',
    args: owner ? [owner, raffle.address] : undefined,
    query: {
      enabled: Boolean(owner),
    },
  });

  const {
    writeContractAsync,
    isPending: isApprovePending,
    error: approveError,
  } = useWriteContract();

  const currentAllowance = allowance ?? 0n;
  const hasEnoughAllowance = currentAllowance >= requiredAmount;

  const approveAsync = async () => {
    return writeContractAsync({
      ...usdc,
      functionName: 'approve',
      args: [raffle.address, requiredAmount],
    });
  };

  return {
    allowance: currentAllowance,
    hasEnoughAllowance,
    approveAsync,
    isAllowanceLoading,
    isApproving: isApprovePending,
    approveError,
    refetchAllowance,
  };
}
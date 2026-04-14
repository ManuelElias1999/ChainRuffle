import { motion } from 'motion/react';
import { useTranslation } from '../context/TranslationContext';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Share2,
  QrCode,
  Trophy,
  Users,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Wallet,
  Percent,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { waitForTransactionReceipt } from '@wagmi/core';
import { wagmiConfig } from '../../config/wagmi';
import { useLottery } from '../../hooks/useLottery';
import { useLotteryMetrics } from '../../hooks/useLotteryMetrics';
import { useLotteryParticipants } from '../../hooks/useLotteryParticipants';
import { useSwitchToChain } from '../../hooks/useSwitchToChain';
import { useUSDCApproval } from '../../hooks/useUSDCApproval';
import { useBuyTickets } from '../../hooks/useBuyTickets';
import { CHAIN_CONFIG, type SupportedChainKey } from '../../config/chains';
import { formatAddress, formatUSDC } from '../../lib/formatters';
import { useCloseLottery } from '../../hooks/useCloseLottery';
import { getPublicClient } from '../../lib/publicClients';
import { getRaffleContract } from '../../lib/contracts';
import {
  addActivityItem,
  getLotteryTxRegistry,
  saveBuyTxHash,
  saveCloseTxHash,
} from '../../lib/txRegistry';

interface LotteryDetailProps {
  lotteryId: string;
  setCurrentPage: (page: string) => void;
}

const chainColors: Record<SupportedChainKey, string> = {
  base: 'from-blue-500 to-blue-600',
  avalanche: 'from-red-500 to-red-600',
  arbitrum: 'from-cyan-500 to-cyan-600',
};

function parseLotteryParam(value: string): {
  chainKey: SupportedChainKey;
  id: bigint;
} {
  const parts = value.includes(':') ? value.split(':') : value.split('-');

  if (
    parts.length === 2 &&
    ['base', 'avalanche', 'arbitrum'].includes(parts[0])
  ) {
    return {
      chainKey: parts[0] as SupportedChainKey,
      id: BigInt(parts[1]),
    };
  }

  return {
    chainKey: 'base',
    id: BigInt(value),
  };
}

type PurchaseStep =
  | 'idle'
  | 'approving'
  | 'approved'
  | 'buying'
  | 'success'
  | 'error';

export function LotteryDetail({
  lotteryId,
  setCurrentPage,
}: LotteryDetailProps) {
  const { t } = useTranslation();
  const { address, isConnected, chainId } = useAccount();
  const { switchToChain, isSwitching } = useSwitchToChain();

  const [quantityInput, setQuantityInput] = useState('1');
  const [showQR, setShowQR] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep>('idle');
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [purchaseError, setPurchaseError] = useState('');
  const [isClosingFlow, setIsClosingFlow] = useState(false);
  const [closeMessage, setCloseMessage] = useState('');
  const [createTxHash, setCreateTxHash] = useState<`0x${string}` | null>(null);
  const [purchaseTxHash, setPurchaseTxHash] = useState<`0x${string}` | null>(
    null
  );
  const [closeTxHash, setCloseTxHash] = useState<`0x${string}` | null>(null);
  const [participantsOffset, setParticipantsOffset] = useState(0n);

  const pageSize = 25n;
  const { chainKey, id } = parseLotteryParam(lotteryId);
  const { closeLotteryAsync, isClosing, closeError } = useCloseLottery();
  const chain = CHAIN_CONFIG[chainKey];
  const isCorrectChain = chainId === chain.chainId;

  const { lottery, isLoading, error, refetch } = useLottery({
    lotteryId: id,
    chainKey,
  });

  const metrics = useLotteryMetrics({
    lotteryId: id,
    chainKey,
  });

  const participants = useLotteryParticipants({
    lotteryId: id,
    chainKey,
    page: participantsOffset,
    pageSize,
  });

  useEffect(() => {
    const stored = getLotteryTxRegistry(chainKey, id);
    setCreateTxHash(stored.createTxHash ?? null);
    setPurchaseTxHash(stored.buyTxHashes?.[0] ?? null);
    setCloseTxHash(stored.closeTxHash ?? null);
  }, [chainKey, id]);

  const ticketPrice = lottery?.ticketPrice ?? 0n;
  const maxTickets = lottery?.maxTickets ?? 0n;
  const ticketsSold = lottery?.ticketsSold ?? 0n;
  const remainingTickets = metrics.remainingTickets ?? maxTickets - ticketsSold;
  const currentPool = metrics.currentPool ?? lottery?.totalRaised ?? 0n;
  const totalParticipants = lottery?.uniqueParticipants ?? 0n;
  const winnerPayout = (currentPool * 80n) / 100n;
  const creatorPayout = (currentPool * 10n) / 100n;
  const feesPayout = currentPool - winnerPayout - creatorPayout;

  const parsedQuantity = Number(quantityInput);
  const isQuantityInvalid =
    quantityInput.trim() === '' ||
    !Number.isFinite(parsedQuantity) ||
    !Number.isInteger(parsedQuantity) ||
    parsedQuantity <= 0;

  const quantitySafe = useMemo(() => {
    if (isQuantityInvalid) return 1;

    const maxAllowed = Number(remainingTickets > 0n ? remainingTickets : 1n);
    return Math.max(1, Math.min(parsedQuantity, maxAllowed));
  }, [isQuantityInvalid, parsedQuantity, remainingTickets]);

  const requiredAmount = BigInt(quantitySafe) * ticketPrice;

  const {
    hasEnoughAllowance,
    approveAsync,
    isApproving,
    approveError,
    refetchAllowance,
  } = useUSDCApproval({
    chainKey,
    owner: address,
    requiredAmount,
  });

  const { buyTicketsAsync, isBuying, buyError } = useBuyTickets();

  const progress =
    maxTickets > 0n ? Number((ticketsSold * 10000n) / maxTickets) / 100 : 0;

  const isCreator =
    !!address &&
    !!lottery &&
    lottery.creator.toLowerCase() === address.toLowerCase();

  const isProcessing =
    purchaseStep === 'approving' ||
    purchaseStep === 'approved' ||
    purchaseStep === 'buying' ||
    isApproving ||
    isBuying;

  const totalPages =
    totalParticipants > 0n
      ? Math.ceil(Number(totalParticipants) / Number(pageSize))
      : 1;

  const currentPage =
    totalParticipants > 0n
      ? Math.floor(Number(participantsOffset) / Number(pageSize)) + 1
      : 1;

  const pageStart = totalParticipants > 0n ? Number(participantsOffset) + 1 : 0;
  const pageEnd =
    totalParticipants > 0n
      ? Math.min(Number(participantsOffset + pageSize), Number(totalParticipants))
      : 0;

  const canGoPrev = participantsOffset > 0n;
  const canGoNext = participantsOffset + pageSize < totalParticipants;

  const canBuy =
    isConnected &&
    isCorrectChain &&
    !isQuantityInvalid &&
    remainingTickets > 0n &&
    BigInt(quantitySafe) <= remainingTickets &&
    !isProcessing;

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const refreshAll = async () => {
    await Promise.all([
      refetch(),
      metrics.refetch(),
      participants.refetch(),
      refetchAllowance(),
    ]);
  };

  const resetPurchaseState = () => {
    setPurchaseStep('idle');
    setPurchaseMessage('');
    setPurchaseError('');
  };

  const waitForEnoughAllowance = async () => {
    for (let i = 0; i < 8; i++) {
      const result = await refetchAllowance();
      const value = result.data ?? 0n;
      if (value >= requiredAmount) return value;
      await sleep(800);
    }
    return 0n;
  };

  const waitForLotteryStateAfterBuy = async () => {
    const client = getPublicClient(chainKey);
    const raffle = getRaffleContract(chainKey);

    const previousTicketsSold = ticketsSold;
    const previousRemainingTickets = remainingTickets;
    const previousCurrentPool = currentPool;

    for (let i = 0; i < 12; i++) {
      const [freshLottery, freshRemaining, freshCurrentPool] = await Promise.all([
        client.readContract({
          address: raffle.address,
          abi: raffle.abi,
          functionName: 'getLottery',
          args: [id],
        }),
        client.readContract({
          address: raffle.address,
          abi: raffle.abi,
          functionName: 'remainingTickets',
          args: [id],
        }),
        client.readContract({
          address: raffle.address,
          abi: raffle.abi,
          functionName: 'currentPool',
          args: [id],
        }),
      ]);

      const freshIsOpen = Array.isArray(freshLottery)
        ? freshLottery[8]
        : freshLottery.isOpen;

      const freshTicketsSold = Array.isArray(freshLottery)
        ? freshLottery[5]
        : freshLottery.ticketsSold;

      const changed =
        freshTicketsSold !== previousTicketsSold ||
        freshRemaining !== previousRemainingTickets ||
        freshCurrentPool !== previousCurrentPool;

      if (changed || !freshIsOpen) {
        return { isOpen: freshIsOpen };
      }

      await sleep(1000);
    }

    return null;
  };

  const waitForLotteryToClose = async () => {
    const client = getPublicClient(chainKey);
    const raffle = getRaffleContract(chainKey);

    for (let i = 0; i < 12; i++) {
      const freshLottery = await client.readContract({
        address: raffle.address,
        abi: raffle.abi,
        functionName: 'getLottery',
        args: [id],
      });

      const openValue = Array.isArray(freshLottery)
        ? freshLottery[8]
        : freshLottery.isOpen;

      if (!openValue) return true;
      await sleep(1000);
    }

    return false;
  };

  const handlePrimaryPurchase = async () => {
    if (!isConnected || !isCorrectChain) return;
    if (isQuantityInvalid) return;
    if (quantitySafe <= 0 || remainingTickets <= 0n) return;
    if (BigInt(quantitySafe) > remainingTickets) return;

    resetPurchaseState();

    try {
      const allowanceResult = await refetchAllowance();
      const freshAllowance = allowanceResult.data ?? 0n;
      const needsApproval = freshAllowance < requiredAmount;

      if (needsApproval) {
        setPurchaseStep('approving');
        setPurchaseMessage(t('detail.purchase_approve_wallet'));

        const approveHash = await approveAsync();

        await waitForTransactionReceipt(wagmiConfig, {
          hash: approveHash,
        });

        setPurchaseStep('approved');
        setPurchaseMessage(t('detail.purchase_verifying_allowance'));

        const refreshedAllowance = await waitForEnoughAllowance();

        if (refreshedAllowance < requiredAmount) {
          setPurchaseStep('error');
          setPurchaseError(t('detail.purchase_allowance_not_ready'));
          return;
        }
      }

      setPurchaseStep('buying');
      setPurchaseMessage(t('detail.purchase_confirm_buy_wallet'));

      const buyHash = await buyTicketsAsync({
        chainKey,
        lotteryId: id,
        quantity: quantitySafe,
      });

      setPurchaseTxHash(buyHash);
      saveBuyTxHash(chainKey, id, buyHash);

      addActivityItem({
        type: 'buy',
        chainKey,
        lotteryId: id,
        lotteryName: lottery?.name,
        txHash: buyHash,
      });

      await waitForTransactionReceipt(wagmiConfig, {
        hash: buyHash,
      });

      const finalState = await waitForLotteryStateAfterBuy();
      await refreshAll();

      if (finalState && !finalState.isOpen) {
        setPurchaseStep('success');
        setPurchaseMessage(
          t('detail.purchase_success_closed', {
            count: quantitySafe.toString(),
          })
        );
        return;
      }

      setPurchaseStep('success');
      setPurchaseMessage(
        t('detail.purchase_success', {
          count: quantitySafe.toString(),
        })
      );
    } catch (err) {
      console.error(err);
      await refetchAllowance();
      setPurchaseStep('error');
      setPurchaseError(t('detail.purchase_error'));
    }
  };

  const handleCloseLottery = async () => {
    if (!isConnected || !isCorrectChain || !isCreator || !lottery?.isOpen) return;

    try {
      setIsClosingFlow(true);
      setCloseMessage(t('detail.close_confirm_wallet'));

      const closeHash = await closeLotteryAsync({
        chainKey,
        lotteryId: id,
      });

      setCloseTxHash(closeHash);
      saveCloseTxHash(chainKey, id, closeHash);

      addActivityItem({
        type: 'close',
        chainKey,
        lotteryId: id,
        lotteryName: lottery?.name,
        txHash: closeHash,
      });

      await waitForTransactionReceipt(wagmiConfig, {
        hash: closeHash,
      });

      setCloseMessage(t('detail.close_updating'));

      const closed = await waitForLotteryToClose();
      await refreshAll();

      if (closed) {
        setCloseMessage(t('detail.close_success'));
      } else {
        setCloseMessage(t('detail.close_delayed'));
      }
    } catch (err) {
      console.error(err);
      setCloseMessage(t('detail.close_error'));
    } finally {
      setIsClosingFlow(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto rounded-3xl border border-border bg-card p-10 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">{t('detail.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !lottery) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto rounded-3xl border border-border bg-card p-10 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-yellow-500" />
          <p className="text-muted-foreground mb-6">{t('detail.load_error')}</p>
          <button
            onClick={() => setCurrentPage('explore')}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground"
          >
            {t('detail.back_to_explorer')}
          </button>
        </div>
      </div>
    );
  }

  const showActionPanel = lottery.isOpen;
  const showResultPanel = !lottery.isOpen;

  const ExplorerButton = ({
    href,
    label,
  }: {
    href: string;
    label: string;
  }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
    >
      {label}
      <ExternalLink className="w-4 h-4" />
    </a>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => setCurrentPage('explore')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('detail.back_to_explorer')}
      </button>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-2 rounded-3xl border border-border bg-card p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm bg-gradient-to-r ${chainColors[chainKey]} mb-4`}
              >
                <Wallet className="w-4 h-4" />
                {chain.name}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                {lottery.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>
                  {t('lottery.id')}: {lottery.id.toString()}
                </span>
                <span>•</span>
                <span>
                  {t('detail.creator')}: {formatAddress(lottery.creator)}
                </span>
                {!lottery.isOpen && (
                  <>
                    <span>•</span>
                    <span>
                      {lottery.hasWinner
                        ? t('detail.status_finished_with_winner')
                        : t('detail.status_finished_without_winner')}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={async () => {
                  const shareUrl = `${window.location.origin}${window.location.pathname}?lottery=${chainKey}:${id.toString()}`;

                  try {
                    if (navigator.share) {
                      await navigator.share({
                        title: lottery.name,
                        text: `${t('detail.share_lottery_text')}: ${lottery.name}`,
                        url: shareUrl,
                      });
                    } else if (navigator.clipboard?.writeText) {
                      await navigator.clipboard.writeText(shareUrl);
                      alert(t('detail.link_copied'));
                    } else {
                      window.prompt(t('detail.copy_this_link'), shareUrl);
                    }
                  } catch (err) {
                    console.error('Share failed:', err);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-all"
              >
                <Share2 className="w-4 h-4" />
                {t('detail.share')}
              </button>

              {createTxHash && (
                <ExplorerButton
                  href={`${chain.explorer}/tx/${createTxHash}`}
                  label={t('detail.view_creation_explorer')}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl border border-border bg-background/40 p-4">
              <div className="text-sm text-muted-foreground mb-1">
                {t('lottery.price')}
              </div>
              <div className="text-xl font-semibold">
                {formatUSDC(ticketPrice)} USDC
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background/40 p-4">
              <div className="text-sm text-muted-foreground mb-1">
                {t('lottery.sold')}
              </div>
              <div className="text-xl font-semibold">{ticketsSold.toString()}</div>
            </div>

            <div className="rounded-2xl border border-border bg-background/40 p-4">
              <div className="text-sm text-muted-foreground mb-1">
                {t('lottery.remaining')}
              </div>
              <div className="text-xl font-semibold">
                {remainingTickets.toString()}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background/40 p-4">
              <div className="text-sm text-muted-foreground mb-1">
                {t('lottery.pool')}
              </div>
              <div className="text-xl font-semibold">
                {formatUSDC(currentPool)} USDC
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-muted-foreground">{t('detail.progress')}</span>
              <span className="font-medium">{progress.toFixed(1)}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {lottery.hasWinner && (
            <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4 mb-8">
              <div className="flex items-center gap-2 font-medium mb-1">
                <Trophy className="w-5 h-5 text-green-500" />
                {t('detail.winner')}: {formatAddress(lottery.winner)}
              </div>
            </div>
          )}

          {!lottery.isOpen && !lottery.hasWinner && (
            <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 mb-8">
              <div className="flex items-center gap-2 font-medium">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                {t('detail.closed_without_winner')}
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-border bg-background/30 p-6">
            <h3 className="text-xl font-semibold mb-4">{t('detail.transparency')}</h3>

            <div className="flex items-center justify-between gap-3 mb-4 text-sm text-muted-foreground">
              <div>
                {totalParticipants > 0n
                  ? t('detail.participants_range', {
                      start: pageStart.toString(),
                      end: pageEnd.toString(),
                      total: totalParticipants.toString(),
                    })
                  : t('detail.no_participants')}
              </div>

              <div className="inline-flex items-center gap-2">
                <Users className="w-4 h-4" />
                {totalParticipants.toString()}
              </div>
            </div>

            {participants.wallets.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-muted-foreground">
                {t('detail.no_participants')}
              </div>
            )}

            <div className="space-y-3">
              {participants.wallets.map((wallet, i) => (
                <div
                  key={`${wallet}-${i}`}
                  className="flex items-center justify-between rounded-2xl border border-border p-4"
                >
                  <span className="font-mono text-sm">{formatAddress(wallet)}</span>
                  <span className="text-sm text-muted-foreground">
                    {participants.ticketCounts[i]?.toString() ?? '0'}{' '}
                    {t('detail.tickets')}
                  </span>
                </div>
              ))}
            </div>

            {totalParticipants > pageSize && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
                <button
                  onClick={() =>
                    setParticipantsOffset((prev) =>
                      prev >= pageSize ? prev - pageSize : 0n
                    )
                  }
                  disabled={!canGoPrev}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('detail.previous')}
                </button>

                <span className="text-sm text-muted-foreground">
                  {t('detail.page_of', {
                    current: currentPage.toString(),
                    total: totalPages.toString(),
                  })}
                </span>

                <button
                  onClick={() => setParticipantsOffset((prev) => prev + pageSize)}
                  disabled={!canGoNext}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('detail.next')}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-6"
        >
          {showActionPanel && (
            <div className="rounded-3xl border border-border bg-card p-6">
              <h3 className="text-xl font-semibold mb-4">{t('detail.purchase')}</h3>

              {!isConnected ? (
                <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-muted-foreground">
                  {t('detail.connect_wallet_to_buy')}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">
                      {t('detail.quantity')}
                    </label>
                    <button
                      onClick={() => {
                        setQuantityInput(
                          (remainingTickets > 0n ? remainingTickets : 1n).toString()
                        );
                        resetPurchaseState();
                      }}
                      className="text-sm px-3 py-1 rounded-lg border border-border hover:bg-muted transition-all"
                    >
                      {t('detail.max')}
                    </button>
                  </div>

                  <input
                    type="number"
                    min={1}
                    max={remainingTickets.toString()}
                    value={quantityInput}
                    onChange={(e) => {
                      setQuantityInput(e.target.value);
                      resetPurchaseState();
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />

                  {isQuantityInvalid && (
                    <p className="text-sm text-red-500 mt-2">
                      {t('detail.invalid_quantity')}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="rounded-2xl border border-border p-4">
                      <div className="text-sm text-muted-foreground mb-1">
                        {t('lottery.price')}
                      </div>
                      <div className="font-semibold">
                        {formatUSDC(ticketPrice)} USDC
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border p-4">
                      <div className="text-sm text-muted-foreground mb-1">
                        {t('detail.total')}
                      </div>
                      <div className="font-semibold">
                        {isQuantityInvalid
                          ? `0 USDC`
                          : `${formatUSDC(requiredAmount)} USDC`}
                      </div>
                    </div>
                  </div>

                  {!isCorrectChain && (
                    <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 mt-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <div>
                          <div className="font-medium mb-1">
                            {t('detail.wrong_network')}
                          </div>
                          <div className="text-sm text-muted-foreground mb-3">
                            {t('detail.view_any_chain_interact_same_chain', {
                              chain: chain.name,
                            })}
                          </div>
                          <button
                            onClick={() => switchToChain(chainKey)}
                            disabled={isSwitching}
                            className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
                          >
                            {isSwitching
                              ? t('detail.switching_network')
                              : t('detail.switch_to_chain', { chain: chain.name })}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl border border-border p-4 mt-4">
                    <div className="flex items-center gap-2 font-medium mb-2">
                      <Percent className="w-4 h-4" />
                      {t('detail.purchase_flow')}
                      {(purchaseStep === 'approved' ||
                        purchaseStep === 'buying' ||
                        purchaseStep === 'success') && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                    </div>

                    {purchaseStep === 'idle' && !hasEnoughAllowance && (
                      <p className="text-sm text-muted-foreground">
                        {t('detail.purchase_flow_explain_approve_then_buy')}
                      </p>
                    )}

                    {purchaseMessage && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {purchaseMessage}
                      </p>
                    )}

                    {purchaseError && (
                      <p className="text-sm text-red-500 mt-2">{purchaseError}</p>
                    )}
                  </div>

                  <button
                    onClick={handlePrimaryPurchase}
                    disabled={!canBuy}
                    className="w-full mt-4 px-4 py-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                    {purchaseStep === 'idle' && t('detail.buy_tickets')}
                    {purchaseStep === 'approving' && t('detail.button_approving')}
                    {purchaseStep === 'approved' && t('detail.button_preparing')}
                    {purchaseStep === 'buying' && t('detail.button_buying')}
                    {purchaseStep === 'success' && t('detail.buy_again')}
                    {purchaseStep === 'error' && t('detail.try_again')}
                  </button>

                  {purchaseTxHash && (
                        <ExplorerButton
                          href={`${chain.explorerUrl}/tx/${purchaseTxHash}`}
                          label={t('detail.view_purchase_explorer')}
                        />
                  )}

                  {(approveError || buyError) && purchaseStep !== 'error' && (
                    <p className="text-sm text-red-500 mt-3">
                      {t('detail.transaction_incomplete')}
                    </p>
                  )}

                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="w-full mt-4 px-4 py-2 rounded-xl border border-border hover:bg-muted/50 transition-all flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    {t('detail.qr.title')}
                  </button>

                  {showQR && (
                    <div className="rounded-2xl border border-border p-4 mt-4 text-sm text-muted-foreground">
                      {t('detail.qr.steps')}
                    </div>
                  )}

                  {isCreator && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <button
                        onClick={handleCloseLottery}
                        disabled={isClosingFlow || isClosing || !lottery.isOpen}
                        className="w-full px-4 py-3 rounded-xl border border-border hover:bg-muted/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {(isClosingFlow || isClosing) && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        {isClosingFlow || isClosing
                          ? t('detail.button_closing')
                          : t('detail.close')}
                      </button>

                      {closeMessage && (
                        <p className="text-sm text-muted-foreground mt-3">
                          {closeMessage}
                        </p>
                      )}

                      {closeTxHash && (
                        <div className="mt-3">
                          <ExplorerButton
                            href={`${chain.explorer}/tx/${closeTxHash}`}
                            label={t('detail.view_close_tx')}
                          />
                        </div>
                      )}

                      {closeError && (
                        <p className="text-sm text-red-500 mt-3">
                          {t('detail.close_error')}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {showResultPanel && (
            <div className="rounded-3xl border border-border bg-card p-6">
              <h3 className="text-xl font-semibold mb-4">{t('detail.result')}</h3>

              <div className="rounded-2xl border border-border p-4">
                <p className="text-sm text-muted-foreground mb-4">
                  {lottery.hasWinner
                    ? t('detail.status_finished_with_winner')
                    : t('detail.status_finished_without_winner')}
                </p>

                {lottery.hasWinner ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-border p-4">
                        <div className="text-sm text-muted-foreground mb-1">
                          {t('detail.winner')}
                        </div>
                        <div className="font-mono break-all">{lottery.winner}</div>
                      </div>

                      <div className="rounded-2xl border border-border p-4">
                        <div className="text-sm text-muted-foreground mb-1">
                          {t('detail.winning_ticket')}
                        </div>
                        <div className="font-semibold">
                          {lottery.winningTicket.toString()}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border p-4">
                        <div className="text-sm text-muted-foreground mb-1">
                          {t('detail.winner_prize')}
                        </div>
                        <div className="font-semibold">
                          {formatUSDC(winnerPayout)} USDC
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border p-4">
                        <div className="text-sm text-muted-foreground mb-1">
                          {t('detail.creator_earnings')}
                        </div>
                        <div className="font-semibold">
                          {formatUSDC(creatorPayout)} USDC
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border p-4 sm:col-span-2">
                        <div className="text-sm text-muted-foreground mb-1">
                          {t('detail.fees_distributed')}
                        </div>
                        <div className="font-semibold">
                          {formatUSDC(feesPayout)} USDC
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    {t('detail.closed_without_winner_explain')}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 mt-6">
                  {createTxHash && (
                    <ExplorerButton
                      href={`${chain.explorer}/tx/${createTxHash}`}
                      label={t('detail.view_creation_explorer')}
                    />
                  )}

                  {closeTxHash && (
                    <ExplorerButton
                      href={`${chain.explorer}/tx/${closeTxHash}`}
                      label={t('detail.view_close_tx')}
                    />
                  )}
                </div>

                {closeMessage && (
                  <p className="text-sm text-muted-foreground mt-4">
                    {closeMessage}
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
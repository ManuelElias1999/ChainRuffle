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

function parseLotteryParam(value: string): { chainKey: SupportedChainKey; id: bigint } {
  const parts = value.includes(':') ? value.split(':') : value.split('-');

  if (parts.length === 2 && ['base', 'avalanche', 'arbitrum'].includes(parts[0])) {
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

type PurchaseStep = 'idle' | 'approving' | 'approved' | 'buying' | 'success' | 'error';

export function LotteryDetail({ lotteryId, setCurrentPage }: LotteryDetailProps) {
  const { t } = useTranslation();
  const { address, isConnected, chainId } = useAccount();
  const { switchToChain, isSwitching } = useSwitchToChain();

  const [quantity, setQuantity] = useState(1);
  const [showQR, setShowQR] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep>('idle');
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [purchaseError, setPurchaseError] = useState('');
  const [isClosingFlow, setIsClosingFlow] = useState(false);
  const [closeMessage, setCloseMessage] = useState('');

  const [createTxHash, setCreateTxHash] = useState<`0x${string}` | null>(null);
  const [purchaseTxHash, setPurchaseTxHash] = useState<`0x${string}` | null>(null);
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

  const quantitySafe = useMemo(() => {
    const maxAllowed = Number(remainingTickets > 0n ? remainingTickets : 1n);
    return Math.max(1, Math.min(quantity, maxAllowed));
  }, [quantity, remainingTickets]);

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
    !!address && !!lottery && lottery.creator.toLowerCase() === address.toLowerCase();

  const isProcessing =
    purchaseStep === 'approving' ||
    purchaseStep === 'approved' ||
    purchaseStep === 'buying' ||
    isApproving ||
    isBuying;

  const totalPages =
    totalParticipants > 0n ? Math.ceil(Number(totalParticipants) / Number(pageSize)) : 1;

  const currentPage =
    totalParticipants > 0n ? Math.floor(Number(participantsOffset) / Number(pageSize)) + 1 : 1;

  const pageStart =
    totalParticipants > 0n ? Number(participantsOffset) + 1 : 0;

  const pageEnd =
    totalParticipants > 0n
      ? Math.min(Number(participantsOffset + pageSize), Number(totalParticipants))
      : 0;

  const canGoPrev = participantsOffset > 0n;
  const canGoNext = participantsOffset + pageSize < totalParticipants;

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

      const freshIsOpen = Array.isArray(freshLottery) ? freshLottery[8] : freshLottery.isOpen;
      const freshTicketsSold = Array.isArray(freshLottery) ? freshLottery[5] : freshLottery.ticketsSold;

      const changed =
        freshTicketsSold !== previousTicketsSold ||
        freshRemaining !== previousRemainingTickets ||
        freshCurrentPool !== previousCurrentPool;

      if (changed || !freshIsOpen) {
        return {
          isOpen: freshIsOpen,
        };
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

      const openValue = Array.isArray(freshLottery) ? freshLottery[8] : freshLottery.isOpen;
      if (!openValue) return true;
      await sleep(1000);
    }

    return false;
  };

  const handlePrimaryPurchase = async () => {
    if (!isConnected || !isCorrectChain || quantitySafe <= 0 || remainingTickets <= 0n) return;

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('detail.loading')}</p>
      </div>
    );
  }

  if (error || !lottery) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl">{t('detail.load_error')}</p>
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
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-muted/50 hover:bg-muted transition-all text-sm"
    >
      <ExternalLink className="w-4 h-4" />
      {label}
    </a>
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => setCurrentPage('explore')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('detail.back_to_explorer')}
        </motion.button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl blur-md" />
              <div className="relative backdrop-blur-md bg-card border border-border rounded-3xl p-8">
                <div className="flex items-start justify-between mb-6 gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h1 className="text-4xl font-bold">{lottery.name}</h1>
                      <span
                        className={`px-3 py-1 rounded-full text-xs text-white bg-gradient-to-r ${chainColors[chainKey]}`}
                      >
                        {chain.name}
                      </span>
                      {!lottery.isOpen && (
                        <span className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary">
                          {lottery.hasWinner
                            ? t('detail.status_finished_with_winner')
                            : t('detail.status_finished_without_winner')}
                        </span>
                      )}
                    </div>

                    <p className="text-muted-foreground">
                      {t('lottery.id')}: {lottery.id.toString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('detail.creator')}: {formatAddress(lottery.creator)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">{t('lottery.price')}</div>
                    <div className="text-2xl font-bold">{formatUSDC(ticketPrice)} USDC</div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">{t('lottery.sold')}</div>
                    <div className="text-2xl font-bold">{ticketsSold.toString()}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">{t('lottery.remaining')}</div>
                    <div className="text-2xl font-bold">{remainingTickets.toString()}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">{t('lottery.pool')}</div>
                    <div className="text-2xl font-bold">{formatUSDC(currentPool)} USDC</div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">{t('detail.progress')}</span>
                    <span className="font-semibold">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full bg-gradient-to-r from-primary via-accent to-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
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
                      href={`${chain.explorerUrl}/tx/${createTxHash}`}
                      label={t('detail.view_creation_explorer')}
                    />
                  )}

                  {lottery.hasWinner && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary">
                      <Trophy className="w-4 h-4" />
                      {t('detail.winner')}: {formatAddress(lottery.winner)}
                    </div>
                  )}

                  {!lottery.isOpen && !lottery.hasWinner && (
                    <div className="px-4 py-2 rounded-xl bg-muted text-muted-foreground">
                      {t('detail.closed_without_winner')}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl blur-md" />
              <div className="relative backdrop-blur-md bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                  <h3 className="text-xl flex items-center gap-2 font-semibold">
                    <Users className="w-5 h-5" />
                    {t('detail.transparency')}
                  </h3>

                  <div className="text-sm text-muted-foreground">
                    {totalParticipants > 0n
                      ? t('detail.participants_range', {
                          start: pageStart.toString(),
                          end: pageEnd.toString(),
                          total: totalParticipants.toString(),
                        })
                      : t('detail.no_participants')}
                  </div>
                </div>

                <div className="space-y-3">
                  {participants.wallets.length === 0 && (
                    <p className="text-sm text-muted-foreground">{t('detail.no_participants')}</p>
                  )}

                  {participants.wallets.map((wallet, i) => (
                    <div key={`${wallet}-${i}`} className="flex justify-between items-center p-3 rounded-xl bg-muted/50">
                      <span className="font-mono text-sm">{formatAddress(wallet)}</span>
                      <span className="text-sm font-semibold">
                        {participants.ticketCounts[i]?.toString() ?? '0'} {t('detail.tickets')}
                      </span>
                    </div>
                  ))}
                </div>

                {totalParticipants > pageSize && (
                  <div className="mt-6 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setParticipantsOffset((prev) => (prev >= pageSize ? prev - pageSize : 0n))}
                      disabled={!canGoPrev}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      {t('detail.previous')}
                    </button>

                    <div className="text-sm text-muted-foreground">
                      {t('detail.page_of', {
                        current: currentPage.toString(),
                        total: totalPages.toString(),
                      })}
                    </div>

                    <button
                      type="button"
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
            </div>
          </div>

          {showActionPanel && (
            <div className="relative">
              <div className="sticky top-24">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl blur-md" />
                <div className="relative backdrop-blur-md bg-card border border-border rounded-2xl p-6">
                  <h3 className="text-xl mb-6 font-semibold">{t('detail.purchase')}</h3>

                  {!isConnected ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">
                        {t('detail.connect_wallet_to_buy')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm text-muted-foreground block">
                            {t('detail.quantity')}
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              setQuantity(Number(remainingTickets > 0n ? remainingTickets : 1n));
                              resetPurchaseState();
                            }}
                            className="text-sm px-3 py-1 rounded-lg border border-border hover:bg-muted transition-all"
                          >
                            {t('detail.max')}
                          </button>
                        </div>

                        <input
                          type="number"
                          min="1"
                          max={Number(remainingTickets)}
                          value={quantitySafe}
                          onChange={(e) => {
                            const next = Math.max(1, Number(e.target.value) || 1);
                            setQuantity(next);
                            resetPurchaseState();
                          }}
                          className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>

                      <div className="p-4 rounded-xl bg-muted/50">
                        <div className="flex justify-between mb-2">
                          <span className="text-muted-foreground">{t('lottery.price')}</span>
                          <span>{formatUSDC(ticketPrice)} USDC</span>
                        </div>
                        <div className="flex justify-between text-lg font-semibold">
                          <span>{t('detail.total')}</span>
                          <span className="text-primary">{formatUSDC(requiredAmount)} USDC</span>
                        </div>
                      </div>

                      {!isCorrectChain && (
                        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 space-y-3">
                          <div className="flex gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            <div>
                              <p className="font-semibold">{t('detail.wrong_network')}</p>
                              <p className="text-sm text-muted-foreground">
                                {t('detail.view_any_chain_interact_same_chain', {
                                  chain: chain.name,
                                })}
                              </p>
                            </div>
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
                      )}

                      <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{t('detail.purchase_flow')}</span>
                          {(purchaseStep === 'approved' || purchaseStep === 'buying' || purchaseStep === 'success') && (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          )}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          {purchaseStep === 'idle' && !hasEnoughAllowance && (
                            <p>{t('detail.purchase_flow_explain_approve_then_buy')}</p>
                          )}
                          {purchaseStep === 'idle' && hasEnoughAllowance && (
                            <p>{t('detail.purchase_flow_explain_direct_buy')}</p>
                          )}
                          {purchaseStep === 'approving' && <p>{t('detail.purchase_approve_wallet')}</p>}
                          {purchaseStep === 'approved' && <p>{t('detail.purchase_preparing')}</p>}
                          {purchaseStep === 'buying' && <p>{t('detail.purchase_confirm_buy_wallet')}</p>}
                          {purchaseStep === 'success' && <p>{purchaseMessage}</p>}
                          {purchaseStep === 'error' && <p className="text-red-500">{purchaseError}</p>}
                        </div>
                      </div>

                      <button
                        onClick={handlePrimaryPurchase}
                        disabled={!isCorrectChain || isProcessing || remainingTickets <= 0n}
                        className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="flex items-center justify-center gap-2 whitespace-nowrap">
                          {isProcessing && <Loader2 className="w-5 h-5 shrink-0 animate-spin" />}
                          <span className="inline-flex items-center leading-none font-medium">
                            {purchaseStep === 'idle' && t('detail.buy_tickets')}
                            {purchaseStep === 'approving' && t('detail.button_approving')}
                            {purchaseStep === 'approved' && t('detail.button_preparing')}
                            {purchaseStep === 'buying' && t('detail.button_buying')}
                            {purchaseStep === 'success' && t('detail.buy_again')}
                            {purchaseStep === 'error' && t('detail.try_again')}
                          </span>
                        </span>
                      </button>

                      {purchaseTxHash && (
                        <ExplorerButton
                          href={`${chain.explorerUrl}/tx/${purchaseTxHash}`}
                          label={t('detail.view_purchase_explorer')}
                        />
                      )}

                      {(approveError || buyError) && purchaseStep !== 'error' && (
                        <p className="text-sm text-red-500">
                          {t('detail.transaction_incomplete')}
                        </p>
                      )}

                      <button
                        onClick={() => setShowQR(!showQR)}
                        className="w-full px-4 py-2 rounded-xl border border-border hover:bg-muted/50 transition-all flex items-center justify-center gap-2"
                      >
                        <QrCode className="w-4 h-4" />
                        {t('detail.qr.title')}
                      </button>

                      {showQR && (
                        <div className="p-4 rounded-xl bg-muted/50 text-center">
                          <div className="w-48 h-48 bg-white rounded-xl mx-auto mb-3 flex items-center justify-center">
                            <QrCode className="w-24 h-24 text-gray-300" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {t('detail.qr.steps')}
                          </p>
                        </div>
                      )}

                      {isCreator && (
                        <div className="space-y-3">
                          <button
                            onClick={handleCloseLottery}
                            disabled={!isCorrectChain || isClosingFlow || isClosing}
                            className="w-full px-4 py-3 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {(isClosingFlow || isClosing) && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isClosingFlow || isClosing
                              ? t('detail.button_closing')
                              : t('detail.close')}
                          </button>

                          {closeMessage && (
                            <p className="text-sm text-muted-foreground">{closeMessage}</p>
                          )}

                          {closeTxHash && (
                            <ExplorerButton
                              href={`${chain.explorerUrl}/tx/${closeTxHash}`}
                              label={t('detail.view_close_explorer')}
                            />
                          )}

                          {closeError && (
                            <p className="text-sm text-red-500">
                              {t('detail.close_error')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {showResultPanel && (
            <div className="relative">
              <div className="sticky top-24">
                <div className="relative backdrop-blur-md bg-card border border-border rounded-2xl p-6 space-y-6">
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">{t('detail.result')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {lottery.hasWinner
                        ? t('detail.status_finished_with_winner')
                        : t('detail.status_finished_without_winner')}
                    </p>
                  </div>

                  {lottery.hasWinner ? (
                    <>
                      <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className="w-5 h-5 text-primary" />
                          <span className="font-semibold">{t('detail.winner')}</span>
                        </div>
                        <p className="font-mono break-all mb-2">{lottery.winner}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('detail.winning_ticket')}: {lottery.winningTicket.toString()}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div className="p-4 rounded-xl bg-muted/50">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Wallet className="w-4 h-4" />
                            {t('detail.winner_prize')}
                          </div>
                          <div className="text-2xl font-bold text-primary">
                            {formatUSDC(winnerPayout)} USDC
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/50">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Users className="w-4 h-4" />
                            {t('detail.creator_earnings')}
                          </div>
                          <div className="text-xl font-bold">
                            {formatUSDC(creatorPayout)} USDC
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/50">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Percent className="w-4 h-4" />
                            {t('detail.fees_distributed')}
                          </div>
                          <div className="text-xl font-bold">
                            {formatUSDC(feesPayout)} USDC
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-muted-foreground">
                        {t('detail.closed_without_winner_explain')}
                      </p>
                    </div>
                  )}

                  {createTxHash && (
                    <ExplorerButton
                      href={`${chain.explorerUrl}/tx/${createTxHash}`}
                      label={t('detail.view_creation_explorer')}
                    />
                  )}

                  {closeTxHash && (
                    <ExplorerButton
                      href={`${chain.explorerUrl}/tx/${closeTxHash}`}
                      label={t('detail.view_close_explorer')}
                    />
                  )}

                  {closeMessage && (
                    <p className="text-sm text-muted-foreground">{closeMessage}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
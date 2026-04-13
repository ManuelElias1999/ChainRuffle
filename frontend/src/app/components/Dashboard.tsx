import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import {
  Trophy,
  Wallet,
  Sparkles,
  Clock3,
  CheckCircle2,
  Ticket,
  RefreshCw,
  ExternalLink,
  History,
} from 'lucide-react';
import { useTranslation } from '../context/TranslationContext';
import { useAllLotteries } from '../../hooks/useAllLotteries';
import { useParticipationMap } from '../../hooks/useParticipationMap';
import { CHAIN_CONFIG, type SupportedChainKey } from '../../config/chains';
import { formatAddress, formatUSDC } from '../../lib/formatters';
import type { Lottery } from '../../types/lottery';
import { getActivityItems, type ActivityItem } from '../../lib/txRegistry';

interface DashboardProps {
  setCurrentPage: (page: string) => void;
  setSelectedLottery: (id: string) => void;
}

type OwnershipTab = 'created' | 'participating';
type ActivityTab = 'all' | 'create' | 'buy' | 'close';

const chainColors: Record<SupportedChainKey, string> = {
  base: 'from-blue-500 to-blue-600',
  avalanche: 'from-red-500 to-red-600',
  arbitrum: 'from-cyan-500 to-cyan-600',
};

export function Dashboard({ setCurrentPage, setSelectedLottery }: DashboardProps) {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const { lotteries, isLoading, hasError, refetch } = useAllLotteries();

  const {
    participationMap,
    isLoading: isParticipationLoading,
    hasError: hasParticipationError,
    refetch: refetchParticipations,
  } = useParticipationMap(lotteries, address);

  const [ownershipTab, setOwnershipTab] = useState<OwnershipTab>('created');
  const [statusTab, setStatusTab] = useState<StatusTab>('open');
  const [activityTab, setActivityTab] = useState<ActivityTab>('all');

  const activityItems = useMemo(() => getActivityItems(), []);

  const filteredActivityItems = useMemo(() => {
    if (activityTab === 'all') return activityItems;
    return activityItems.filter((item) => item.type === activityTab);
  }, [activityItems, activityTab]);

  const myCreatedLotteries = useMemo(() => {
    if (!address) return [];

    return lotteries.filter(
      (lottery) => lottery.creator.toLowerCase() === address.toLowerCase()
    );
  }, [lotteries, address]);

  const myParticipatingLotteries = useMemo(() => {
    return lotteries.filter((lottery) => {
      const key = `${lottery.chain}:${lottery.id.toString()}`;
      const myTickets = participationMap[key] ?? 0n;
      return myTickets > 0n;
    });
  }, [lotteries, participationMap]);

  const selectedBase =
    ownershipTab === 'created' ? myCreatedLotteries : myParticipatingLotteries;

  const filteredLotteries = useMemo(() => {
    if (statusTab === 'all') return selectedBase;
    if (statusTab === 'open') return selectedBase.filter((lottery) => lottery.isOpen);
    return selectedBase.filter((lottery) => !lottery.isOpen);
  }, [selectedBase, statusTab]);

  const createdOpenCount = myCreatedLotteries.filter((l) => l.isOpen).length;
  const createdClosedCount = myCreatedLotteries.filter((l) => !l.isOpen).length;
  const participatingOpenCount = myParticipatingLotteries.filter((l) => l.isOpen).length;
  const participatingClosedCount = myParticipatingLotteries.filter((l) => !l.isOpen).length;

  const totalCreatedRaised = myCreatedLotteries.reduce(
    (acc, lottery) => acc + lottery.totalRaised,
    0n
  );

  const totalPotentialCreatorRevenue = myCreatedLotteries.reduce((acc, lottery) => {
    return acc + (lottery.totalRaised * 10n) / 100n;
  }, 0n);

  const totalParticipatingTickets = Object.values(participationMap).reduce(
    (acc, tickets) => acc + tickets,
    0n
  );

  const openLotteryDetail = (lottery: Lottery) => {
    setSelectedLottery(`${lottery.chain}:${lottery.id.toString()}`);
  };

  const handleRefresh = async () => {
    await refetch();
    await refetchParticipations();
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <div className="rounded-3xl border border-border bg-card p-12 text-center">
            <Wallet className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold mb-3">{t('header.dashboard')}</h1>
            <p className="text-muted-foreground mb-6">
              {t('dashboard.connect_to_view')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const loadingDashboard = isLoading || isParticipationLoading;
  const anyError = hasError || hasParticipationError;

  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">{t('header.dashboard')}</h1>
            <p className="text-muted-foreground">
              {t('dashboard.overview_multichain')}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Wallet: {formatAddress(address!)}
            </p>
          </div>

          <button
            onClick={handleRefresh}
            className="px-4 py-3 rounded-xl border border-border hover:bg-muted transition-all inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t('dashboard.refresh')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          <StatCard
            title={t('dashboard.created_count')}
            value={myCreatedLotteries.length.toString()}
            icon={Sparkles}
          />
          <StatCard
            title={t('dashboard.participating_count')}
            value={myParticipatingLotteries.length.toString()}
            icon={Ticket}
          />
          <StatCard
            title={t('dashboard.total_tickets_bought')}
            value={totalParticipatingTickets.toString()}
            icon={Trophy}
          />
          <StatCard
            title={t('dashboard.total_pool_generated')}
            value={`${formatUSDC(totalCreatedRaised)} USDC`}
            icon={Wallet}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-2">
              {t('dashboard.creator_estimated_revenue')}
            </p>
            <p className="text-3xl font-bold text-primary">
              {formatUSDC(totalPotentialCreatorRevenue)} USDC
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('dashboard.creator_estimated_revenue_help')}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-2">
              {t('dashboard.multichain_distribution')}
            </p>
            <div className="space-y-2">
              <ChainLine
                label="Base"
                count={selectedBase.filter((lottery) => lottery.chain === 'base').length}
              />
              <ChainLine
                label="Avalanche"
                count={selectedBase.filter((lottery) => lottery.chain === 'avalanche').length}
              />
              <ChainLine
                label="Arbitrum"
                count={selectedBase.filter((lottery) => lottery.chain === 'arbitrum').length}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <TabButton active={ownershipTab === 'created'} onClick={() => setOwnershipTab('created')}>
            {t('dashboard.myLotteries')}
          </TabButton>
          <TabButton
            active={ownershipTab === 'participating'}
            onClick={() => setOwnershipTab('participating')}
          >
            {t('dashboard.participating')}
          </TabButton>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <TabButton active={statusTab === 'open'} onClick={() => setStatusTab('open')}>
            {t('dashboard.open')}
          </TabButton>
          <TabButton active={statusTab === 'closed'} onClick={() => setStatusTab('closed')}>
            {t('dashboard.closed')}
          </TabButton>
          <TabButton active={statusTab === 'all'} onClick={() => setStatusTab('all')}>
            {t('dashboard.all')}
          </TabButton>
        </div>

        {loadingDashboard && (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
            {t('dashboard.loading')}
          </div>
        )}

        {anyError && (
          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6 mb-8">
            <p className="font-semibold mb-2">{t('dashboard.partial_error_title')}</p>
            <p className="text-sm text-muted-foreground">
              {t('dashboard.partial_error_body')}
            </p>
          </div>
        )}

        {!loadingDashboard && filteredLotteries.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <p className="text-2xl font-semibold mb-3">{t('dashboard.empty_title')}</p>
            <p className="text-muted-foreground mb-6">
              {ownershipTab === 'created'
                ? t('dashboard.empty_created')
                : t('dashboard.empty_participating')}
            </p>
            <button
              onClick={() => setCurrentPage('create')}
              className="px-5 py-3 rounded-xl bg-primary text-primary-foreground"
            >
              {t('create.submit')}
            </button>
          </div>
        )}

        {filteredLotteries.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredLotteries.map((lottery, index) => {
              const participationKey = `${lottery.chain}:${lottery.id.toString()}`;
              const myTickets = participationMap[participationKey] ?? 0n;

              return (
                <motion.div
                  key={`${lottery.chain}-${lottery.id.toString()}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: Math.min(index * 0.04, 0.2) }}
                >
                  <DashboardLotteryCard
                    lottery={lottery}
                    myTickets={myTickets}
                    showMyTickets={ownershipTab === 'participating'}
                    ownershipTab={ownershipTab}
                    onOpen={() => openLotteryDetail(lottery)}
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <SummaryMiniCard
            title={t('dashboard.created_open')}
            value={createdOpenCount.toString()}
            icon={Clock3}
          />
          <SummaryMiniCard
            title={t('dashboard.created_closed')}
            value={createdClosedCount.toString()}
            icon={CheckCircle2}
          />
          <SummaryMiniCard
            title={t('dashboard.participating_open')}
            value={participatingOpenCount.toString()}
            icon={Clock3}
          />
          <SummaryMiniCard
            title={t('dashboard.participating_closed')}
            value={participatingClosedCount.toString()}
            icon={CheckCircle2}
          />
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <History className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold">{t('dashboard.recent_activity')}</h3>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <TabButton active={activityTab === 'all'} onClick={() => setActivityTab('all')}>
              {t('dashboard.activity_filter_all')}
            </TabButton>
            <TabButton active={activityTab === 'create'} onClick={() => setActivityTab('create')}>
              {t('dashboard.activity_filter_create')}
            </TabButton>
            <TabButton active={activityTab === 'buy'} onClick={() => setActivityTab('buy')}>
              {t('dashboard.activity_filter_buy')}
            </TabButton>
            <TabButton active={activityTab === 'close'} onClick={() => setActivityTab('close')}>
              {t('dashboard.activity_filter_close')}
            </TabButton>
          </div>

          {filteredActivityItems.length === 0 ? (
            <p className="text-muted-foreground">{t('dashboard.no_activity')}</p>
          ) : (
            <div className="space-y-3">
              {filteredActivityItems.slice(0, 12).map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: typeof Sparkles;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <p className="text-sm text-muted-foreground mb-2">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function SummaryMiniCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: typeof Clock3;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5 text-primary" />
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl transition-all ${
        active ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'
      }`}
    >
      {children}
    </button>
  );
}

function ChainLine({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold">{count}</span>
    </div>
  );
}

function DashboardLotteryCard({
  lottery,
  myTickets,
  showMyTickets,
  ownershipTab,
  onOpen,
}: {
  lottery: Lottery;
  myTickets: bigint;
  showMyTickets: boolean;
  ownershipTab: 'created' | 'participating';
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const chain = CHAIN_CONFIG[lottery.chain];
  const currentPool = lottery.totalRaised;
  const creatorRevenue = (lottery.totalRaised * 10n) / 100n;
  const progress =
    lottery.maxTickets > 0n
      ? Number((lottery.ticketsSold * 10000n) / lottery.maxTickets) / 100
      : 0;

  return (
    <button
      onClick={onOpen}
      className="w-full text-left rounded-2xl border border-border bg-card p-6 hover:bg-muted/20 transition-all"
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-2xl font-bold">{lottery.name}</h3>

            {ownershipTab === 'created' && (
              <span className="px-2 py-1 rounded-full text-[10px] bg-primary/10 text-primary">
                {t('dashboard.badge_created')}
              </span>
            )}

            {ownershipTab === 'participating' && (
              <span className="px-2 py-1 rounded-full text-[10px] bg-cyan-500/15 text-cyan-600">
                {t('dashboard.badge_participating')}
              </span>
            )}

            {lottery.isOpen ? (
              <span className="px-2 py-1 rounded-full text-[10px] bg-emerald-500/15 text-emerald-600">
                {t('dashboard.badge_open')}
              </span>
            ) : (
              <span className="px-2 py-1 rounded-full text-[10px] bg-muted text-muted-foreground">
                {t('dashboard.badge_closed')}
              </span>
            )}

            {!lottery.isOpen && lottery.hasWinner && (
              <span className="px-2 py-1 rounded-full text-[10px] bg-yellow-500/15 text-yellow-600">
                {t('dashboard.badge_winner_selected')}
              </span>
            )}

            {!lottery.isOpen && !lottery.hasWinner && (
              <span className="px-2 py-1 rounded-full text-[10px] bg-muted text-muted-foreground">
                {t('dashboard.badge_closed_no_winner')}
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground">ID: {lottery.id.toString()}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs text-white bg-gradient-to-r ${chainColors[lottery.chain]}`}
          >
            {chain.name}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="rounded-xl bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground mb-1">{t('dashboard.current_pool')}</p>
          <p className="font-bold text-primary">{formatUSDC(currentPool)} USDC</p>
        </div>

        <div className="rounded-xl bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground mb-1">{t('dashboard.creator_share')}</p>
          <p className="font-bold">{formatUSDC(creatorRevenue)} USDC</p>
        </div>

        <div className="rounded-xl bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground mb-1">{t('dashboard.sold')}</p>
          <p className="font-bold">
            {lottery.ticketsSold.toString()} / {lottery.maxTickets.toString()}
          </p>
        </div>

        <div className="rounded-xl bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground mb-1">
            {showMyTickets ? t('dashboard.my_tickets_label') : t('dashboard.participants_label')}
          </p>
          <p className="font-bold">
            {showMyTickets ? myTickets.toString() : lottery.uniqueParticipants.toString()}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">{t('dashboard.progress')}</span>
          <span>{progress.toFixed(1)}%</span>
        </div>

        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary via-accent to-emerald-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {!lottery.isOpen && lottery.hasWinner && (
        <div className="rounded-xl bg-primary/10 text-primary px-4 py-3 text-sm">
          {t('dashboard.winner_label')}: {formatAddress(lottery.winner)}
        </div>
      )}

      {!lottery.isOpen && !lottery.hasWinner && (
        <div className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          {t('dashboard.badge_closed_no_winner')}
        </div>
      )}
    </button>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const { t } = useTranslation();
  const chain = CHAIN_CONFIG[item.chainKey as SupportedChainKey];

  const label =
    item.type === 'create'
      ? t('dashboard.activity_create')
      : item.type === 'buy'
      ? t('dashboard.activity_buy')
      : t('dashboard.activity_close');

  const formattedDate = new Date(item.timestamp).toLocaleString();

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-sm font-semibold">{label}</span>
          <span className="px-2 py-1 rounded-full text-[10px] bg-primary/10 text-primary">
            {chain?.shortName ?? item.chainKey.toUpperCase()}
          </span>
        </div>

        <p className="text-sm text-muted-foreground truncate">
          {item.lotteryName ?? t('dashboard.lottery_fallback', { id: item.lotteryId })} · ID {item.lotteryId}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{formattedDate}</p>
      </div>

      <a
        href={`${chain.explorerUrl}/tx/${item.txHash}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted transition-all text-sm"
      >
        <ExternalLink className="w-4 h-4" />
        {t('dashboard.view_in_explorer')}
      </a>
    </div>
  );
}
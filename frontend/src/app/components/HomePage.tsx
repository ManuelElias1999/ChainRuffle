import { motion } from 'motion/react';
import { useTranslation } from '../context/TranslationContext';
import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  TrendingUp,
  Users,
  Sparkles,
  Shield,
  Layers,
  Zap,
  CheckCircle2,
  Coins,
  FileText,
  Share2,
  DollarSign,
  Ticket,
  Trophy,
  ArrowRight,
  Star,
} from 'lucide-react';
import { useAllLotteries } from '../../hooks/useAllLotteries';
import { CHAIN_CONFIG, type SupportedChainKey } from '../../config/chains';
import { formatAddress, formatUSDC } from '../../lib/formatters';
import type { Lottery } from '../../types/lottery';

interface HomePageProps {
  setCurrentPage: (page: string) => void;
  setSelectedLottery: (id: string) => void;
}

const chainColors: Record<SupportedChainKey, string> = {
  base: 'from-blue-500 to-cyan-500',
  avalanche: 'from-red-500 to-orange-500',
  arbitrum: 'from-cyan-500 to-indigo-500',
};

function getCurrentPoolNumber(lottery: Lottery) {
  return Number(lottery.totalRaised);
}

function getMaxPoolNumber(lottery: Lottery) {
  return Number(lottery.ticketPrice * lottery.maxTickets);
}

export function HomePage({ setCurrentPage, setSelectedLottery }: HomePageProps) {
  const { t } = useTranslation();
  const { openLotteries, isLoading, hasError, refetch } = useAllLotteries();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChain, setSelectedChain] = useState<SupportedChainKey | 'all'>('all');
  const [sortBy, setSortBy] = useState('highestPool');
  const [stableOpenLotteries, setStableOpenLotteries] = useState<Lottery[]>([]);
  const [showAllLotteries, setShowAllLotteries] = useState(false);

  useEffect(() => {
    setStableOpenLotteries(openLotteries);
  }, [openLotteries]);

  const featuredLottery = useMemo(() => {
    if (!stableOpenLotteries.length) return null;
    return [...stableOpenLotteries].sort(
      (a, b) => Number(b.totalRaised) - Number(a.totalRaised)
    )[0];
  }, [stableOpenLotteries]);

  const filteredLotteries = useMemo(() => {
    return stableOpenLotteries
      .filter((lottery) => {
        const lotteryKey = `${lottery.chain}:${lottery.id.toString()}`;

        const matchesSearch =
          lottery.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lottery.id.toString().includes(searchQuery.toLowerCase()) ||
          lotteryKey.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesChain =
          selectedChain === 'all' || lottery.chain === selectedChain;

        return matchesSearch && matchesChain;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'highestPool':
            return getCurrentPoolNumber(b) - getCurrentPoolNumber(a);
          case 'highestMax':
            return getMaxPoolNumber(b) - getMaxPoolNumber(a);
          case 'lowestPrice':
            return Number(a.ticketPrice) - Number(b.ticketPrice);
          case 'highestPrice':
            return Number(b.ticketPrice) - Number(a.ticketPrice);
          case 'closestFull': {
            const aProgress =
              a.maxTickets > 0n ? Number((a.ticketsSold * 10000n) / a.maxTickets) : 0;
            const bProgress =
              b.maxTickets > 0n ? Number((b.ticketsSold * 10000n) / b.maxTickets) : 0;
            return bProgress - aProgress;
          }
          default:
            return 0;
        }
      });
  }, [stableOpenLotteries, searchQuery, selectedChain, sortBy]);

  const visibleLotteries = showAllLotteries
    ? filteredLotteries
    : filteredLotteries.slice(0, 3);

  const totalPool = stableOpenLotteries.reduce(
    (acc, lottery) => acc + lottery.totalRaised,
    0n
  );

  const highestPool = stableOpenLotteries.reduce((highest, lottery) => {
    return lottery.totalRaised > highest ? lottery.totalRaised : highest;
  }, 0n);

  const totalParticipants = stableOpenLotteries.reduce(
    (acc, lottery) => acc + Number(lottery.uniqueParticipants),
    0
  );

  const stats = [
    {
      label: t('home.stats.open'),
      value: stableOpenLotteries.length.toString(),
      icon: Sparkles,
      badge: t('home.stats.badge_live'),
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.18)] dark:shadow-[0_0_40px_rgba(16,185,129,0.16)]',
    },
    {
      label: t('home.stats.pool'),
      value: `$${formatUSDC(totalPool)}`,
      icon: TrendingUp,
      badge: 'USDC',
      glow: 'shadow-[0_0_30px_rgba(34,211,238,0.16)] dark:shadow-[0_0_40px_rgba(34,211,238,0.14)]',
    },
    {
      label: t('home.stats.highest'),
      value: `$${formatUSDC(highestPool)}`,
      icon: Trophy,
      badge: t('home.stats.badge_top'),
      glow: 'shadow-[0_0_30px_rgba(234,179,8,0.16)] dark:shadow-[0_0_40px_rgba(234,179,8,0.14)]',
    },
    {
      label: t('home.stats.participants'),
      value: totalParticipants.toString(),
      icon: Users,
      badge: t('home.stats.badge_users'),
      glow: 'shadow-[0_0_30px_rgba(168,85,247,0.16)] dark:shadow-[0_0_40px_rgba(168,85,247,0.14)]',
    },
  ];

  const trustBadges = [
    { label: t('home.badges.transparent'), icon: Shield },
    { label: t('home.badges.multichain'), icon: Layers },
    { label: t('home.badges.usdc'), icon: Coins },
    { label: t('home.badges.autoDraw'), icon: Zap },
    { label: t('home.badges.onchainPayments'), icon: CheckCircle2 },
  ];

  const howItWorksSteps = [
    { text: t('home.how.step1'), icon: Sparkles },
    { text: t('home.how.step2'), icon: CheckCircle2 },
    { text: t('home.how.step3'), icon: Coins },
    { text: t('home.how.step4'), icon: Zap },
    { text: t('home.how.step5'), icon: FileText },
    { text: t('home.how.step6'), icon: Shield },
  ];

  const createSteps = [
    { text: t('home.create.step1'), icon: Layers },
    { text: t('home.create.step2'), icon: FileText },
    { text: t('home.create.step3'), icon: DollarSign },
    { text: t('home.create.step4'), icon: Users },
    { text: t('home.create.step5'), icon: Share2 },
  ];

  const distributionItems = [
    { text: t('home.distribution.winner'), percentage: '80%' },
    { text: t('home.distribution.creator'), percentage: '10%' },
    { text: t('home.distribution.fees'), percentage: '10%' },
  ];

  const openLotteryDetail = (lottery: Lottery) => {
    setSelectedLottery(`${lottery.chain}:${lottery.id.toString()}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#f4f5f7] text-zinc-900 dark:bg-[#06100d] dark:text-zinc-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-120px] left-[-120px] w-[260px] h-[260px] rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/12" />
        <div className="absolute top-[120px] right-[-60px] w-[220px] h-[220px] rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-500/12" />
        <div className="absolute bottom-[220px] left-[10%] w-[220px] h-[220px] rounded-full bg-fuchsia-500/8 blur-3xl dark:bg-fuchsia-500/10" />
        <div className="absolute bottom-[-100px] right-[8%] w-[260px] h-[260px] rounded-full bg-yellow-500/8 blur-3xl dark:bg-yellow-500/10" />
      </div>

      <section className="relative overflow-hidden border-b border-zinc-300/80 dark:border-white/12">
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-10 dark:opacity-15"
          >
            <source src="/videos/lottery-bg.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-gradient-to-b from-[#f4f5f7]/55 via-[#f4f5f7]/78 to-[#f4f5f7] dark:from-[#06100d]/20 dark:via-[#06100d]/72 dark:to-[#06100d]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.08),transparent_26%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_26%)]" />
        </div>

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-10 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6 lg:gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-[3px] border-emerald-500/25 bg-white/95 dark:bg-[#101715] text-primary text-sm mb-4 shadow-sm dark:shadow-[0_0_18px_rgba(16,185,129,0.15)]">
                <Sparkles className="w-4 h-4" />
                {t('home.hero.badge')}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                {t('home.hero.title')}
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mb-6">
                {t('home.hero.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <button
                  onClick={() => {
                    const exploreSection = document.getElementById('explore');
                    exploreSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all"
                >
                  {t('home.hero.explore')}
                </button>

                <button
                  onClick={() => setCurrentPage('create')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border-[3px] border-zinc-300 dark:border-white/18 bg-white dark:bg-[#101715] shadow-md dark:shadow-[0_0_24px_rgba(255,255,255,0.03)] hover:bg-zinc-100 dark:hover:bg-[#14201c] transition-all"
                >
                  {t('home.hero.create')}
                </button>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {trustBadges.map((badge, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-full border-[3px] border-zinc-300 dark:border-white/18 bg-white dark:bg-[#101715] shadow-sm dark:shadow-[0_0_18px_rgba(16,185,129,0.08)] text-sm"
                  >
                    <badge.icon className="w-4 h-4 text-primary" />
                    <span>{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {featuredLottery && (
              <div className="rounded-[24px] border-[3px] border-zinc-300 dark:border-white/18 bg-white dark:bg-[#101715] shadow-xl dark:shadow-[0_0_26px_rgba(16,185,129,0.08)] p-5 sm:p-6">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                  {t('home.featured')}
                </p>

                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <h3 className="text-2xl font-bold break-words mb-1">
                      {featuredLottery.name}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      ID: {featuredLottery.id.toString()}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs text-white bg-gradient-to-r ${chainColors[featuredLottery.chain]} shrink-0`}
                  >
                    {CHAIN_CONFIG[featuredLottery.chain].shortName}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <FeaturedBox
                    label={t('home.current_pool_label')}
                    value={`${formatUSDC(featuredLottery.totalRaised)} USDC`}
                  />
                  <FeaturedBox
                    label={t('home.ticket_label')}
                    value={`${formatUSDC(featuredLottery.ticketPrice)} USDC`}
                  />
                  <FeaturedBox
                    label={t('home.sold_label')}
                    value={`${featuredLottery.ticketsSold.toString()} / ${featuredLottery.maxTickets.toString()}`}
                  />
                  <FeaturedBox
                    label={t('home.participants_label')}
                    value={featuredLottery.uniqueParticipants.toString()}
                  />
                </div>

                <button
                  onClick={() => openLotteryDetail(featuredLottery)}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all"
                >
                  {t('home.buy_tickets')}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-[1280px] mx-auto">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="relative"
            >
              <div className={`relative rounded-3xl border-[3px] border-zinc-300 dark:border-white/18 bg-white dark:bg-[#101715] ${stat.glow} px-5 py-4 overflow-hidden min-h-[126px]`}>
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shrink-0">
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>

                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary shrink-0">
                    {stat.badge}
                  </span>
                </div>

                <div className="text-3xl font-bold leading-none mb-2 break-words">
                  {stat.value}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="rounded-[28px] border-[3px] border-zinc-300 dark:border-white/18 bg-white dark:bg-[#101715] shadow-xl dark:shadow-[0_0_26px_rgba(34,211,238,0.06)] p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm mb-3">
                <Star className="w-4 h-4" />
                {t('home.discover_badge')}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                {t('home.explore_title')}
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">
                {t('home.explore_subtitle')}
              </p>
            </div>

            <button
              onClick={refetch}
              className="w-full sm:w-auto px-4 py-3 rounded-2xl border-[3px] border-zinc-300 dark:border-white/18 bg-zinc-100 dark:bg-[#19211f] hover:bg-zinc-200 dark:hover:bg-[#1d2725] transition-all"
            >
              {t('home.refresh')}
            </button>
          </div>

          <div id="explore" className="scroll-mt-24" />

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr_0.8fr] gap-4 mb-8">
            <input
              type="text"
              placeholder={t('filters.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-zinc-100 dark:bg-[#19211f] border-[3px] border-zinc-300 dark:border-white/18 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            />

            <div className="relative">
              <select
                value={selectedChain}
                onChange={(e) =>
                  setSelectedChain(e.target.value as SupportedChainKey | 'all')
                }
                className="appearance-none w-full px-4 py-3.5 pr-10 rounded-2xl bg-zinc-100 dark:bg-[#19211f] border-[3px] border-zinc-300 dark:border-white/18 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer text-foreground"
              >
                <option value="all">{t('filters.all')}</option>
                <option value="base">Base Sepolia</option>
                <option value="avalanche">Avalanche Fuji</option>
                <option value="arbitrum">Arbitrum Sepolia</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none w-full px-4 py-3.5 pr-10 rounded-2xl bg-zinc-100 dark:bg-[#19211f] border-[3px] border-zinc-300 dark:border-white/18 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer text-foreground"
              >
                <option value="highestPool">{t('filters.highestPool')}</option>
                <option value="highestMax">{t('filters.highestMax')}</option>
                <option value="lowestPrice">{t('filters.lowestPrice')}</option>
                <option value="highestPrice">{t('filters.highestPrice')}</option>
                <option value="closestFull">{t('filters.closestFull')}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {isLoading && (
            <div className="py-16 text-center text-zinc-500 dark:text-zinc-400">
              {t('home.loading_lotteries')}
            </div>
          )}

          {hasError && (
            <div className="py-6 px-6 rounded-2xl border-[3px] border-yellow-500/30 bg-yellow-500/10 mb-8">
              <p className="text-yellow-600 font-semibold mb-2">
                {t('home.partial_error_title')}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                {t('home.partial_error_body')}
              </p>
              <button
                onClick={refetch}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground"
              >
                {t('home.retry')}
              </button>
            </div>
          )}

          {!isLoading && stableOpenLotteries.length === 0 && (
            <div className="py-16 text-center rounded-3xl border-[3px] border-zinc-300 dark:border-white/18 bg-zinc-100 dark:bg-[#19211f] px-4">
              <p className="text-xl mb-2">{t('home.no_open_title')}</p>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                {t('home.no_open_body')}
              </p>
              <button
                onClick={() => setCurrentPage('create')}
                className="px-5 py-3 rounded-2xl bg-primary text-primary-foreground"
              >
                {t('home.hero.create')}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {visibleLotteries.map((lottery, i) => (
              <motion.div
                key={`${lottery.chain}-${lottery.id.toString()}`}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.04, 0.2) }}
              >
                <RealLotteryCard
                  lottery={lottery}
                  onClick={() => openLotteryDetail(lottery)}
                />
              </motion.div>
            ))}
          </div>

          {filteredLotteries.length > 3 && (
            <div className="text-center mt-8">
              <button
                onClick={() => setShowAllLotteries((prev) => !prev)}
                className="px-6 py-3 rounded-xl border-[3px] border-zinc-300 dark:border-white/18 bg-zinc-100 dark:bg-[#19211f] hover:bg-zinc-200 dark:hover:bg-[#1d2725] transition"
              >
                {showAllLotteries ? t('home.view_less') : t('home.view_more')}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <InfoCard
            icon={Sparkles}
            title={t('home.how.title')}
            subtitle={t('home.how.subtitle')}
            items={howItWorksSteps}
            gradient="from-emerald-500 to-cyan-500"
            neon="dark:shadow-[0_0_28px_rgba(16,185,129,0.08)]"
          />

          <InfoCard
            icon={Layers}
            title={t('home.create.title')}
            subtitle={t('home.create.subtitle')}
            items={createSteps}
            gradient="from-fuchsia-500 to-purple-500"
            neon="dark:shadow-[0_0_28px_rgba(168,85,247,0.08)]"
          />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-[28px] border-[3px] border-zinc-300 dark:border-white/18 bg-white dark:bg-[#101715] shadow-lg dark:shadow-[0_0_28px_rgba(234,179,8,0.08)] p-6 sm:p-8 h-full">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-6">
                <DollarSign className="w-7 h-7 text-white" />
              </div>

              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                {t('home.distribution.badge')}
              </p>
              <h3 className="text-2xl font-bold mb-6">{t('home.distribution.title')}</h3>

              <div className="space-y-5">
                {distributionItems.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {item.text}
                      </span>
                      <span className="text-xl font-bold text-primary shrink-0">
                        {item.percentage}
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-zinc-200 dark:bg-white/[0.08] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary via-cyan-400 to-fuchsia-400"
                        style={{ width: item.percentage }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border-[3px] border-zinc-300 dark:border-white/18 bg-zinc-100 dark:bg-[#19211f] p-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {t('home.distribution.note')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  subtitle,
  items,
  gradient,
  neon,
}: {
  icon: typeof Sparkles;
  title: string;
  subtitle: string;
  items: { text: string; icon: typeof Sparkles }[];
  gradient: string;
  neon: string;
}) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="relative"
    >
      <div className={`relative rounded-[28px] border-[3px] border-zinc-300 dark:border-white/18 bg-white dark:bg-[#101715] shadow-lg ${neon} p-6 sm:p-8 h-full`}>
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6`}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">{subtitle}</p>
        <h3 className="text-2xl font-bold mb-6">{title}</h3>

        <div className="space-y-4">
          {items.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <step.icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function FeaturedBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border-[3px] border-zinc-300 dark:border-white/18 bg-zinc-100 dark:bg-[#19211f] p-4">
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{label}</p>
      <p className="font-bold break-words">{value}</p>
    </div>
  );
}

function RealLotteryCard({
  lottery,
  onClick,
}: {
  lottery: Lottery;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  const chain = CHAIN_CONFIG[lottery.chain];
  const currentPool = lottery.totalRaised;
  const maxPool = lottery.ticketPrice * lottery.maxTickets;

  const progress =
    lottery.maxTickets > 0n
      ? Number((lottery.ticketsSold * 10000n) / lottery.maxTickets) / 100
      : 0;

  const isAlmostFull = progress >= 80;
  const isHighPool = currentPool >= 100_000_000n;
  const isNew = lottery.id >= 2n;

  const neonClass =
    lottery.chain === 'base'
      ? 'dark:shadow-[0_0_28px_rgba(59,130,246,0.10)]'
      : lottery.chain === 'avalanche'
      ? 'dark:shadow-[0_0_28px_rgba(239,68,68,0.10)]'
      : 'dark:shadow-[0_0_28px_rgba(34,211,238,0.10)]';

  return (
    <button onClick={onClick} className="w-full text-left group relative">
      <div className={`relative rounded-[28px] border-[3px] border-zinc-300 dark:border-white/18 bg-white dark:bg-[#101715] shadow-xl ${neonClass} p-4 sm:p-5 h-full hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className="text-xl font-bold break-words">{lottery.name}</h3>

              {isNew && (
                <span className="px-2.5 py-1 rounded-full text-[10px] bg-primary/10 text-primary">
                  {t('home.badge.new')}
                </span>
              )}

              {isAlmostFull && (
                <span className="px-2.5 py-1 rounded-full text-[10px] bg-yellow-500/15 text-yellow-600">
                  {t('home.badge.almostFull')}
                </span>
              )}

              {isHighPool && (
                <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-500/15 text-emerald-600">
                  {t('home.badge.highPool')}
                </span>
              )}
            </div>

            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              ID: {lottery.id.toString()}
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs text-white bg-gradient-to-r ${chainColors[lottery.chain]} shrink-0`}
          >
            {chain.shortName}
          </span>
        </div>

        <div className="rounded-2xl border-[3px] border-zinc-300 dark:border-white/18 bg-zinc-100 dark:bg-[#19211f] p-3 mb-3">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
            {t('home.creator_label')}
          </p>
          <p className="font-medium break-all">{formatAddress(lottery.creator)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <CardMetric
            label={t('home.ticket_label')}
            value={`${formatUSDC(lottery.ticketPrice)} USDC`}
            icon={Ticket}
          />
          <CardMetric
            label={t('home.sold_label')}
            value={`${lottery.ticketsSold.toString()} / ${lottery.maxTickets.toString()}`}
            icon={Users}
          />
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-sm mb-2 gap-4">
            <span className="text-zinc-500 dark:text-zinc-400">{t('home.progress_label')}</span>
            <span className="font-medium shrink-0">{progress.toFixed(1)}%</span>
          </div>

          <div className="h-3 bg-zinc-200 dark:bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-cyan-400 to-fuchsia-400"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="rounded-2xl border-[3px] border-zinc-300 dark:border-white/18 p-3 bg-zinc-100 dark:bg-[#19211f]">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              {t('home.current_pool_label')}
            </p>
            <p className="font-bold text-primary break-words">
              {formatUSDC(currentPool)} USDC
            </p>
          </div>

          <div className="rounded-2xl border-[3px] border-zinc-300 dark:border-white/18 p-3 bg-zinc-100 dark:bg-[#19211f]">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              {t('home.max_pool_label')}
            </p>
            <p className="font-bold break-words">{formatUSDC(maxPool)} USDC</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-1">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {t('home.view_raffle_details')}
          </span>
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </button>
  );
}

function CardMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Ticket;
}) {
  return (
    <div className="rounded-2xl border-[3px] border-zinc-300 dark:border-white/18 bg-zinc-100 dark:bg-[#19211f] p-3">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      </div>
      <p className="font-bold break-words">{value}</p>
    </div>
  );
}
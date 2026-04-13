import { motion } from 'motion/react';
import { useTranslation } from '../context/TranslationContext';
import { useEffect, useState } from 'react';
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
  base: 'from-blue-500 to-blue-600',
  avalanche: 'from-red-500 to-red-600',
  arbitrum: 'from-cyan-500 to-cyan-600',
};

function getCurrentPoolNumber(lottery: Lottery) {
  return Number(lottery.totalRaised);
}

function getMaxPoolNumber(lottery: Lottery) {
  return Number(lottery.ticketPrice * lottery.maxTickets);
}

export function HomePage({ setCurrentPage, setSelectedLottery }: HomePageProps) {
  const { t } = useTranslation();
  const { lotteries, openLotteries, isLoading, hasError, errors, refetch } = useAllLotteries();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChain, setSelectedChain] = useState<SupportedChainKey | 'all'>('all');
  const [sortBy, setSortBy] = useState('highestPool');
  const [stableOpenLotteries, setStableOpenLotteries] = useState<Lottery[]>([]);

  const filteredLotteries = stableOpenLotteries
    .filter((lottery) => {
      const lotteryKey = `${lottery.chain}:${lottery.id.toString()}`;

      const matchesSearch =
        lottery.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lottery.id.toString().includes(searchQuery.toLowerCase()) ||
        lotteryKey.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesChain = selectedChain === 'all' || lottery.chain === selectedChain;

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
  
  useEffect(() => {
    if (openLotteries.length === 0) return;
  
    // evita flicker si llega lista parcial
    if (openLotteries.length < stableOpenLotteries.length) return;
  
    setStableOpenLotteries(openLotteries);
  }, [openLotteries]);

  const totalPool = stableOpenLotteries.reduce((acc, lottery) => acc + lottery.totalRaised, 0n);

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
      color: 'from-emerald-500 to-green-500',
    },
    {
      label: t('home.stats.pool'),
      value: `$${formatUSDC(totalPool)}`,
      icon: TrendingUp,
      color: 'from-green-500 to-lime-500',
    },
    {
      label: t('home.stats.highest'),
      value: `$${formatUSDC(highestPool)}`,
      icon: TrendingUp,
      color: 'from-lime-500 to-emerald-500',
    },
    {
      label: t('home.stats.participants'),
      value: totalParticipants.toString(),
      icon: Users,
      color: 'from-teal-500 to-emerald-500',
    },
  ];

  const trustBadges = [
    { label: 'Transparente', icon: Shield },
    { label: 'Multichain', icon: Layers },
    { label: 'USDC', icon: Coins },
    { label: 'Sorteo automático', icon: Zap },
    { label: 'Pagos onchain', icon: CheckCircle2 },
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
    <div className="min-h-screen">
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h1
              className="text-4xl md:text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent leading-tight"
              style={{ fontWeight: 700, letterSpacing: '-0.02em' }}
            >
              {t('home.hero.title')}
            </h1>
          </motion.div>

          <motion.p
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            {t('home.hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-3 justify-center mb-12"
          >
            <button
              onClick={() => {
                const exploreSection = document.getElementById('explore');
                exploreSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-7 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              {t('home.hero.explore')}
            </button>

            <button
              onClick={() => setCurrentPage('create')}
              className="px-7 py-3 rounded-xl bg-background border border-primary/30 text-primary hover:bg-primary/5 transition-all"
            >
              {t('home.hero.create')}
            </button>
          </motion.div>

          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            {trustBadges.map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-xl bg-primary/5 border border-primary/20 text-sm"
              >
                <badge.icon className="w-3.5 h-3.5 text-primary" />
                <span>{badge.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl blur-md" />
              <div className="relative backdrop-blur-md bg-card border border-border rounded-2xl p-6">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-4xl mb-2" style={{ fontWeight: 700 }}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 py-16">
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl mb-16 text-center"
          style={{ fontWeight: 700 }}
        >
          {t('home.how.title')}
        </motion.h2>

        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          <InfoCard
            icon={Sparkles}
            title={t('home.how.title')}
            items={howItWorksSteps}
            gradient="from-emerald-500 to-green-600"
          />

          <InfoCard
            icon={Layers}
            title={t('home.create.title')}
            items={createSteps}
            gradient="from-lime-500 to-teal-600"
          />

          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl blur-md" />
            <div className="relative backdrop-blur-md bg-card border border-border rounded-2xl p-8">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6">
                <DollarSign className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl mb-6" style={{ fontWeight: 600 }}>
                {t('home.distribution.title')}
              </h3>

              <div className="space-y-5">
                {distributionItems.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{item.text}</span>
                      <span className="text-xl text-primary" style={{ fontWeight: 700 }}>
                        {item.percentage}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent"
                        style={{ width: item.percentage }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 py-12">
        <div id="explore" className="scroll-mt-20">
          <div className="flex items-center justify-between gap-4 mb-8">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl"
              style={{ fontWeight: 700 }}
            >
              {t('header.explore')}
            </motion.h2>

            <button
              onClick={refetch}
              className="px-4 py-2 rounded-xl border border-border hover:bg-muted transition-all text-sm"
            >
              {t('home.refresh')}
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <input
              type="text"
              placeholder={t('filters.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-black"
            />

            <div className="flex gap-4">
              <div className="relative">
                <select
                  value={selectedChain}
                  onChange={(e) => setSelectedChain(e.target.value as SupportedChainKey | 'all')}
                  className="appearance-none px-4 py-3 pr-10 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer text-black"
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
                  className="appearance-none px-4 py-3 pr-10 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer text-black"
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
          </div>

          {isLoading && (
            <div className="py-16 text-center text-muted-foreground">
              {t('home.loading_lotteries')}
            </div>
          )}

          {hasError && (
            <div className="py-6 px-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 mb-8">
              <p className="text-yellow-600 font-semibold mb-2">
                {t('home.partial_error_title')}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
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
            <div className="py-16 text-center rounded-2xl border border-border bg-card">
              <p className="text-xl mb-2">{t('home.no_open_title')}</p>
              <p className="text-muted-foreground mb-6">
                {t('home.no_open_body')}
              </p>
              <button
                onClick={() => setCurrentPage('create')}
                className="px-5 py-3 rounded-xl bg-primary text-primary-foreground"
              >
                Crear lotería
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLotteries.map((lottery, i) => (
              <motion.div
                key={`${lottery.chain}-${lottery.id.toString()}`}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.03, 0.2) }}
              >
                <RealLotteryCard lottery={lottery} onClick={() => openLotteryDetail(lottery)} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  items,
  gradient,
}: {
  icon: typeof Sparkles;
  title: string;
  items: { text: string; icon: typeof Sparkles }[];
  gradient: string;
}) {
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl blur-md" />
      <div className="relative backdrop-blur-md bg-card border border-border rounded-2xl p-8">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6`}>
          <Icon className="w-7 h-7 text-white" />
        </div>

        <h3 className="text-xl mb-6" style={{ fontWeight: 600 }}>
          {title}
        </h3>

        <div className="space-y-4">
          {items.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <step.icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function RealLotteryCard({ lottery, onClick }: { lottery: Lottery; onClick: () => void }) {
  const { t } = useTranslation();
  const chain = CHAIN_CONFIG[lottery.chain];
  const currentPool = lottery.totalRaised;
  const maxPool = lottery.ticketPrice * lottery.maxTickets;

  const progress =
    lottery.maxTickets > 0n
      ? Number((lottery.ticketsSold * 10000n) / lottery.maxTickets) / 100
      : 0;

  const isAlmostFull = progress >= 80;
  const isHighPool = currentPool >= 100_000_000n; // 100 USDC con 6 decimales
  const isNew = lottery.id >= 2n;

  return (
    <button
      onClick={onClick}
      className="w-full text-left relative group transition-transform hover:-translate-y-1"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition" />

      <div className="relative backdrop-blur-md bg-card border border-border rounded-2xl p-6 h-full">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-xl font-bold">{lottery.name}</h3>

              {isNew && (
                <span className="px-2 py-1 rounded-full text-[10px] bg-primary/10 text-primary">
                  {t('home.badge.new')}
                </span>
              )}

              {isAlmostFull && (
                <span className="px-2 py-1 rounded-full text-[10px] bg-yellow-500/15 text-yellow-600">
                  {t('home.badge.almostFull')}
                </span>
              )}

              {isHighPool && (
                <span className="px-2 py-1 rounded-full text-[10px] bg-emerald-500/15 text-emerald-600">
                  {t('home.badge.highPool')}
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground">ID: {lottery.id.toString()}</p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs text-white bg-gradient-to-r ${chainColors[lottery.chain]}`}
          >
            {chain.shortName}
          </span>
        </div>

        <div className="space-y-3 mb-5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('home.creator_label')}</span>
            <span className="font-mono">{formatAddress(lottery.creator)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('home.ticket_label')}</span>
            <span>{formatUSDC(lottery.ticketPrice)} USDC</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('home.sold_label')}</span>
            <span>
              {lottery.ticketsSold.toString()} / {lottery.maxTickets.toString()}
            </span>
          </div>
        </div>

        <div className="mb-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">{t('home.progress_label')}</span>
            <span>{progress.toFixed(1)}%</span>
          </div>

          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary via-accent to-emerald-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">{t('home.current_pool_label')}</p>
            <p className="font-bold text-primary">{formatUSDC(currentPool)} USDC</p>
          </div>

          <div className="p-3 rounded-xl bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">{t('home.max_pool_label')}</p>
            <p className="font-bold">{formatUSDC(maxPool)} USDC</p>
          </div>
        </div>
      </div>
    </button>
  );
}
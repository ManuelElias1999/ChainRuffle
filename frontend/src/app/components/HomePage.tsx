import { motion } from 'motion/react';
import { useTranslation } from '../context/TranslationContext';
import { mockLotteries, mockStats } from '../data/mockData';
import { LotteryCard } from './LotteryCard';
import { Blockchain } from '../types/lottery';
import { useState } from 'react';
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

interface HomePageProps {
  setCurrentPage: (page: string) => void;
  setSelectedLottery: (id: string) => void;
}

export function HomePage({ setCurrentPage, setSelectedLottery }: HomePageProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChain, setSelectedChain] = useState<Blockchain | 'all'>('all');
  const [sortBy, setSortBy] = useState('highestPool');

  const openLotteries = mockLotteries.filter((l) => l.status === 'open');

  const filteredLotteries = openLotteries
    .filter((lottery) => {
      const matchesSearch =
        lottery.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lottery.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesChain = selectedChain === 'all' || lottery.blockchain === selectedChain;
      return matchesSearch && matchesChain;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'highestPool':
          return b.ticketsSold * b.ticketPrice - a.ticketsSold * a.ticketPrice;
        case 'highestMax':
          return b.maxTickets * b.ticketPrice - a.maxTickets * a.ticketPrice;
        case 'lowestPrice':
          return a.ticketPrice - b.ticketPrice;
        case 'highestPrice':
          return b.ticketPrice - a.ticketPrice;
        case 'closestFull':
          return b.ticketsSold / b.maxTickets - a.ticketsSold / a.maxTickets;
        default:
          return 0;
      }
    });

  const stats = [
    {
      label: t('home.stats.open'),
      value: mockStats.openLotteries,
      icon: Sparkles,
      color: 'from-emerald-500 to-green-500',
    },
    {
      label: t('home.stats.pool'),
      value: `$${mockStats.totalPoolUSDC.toLocaleString()}`,
      icon: TrendingUp,
      color: 'from-green-500 to-lime-500',
    },
    {
      label: t('home.stats.highest'),
      value: `$${mockStats.highestPool}`,
      icon: TrendingUp,
      color: 'from-lime-500 to-emerald-500',
    },
    {
      label: t('home.stats.participants'),
      value: mockStats.totalParticipants,
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
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

      {/* Stats Section */}
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
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative backdrop-blur-xl bg-card border border-border rounded-2xl p-6">
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

      {/* How It Works Section */}
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
          {/* How It Works */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl blur-xl" />
            <div className="relative backdrop-blur-xl bg-card border border-border rounded-2xl p-8">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl mb-6" style={{ fontWeight: 600 }}>
                {t('home.how.title')}
              </h3>
              <div className="space-y-4">
                {howItWorksSteps.map((step, i) => (
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

          {/* Create Lottery */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-lime-500/10 to-teal-500/10 rounded-2xl blur-xl" />
            <div className="relative backdrop-blur-xl bg-card border border-border rounded-2xl p-8">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-lime-500 to-teal-600 flex items-center justify-center mb-6">
                <Layers className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl mb-6" style={{ fontWeight: 600 }}>
                {t('home.create.title')}
              </h3>
              <div className="space-y-4">
                {createSteps.map((step, i) => (
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

          {/* Distribution */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl blur-xl" />
            <div className="relative backdrop-blur-xl bg-card border border-border rounded-2xl p-8">
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

      {/* Explorer Section */}
      <section className="max-w-[1400px] mx-auto px-6 py-12">
        <div id="explore" className="scroll-mt-20">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl mb-8"
            style={{ fontWeight: 700 }}
          >
            {t('header.explore')}
          </motion.h2>

          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <input
              type="text"
              placeholder={t('filters.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            />

            <div className="flex gap-4">
              <div className="relative">
                <select
                  value={selectedChain}
                  onChange={(e) => setSelectedChain(e.target.value as Blockchain | 'all')}
                  className="appearance-none px-4 py-3 pr-10 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                >
                  <option value="all">{t('filters.all')}</option>
                  <option value="Base">Base</option>
                  <option value="Avalanche">Avalanche</option>
                  <option value="Arbitrum">Arbitrum</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none px-4 py-3 pr-10 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLotteries.map((lottery, i) => (
              <motion.div
                key={lottery.id}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <LotteryCard lottery={lottery} onClick={() => setSelectedLottery(lottery.id)} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { Sparkles, Shield, DollarSign, TrendingUp, Search, SlidersHorizontal, X } from 'lucide-react';
import { Link } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { mockLotteries } from '../data/mockLotteries';
import { LotteryFilters } from '../types/lottery';
import { LotteryCard } from '../components/LotteryCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';

export const Home: React.FC = () => {
  const { t } = useLanguage();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<LotteryFilters>({
    search: '',
    currentPoolMin: '',
    currentPoolMax: '',
    maxPoolMin: '',
    maxPoolMax: '',
    ticketPriceMin: '',
    ticketPriceMax: '',
    ticketsSoldMin: '',
    ticketsSoldMax: '',
    totalTicketsMin: '',
    totalTicketsMax: '',
    remainingTicketsMin: '',
    remainingTicketsMax: '',
    sortBy: 'highestPool',
  });

  const openLotteries = mockLotteries.filter(l => l.status === 'open');

  // Calculate stats
  const stats = {
    openLotteries: openLotteries.length,
    totalPool: openLotteries.reduce((sum, l) => sum + l.currentPool, 0),
    highestPool: Math.max(...openLotteries.map(l => l.currentPool)),
    totalParticipants: openLotteries.reduce((sum, l) => sum + l.participants.length, 0),
  };

  // Filter and sort lotteries
  const filteredLotteries = useMemo(() => {
    let result = [...openLotteries];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        l => l.name.toLowerCase().includes(searchLower) || l.id.toLowerCase().includes(searchLower)
      );
    }

    // Numeric filters
    if (filters.currentPoolMin) {
      result = result.filter(l => l.currentPool >= parseFloat(filters.currentPoolMin));
    }
    if (filters.currentPoolMax) {
      result = result.filter(l => l.currentPool <= parseFloat(filters.currentPoolMax));
    }
    if (filters.maxPoolMin) {
      result = result.filter(l => l.maxPool >= parseFloat(filters.maxPoolMin));
    }
    if (filters.maxPoolMax) {
      result = result.filter(l => l.maxPool <= parseFloat(filters.maxPoolMax));
    }
    if (filters.ticketPriceMin) {
      result = result.filter(l => l.ticketPrice >= parseFloat(filters.ticketPriceMin));
    }
    if (filters.ticketPriceMax) {
      result = result.filter(l => l.ticketPrice <= parseFloat(filters.ticketPriceMax));
    }
    if (filters.ticketsSoldMin) {
      result = result.filter(l => l.ticketsSold >= parseFloat(filters.ticketsSoldMin));
    }
    if (filters.ticketsSoldMax) {
      result = result.filter(l => l.ticketsSold <= parseFloat(filters.ticketsSoldMax));
    }
    if (filters.totalTicketsMin) {
      result = result.filter(l => l.maxTickets >= parseFloat(filters.totalTicketsMin));
    }
    if (filters.totalTicketsMax) {
      result = result.filter(l => l.maxTickets <= parseFloat(filters.totalTicketsMax));
    }
    if (filters.remainingTicketsMin) {
      result = result.filter(l => (l.maxTickets - l.ticketsSold) >= parseFloat(filters.remainingTicketsMin));
    }
    if (filters.remainingTicketsMax) {
      result = result.filter(l => (l.maxTickets - l.ticketsSold) <= parseFloat(filters.remainingTicketsMax));
    }

    // Sort
    switch (filters.sortBy) {
      case 'highestPool':
        result.sort((a, b) => b.currentPool - a.currentPool);
        break;
      case 'highestMaxPool':
        result.sort((a, b) => b.maxPool - a.maxPool);
        break;
      case 'lowestPrice':
        result.sort((a, b) => a.ticketPrice - b.ticketPrice);
        break;
      case 'highestPrice':
        result.sort((a, b) => b.ticketPrice - a.ticketPrice);
        break;
      case 'newest':
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'closestToFull':
        result.sort((a, b) => {
          const aProgress = a.ticketsSold / a.maxTickets;
          const bProgress = b.ticketsSold / b.maxTickets;
          return bProgress - aProgress;
        });
        break;
    }

    return result;
  }, [openLotteries, filters]);

  const resetFilters = () => {
    setFilters({
      search: '',
      currentPoolMin: '',
      currentPoolMax: '',
      maxPoolMin: '',
      maxPoolMax: '',
      ticketPriceMin: '',
      ticketPriceMax: '',
      ticketsSoldMin: '',
      ticketsSoldMax: '',
      totalTicketsMin: '',
      totalTicketsMax: '',
      remainingTicketsMin: '',
      remainingTicketsMax: '',
      sortBy: 'highestPool',
    });
  };

  const featuredLotteries = [...openLotteries].sort((a, b) => b.currentPool - a.currentPool).slice(0, 3);
  const mostActiveLotteries = [...openLotteries].sort((a, b) => b.ticketsSold - a.ticketsSold).slice(0, 3);
  const recentLotteries = [...openLotteries].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0b14] via-[#0f1123] to-[#0a0b14]">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/5 px-4 py-20 sm:px-6 lg:px-8">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="mb-6 bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl lg:text-6xl">
            {t('hero.title')}
          </h1>
          <p className="mb-8 text-lg text-gray-300 sm:text-xl">
            {t('hero.subtitle')}
          </p>

          <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 font-medium text-white hover:from-blue-700 hover:to-cyan-700">
                <Sparkles className="mr-2 h-5 w-5" />
                {t('hero.exploreCta')}
              </Button>
            </Link>
            <Link to="/create">
              <Button size="lg" variant="outline" className="border-white/20 bg-white/5 px-8 text-white hover:bg-white/10">
                <TrendingUp className="mr-2 h-5 w-5" />
                {t('hero.createCta')}
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Badge className="border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-blue-300">
              <Shield className="mr-1.5 h-3.5 w-3.5" />
              {t('hero.badge.onchain')}
            </Badge>
            <Badge className="border-green-500/30 bg-green-500/10 px-3 py-1.5 text-green-300">
              <DollarSign className="mr-1.5 h-3.5 w-3.5" />
              {t('hero.badge.usdc')}
            </Badge>
            <Badge className="border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-cyan-300">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              {t('hero.badge.transparent')}
            </Badge>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <p className="mb-2 text-sm text-gray-400">{t('stats.openLotteries')}</p>
                <p className="text-3xl font-bold text-white">{stats.openLotteries}</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <p className="mb-2 text-sm text-gray-400">{t('stats.totalPool')}</p>
                <p className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-3xl font-bold text-transparent">
                  {stats.totalPool.toLocaleString()} USDC
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <p className="mb-2 text-sm text-gray-400">{t('stats.highestPool')}</p>
                <p className="bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-3xl font-bold text-transparent">
                  {stats.highestPool.toLocaleString()} USDC
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <p className="mb-2 text-sm text-gray-400">{t('stats.totalParticipants')}</p>
                <p className="text-3xl font-bold text-white">{stats.totalParticipants}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Sections */}
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-12">
          {/* Highest Pool */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-white">{t('explorer.featured')}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredLotteries.map(lottery => (
                <LotteryCard key={lottery.id} lottery={lottery} />
              ))}
            </div>
          </div>

          {/* Most Active */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-white">{t('explorer.mostActive')}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mostActiveLotteries.map(lottery => (
                <LotteryCard key={lottery.id} lottery={lottery} />
              ))}
            </div>
          </div>

          {/* Recent */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-white">{t('explorer.recent')}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentLotteries.map(lottery => (
                <LotteryCard key={lottery.id} lottery={lottery} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* All Lotteries Explorer */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-6 text-2xl font-bold text-white">{t('explorer.allLotteries')}</h2>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t('explorer.searchPlaceholder')}
                  value={filters.search}
                  onChange={e => setFilters({ ...filters, search: e.target.value })}
                  className="w-full border-white/10 bg-white/5 pl-10 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="flex gap-2">
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: any) => setFilters({ ...filters, sortBy: value })}
                >
                  <SelectTrigger className="w-[200px] border-white/10 bg-white/5 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#1a1b2e] text-white">
                    <SelectItem value="highestPool">{t('sort.highestPool')}</SelectItem>
                    <SelectItem value="highestMaxPool">{t('sort.highestMaxPool')}</SelectItem>
                    <SelectItem value="lowestPrice">{t('sort.lowestPrice')}</SelectItem>
                    <SelectItem value="highestPrice">{t('sort.highestPrice')}</SelectItem>
                    <SelectItem value="newest">{t('sort.newest')}</SelectItem>
                    <SelectItem value="closestToFull">{t('sort.closestToFull')}</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {t('explorer.filters')}
                </Button>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{t('explorer.filters')}</h3>
                  <Button
                    onClick={() => setShowFilters(false)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Current Pool */}
                  <div>
                    <label className="mb-2 block text-sm text-gray-300">{t('filter.currentPool')}</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder={t('filter.min')}
                        value={filters.currentPoolMin}
                        onChange={e => setFilters({ ...filters, currentPoolMin: e.target.value })}
                        className="border-white/10 bg-white/5 text-white"
                      />
                      <Input
                        type="number"
                        placeholder={t('filter.max')}
                        value={filters.currentPoolMax}
                        onChange={e => setFilters({ ...filters, currentPoolMax: e.target.value })}
                        className="border-white/10 bg-white/5 text-white"
                      />
                    </div>
                  </div>

                  {/* Max Pool */}
                  <div>
                    <label className="mb-2 block text-sm text-gray-300">{t('filter.maxPool')}</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder={t('filter.min')}
                        value={filters.maxPoolMin}
                        onChange={e => setFilters({ ...filters, maxPoolMin: e.target.value })}
                        className="border-white/10 bg-white/5 text-white"
                      />
                      <Input
                        type="number"
                        placeholder={t('filter.max')}
                        value={filters.maxPoolMax}
                        onChange={e => setFilters({ ...filters, maxPoolMax: e.target.value })}
                        className="border-white/10 bg-white/5 text-white"
                      />
                    </div>
                  </div>

                  {/* Ticket Price */}
                  <div>
                    <label className="mb-2 block text-sm text-gray-300">{t('filter.ticketPrice')}</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder={t('filter.min')}
                        value={filters.ticketPriceMin}
                        onChange={e => setFilters({ ...filters, ticketPriceMin: e.target.value })}
                        className="border-white/10 bg-white/5 text-white"
                      />
                      <Input
                        type="number"
                        placeholder={t('filter.max')}
                        value={filters.ticketPriceMax}
                        onChange={e => setFilters({ ...filters, ticketPriceMax: e.target.value })}
                        className="border-white/10 bg-white/5 text-white"
                      />
                    </div>
                  </div>

                  {/* Tickets Sold */}
                  <div>
                    <label className="mb-2 block text-sm text-gray-300">{t('filter.ticketsSold')}</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder={t('filter.min')}
                        value={filters.ticketsSoldMin}
                        onChange={e => setFilters({ ...filters, ticketsSoldMin: e.target.value })}
                        className="border-white/10 bg-white/5 text-white"
                      />
                      <Input
                        type="number"
                        placeholder={t('filter.max')}
                        value={filters.ticketsSoldMax}
                        onChange={e => setFilters({ ...filters, ticketsSoldMax: e.target.value })}
                        className="border-white/10 bg-white/5 text-white"
                      />
                    </div>
                  </div>

                  {/* Total Tickets */}
                  <div>
                    <label className="mb-2 block text-sm text-gray-300">{t('filter.totalTickets')}</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder={t('filter.min')}
                        value={filters.totalTicketsMin}
                        onChange={e => setFilters({ ...filters, totalTicketsMin: e.target.value })}
                        className="border-white/10 bg-white/5 text-white"
                      />
                      <Input
                        type="number"
                        placeholder={t('filter.max')}
                        value={filters.totalTicketsMax}
                        onChange={e => setFilters({ ...filters, totalTicketsMax: e.target.value })}
                        className="border-white/10 bg-white/5 text-white"
                      />
                    </div>
                  </div>

                  {/* Remaining Tickets */}
                  <div>
                    <label className="mb-2 block text-sm text-gray-300">{t('filter.remainingTickets')}</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder={t('filter.min')}
                        value={filters.remainingTicketsMin}
                        onChange={e => setFilters({ ...filters, remainingTicketsMin: e.target.value })}
                        className="border-white/10 bg-white/5 text-white"
                      />
                      <Input
                        type="number"
                        placeholder={t('filter.max')}
                        value={filters.remainingTicketsMax}
                        onChange={e => setFilters({ ...filters, remainingTicketsMax: e.target.value })}
                        className="border-white/10 bg-white/5 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button onClick={resetFilters} variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
                    {t('explorer.resetFilters')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLotteries.map(lottery => (
              <LotteryCard key={lottery.id} lottery={lottery} />
            ))}
          </div>

          {filteredLotteries.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-sm">
              <p className="text-gray-400">{t('common.noResults')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
import React from 'react';
import { Link } from 'react-router';
import { TrendingUp, Users, Ticket } from 'lucide-react';
import { Lottery } from '../types/lottery';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface LotteryCardProps {
  lottery: Lottery;
}

export const LotteryCard: React.FC<LotteryCardProps> = ({ lottery }) => {
  const { t } = useLanguage();
  
  const progress = (lottery.ticketsSold / lottery.maxTickets) * 100;
  const remaining = lottery.maxTickets - lottery.ticketsSold;

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10">
      {/* Glassmorphic effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      
      <div className="relative">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="mb-1 truncate text-lg font-semibold text-white">
              {lottery.name}
            </h3>
            <p className="text-sm text-gray-400">ID: {lottery.id}</p>
          </div>
          <Badge 
            className={`shrink-0 ${
              lottery.status === 'open'
                ? 'border-green-500/30 bg-green-500/10 text-green-400'
                : 'border-gray-500/30 bg-gray-500/10 text-gray-400'
            }`}
          >
            {lottery.status === 'open' ? t('card.status.open') : t('card.status.closed')}
          </Badge>
        </div>

        {/* Creator */}
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-400">{t('card.creator')}:</span>
          <span className="text-sm font-mono text-gray-300">{formatAddress(lottery.creator)}</span>
        </div>

        {/* Stats Grid */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <Ticket className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-xs text-gray-400">{t('card.ticketPrice')}</span>
            </div>
            <p className="text-base font-semibold text-white">{lottery.ticketPrice} USDC</p>
          </div>
          
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-green-400" />
              <span className="text-xs text-gray-400">{t('card.ticketsSold')}</span>
            </div>
            <p className="text-base font-semibold text-white">
              {lottery.ticketsSold}/{lottery.maxTickets}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-gray-400">{remaining} {t('card.remaining')}</span>
            <span className="font-medium text-blue-400">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Pool Info */}
        <div className="mb-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">{t('card.currentPool')}</span>
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-lg font-bold text-transparent">
              {lottery.currentPool.toLocaleString()} USDC
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">{t('card.maxPool')}</span>
            <span className="text-sm font-semibold text-gray-300">
              {lottery.maxPool.toLocaleString()} USDC
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Link to={`/lottery/${lottery.id}`}>
          <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 font-medium text-white hover:from-blue-700 hover:to-cyan-700">
            {t('card.viewDetails')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

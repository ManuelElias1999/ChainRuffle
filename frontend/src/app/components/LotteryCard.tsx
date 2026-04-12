import { motion } from 'motion/react';
import { useTranslation } from '../context/TranslationContext';
import { Lottery } from '../types/lottery';
import { ExternalLink } from 'lucide-react';

interface LotteryCardProps {
  lottery: Lottery;
  onClick: () => void;
}

const chainColors = {
  Base: 'from-blue-500 to-blue-600',
  Avalanche: 'from-red-500 to-red-600',
  Arbitrum: 'from-cyan-500 to-cyan-600',
};

export function LotteryCard({ lottery, onClick }: LotteryCardProps) {
  const { t } = useTranslation();
  const currentPool = lottery.ticketsSold * lottery.ticketPrice;
  const maxPool = lottery.maxTickets * lottery.ticketPrice;
  const progress = (lottery.ticketsSold / lottery.maxTickets) * 100;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={onClick}
      className="relative group cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
      <div className="relative backdrop-blur-xl bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl mb-1" style={{ fontWeight: 600 }}>
              {lottery.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('lottery.id')}: {lottery.id}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${chainColors[lottery.blockchain]} text-white text-sm`}>
            {lottery.blockchain}
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('lottery.creator')}</span>
            <span className="font-mono">
              {lottery.creator.slice(0, 6)}...{lottery.creator.slice(-4)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('lottery.price')}</span>
            <span style={{ fontWeight: 600 }}>${lottery.ticketPrice} USDC</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('lottery.sold')}</span>
            <span style={{ fontWeight: 600 }}>
              {lottery.ticketsSold} / {lottery.maxTickets}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">{t('lottery.pool')}</span>
            <span style={{ fontWeight: 600 }}>${currentPool} USDC</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-primary to-accent"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{progress.toFixed(0)}%</span>
            <span>
              {t('lottery.maxPool')}: ${maxPool}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary">
            {t('lottery.status.open')}
          </span>
          <button className="flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors">
            {t('lottery.viewDetails')}
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

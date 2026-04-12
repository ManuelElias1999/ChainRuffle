import { motion } from 'motion/react';
import { useTranslation } from '../context/TranslationContext';
import { useWallet } from '../context/WalletContext';
import { useState } from 'react';
import { Trophy, TrendingUp, History, Target } from 'lucide-react';
import { mockLotteries } from '../data/mockData';

interface DashboardProps {
  setCurrentPage: (page: string) => void;
  setSelectedLottery: (id: string) => void;
}

const chainColors = {
  Base: 'from-blue-500 to-blue-600',
  Avalanche: 'from-red-500 to-red-600',
  Arbitrum: 'from-cyan-500 to-cyan-600',
};

export function Dashboard({ setSelectedLottery }: DashboardProps) {
  const { t } = useTranslation();
  const { isConnected, address } = useWallet();
  const [activeTab, setActiveTab] = useState<'created' | 'participating' | 'history' | 'results'>('created');

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">Conecta tu wallet para ver tu dashboard</p>
        </div>
      </div>
    );
  }

  const myLotteries = mockLotteries.filter((l) => l.creator === address);
  const participating = mockLotteries.filter((l) =>
    l.participants.some((p) => p.address.includes(address?.slice(2, 6) || ''))
  );
  const history = [...myLotteries, ...participating].filter((l) => l.status === 'closed');
  const results = history.filter((l) => l.winner);

  const tabs = [
    { id: 'created', label: t('dashboard.myLotteries'), icon: Target, count: myLotteries.length },
    { id: 'participating', label: t('dashboard.participating'), icon: TrendingUp, count: participating.length },
    { id: 'history', label: t('dashboard.history'), icon: History, count: history.length },
    { id: 'results', label: t('dashboard.results'), icon: Trophy, count: results.length },
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case 'created':
        return myLotteries;
      case 'participating':
        return participating;
      case 'history':
        return history;
      case 'results':
        return results;
      default:
        return [];
    }
  };

  const currentData = getCurrentData();

  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl md:text-5xl mb-12"
          style={{ fontWeight: 700 }}
        >
          Dashboard
        </motion.h1>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl blur-xl" />
            <div className="relative backdrop-blur-xl bg-card border border-border rounded-2xl p-2">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`p-4 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <tab.icon className="w-5 h-5" />
                      <span className="text-2xl" style={{ fontWeight: 700 }}>
                        {tab.count}
                      </span>
                    </div>
                    <div className="text-sm">{tab.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {currentData.length === 0 ? (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-xl text-muted-foreground">{t('dashboard.empty')}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentData.map((lottery, i) => (
              <motion.div
                key={lottery.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedLottery(lottery.id)}
                className="relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative backdrop-blur-xl bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl mb-1" style={{ fontWeight: 600 }}>
                        {lottery.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{lottery.id}</p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full bg-gradient-to-r ${chainColors[lottery.blockchain]} text-white text-sm`}
                    >
                      {lottery.blockchain}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('lottery.sold')}</span>
                      <span style={{ fontWeight: 600 }}>
                        {lottery.ticketsSold} / {lottery.maxTickets}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('lottery.pool')}</span>
                      <span style={{ fontWeight: 600 }}>${lottery.ticketsSold * lottery.ticketPrice} USDC</span>
                    </div>
                    {lottery.status === 'closed' && lottery.winner && (
                      <div className="pt-3 border-t border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{t('detail.winner')}</span>
                          <span className="text-sm font-mono">{lottery.winner}</span>
                        </div>
                        {lottery.winner.includes(address?.slice(2, 6) || '') && (
                          <div className="mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm text-center">
                            {t('dashboard.won')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <span
                      className={`text-sm px-3 py-1 rounded-full ${
                        lottery.status === 'open'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {lottery.status === 'open' ? t('lottery.status.open') : t('lottery.status.closed')}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

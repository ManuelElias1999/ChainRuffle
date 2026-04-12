import { motion } from 'motion/react';
import { useTranslation } from '../context/TranslationContext';
import { useWallet } from '../context/WalletContext';
import { useState } from 'react';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { Blockchain } from '../types/lottery';

interface CreateLotteryProps {
  setCurrentPage: (page: string) => void;
}

const chainColors = {
  Base: 'from-blue-500 to-blue-600',
  Avalanche: 'from-red-500 to-red-600',
  Arbitrum: 'from-cyan-500 to-cyan-600',
};

export function CreateLottery({ setCurrentPage }: CreateLotteryProps) {
  const { t } = useTranslation();
  const { isConnected } = useWallet();
  const [name, setName] = useState('');
  const [blockchain, setBlockchain] = useState<Blockchain>('Base');
  const [ticketPrice, setTicketPrice] = useState(10);
  const [maxTickets, setMaxTickets] = useState(100);
  const [isCreating, setIsCreating] = useState(false);

  const estimatedMaxPool = ticketPrice * maxTickets;

  const handleCreate = async () => {
    setIsCreating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsCreating(false);
    setCurrentPage('explore');
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => setCurrentPage('explore')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </motion.button>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl md:text-5xl mb-12"
          style={{ fontWeight: 700 }}
        >
          {t('create.title')}
        </motion.h1>

        {!isConnected ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">Conecta tu wallet para crear una lotería</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl" />
                <div className="relative backdrop-blur-xl bg-card border border-border rounded-2xl p-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm mb-2" style={{ fontWeight: 600 }}>
                        {t('create.name')}
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Mi Super Lotería"
                        className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-3" style={{ fontWeight: 600 }}>
                        {t('create.blockchain')}
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['Base', 'Avalanche', 'Arbitrum'] as Blockchain[]).map((chain) => (
                          <button
                            key={chain}
                            onClick={() => setBlockchain(chain)}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              blockchain === chain
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${chainColors[chain]} mx-auto mb-2`}
                            />
                            <div className="text-sm" style={{ fontWeight: 600 }}>
                              {chain}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm mb-2" style={{ fontWeight: 600 }}>
                          {t('create.ticketPrice')}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            value={ticketPrice}
                            onChange={(e) => setTicketPrice(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-4 py-3 pr-16 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            USDC
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm mb-2" style={{ fontWeight: 600 }}>
                          {t('create.maxTickets')}
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={maxTickets}
                          onChange={(e) => setMaxTickets(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-1">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="relative sticky top-24"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl" />
                <div className="relative backdrop-blur-xl bg-card border border-border rounded-2xl p-6">
                  <h3 className="text-lg mb-6 flex items-center gap-2" style={{ fontWeight: 600 }}>
                    <Sparkles className="w-5 h-5 text-primary" />
                    {t('create.summary')}
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">{t('create.chain')}</div>
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${chainColors[blockchain]} text-white text-sm`}
                      >
                        {blockchain}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">{t('lottery.price')}</div>
                      <div className="text-2xl" style={{ fontWeight: 700 }}>
                        ${ticketPrice} USDC
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">{t('create.maxTickets')}</div>
                      <div className="text-2xl" style={{ fontWeight: 700 }}>
                        {maxTickets}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="text-sm text-muted-foreground mb-1">{t('create.estimatedMax')}</div>
                      <div className="text-3xl text-primary" style={{ fontWeight: 800 }}>
                        ${estimatedMaxPool} USDC
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCreate}
                    disabled={!name || isCreating}
                    className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isCreating ? t('create.creating') : t('create.submit')}
                  </button>

                  <div className="mt-6 p-4 rounded-xl bg-muted/50">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>{t('distribution.winner')}</div>
                      <div>{t('distribution.creator')}</div>
                      <div>{t('distribution.fees')}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

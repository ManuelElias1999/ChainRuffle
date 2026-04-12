import { motion } from 'motion/react';
import { useTranslation } from '../context/TranslationContext';
import { useWallet } from '../context/WalletContext';
import { mockLotteries } from '../data/mockData';
import { useState } from 'react';
import { ArrowLeft, Share2, QrCode, CheckCircle2, Loader2, Trophy, Users } from 'lucide-react';

interface LotteryDetailProps {
  lotteryId: string;
  setCurrentPage: (page: string) => void;
}

const chainColors = {
  Base: 'from-blue-500 to-blue-600',
  Avalanche: 'from-red-500 to-red-600',
  Arbitrum: 'from-cyan-500 to-cyan-600',
};

export function LotteryDetail({ lotteryId, setCurrentPage }: LotteryDetailProps) {
  const { t } = useTranslation();
  const { isConnected, address } = useWallet();
  const [quantity, setQuantity] = useState(1);
  const [approvalStatus, setApprovalStatus] = useState<'idle' | 'approving' | 'approved'>('idle');
  const [buyStatus, setBuyStatus] = useState<'idle' | 'buying' | 'success'>('idle');
  const [showQR, setShowQR] = useState(false);

  const lottery = mockLotteries.find((l) => l.id === lotteryId);

  if (!lottery) {
    return <div>Lottery not found</div>;
  }

  const currentPool = lottery.ticketsSold * lottery.ticketPrice;
  const maxPool = lottery.maxTickets * lottery.ticketPrice;
  const progress = (lottery.ticketsSold / lottery.maxTickets) * 100;
  const estimatedTotal = quantity * lottery.ticketPrice;
  const isCreator = address === lottery.creator;

  const handleApprove = async () => {
    setApprovalStatus('approving');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setApprovalStatus('approved');
  };

  const handleBuy = async () => {
    setBuyStatus('buying');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setBuyStatus('success');
  };

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
          Volver al explorador
        </motion.button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-xl" />
              <div className="relative backdrop-blur-xl bg-card border border-border rounded-3xl p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-4xl mb-2" style={{ fontWeight: 700 }}>
                      {lottery.name}
                    </h1>
                    <p className="text-muted-foreground">
                      {t('lottery.id')}: {lottery.id}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${chainColors[lottery.blockchain]} text-white`}>
                    {lottery.blockchain}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">{t('lottery.price')}</div>
                    <div className="text-2xl" style={{ fontWeight: 700 }}>
                      ${lottery.ticketPrice}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">{t('lottery.sold')}</div>
                    <div className="text-2xl" style={{ fontWeight: 700 }}>
                      {lottery.ticketsSold}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">{t('lottery.remaining')}</div>
                    <div className="text-2xl" style={{ fontWeight: 700 }}>
                      {lottery.maxTickets - lottery.ticketsSold}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">{t('lottery.pool')}</div>
                    <div className="text-2xl" style={{ fontWeight: 700 }}>
                      ${currentPool}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progreso</span>
                    <span style={{ fontWeight: 600 }}>{progress.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-primary via-accent to-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-all">
                    <Share2 className="w-4 h-4" />
                    {t('detail.share')}
                  </button>
                  {lottery.status === 'closed' && lottery.winner && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary">
                      <Trophy className="w-4 h-4" />
                      {t('detail.winner')}: {lottery.winner}
                    </div>
                  )}
                  {lottery.status === 'closed' && !lottery.winner && (
                    <div className="px-4 py-2 rounded-xl bg-muted text-muted-foreground">
                      {t('detail.noWinner')}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl blur-xl" />
              <div className="relative backdrop-blur-xl bg-card border border-border rounded-2xl p-6">
                <h3 className="text-xl mb-4 flex items-center gap-2" style={{ fontWeight: 600 }}>
                  <Users className="w-5 h-5" />
                  {t('detail.transparency')}
                </h3>
                <div className="space-y-3">
                  {lottery.participants.map((participant, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-muted/50">
                      <span className="font-mono text-sm">{participant.address}</span>
                      <span className="text-sm" style={{ fontWeight: 600 }}>
                        {participant.tickets} {t('detail.tickets')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {lottery.status === 'open' && (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="sticky top-24">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl" />
                <div className="relative backdrop-blur-xl bg-card border border-border rounded-2xl p-6">
                  <h3 className="text-xl mb-6" style={{ fontWeight: 600 }}>
                    {t('detail.purchase')}
                  </h3>

                  {!isConnected ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">Conecta tu wallet para comprar tickets</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">{t('detail.quantity')}</label>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>

                      <div className="p-4 rounded-xl bg-muted/50">
                        <div className="flex justify-between mb-2">
                          <span className="text-muted-foreground">{t('lottery.price')}</span>
                          <span>${lottery.ticketPrice} USDC</span>
                        </div>
                        <div className="flex justify-between text-lg" style={{ fontWeight: 600 }}>
                          <span>{t('detail.total')}</span>
                          <span className="text-primary">${estimatedTotal} USDC</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="p-4 rounded-xl border-2 border-dashed border-border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm" style={{ fontWeight: 600 }}>
                              {t('detail.step1')}
                            </span>
                            {approvalStatus === 'approved' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                          </div>
                          <button
                            onClick={handleApprove}
                            disabled={approvalStatus !== 'idle'}
                            className="w-full px-4 py-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {approvalStatus === 'approving' && <Loader2 className="w-4 h-4 animate-spin" />}
                            {approvalStatus === 'idle' && t('detail.approve')}
                            {approvalStatus === 'approving' && t('detail.approving')}
                            {approvalStatus === 'approved' && t('detail.approved')}
                          </button>
                        </div>

                        <button
                          onClick={handleBuy}
                          disabled={approvalStatus !== 'approved' || buyStatus !== 'idle'}
                          className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {buyStatus === 'buying' && <Loader2 className="w-4 h-4 animate-spin" />}
                          {buyStatus === 'idle' && t('detail.buy')}
                          {buyStatus === 'buying' && t('detail.buying')}
                          {buyStatus === 'success' && t('detail.success')}
                        </button>
                      </div>

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
                            {t('detail.qr.step1')} → {t('detail.qr.step2')}
                          </p>
                        </div>
                      )}

                      {isCreator && (
                        <button className="w-full px-4 py-3 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all">
                          {t('detail.close')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

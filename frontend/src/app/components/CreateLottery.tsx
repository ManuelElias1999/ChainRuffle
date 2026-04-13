import { motion } from 'motion/react';
import { useTranslation } from '../context/TranslationContext';
import { useState } from 'react';
import { ArrowLeft, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { useWallet } from '../../hooks/uswWallet';
import { useCreateLottery } from '../../hooks/useCreateLottery';
import { useSwitchToChain } from '../../hooks/useSwitchToChain';
import { SUPPORTED_CHAINS, CHAIN_CONFIG, type SupportedChainKey } from '../../config/chains';
import { addActivityItem, saveCreateTxHash } from '../../lib/txRegistry';
import { useAccount } from 'wagmi';


interface CreateLotteryProps {
  setCurrentPage: (page: string) => void;
  setSelectedLottery?: (id: string) => void;
}

const chainColors: Record<SupportedChainKey, string> = {
  base: 'from-blue-500 to-blue-600',
  avalanche: 'from-red-500 to-red-600',
  arbitrum: 'from-cyan-500 to-cyan-600',
};

export function CreateLottery({ setCurrentPage, setSelectedLottery }: CreateLotteryProps) {
  const { t } = useTranslation();
  const { isConnected, currentChain } = useWallet();
  const { createLottery, isCreating, createError } = useCreateLottery();
  const { switchToChain, isSwitching } = useSwitchToChain();
  const { address } = useAccount();

  const [name, setName] = useState('');
  const [selectedChain, setSelectedChain] = useState<SupportedChainKey>('base');
  const [ticketPrice, setTicketPrice] = useState('10');
  const [maxTickets, setMaxTickets] = useState('100');
  const [createTxHash, setCreateTxHash] = useState<`0x${string}` | null>(null);

  const selectedChainConfig = CHAIN_CONFIG[selectedChain];
  const isCorrectChain = currentChain?.key === selectedChain;

  const numericTicketPrice = Number(ticketPrice || 0);
  const numericMaxTickets = Number(maxTickets || 0);
  const estimatedMaxPool = numericTicketPrice * numericMaxTickets;

  const canCreate =
    name.trim().length > 0 &&
    numericTicketPrice > 0 &&
    numericMaxTickets > 0 &&
    isConnected &&
    isCorrectChain &&
    !isCreating;

    const handleCreate = async () => {
      if (!canCreate || !address) return;
    
      try {
        const result = await createLottery({
          chainKey: selectedChain,
          creator: address,
          name: name.trim(),
          ticketPrice,
          maxTickets,
        });
    
        setCreateTxHash(result.hash);
        saveCreateTxHash(selectedChain, result.lotteryId, result.hash);
        addActivityItem({
          type: 'create',
          chainKey: selectedChain,
          lotteryId: result.lotteryId,
          lotteryName: name.trim(),
          txHash: result.hash,
        });
    
        if (setSelectedLottery) {
          setSelectedLottery(`${selectedChain}:${result.lotteryId.toString()}`);
          return;
        }
    
        setCurrentPage('explore');
      } catch (err) {
        console.error('Error creating lottery:', err);
      }
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
          <div className="text-center py-20 rounded-2xl border border-border bg-card">
            <p className="text-xl text-muted-foreground">
              Conecta tu wallet para crear una lotería
            </p>
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
                        Blockchain
                      </label>

                      <div className="grid grid-cols-3 gap-3">
                        {SUPPORTED_CHAINS.map((chain) => (
                          <button
                            key={chain.key}
                            type="button"
                            onClick={() => setSelectedChain(chain.key)}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              selectedChain === chain.key
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                                chainColors[chain.key]
                              } mx-auto mb-2`}
                            />
                            <div className="text-sm" style={{ fontWeight: 600 }}>
                              {chain.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {!isCorrectChain && (
                      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold">Red incorrecta</p>
                          <p className="text-sm text-muted-foreground mb-3">
                            Estás conectado a {currentChain?.name ?? 'una red no soportada'}.
                            Cambia a {selectedChainConfig.name} para crear esta lotería.
                          </p>
                          <button
                            type="button"
                            onClick={() => switchToChain(selectedChain)}
                            disabled={isSwitching}
                            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
                          >
                            {isSwitching ? 'Cambiando red...' : `Cambiar a ${selectedChainConfig.name}`}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm mb-2" style={{ fontWeight: 600 }}>
                          {t('create.ticketPrice')}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={ticketPrice}
                            onChange={(e) => setTicketPrice(e.target.value)}
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
                          step="1"
                          value={maxTickets}
                          onChange={(e) => setMaxTickets(e.target.value)}
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
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${
                          chainColors[selectedChain]
                        } text-white text-sm`}
                      >
                        {selectedChainConfig.name}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">{t('lottery.price')}</div>
                      <div className="text-2xl" style={{ fontWeight: 700 }}>
                        ${ticketPrice || '0'} USDC
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">{t('create.maxTickets')}</div>
                      <div className="text-2xl" style={{ fontWeight: 700 }}>
                        {maxTickets || '0'}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="text-sm text-muted-foreground mb-1">{t('create.estimatedMax')}</div>
                      <div className="text-3xl text-primary" style={{ fontWeight: 800 }}>
                        ${Number.isFinite(estimatedMaxPool) ? estimatedMaxPool.toLocaleString() : '0'} USDC
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={!canCreate}
                    className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isCreating ? 'Creando...' : t('create.submit')}
                  </button>

                  {createTxHash && (
                    <a
                      href={`${CHAIN_CONFIG[selectedChain].explorerUrl}/tx/${createTxHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 block text-sm text-primary underline break-all"
                    >
                      Ver transacción de creación
                    </a>
                  )}

                  {createError && (
                    <p className="mt-4 text-sm text-red-500">
                      Error creando lotería. Revisa la wallet, la red o los datos.
                    </p>
                  )}

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
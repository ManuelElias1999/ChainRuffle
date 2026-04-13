import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { Trophy, Wallet, Sparkles, Clock3, CheckCircle2 } from 'lucide-react';
import { useAllLotteries } from '../../hooks/useAllLotteries';
import { CHAIN_CONFIG, type SupportedChainKey } from '../../config/chains';
import { formatAddress, formatUSDC } from '../../lib/formatters';
import type { Lottery } from '../../types/lottery';

interface DashboardProps {
  setCurrentPage: (page: string) => void;
  setSelectedLottery: (id: string) => void;
}

type DashboardTab = 'open' | 'closed' | 'all';

const chainColors: Record<SupportedChainKey, string> = {
  base: 'from-blue-500 to-blue-600',
  avalanche: 'from-red-500 to-red-600',
  arbitrum: 'from-cyan-500 to-cyan-600',
};

export function Dashboard({ setCurrentPage, setSelectedLottery }: DashboardProps) {
  const { address, isConnected } = useAccount();
  const { lotteries, isLoading, hasError, refetch } = useAllLotteries();
  const [tab, setTab] = useState<DashboardTab>('open');

  const myLotteries = useMemo(() => {
    if (!address) return [];

    return lotteries.filter(
      (lottery) => lottery.creator.toLowerCase() === address.toLowerCase()
    );
  }, [lotteries, address]);

  const filteredLotteries = useMemo(() => {
    if (tab === 'all') return myLotteries;
    if (tab === 'open') return myLotteries.filter((lottery) => lottery.isOpen);
    return myLotteries.filter((lottery) => !lottery.isOpen);
  }, [myLotteries, tab]);

  const totalCreated = myLotteries.length;
  const openCount = myLotteries.filter((lottery) => lottery.isOpen).length;
  const closedCount = myLotteries.filter((lottery) => !lottery.isOpen).length;

  const totalRaised = myLotteries.reduce((acc, lottery) => acc + lottery.totalRaised, 0n);

  const totalPotentialCreatorRevenue = myLotteries.reduce((acc, lottery) => {
    return acc + (lottery.totalRaised * 10n) / 100n;
  }, 0n);

  const openLotteryDetail = (lottery: Lottery) => {
    setSelectedLottery(`${lottery.chain}:${lottery.id.toString()}`);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <div className="rounded-3xl border border-border bg-card p-12 text-center">
            <Wallet className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold mb-3">Dashboard</h1>
            <p className="text-muted-foreground mb-6">
              Conecta tu wallet para ver las loterías que creaste.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Dashboard</h1>
            <p className="text-muted-foreground">
              Vista general de tus loterías creadas en Base, Avalanche y Arbitrum.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Wallet: {formatAddress(address!)}
            </p>
          </div>

          <button
            onClick={refetch}
            className="px-4 py-3 rounded-xl border border-border hover:bg-muted transition-all"
          >
            Actualizar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Loterías creadas"
            value={totalCreated.toString()}
            icon={Sparkles}
          />
          <StatCard
            title="Abiertas"
            value={openCount.toString()}
            icon={Clock3}
          />
          <StatCard
            title="Cerradas"
            value={closedCount.toString()}
            icon={CheckCircle2}
          />
          <StatCard
            title="Pozo total generado"
            value={`${formatUSDC(totalRaised)} USDC`}
            icon={Trophy}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-2">Ingresos estimados del creador</p>
            <p className="text-3xl font-bold text-primary">
              {formatUSDC(totalPotentialCreatorRevenue)} USDC
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Estimado con base en el 10% del pozo recaudado de tus loterías.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-2">Distribución multichain</p>
            <div className="space-y-2">
              <ChainLine
                label="Base"
                count={myLotteries.filter((lottery) => lottery.chain === 'base').length}
              />
              <ChainLine
                label="Avalanche"
                count={myLotteries.filter((lottery) => lottery.chain === 'avalanche').length}
              />
              <ChainLine
                label="Arbitrum"
                count={myLotteries.filter((lottery) => lottery.chain === 'arbitrum').length}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <TabButton active={tab === 'open'} onClick={() => setTab('open')}>
            Abiertas
          </TabButton>
          <TabButton active={tab === 'closed'} onClick={() => setTab('closed')}>
            Cerradas
          </TabButton>
          <TabButton active={tab === 'all'} onClick={() => setTab('all')}>
            Todas
          </TabButton>
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
            Cargando dashboard...
          </div>
        )}

        {hasError && (
          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6 mb-8">
            <p className="font-semibold mb-2">Algunas redes no respondieron correctamente.</p>
            <p className="text-sm text-muted-foreground">
              El dashboard mostrará las loterías que sí pudieron cargarse.
            </p>
          </div>
        )}

        {!isLoading && filteredLotteries.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <p className="text-2xl font-semibold mb-3">No hay loterías para mostrar</p>
            <p className="text-muted-foreground mb-6">
              Aún no tienes loterías en esta vista.
            </p>
            <button
              onClick={() => setCurrentPage('create')}
              className="px-5 py-3 rounded-xl bg-primary text-primary-foreground"
            >
              Crear lotería
            </button>
          </div>
        )}

        {filteredLotteries.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredLotteries.map((lottery, index) => (
              <motion.div
                key={`${lottery.chain}-${lottery.id.toString()}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: Math.min(index * 0.04, 0.2) }}
              >
                <DashboardLotteryCard
                  lottery={lottery}
                  onOpen={() => openLotteryDetail(lottery)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: typeof Sparkles;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <p className="text-sm text-muted-foreground mb-2">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl transition-all ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'border border-border hover:bg-muted'
      }`}
    >
      {children}
    </button>
  );
}

function ChainLine({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold">{count}</span>
    </div>
  );
}

function DashboardLotteryCard({
  lottery,
  onOpen,
}: {
  lottery: Lottery;
  onOpen: () => void;
}) {
  const chain = CHAIN_CONFIG[lottery.chain];
  const currentPool = lottery.totalRaised;
  const creatorRevenue = (lottery.totalRaised * 10n) / 100n;
  const progress =
    lottery.maxTickets > 0n
      ? Number((lottery.ticketsSold * 10000n) / lottery.maxTickets) / 100
      : 0;

  return (
    <button
      onClick={onOpen}
      className="w-full text-left rounded-2xl border border-border bg-card p-6 hover:bg-muted/20 transition-all"
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-2xl font-bold mb-1">{lottery.name}</h3>
          <p className="text-sm text-muted-foreground">ID: {lottery.id.toString()}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs text-white bg-gradient-to-r ${chainColors[lottery.chain]}`}
          >
            {chain.name}
          </span>

          <span
            className={`px-3 py-1 rounded-full text-xs ${
              lottery.isOpen
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {lottery.isOpen ? 'Abierta' : 'Cerrada'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="rounded-xl bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground mb-1">Pozo actual</p>
          <p className="font-bold text-primary">{formatUSDC(currentPool)} USDC</p>
        </div>

        <div className="rounded-xl bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground mb-1">Tu 10%</p>
          <p className="font-bold">{formatUSDC(creatorRevenue)} USDC</p>
        </div>

        <div className="rounded-xl bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground mb-1">Vendidos</p>
          <p className="font-bold">
            {lottery.ticketsSold.toString()} / {lottery.maxTickets.toString()}
          </p>
        </div>

        <div className="rounded-xl bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground mb-1">Participantes</p>
          <p className="font-bold">{lottery.uniqueParticipants.toString()}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progreso</span>
          <span>{progress.toFixed(1)}%</span>
        </div>

        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary via-accent to-emerald-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {!lottery.isOpen && lottery.hasWinner && (
        <div className="rounded-xl bg-primary/10 text-primary px-4 py-3 text-sm">
          Ganador: {formatAddress(lottery.winner)}
        </div>
      )}

      {!lottery.isOpen && !lottery.hasWinner && (
        <div className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          Cerrada sin ganador
        </div>
      )}
    </button>
  );
}
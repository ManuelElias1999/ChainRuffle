import { useState } from 'react';
import { useConnect, useDisconnect } from 'wagmi';
import { useWallet } from '../../hooks/uswWallet';
import { useSwitchToChain } from '../../hooks/useSwitchToChain';
import { formatAddress } from '../../lib/formatters';
import { SUPPORTED_CHAINS, type SupportedChainKey } from '../../config/chains';

export function WalletButton() {
  const [isOpen, setIsOpen] = useState(false);

  const { address, isConnected, currentChain } = useWallet();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchToChain, isSwitching } = useSwitchToChain();

  const handleSwitchChain = (chainKey: SupportedChainKey) => {
    switchToChain(chainKey);
    setIsOpen(false);
  };

  if (!isConnected || !address) {
    return (
      <button
        onClick={() => connect({ connector: connectors[0] })}
        disabled={isPending || connectors.length === 0}
        className="rounded-xl px-4 py-2 font-medium bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
      >
        {isPending ? 'Conectando...' : 'Conectar wallet'}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-xl px-4 py-2 font-medium border border-border bg-card hover:opacity-90 transition flex items-center gap-2"
      >
        <span className="hidden md:inline text-sm text-muted-foreground">
          {currentChain?.name ?? 'Red no soportada'}
        </span>
        <span>{formatAddress(address)}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-border bg-card shadow-xl p-4 z-50 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground">Wallet conectada</p>
            <p className="font-medium break-all">{address}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Red actual</p>
            <div className="rounded-xl border border-border px-3 py-2">
              {currentChain?.name ?? 'Red no soportada'}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Cambiar red</p>
            <div className="grid grid-cols-1 gap-2">
              {SUPPORTED_CHAINS.map((chain) => (
                <button
                  key={chain.key}
                  onClick={() => handleSwitchChain(chain.key)}
                  disabled={isSwitching || currentChain?.key === chain.key}
                  className="w-full rounded-xl px-3 py-2 text-left border border-border hover:bg-muted transition disabled:opacity-50"
                >
                  {chain.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              disconnect();
              setIsOpen(false);
            }}
            className="w-full rounded-xl px-4 py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 transition"
          >
            Desconectar
          </button>
        </div>
      )}
    </div>
  );
}
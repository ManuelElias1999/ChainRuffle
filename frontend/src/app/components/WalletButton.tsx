import { useEffect, useRef, useState } from 'react';
import { useConnect, useDisconnect } from 'wagmi';
import { useWallet } from '../../hooks/uswWallet';
import { useSwitchToChain } from '../../hooks/useSwitchToChain';
import { formatAddress } from '../../lib/formatters';
import { SUPPORTED_CHAINS, type SupportedChainKey } from '../../config/chains';

export function WalletButton() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { address, isConnected, currentChain } = useWallet();
  const {
    connect,
    connectors,
    isPending,
    error: connectError,
  } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchToChain, isSwitching } = useSwitchToChain();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSwitchChain = (chainKey: SupportedChainKey) => {
    switchToChain(chainKey);
    setIsOpen(false);
  };

  const getConnectorLabel = (name: string) => {
    const lower = name.toLowerCase();

    if (lower.includes('metamask')) return 'MetaMask';
    if (lower.includes('walletconnect')) return 'WalletConnect';
    if (lower.includes('injected')) return 'Browser wallet';

    return name;
  };

  if (!isConnected || !address) {
    return (
      <div ref={containerRef} className="relative w-full sm:w-auto">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={isPending}
          className="w-full sm:w-auto rounded-xl px-4 py-2.5 font-medium bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
        >
          {isPending ? 'Conectando...' : 'Conectar wallet'}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] max-w-sm sm:w-80 rounded-2xl border border-border bg-background/95 backdrop-blur-xl shadow-2xl p-4 z-50 space-y-3">
            <p className="text-sm text-muted-foreground">
              Elige cómo quieres conectar tu wallet
            </p>

            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => {
                  connect({ connector });
                }}
                disabled={isPending}
                className="w-full rounded-xl px-4 py-3 text-left border border-border hover:bg-muted transition disabled:opacity-50"
              >
                {getConnectorLabel(connector.name)}
              </button>
            ))}

            {connectError && (
              <p className="text-sm text-red-500 break-words">
                {connectError.message}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full sm:w-auto">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full sm:w-auto rounded-xl px-4 py-2.5 font-medium border border-border bg-background hover:opacity-90 transition flex items-center justify-between sm:justify-center gap-2"
      >
        <span className="hidden md:inline text-sm text-muted-foreground">
          {currentChain?.name ?? 'Red no soportada'}
        </span>
        <span className="truncate">{formatAddress(address)}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] max-w-sm sm:w-80 rounded-2xl border border-border bg-background/95 backdrop-blur-xl shadow-2xl p-4 z-50 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground">Wallet conectada</p>
            <p className="font-medium break-all">{address}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Red actual</p>
            <div className="rounded-xl border border-border px-3 py-2 break-words">
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
                  className="w-full rounded-xl px-3 py-3 text-left border border-border hover:bg-muted transition disabled:opacity-50"
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
            className="w-full rounded-xl px-4 py-3 border border-red-500/30 text-red-500 hover:bg-red-500/10 transition"
          >
            Desconectar
          </button>
        </div>
      )}
    </div>
  );
}
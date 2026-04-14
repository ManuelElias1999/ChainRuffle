import { http, createConfig } from 'wagmi';
import { baseSepolia, avalancheFuji, arbitrumSepolia } from 'wagmi/chains';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

export const wagmiConfig = createConfig({
  chains: [baseSepolia, avalancheFuji, arbitrumSepolia],
  connectors: [
    injected(),
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: 'ChainRaffle',
        description: 'Multichain raffles with USDC',
        url: window.location.origin,
        icons: [`${window.location.origin}/favicon.ico`],
      },
    }),
    metaMask({
      dapp: {
        name: 'ChainRaffle',
        url: window.location.origin,
        iconUrl: `${window.location.origin}/favicon.ico`,
      },
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
    [avalancheFuji.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
});
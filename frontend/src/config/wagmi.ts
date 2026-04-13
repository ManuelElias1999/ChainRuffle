import { http, createConfig } from 'wagmi';
import { baseSepolia, avalancheFuji, arbitrumSepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [baseSepolia, avalancheFuji, arbitrumSepolia],
  connectors: [injected()],
  transports: {
    [baseSepolia.id]: http(),
    [avalancheFuji.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
});
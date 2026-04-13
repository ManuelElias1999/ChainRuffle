export type SupportedChainKey = 'base' | 'avalanche' | 'arbitrum';

export type ChainConfig = {
  key: SupportedChainKey;
  name: string;
  shortName: string;
  chainId: number;
  raffleAddress: `0x${string}`;
  usdcAddress: `0x${string}`;
  explorerName: string;
  explorerUrl: string;
  color: string;
  isDefault?: boolean;
  rpcUrl: string;
};

export const CHAIN_CONFIG: Record<SupportedChainKey, ChainConfig> = {
  base: {
    key: 'base',
    name: 'Base Sepolia',
    shortName: 'BASE',
    chainId: 84532,
    raffleAddress: '0x3D069e9D5085388344D5c97eC5Eb742cf3a22c0b',
    usdcAddress: '0xEb05E0A3643195BBb1b53c354c9AE7DD2D095458',
    explorerName: 'BaseScan',
    explorerUrl: 'https://sepolia.basescan.org',
    color: '#22c55e',
    isDefault: true,
    rpcUrl: 'https://sepolia.base.org',
  },
  avalanche: {
    key: 'avalanche',
    name: 'Avalanche Fuji',
    shortName: 'FUJI',
    chainId: 43113,
    raffleAddress: '0x0F298dd0470eA557B23522F5C13364d8A660Dc92',
    usdcAddress: '0xd66261cc25933Ae4a3f3689A8babD7c904e34d80',
    explorerName: 'SnowTrace',
    explorerUrl: 'https://testnet.snowtrace.io',
    color: '#16a34a',
    rpcUrl: 'https://avalanche-fuji-c-chain-rpc.publicnode.com',
  },
  arbitrum: {
    key: 'arbitrum',
    name: 'Arbitrum Sepolia',
    shortName: 'ARB',
    chainId: 421614,
    raffleAddress: '0x9D2d828559B4Ba8Af37dcA28593FB9E14E1FE4A4',
    usdcAddress: '0x380a3Af810aEC334c5CcDFa7Faa9c42Ba9559B8e',
    explorerName: 'Arbiscan',
    explorerUrl: 'https://sepolia.arbiscan.io',
    color: '#4ade80',
    rpcUrl: 'https://arbitrum-sepolia-rpc.publicnode.com',
  },
};

export const DEFAULT_CHAIN_KEY: SupportedChainKey = 'base';

export const SUPPORTED_CHAINS = Object.values(CHAIN_CONFIG);

export function getChainConfig(chainKey: SupportedChainKey): ChainConfig {
  return CHAIN_CONFIG[chainKey];
}

export function getChainById(chainId: number): ChainConfig | undefined {
  return SUPPORTED_CHAINS.find((chain) => chain.chainId === chainId);
}
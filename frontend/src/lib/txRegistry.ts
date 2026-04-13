type TxRegistryEntry = {
    createTxHash?: `0x${string}`;
    buyTxHashes?: `0x${string}`[];
    closeTxHash?: `0x${string}`;
  };
  
  type TxRegistry = Record<string, TxRegistryEntry>;
  
  const STORAGE_KEY = 'chainraffle_tx_registry';
  
  function readRegistry(): TxRegistry {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw) as TxRegistry;
    } catch {
      return {};
    }
  }
  
  function writeRegistry(registry: TxRegistry) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registry));
  }
  
  function key(chainKey: string, lotteryId: bigint | string) {
    return `${chainKey}:${lotteryId.toString()}`;
  }
  
  export function saveCreateTxHash(
    chainKey: string,
    lotteryId: bigint | string,
    txHash: `0x${string}`
  ) {
    const registry = readRegistry();
    const k = key(chainKey, lotteryId);
  
    registry[k] = {
      ...registry[k],
      createTxHash: txHash,
    };
  
    writeRegistry(registry);
  }
  
  export function saveBuyTxHash(
    chainKey: string,
    lotteryId: bigint | string,
    txHash: `0x${string}`
  ) {
    const registry = readRegistry();
    const k = key(chainKey, lotteryId);
    const current = registry[k]?.buyTxHashes ?? [];
  
    registry[k] = {
      ...registry[k],
      buyTxHashes: [txHash, ...current].slice(0, 10),
    };
  
    writeRegistry(registry);
  }
  
  export function saveCloseTxHash(
    chainKey: string,
    lotteryId: bigint | string,
    txHash: `0x${string}`
  ) {
    const registry = readRegistry();
    const k = key(chainKey, lotteryId);
  
    registry[k] = {
      ...registry[k],
      closeTxHash: txHash,
    };
  
    writeRegistry(registry);
  }
  
  export function getLotteryTxRegistry(
    chainKey: string,
    lotteryId: bigint | string
  ): TxRegistryEntry {
    const registry = readRegistry();
    return registry[key(chainKey, lotteryId)] ?? {};
  }
type TxRegistryEntry = {
  createTxHash?: `0x${string}`;
  buyTxHashes?: `0x${string}`[];
  closeTxHash?: `0x${string}`;
};

type TxRegistry = Record<string, TxRegistryEntry>;

export type ActivityType = 'create' | 'buy' | 'close';

export type ActivityItem = {
  id: string;
  type: ActivityType;
  chainKey: string;
  lotteryId: string;
  lotteryName?: string;
  txHash: `0x${string}`;
  timestamp: number;
};

const STORAGE_KEY = 'chainraffle_tx_registry';
const ACTIVITY_STORAGE_KEY = 'chainraffle_activity_registry';

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

function readActivity(): ActivityItem[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ActivityItem[];
  } catch {
    return [];
  }
}

function writeActivity(items: ActivityItem[]) {
  localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(items));
}

export function addActivityItem(input: {
  type: ActivityType;
  chainKey: string;
  lotteryId: bigint | string;
  lotteryName?: string;
  txHash: `0x${string}`;
}) {
  const items = readActivity();

  const next: ActivityItem = {
    id: `${input.type}-${input.chainKey}-${input.lotteryId.toString()}-${input.txHash}-${Date.now()}`,
    type: input.type,
    chainKey: input.chainKey,
    lotteryId: input.lotteryId.toString(),
    lotteryName: input.lotteryName,
    txHash: input.txHash,
    timestamp: Date.now(),
  };

  const deduped = items.filter(
    (item) =>
      !(
        item.type === next.type &&
        item.chainKey === next.chainKey &&
        item.lotteryId === next.lotteryId &&
        item.txHash === next.txHash
      )
  );

  writeActivity([next, ...deduped].slice(0, 100));
}

export function getActivityItems(): ActivityItem[] {
  return readActivity().sort((a, b) => b.timestamp - a.timestamp);
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
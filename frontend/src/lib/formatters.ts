import { formatUnits } from 'viem';

export function formatAddress(address?: string, start = 6, end = 4) {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function formatUSDC(value: bigint | number | string, decimals = 6) {
  try {
    const bigValue =
      typeof value === 'bigint'
        ? value
        : BigInt(typeof value === 'number' ? Math.floor(value) : value);

    const formatted = Number(formatUnits(bigValue, decimals));
    return formatted.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  } catch {
    return '0';
  }
}

export function parseUSDCDisplay(value: string | number) {
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num)) return 0;
  return num;
}
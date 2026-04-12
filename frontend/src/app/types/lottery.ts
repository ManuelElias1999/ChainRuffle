export type Blockchain = 'Base' | 'Avalanche' | 'Arbitrum';

export type LotteryStatus = 'open' | 'closed';

export interface Lottery {
  id: string;
  name: string;
  blockchain: Blockchain;
  creator: string;
  ticketPrice: number;
  maxTickets: number;
  ticketsSold: number;
  status: LotteryStatus;
  winner?: string;
  participants: {
    address: string;
    tickets: number;
  }[];
}

export interface Stats {
  openLotteries: number;
  totalPoolUSDC: number;
  highestPool: number;
  totalParticipants: number;
}

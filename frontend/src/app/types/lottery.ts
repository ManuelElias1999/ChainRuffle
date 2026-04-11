export interface Lottery {
  id: string;
  name: string;
  creator: string;
  ticketPrice: number;
  maxTickets: number;
  ticketsSold: number;
  currentPool: number;
  maxPool: number;
  status: 'open' | 'closed';
  createdAt: Date;
  winner?: string;
  participants: Participant[];
}

export interface Participant {
  wallet: string;
  ticketCount: number;
}

export interface LotteryFilters {
  search: string;
  currentPoolMin: string;
  currentPoolMax: string;
  maxPoolMin: string;
  maxPoolMax: string;
  ticketPriceMin: string;
  ticketPriceMax: string;
  ticketsSoldMin: string;
  ticketsSoldMax: string;
  totalTicketsMin: string;
  totalTicketsMax: string;
  remainingTicketsMin: string;
  remainingTicketsMax: string;
  sortBy: 'highestPool' | 'highestMaxPool' | 'lowestPrice' | 'highestPrice' | 'newest' | 'closestToFull';
}

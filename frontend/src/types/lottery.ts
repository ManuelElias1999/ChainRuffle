import type { LotteryChain } from './chain';

export type LotteryStatus = 'open' | 'closed_no_winner' | 'closed_with_winner';

export type Lottery = {
  id: bigint;
  name: string;
  creator: `0x${string}`;
  chain: LotteryChain;
  ticketPrice: bigint;
  maxTickets: bigint;
  ticketsSold: bigint;
  totalRaised: bigint;
  uniqueParticipants: bigint;
  isOpen: boolean;
  hasWinner: boolean;
  winner: `0x${string}`;
  winningTicket: bigint;
};

export type LotteryParticipant = {
  wallet: `0x${string}`;
  tickets: bigint;
};
import type { Lottery } from '../types/lottery';
import type { LotteryChain } from '../types/chain';

type RawLotteryTuple = readonly [
  bigint,
  string,
  `0x${string}`,
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  boolean,
  boolean,
  `0x${string}`,
  bigint
];

type RawLotteryObject = {
  id: bigint;
  name: string;
  creator: `0x${string}`;
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

function isTuple(raw: RawLotteryTuple | RawLotteryObject): raw is RawLotteryTuple {
  return Array.isArray(raw);
}

export function mapLotteryFromContract(
  raw: RawLotteryTuple | RawLotteryObject,
  chain: LotteryChain
): Lottery {
  if (isTuple(raw)) {
    return {
      id: raw[0],
      name: raw[1],
      creator: raw[2],
      chain,
      ticketPrice: raw[3],
      maxTickets: raw[4],
      ticketsSold: raw[5],
      totalRaised: raw[6],
      uniqueParticipants: raw[7],
      isOpen: raw[8],
      hasWinner: raw[9],
      winner: raw[10],
      winningTicket: raw[11],
    };
  }

  const lottery = raw as RawLotteryObject;

  return {
    id: lottery.id,
    name: lottery.name,
    creator: lottery.creator,
    chain,
    ticketPrice: lottery.ticketPrice,
    maxTickets: lottery.maxTickets,
    ticketsSold: lottery.ticketsSold,
    totalRaised: lottery.totalRaised,
    uniqueParticipants: lottery.uniqueParticipants,
    isOpen: lottery.isOpen,
    hasWinner: lottery.hasWinner,
    winner: lottery.winner,
    winningTicket: lottery.winningTicket,
  };
}
import { useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from '@wagmi/core';
import { parseUnits } from 'viem';
import type { Address } from 'viem';
import type { SupportedChainKey } from '../config/chains';
import { getRaffleContract } from '../lib/contracts';
import { getPublicClient } from '../lib/publicClients';
import { wagmiConfig } from '../config/wagmi';

type CreateLotteryParams = {
  chainKey: SupportedChainKey;
  creator: Address;
  name: string;
  ticketPrice: string;
  maxTickets: string;
};

type CreateLotteryResult = {
  hash: `0x${string}`;
  lotteryId: bigint;
};

export function useCreateLottery() {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const createLottery = async ({
    chainKey,
    creator,
    name,
    ticketPrice,
    maxTickets,
  }: CreateLotteryParams): Promise<CreateLotteryResult> => {
    const contract = getRaffleContract(chainKey);
    const client = getPublicClient(chainKey);

    const parsedTicketPrice = parseUnits(ticketPrice, 6);
    const parsedMaxTickets = BigInt(maxTickets);

    // 1) Simular para obtener el lotteryId esperado
    const simulation = await client.simulateContract({
      address: contract.address,
      abi: contract.abi,
      functionName: 'createLottery',
      args: [name, parsedTicketPrice, parsedMaxTickets],
      account: creator,
    });

    const simulatedLotteryId = simulation.result as bigint;

    // 2) Enviar tx real
    const hash = await writeContractAsync(simulation.request);

    // 3) Esperar confirmación
    await waitForTransactionReceipt(wagmiConfig, { hash });

    // 4) Esperar a que la lotería realmente sea legible
    let found = false;

    for (let i = 0; i < 12; i++) {
      try {
        const rawLottery = await client.readContract({
          address: contract.address,
          abi: contract.abi,
          functionName: 'getLottery',
          args: [simulatedLotteryId],
        });

        const raw = rawLottery as any;
        const rawName = Array.isArray(raw) ? raw[1] : raw.name;
        const rawTicketPrice = Array.isArray(raw) ? raw[3] : raw.ticketPrice;
        const rawMaxTickets = Array.isArray(raw) ? raw[4] : raw.maxTickets;

        const matches =
          rawName === name &&
          rawTicketPrice === parsedTicketPrice &&
          rawMaxTickets === parsedMaxTickets;

        if (matches) {
          found = true;
          break;
        }
      } catch {
        // todavía no está disponible, seguimos intentando
      }

      await sleep(1000);
    }

    if (!found) {
      throw new Error('La lotería fue creada, pero aún no está disponible para lectura.');
    }

    return {
      hash,
      lotteryId: simulatedLotteryId,
    };
  };

  return {
    createLottery,
    isCreating: isPending,
    createError: error,
  };
}
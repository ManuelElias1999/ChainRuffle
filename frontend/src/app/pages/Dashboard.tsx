import React, { useState } from 'react';
import { Link } from 'react-router';
import { Wallet, TrendingUp, History, Trophy, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWallet } from '../contexts/WalletContext';
import { mockLotteries } from '../data/mockLotteries';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

export const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { isConnected, walletAddress } = useWallet();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0b14] via-[#0f1123] to-[#0a0b14]">
        <div className="flex min-h-[80vh] items-center justify-center px-4">
          <div className="text-center">
            <Wallet className="mx-auto mb-4 h-16 w-16 text-gray-500" />
            <h2 className="mb-2 text-2xl font-bold text-white">{t('dashboard.connectWallet')}</h2>
            <p className="text-gray-400">Please connect your wallet to view your dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  // Mock data - filter lotteries based on connected wallet
  const myLotteries = mockLotteries.filter(l => l.creator === walletAddress && l.status === 'open');
  const participatingLotteries = mockLotteries.filter(l => 
    l.participants.some(p => p.wallet === walletAddress) && l.status === 'open'
  );
  const historyLotteries = mockLotteries.filter(l => 
    (l.creator === walletAddress || l.participants.some(p => p.wallet === walletAddress)) && l.status === 'closed'
  );

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getMyTickets = (lotteryId: string) => {
    const lottery = mockLotteries.find(l => l.id === lotteryId);
    const participant = lottery?.participants.find(p => p.wallet === walletAddress);
    return participant?.ticketCount || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0b14] via-[#0f1123] to-[#0a0b14]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-4xl font-bold text-transparent">
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-400">
            Connected: <span className="font-mono text-white">{formatAddress(walletAddress!)}</span>
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="my-lotteries" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 gap-4 bg-transparent lg:w-auto lg:grid-cols-4">
            <TabsTrigger
              value="my-lotteries"
              className="border border-white/10 bg-white/5 data-[state=active]:border-blue-500/50 data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-400"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              {t('dashboard.myLotteries')}
            </TabsTrigger>
            <TabsTrigger
              value="participating"
              className="border border-white/10 bg-white/5 data-[state=active]:border-blue-500/50 data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-400"
            >
              <Wallet className="mr-2 h-4 w-4" />
              {t('dashboard.participating')}
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="border border-white/10 bg-white/5 data-[state=active]:border-blue-500/50 data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-400"
            >
              <History className="mr-2 h-4 w-4" />
              {t('dashboard.history')}
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="border border-white/10 bg-white/5 data-[state=active]:border-blue-500/50 data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-400"
            >
              <Trophy className="mr-2 h-4 w-4" />
              {t('dashboard.results')}
            </TabsTrigger>
          </TabsList>

          {/* My Lotteries Tab */}
          <TabsContent value="my-lotteries">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm">
              {myLotteries.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-gray-300">{t('dashboard.name')}</TableHead>
                        <TableHead className="text-gray-300">{t('dashboard.id')}</TableHead>
                        <TableHead className="text-gray-300">{t('dashboard.status')}</TableHead>
                        <TableHead className="text-right text-gray-300">{t('dashboard.pool')}</TableHead>
                        <TableHead className="text-right text-gray-300">{t('dashboard.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myLotteries.map(lottery => (
                        <TableRow key={lottery.id} className="border-white/10 hover:bg-white/5">
                          <TableCell className="font-medium text-white">{lottery.name}</TableCell>
                          <TableCell className="font-mono text-gray-300">{lottery.id}</TableCell>
                          <TableCell>
                            <Badge className="border-green-500/30 bg-green-500/10 text-green-400">
                              {t('card.status.open')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-white">
                            {lottery.currentPool.toLocaleString()} USDC
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link to={`/lottery/${lottery.id}`}>
                                <Button size="sm" variant="ghost" className="text-blue-400 hover:bg-blue-500/10 hover:text-blue-300">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/10 hover:text-red-300">
                                {t('dashboard.close')}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <TrendingUp className="mx-auto mb-4 h-12 w-12 text-gray-500" />
                  <p className="text-gray-400">{t('dashboard.noLotteries')}</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Participating Tab */}
          <TabsContent value="participating">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm">
              {participatingLotteries.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-gray-300">{t('dashboard.name')}</TableHead>
                        <TableHead className="text-gray-300">{t('dashboard.id')}</TableHead>
                        <TableHead className="text-right text-gray-300">{t('dashboard.myTickets')}</TableHead>
                        <TableHead className="text-right text-gray-300">{t('dashboard.pool')}</TableHead>
                        <TableHead className="text-right text-gray-300">{t('dashboard.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {participatingLotteries.map(lottery => (
                        <TableRow key={lottery.id} className="border-white/10 hover:bg-white/5">
                          <TableCell className="font-medium text-white">{lottery.name}</TableCell>
                          <TableCell className="font-mono text-gray-300">{lottery.id}</TableCell>
                          <TableCell className="text-right font-semibold text-blue-400">
                            {getMyTickets(lottery.id)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-white">
                            {lottery.currentPool.toLocaleString()} USDC
                          </TableCell>
                          <TableCell className="text-right">
                            <Link to={`/lottery/${lottery.id}`}>
                              <Button size="sm" variant="ghost" className="text-blue-400 hover:bg-blue-500/10 hover:text-blue-300">
                                {t('dashboard.view')}
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Wallet className="mx-auto mb-4 h-12 w-12 text-gray-500" />
                  <p className="text-gray-400">{t('dashboard.notParticipating')}</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm">
              {historyLotteries.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-gray-300">{t('dashboard.name')}</TableHead>
                        <TableHead className="text-gray-300">{t('dashboard.id')}</TableHead>
                        <TableHead className="text-gray-300">{t('dashboard.status')}</TableHead>
                        <TableHead className="text-right text-gray-300">{t('dashboard.pool')}</TableHead>
                        <TableHead className="text-right text-gray-300">{t('dashboard.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyLotteries.map(lottery => (
                        <TableRow key={lottery.id} className="border-white/10 hover:bg-white/5">
                          <TableCell className="font-medium text-white">{lottery.name}</TableCell>
                          <TableCell className="font-mono text-gray-300">{lottery.id}</TableCell>
                          <TableCell>
                            <Badge className="border-gray-500/30 bg-gray-500/10 text-gray-400">
                              {t('card.status.closed')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-white">
                            {lottery.currentPool.toLocaleString()} USDC
                          </TableCell>
                          <TableCell className="text-right">
                            <Link to={`/lottery/${lottery.id}`}>
                              <Button size="sm" variant="ghost" className="text-blue-400 hover:bg-blue-500/10 hover:text-blue-300">
                                {t('dashboard.view')}
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <History className="mx-auto mb-4 h-12 w-12 text-gray-500" />
                  <p className="text-gray-400">{t('dashboard.noHistory')}</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm">
              {historyLotteries.filter(l => l.winner).length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-gray-300">{t('dashboard.name')}</TableHead>
                        <TableHead className="text-gray-300">{t('dashboard.id')}</TableHead>
                        <TableHead className="text-right text-gray-300">{t('dashboard.myTickets')}</TableHead>
                        <TableHead className="text-right text-gray-300">{t('dashboard.pool')}</TableHead>
                        <TableHead className="text-right text-gray-300">{t('dashboard.result')}</TableHead>
                        <TableHead className="text-right text-gray-300">{t('dashboard.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyLotteries.filter(l => l.winner).map(lottery => {
                        const isWinner = lottery.winner === walletAddress;
                        return (
                          <TableRow key={lottery.id} className="border-white/10 hover:bg-white/5">
                            <TableCell className="font-medium text-white">{lottery.name}</TableCell>
                            <TableCell className="font-mono text-gray-300">{lottery.id}</TableCell>
                            <TableCell className="text-right font-semibold text-blue-400">
                              {getMyTickets(lottery.id)}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-white">
                              {lottery.currentPool.toLocaleString()} USDC
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                className={
                                  isWinner
                                    ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                                    : 'border-gray-500/30 bg-gray-500/10 text-gray-400'
                                }
                              >
                                {isWinner ? t('dashboard.won') : t('dashboard.lost')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Link to={`/lottery/${lottery.id}`}>
                                <Button size="sm" variant="ghost" className="text-blue-400 hover:bg-blue-500/10 hover:text-blue-300">
                                  {t('dashboard.view')}
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Trophy className="mx-auto mb-4 h-12 w-12 text-gray-500" />
                  <p className="text-gray-400">{t('dashboard.noHistory')}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

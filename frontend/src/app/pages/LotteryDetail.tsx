import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Share2, Trophy, Users, Ticket, DollarSign, Copy, Check, QrCode, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWallet } from '../contexts/WalletContext';
import { mockLotteries } from '../data/mockLotteries';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { toast } from 'sonner';

type ApprovalStatus = 'idle' | 'pending' | 'approved' | 'error';
type PurchaseStatus = 'idle' | 'pending' | 'success' | 'error';

export const LotteryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { isConnected, walletAddress } = useWallet();
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  // ERC20 Approval flow state
  const [currentAllowance, setCurrentAllowance] = useState(0);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('idle');
  const [purchaseStatus, setPurchaseStatus] = useState<PurchaseStatus>('idle');

  const lottery = mockLotteries.find(l => l.id === id);

  // Simulate checking allowance when wallet connects
  useEffect(() => {
    if (isConnected && lottery) {
      // Mock: Simulate checking current USDC allowance
      // In production, this would call: ERC20.allowance(userAddress, lotteryContractAddress)
      const mockAllowance = Math.random() > 0.5 ? 0 : 1000;
      setCurrentAllowance(mockAllowance);

      if (mockAllowance > 0) {
        setApprovalStatus('approved');
      } else {
        setApprovalStatus('idle');
      }
    } else {
      setCurrentAllowance(0);
      setApprovalStatus('idle');
    }

    // Reset purchase status when wallet changes
    setPurchaseStatus('idle');
  }, [isConnected, walletAddress, lottery]);

  if (!lottery) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0b14] via-[#0f1123] to-[#0a0b14] px-4 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">{t('common.notFound')}</h1>
          <Link to="/">
            <Button>{t('common.goHome')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const progress = (lottery.ticketsSold / lottery.maxTickets) * 100;
  const remaining = lottery.maxTickets - lottery.ticketsSold;
  const estimatedTotal = lottery.ticketPrice * ticketQuantity;
  const isCreator = isConnected && walletAddress === lottery.creator;

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(t('common.copied'));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = async () => {
    if (!isConnected) {
      toast.error(t('detail.connectFirst'));
      return;
    }

    setApprovalStatus('pending');

    // Simulate approval transaction
    // In production: await ERC20.approve(lotteryContractAddress, MAX_UINT256)
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      if (success) {
        setApprovalStatus('approved');
        setCurrentAllowance(999999); // Mock large allowance
        toast.success(t('detail.approval.approved'));
      } else {
        setApprovalStatus('error');
        toast.error(t('common.error'));
      }
    }, 2000);
  };

  const handleBuyTickets = async () => {
    if (!isConnected) {
      toast.error(t('detail.connectFirst'));
      return;
    }

    const requiredAmount = estimatedTotal;

    if (approvalStatus !== 'approved' || currentAllowance < requiredAmount) {
      toast.error(t('detail.buy.approveFirst'));
      return;
    }

    setPurchaseStatus('pending');

    // Simulate purchase transaction
    // In production: await LotteryContract.buyTickets(ticketQuantity)
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      if (success) {
        setPurchaseStatus('success');
        toast.success(t('detail.buy.success'));

        // Reset after 3 seconds
        setTimeout(() => {
          setPurchaseStatus('idle');
          setTicketQuantity(1);
        }, 3000);
      } else {
        setPurchaseStatus('error');
        toast.error(t('detail.buy.failed'));
      }
    }, 2500);
  };

  const handleCloseLottery = () => {
    toast.success(t('common.success') + '! Lottery closed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0b14] via-[#0f1123] to-[#0a0b14]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" className="mb-6 text-gray-300 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="mb-2 text-3xl font-bold text-white">{lottery.name}</h1>
                  <p className="text-gray-400">ID: {lottery.id}</p>
                </div>
                <Badge
                  className={`${
                    lottery.status === 'open'
                      ? 'border-green-500/30 bg-green-500/10 text-green-400'
                      : 'border-gray-500/30 bg-gray-500/10 text-gray-400'
                  }`}
                >
                  {lottery.status === 'open' ? t('card.status.open') : t('card.status.closed')}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4">
                  <span className="text-gray-400">{t('detail.creator')}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-white">{formatAddress(lottery.creator)}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(lottery.creator)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
                <div className="mb-2 flex items-center gap-2 text-gray-400">
                  <Ticket className="h-4 w-4" />
                  <span className="text-sm">{t('detail.ticketPrice')}</span>
                </div>
                <p className="text-2xl font-bold text-white">{lottery.ticketPrice} USDC</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
                <div className="mb-2 flex items-center gap-2 text-gray-400">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{t('detail.ticketsSold')}</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {lottery.ticketsSold} / {lottery.maxTickets}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
                <div className="mb-2 flex items-center gap-2 text-gray-400">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">{t('detail.currentPool')}</span>
                </div>
                <p className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-2xl font-bold text-transparent">
                  {lottery.currentPool.toLocaleString()} USDC
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
                <div className="mb-2 flex items-center gap-2 text-gray-400">
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm">{t('detail.maxPool')}</span>
                </div>
                <p className="text-2xl font-bold text-gray-300">
                  {lottery.maxPool.toLocaleString()} USDC
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {remaining} {t('detail.remainingTickets')}
                </span>
                <span className="font-medium text-blue-400">{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {/* Winner Section - Only if closed and has winner */}
            {lottery.status === 'closed' && lottery.winner && (
              <div className="rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-yellow-400" />
                  <h2 className="text-2xl font-bold text-yellow-400">{t('detail.winnerAnnouncement')}</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
                    <span className="text-gray-300">{t('detail.winnerWallet')}</span>
                    <span className="font-mono font-medium text-yellow-400">{formatAddress(lottery.winner)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
                    <span className="text-gray-300">{t('detail.prizeAmount')}</span>
                    <span className="text-2xl font-bold text-yellow-400">{lottery.currentPool.toLocaleString()} USDC</span>
                  </div>
                </div>
              </div>
            )}

            {/* Transparency Section */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
              <h2 className="mb-4 text-xl font-bold text-white">{t('detail.transparency')}</h2>
              <p className="mb-4 text-sm text-gray-400">{t('detail.participants')}</p>

              {lottery.participants.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-white/10">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-gray-300">{t('detail.wallet')}</TableHead>
                        <TableHead className="text-right text-gray-300">{t('detail.tickets')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lottery.participants.map((participant, idx) => (
                        <TableRow key={idx} className="border-white/10 hover:bg-white/5">
                          <TableCell className="font-mono text-gray-300">{formatAddress(participant.wallet)}</TableCell>
                          <TableCell className="text-right font-semibold text-white">{participant.ticketCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
                  <p className="text-gray-400">{t('detail.noParticipants')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Buy Tickets Card - Multi-step ERC20 Flow */}
            {lottery.status === 'open' && (
              <div className="sticky top-20 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
                <h3 className="mb-6 text-lg font-bold text-white">{t('detail.buyTickets')}</h3>

                {/* Wallet Not Connected */}
                {!isConnected ? (
                  <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-6 text-center">
                    <AlertCircle className="mx-auto mb-3 h-10 w-10 text-blue-400" />
                    <p className="text-sm text-blue-300">{t('detail.connectFirst')}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* STEP 1: Ticket Quantity */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                          1
                        </div>
                        <span className="text-sm font-medium text-gray-300">{t('detail.quantity')}</span>
                      </div>

                      <Input
                        type="number"
                        min="1"
                        value={ticketQuantity}
                        onChange={e => setTicketQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="border-white/10 bg-white/5 text-white"
                        disabled={purchaseStatus === 'pending' || approvalStatus === 'pending'}
                      />

                      <div className="space-y-1 rounded-lg border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">{t('detail.ticketPriceSingle')}</span>
                          <span className="font-medium text-white">{lottery.ticketPrice} USDC</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-white/10 pt-2">
                          <span className="font-medium text-gray-300">{t('detail.estimatedTotal')}</span>
                          <span className="text-lg font-bold text-white">{estimatedTotal} USDC</span>
                        </div>
                      </div>
                    </div>

                    {/* STEP 2: USDC Approval */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                          2
                        </div>
                        <span className="text-sm font-medium text-gray-300">{t('detail.approval.title')}</span>
                      </div>

                      {approvalStatus === 'idle' && (
                        <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-orange-400" />
                            <Badge className="border-orange-500/30 bg-orange-500/20 text-orange-300">
                              {t('detail.approval.required')}
                            </Badge>
                          </div>
                          <p className="mb-4 text-xs text-gray-300">
                            {t('detail.approval.explanation')}
                          </p>
                          <Button
                            onClick={handleApprove}
                            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-700 hover:to-orange-600"
                          >
                            {t('detail.approval.buttonApprove')}
                          </Button>
                        </div>
                      )}

                      {approvalStatus === 'pending' && (
                        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                          <div className="flex items-center gap-3">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                            <div>
                              <Badge className="border-blue-500/30 bg-blue-500/20 text-blue-300">
                                {t('detail.approval.approving')}
                              </Badge>
                              <p className="mt-1 text-xs text-gray-300">
                                Confirma la transacción en tu wallet...
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {approvalStatus === 'approved' && (
                        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                            <Badge className="border-green-500/30 bg-green-500/20 text-green-300">
                              {t('detail.approval.ready')}
                            </Badge>
                          </div>
                          <p className="mt-2 text-xs text-green-300">
                            {t('detail.approval.approved')}
                          </p>
                        </div>
                      )}

                      {approvalStatus === 'error' && (
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            <Badge className="border-red-500/30 bg-red-500/20 text-red-300">
                              {t('common.error')}
                            </Badge>
                          </div>
                          <Button
                            onClick={handleApprove}
                            variant="outline"
                            className="w-full border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                          >
                            Reintentar aprobación
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* STEP 3: Purchase */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                          3
                        </div>
                        <span className="text-sm font-medium text-gray-300">{t('detail.buy.button')}</span>
                      </div>

                      {purchaseStatus === 'success' ? (
                        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-6 w-6 text-green-400" />
                            <div>
                              <p className="font-medium text-green-300">{t('detail.buy.success')}</p>
                              <p className="text-xs text-green-400">{ticketQuantity} tickets comprados</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={handleBuyTickets}
                          disabled={approvalStatus !== 'approved' || purchaseStatus === 'pending'}
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 font-medium text-white hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-50"
                        >
                          {purchaseStatus === 'pending' ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t('detail.buy.buying')}
                            </>
                          ) : (
                            <>
                              <Ticket className="mr-2 h-4 w-4" />
                              {t('detail.buy.button')}
                            </>
                          )}
                        </Button>
                      )}

                      {approvalStatus !== 'approved' && (
                        <p className="text-center text-xs text-gray-500">
                          {t('detail.buy.approveFirst')}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Share Link */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <Button
                    onClick={() => copyToClipboard(window.location.href)}
                    variant="outline"
                    className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    {t('detail.shareLink')}
                  </Button>
                </div>
              </div>
            )}

            {/* QR Purchase with Approval Flow */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
              <h3 className="mb-4 text-sm font-semibold text-white">{t('detail.qr.title')}</h3>

              {/* QR Steps */}
              <div className="mb-4 space-y-2 rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/10 text-xs font-bold text-orange-400">
                    1
                  </div>
                  <span className="text-gray-300">{t('detail.qr.step1')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-bold text-blue-400">
                    2
                  </div>
                  <span className="text-gray-300">{t('detail.qr.step2')}</span>
                </div>
              </div>

              <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-gray-400">
                  {t('detail.qr.notice')}
                </p>
              </div>

              <div className="flex aspect-square items-center justify-center rounded-lg border border-white/10 bg-white/5">
                <QrCode className="h-12 w-12 text-gray-500" />
              </div>
            </div>

            {/* Creator Actions */}
            {isCreator && lottery.status === 'open' && (
              <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-500/5 p-6 backdrop-blur-sm">
                <h3 className="mb-4 text-lg font-bold text-white">{t('dashboard.actions')}</h3>
                <Button
                  onClick={handleCloseLottery}
                  variant="destructive"
                  className="w-full"
                >
                  {t('detail.closeLottery')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

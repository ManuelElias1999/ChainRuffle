import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWallet } from '../contexts/WalletContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

export const CreateLottery: React.FC = () => {
  const { t } = useLanguage();
  const { isConnected } = useWallet();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    ticketPrice: '',
    maxTickets: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const estimatedMaxPool = 
    formData.ticketPrice && formData.maxTickets
      ? parseFloat(formData.ticketPrice) * parseFloat(formData.maxTickets)
      : 0;

  const handleCreate = async () => {
    if (!isConnected) {
      toast.error(t('detail.connectFirst'));
      return;
    }

    if (!formData.name || !formData.ticketPrice || !formData.maxTickets) {
      toast.error('Please fill all fields');
      return;
    }

    setIsCreating(true);
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsCreating(false);
    setIsSuccess(true);
    toast.success(t('create.success'));
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0b14] via-[#0f1123] to-[#0a0b14]">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle2 className="h-10 w-10 text-green-400" />
            </div>
          </div>
          <h1 className="mb-4 text-3xl font-bold text-white">{t('create.success')}</h1>
          <p className="mb-8 text-gray-400">Your lottery has been created and is now live on the blockchain.</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              onClick={() => navigate('/lottery/LT-NEW')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 font-medium text-white hover:from-blue-700 hover:to-cyan-700"
            >
              {t('create.viewLottery')}
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              {t('common.goHome')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0b14] via-[#0f1123] to-[#0a0b14]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" className="mb-6 text-gray-300 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-4xl font-bold text-transparent">
            {t('create.title')}
          </h1>
          <p className="text-gray-400">{t('create.subtitle')}</p>
        </div>

        {/* Connection Warning */}
        {!isConnected && (
          <div className="mb-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-yellow-400" />
              <p className="text-sm text-yellow-300">{t('detail.connectFirst')}</p>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form - Left Side */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm sm:p-8">
              <div className="space-y-6">
                {/* Lottery Name */}
                <div>
                  <Label htmlFor="name" className="mb-2 block text-white">
                    {t('create.lotteryName')}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t('create.namePlaceholder')}
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="border-white/10 bg-white/5 text-white placeholder:text-gray-500"
                  />
                </div>

                {/* Ticket Price */}
                <div>
                  <Label htmlFor="ticketPrice" className="mb-2 block text-white">
                    {t('create.ticketPrice')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="ticketPrice"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder={t('create.pricePlaceholder')}
                      value={formData.ticketPrice}
                      onChange={e => setFormData({ ...formData, ticketPrice: e.target.value })}
                      className="border-white/10 bg-white/5 pr-16 text-white placeholder:text-gray-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      USDC
                    </span>
                  </div>
                </div>

                {/* Max Tickets */}
                <div>
                  <Label htmlFor="maxTickets" className="mb-2 block text-white">
                    {t('create.maxTickets')}
                  </Label>
                  <Input
                    id="maxTickets"
                    type="number"
                    min="1"
                    step="1"
                    placeholder={t('create.maxTicketsPlaceholder')}
                    value={formData.maxTickets}
                    onChange={e => setFormData({ ...formData, maxTickets: e.target.value })}
                    className="border-white/10 bg-white/5 text-white placeholder:text-gray-500"
                  />
                </div>

                {/* Create Button */}
                <div className="pt-4">
                  <Button
                    onClick={handleCreate}
                    disabled={isCreating || !isConnected}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 font-medium text-white hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50"
                  >
                    {isCreating ? (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                        {t('create.creating')}
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {t('create.createButton')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Summary - Right Side */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="sticky top-20 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
              <h3 className="mb-4 text-lg font-bold text-white">{t('create.summary')}</h3>

              <div className="mb-6 space-y-4">
                <div>
                  <p className="mb-1 text-sm text-gray-400">{t('create.lotteryName')}</p>
                  <p className="font-medium text-white">{formData.name || '—'}</p>
                </div>

                <div>
                  <p className="mb-1 text-sm text-gray-400">{t('create.ticketPrice')}</p>
                  <p className="font-medium text-white">
                    {formData.ticketPrice ? `${formData.ticketPrice} USDC` : '—'}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-sm text-gray-400">{t('create.maxTickets')}</p>
                  <p className="font-medium text-white">{formData.maxTickets || '—'}</p>
                </div>

                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                  <p className="mb-1 text-sm text-blue-300">{t('create.estimatedMaxPool')}</p>
                  <p className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-2xl font-bold text-transparent">
                    {estimatedMaxPool > 0 ? `${estimatedMaxPool.toLocaleString()} USDC` : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Rules Card */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
              <h3 className="mb-4 text-lg font-bold text-white">{t('create.rules')}</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <Badge className="mt-0.5 h-5 w-5 shrink-0 rounded-full border-blue-500/30 bg-blue-500/20 p-0 text-blue-400">
                    1
                  </Badge>
                  <span>{t('create.rule1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge className="mt-0.5 h-5 w-5 shrink-0 rounded-full border-blue-500/30 bg-blue-500/20 p-0 text-blue-400">
                    2
                  </Badge>
                  <span>{t('create.rule2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge className="mt-0.5 h-5 w-5 shrink-0 rounded-full border-blue-500/30 bg-blue-500/20 p-0 text-blue-400">
                    3
                  </Badge>
                  <span>{t('create.rule3')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge className="mt-0.5 h-5 w-5 shrink-0 rounded-full border-blue-500/30 bg-blue-500/20 p-0 text-blue-400">
                    4
                  </Badge>
                  <span>{t('create.rule4')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge className="mt-0.5 h-5 w-5 shrink-0 rounded-full border-blue-500/30 bg-blue-500/20 p-0 text-blue-400">
                    5
                  </Badge>
                  <span>{t('create.rule5')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

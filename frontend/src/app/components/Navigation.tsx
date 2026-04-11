import React from 'react';
import { Link, useLocation } from 'react-router';
import { Search, Wallet, LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWallet } from '../contexts/WalletContext';
import { Button } from './ui/button';
import { Input } from './ui/input';

export const Navigation: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { isConnected, walletAddress, connect, disconnect } = useWallet();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0b14]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400">
              <span className="text-lg font-bold text-white">C</span>
            </div>
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-xl font-bold text-transparent">
              ChainRaffle
            </span>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className="relative hidden flex-1 max-w-md md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder={t('nav.search')}
              className="w-full border-white/10 bg-white/5 pl-10 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:bg-white/10"
            />
          </div>

          {/* Navigation Links */}
          <div className="hidden items-center gap-1 md:flex">
            <Link to="/">
              <Button
                variant="ghost"
                className={`${
                  isActive('/')
                    ? 'bg-white/10 text-white'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {t('nav.explore')}
              </Button>
            </Link>
            <Link to="/create">
              <Button
                variant="ghost"
                className={`${
                  isActive('/create')
                    ? 'bg-white/10 text-white'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {t('nav.create')}
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button
                variant="ghost"
                className={`${
                  isActive('/dashboard')
                    ? 'bg-white/10 text-white'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {t('nav.dashboard')}
              </Button>
            </Link>
          </div>

          {/* Right side - Language toggle and Wallet */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
              <button
                onClick={() => setLanguage('es')}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  language === 'es'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                ES
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  language === 'en'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Connect Wallet Button */}
            {isConnected ? (
              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 sm:flex">
                  <div className="h-2 w-2 rounded-full bg-green-400"></div>
                  <span className="text-sm font-medium text-green-400">
                    {formatAddress(walletAddress!)}
                  </span>
                </div>
                <Button
                  onClick={disconnect}
                  variant="outline"
                  size="sm"
                  className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">{t('nav.disconnect')}</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={connect}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 font-medium text-white hover:from-blue-700 hover:to-cyan-700"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {t('nav.connectWallet')}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 pb-3 md:hidden">
          <Link to="/" className="flex-1">
            <Button
              variant="ghost"
              size="sm"
              className={`w-full ${
                isActive('/')
                  ? 'bg-white/10 text-white'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {t('nav.explore')}
            </Button>
          </Link>
          <Link to="/create" className="flex-1">
            <Button
              variant="ghost"
              size="sm"
              className={`w-full ${
                isActive('/create')
                  ? 'bg-white/10 text-white'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {t('nav.create')}
            </Button>
          </Link>
          <Link to="/dashboard" className="flex-1">
            <Button
              variant="ghost"
              size="sm"
              className={`w-full ${
                isActive('/dashboard')
                  ? 'bg-white/10 text-white'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {t('nav.dashboard')}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

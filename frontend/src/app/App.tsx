import { useState, useEffect } from 'react';
import { TranslationProvider } from './context/TranslationContext';
import { WalletProvider } from './context/WalletContext';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { LotteryDetail } from './components/LotteryDetail';
import { CreateLottery } from './components/CreateLottery';
import { Dashboard } from './components/Dashboard';

function isValidLotteryParam(value: string | null): value is string {
  if (!value) return false;

  const parts = value.split(':');
  if (parts.length !== 2) return false;

  const [chain, id] = parts;
  const validChain = ['base', 'avalanche', 'arbitrum'].includes(chain);
  const validId = /^\d+$/.test(id);

  return validChain && validId;
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedLottery, setSelectedLottery] = useState<string | null>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lotteryParam = params.get('lottery');

    if (isValidLotteryParam(lotteryParam)) {
      setSelectedLottery(lotteryParam);
      setCurrentPage('detail');
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const syncLotteryInUrl = (lotteryId: string | null) => {
    const url = new URL(window.location.href);

    if (lotteryId) {
      url.searchParams.set('lottery', lotteryId);
    } else {
      url.searchParams.delete('lottery');
    }

    window.history.pushState({}, '', url.toString());
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);

    if (page !== 'detail') {
      setSelectedLottery(null);
      syncLotteryInUrl(null);
    }
  };

  const handleLotterySelect = (id: string) => {
    setSelectedLottery(id);
    setCurrentPage('detail');
    syncLotteryInUrl(id);
  };

  return (
    <TranslationProvider>
      <WalletProvider>
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
          <Header
            theme={theme}
            toggleTheme={toggleTheme}
            currentPage={currentPage}
            setCurrentPage={handlePageChange}
          />

          {currentPage === 'home' && (
            <HomePage setCurrentPage={handlePageChange} setSelectedLottery={handleLotterySelect} />
          )}

          {currentPage === 'explore' && (
            <HomePage setCurrentPage={handlePageChange} setSelectedLottery={handleLotterySelect} />
          )}

          {currentPage === 'detail' && selectedLottery && (
            <LotteryDetail lotteryId={selectedLottery} setCurrentPage={handlePageChange} />
          )}

          {currentPage === 'create' && (
            <CreateLottery
              setCurrentPage={handlePageChange}
              setSelectedLottery={handleLotterySelect}
            />
          )}

          {currentPage === 'dashboard' && (
            <Dashboard setCurrentPage={handlePageChange} setSelectedLottery={handleLotterySelect} />
          )}
        </div>
      </WalletProvider>
    </TranslationProvider>
  );
}
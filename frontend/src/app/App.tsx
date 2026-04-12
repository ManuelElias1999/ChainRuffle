import { useState, useEffect } from 'react';
import { TranslationProvider } from './context/TranslationContext';
import { WalletProvider } from './context/WalletContext';
import { Header } from './components/Header';
import { BackgroundGlow } from './components/BackgroundGlow';
import { HomePage } from './components/HomePage';
import { LotteryDetail } from './components/LotteryDetail';
import { CreateLottery } from './components/CreateLottery';
import { Dashboard } from './components/Dashboard';

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

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    setSelectedLottery(null);
  };

  const handleLotterySelect = (id: string) => {
    setSelectedLottery(id);
    setCurrentPage('detail');
  };

  return (
    <TranslationProvider>
      <WalletProvider>
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
          <BackgroundGlow />
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

          {currentPage === 'create' && <CreateLottery setCurrentPage={handlePageChange} />}

          {currentPage === 'dashboard' && (
            <Dashboard setCurrentPage={handlePageChange} setSelectedLottery={handleLotterySelect} />
          )}
        </div>
      </WalletProvider>
    </TranslationProvider>
  );
}
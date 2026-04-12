import { Search, Sun, Moon, Globe } from 'lucide-react';
import { useTranslation } from '../context/TranslationContext';
import { useWallet } from '../context/WalletContext';
import { motion } from 'motion/react';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export function Header({ theme, toggleTheme, currentPage, setCurrentPage }: HeaderProps) {
  const { language, setLanguage, t } = useTranslation();
  const { isConnected, address, connect, disconnect } = useWallet();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border"
    >
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center gap-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setCurrentPage('home')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <div className="w-6 h-6 rounded-lg border-2 border-white" />
          </div>
          <span className="text-xl tracking-tight" style={{ fontWeight: 700 }}>
            ChainRaffle
          </span>
        </motion.div>

        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('header.search')}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        <nav className="flex items-center gap-1">
          {['explore', 'create', 'dashboard'].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-lg transition-all ${
                currentPage === page
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-foreground'
              }`}
            >
              {t(`header.${page}`)}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="px-3 py-2 rounded-lg hover:bg-muted transition-all flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm">{language.toUpperCase()}</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-muted transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {isConnected ? (
            <button
              onClick={disconnect}
              className="px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary hover:bg-primary hover:text-primary-foreground transition-all"
            >
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </button>
          ) : (
            <button
              onClick={connect}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
            >
              {t('header.connect')}
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}

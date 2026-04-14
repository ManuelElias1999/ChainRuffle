import { Search, Sun, Moon, Globe, Menu, X } from 'lucide-react';
import { useTranslation } from '../context/TranslationContext';
import { motion } from 'motion/react';
import { WalletButton } from './WalletButton';
import { useState } from 'react';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export function Header({
  theme,
  toggleTheme,
  currentPage,
  setCurrentPage,
}: HeaderProps) {
  const { language, setLanguage, t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const goToPage = (page: string) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="flex items-center gap-3 cursor-pointer min-w-0"
            onClick={() => goToPage('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
              <div className="w-6 h-6 rounded-lg border-2 border-white" />
            </div>

            <span className="text-lg sm:text-xl tracking-tight font-bold truncate">
              ChainRaffle
            </span>
          </motion.div>

          <div className="hidden lg:block flex-1 max-w-md relative mx-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('header.search')}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {['explore', 'create', 'dashboard'].map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
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

          <div className="hidden lg:flex items-center gap-2">
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
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            <WalletButton />
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <div className="min-w-[150px]">
              <WalletButton />
            </div>

            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-lg border border-border bg-card shrink-0"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 space-y-4 rounded-2xl border border-border bg-card p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('header.search')}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {['explore', 'create', 'dashboard'].map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-4 py-3 rounded-xl transition-all ${
                    currentPage === page
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border hover:bg-muted text-foreground'
                  }`}
                >
                  {t(`header.${page}`)}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                className="w-full px-3 py-3 rounded-xl border border-border hover:bg-muted transition-all flex items-center justify-center gap-2"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm">{language.toUpperCase()}</span>
              </button>

              <button
                onClick={toggleTheme}
                className="w-full px-3 py-3 rounded-xl border border-border hover:bg-muted transition-all flex items-center justify-center gap-2"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="w-4 h-4" />
                    <span>Dark</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4" />
                    <span>Light</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.header>
  );
}
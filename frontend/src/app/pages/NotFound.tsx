import React from 'react';
import { Link } from 'react-router';
import { Home } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';

export const NotFound: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gradient-to-b from-[#0a0b14] via-[#0f1123] to-[#0a0b14] px-4">
      <div className="text-center">
        <h1 className="mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-6xl font-bold text-transparent">
          404
        </h1>
        <h2 className="mb-6 text-2xl font-bold text-white">{t('common.notFound')}</h2>
        <Link to="/">
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 font-medium text-white hover:from-blue-700 hover:to-cyan-700">
            <Home className="mr-2 h-4 w-4" />
            {t('common.goHome')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

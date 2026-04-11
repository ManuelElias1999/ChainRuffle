import { RouterProvider } from 'react-router';
import { router } from './routes';
import { LanguageProvider } from './contexts/LanguageContext';
import { WalletProvider } from './contexts/WalletContext';

export default function App() {
  return (
    <LanguageProvider>
      <WalletProvider>
        <RouterProvider router={router} />
      </WalletProvider>
    </LanguageProvider>
  );
}

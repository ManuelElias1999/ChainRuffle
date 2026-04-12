import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'es' | 'en';

interface Translations {
  [key: string]: {
    es: string;
    en: string;
  };
}

const translations: Translations = {
  // Header
  'header.search': { es: 'Buscar loterías...', en: 'Search lotteries...' },
  'header.explore': { es: 'Explorar', en: 'Explore' },
  'header.create': { es: 'Crear', en: 'Create' },
  'header.dashboard': { es: 'Dashboard', en: 'Dashboard' },
  'header.connect': { es: 'Conectar Wallet', en: 'Connect Wallet' },

  // Home
  'home.hero.title': { es: 'Lotería transparente en la blockchain', en: 'Transparent lottery on the blockchain' },
  'home.hero.subtitle': { es: 'Sorteos verificables multichain con pagos automáticos en USDC', en: 'Verifiable multichain raffles with automatic USDC payouts' },
  'home.hero.explore': { es: 'Explorar loterías', en: 'Explore lotteries' },
  'home.hero.create': { es: 'Crear lotería', en: 'Create lottery' },

  // How It Works
  'home.how.title': { es: 'Cómo funciona', en: 'How it works' },
  'home.how.step1': { es: 'Explora loterías abiertas sin conectar wallet', en: 'Browse open lotteries without connecting wallet' },
  'home.how.step2': { es: 'Elige una lotería o crea la tuya', en: 'Choose a lottery or create your own' },
  'home.how.step3': { es: 'Aprueba USDC y compra tickets', en: 'Approve USDC and buy tickets' },
  'home.how.step4': { es: 'Si se llena, se cierra y sortea automáticamente', en: 'If full, it closes and draws automatically' },
  'home.how.step5': { es: 'Si no se llena, el creador puede cerrarla manualmente', en: 'If not full, creator can close it manually' },
  'home.how.step6': { es: 'Si no hubo tickets, se cierra sin ganador', en: 'If no tickets sold, closes with no winner' },

  'home.create.title': { es: 'Crear una lotería', en: 'Create a lottery' },
  'home.create.step1': { es: 'Escoge la blockchain', en: 'Choose the blockchain' },
  'home.create.step2': { es: 'Pon el nombre', en: 'Set the name' },
  'home.create.step3': { es: 'Define el precio por ticket', en: 'Define ticket price' },
  'home.create.step4': { es: 'Define la cantidad máxima de tickets', en: 'Define max tickets' },
  'home.create.step5': { es: 'Comparte el link con otras personas', en: 'Share the link with others' },

  'home.distribution.title': { es: 'Distribución del premio', en: 'Prize distribution' },
  'home.distribution.winner': { es: '80% para el ganador', en: '80% to winner' },
  'home.distribution.creator': { es: '10% para el creador', en: '10% to creator' },
  'home.distribution.fees': { es: '3% + 3% + 3% + 1% para fees', en: '3% + 3% + 3% + 1% for fees' },
  'home.stats.open': { es: 'Loterías abiertas', en: 'Open lotteries' },
  'home.stats.pool': { es: 'USDC en pozos abiertos', en: 'USDC in open pools' },
  'home.stats.highest': { es: 'Pozo más alto', en: 'Highest pool' },
  'home.stats.participants': { es: 'Participantes totales', en: 'Total participants' },
  'home.trust.multichain': { es: 'Multichain', en: 'Multichain' },
  'home.trust.usdc': { es: 'Pagos en USDC', en: 'USDC Payments' },
  'home.trust.transparent': { es: 'Pagos transparentes', en: 'Transparent payouts' },
  'home.trust.onchain': { es: 'Onchain', en: 'Onchain' },

  // Lottery Cards
  'lottery.id': { es: 'ID', en: 'ID' },
  'lottery.creator': { es: 'Creador', en: 'Creator' },
  'lottery.price': { es: 'Precio por ticket', en: 'Ticket price' },
  'lottery.sold': { es: 'Vendidos', en: 'Sold' },
  'lottery.pool': { es: 'Pozo actual', en: 'Current pool' },
  'lottery.maxPool': { es: 'Pozo máximo', en: 'Max pool' },
  'lottery.status.open': { es: 'Abierta', en: 'Open' },
  'lottery.status.closed': { es: 'Cerrada', en: 'Closed' },
  'lottery.viewDetails': { es: 'Ver detalles', en: 'View details' },
  'lottery.remaining': { es: 'Restantes', en: 'Remaining' },

  // Filters
  'filters.search': { es: 'Buscar por nombre o ID', en: 'Search by name or ID' },
  'filters.blockchain': { es: 'Blockchain', en: 'Blockchain' },
  'filters.all': { es: 'Todas', en: 'All' },
  'filters.sortBy': { es: 'Ordenar por', en: 'Sort by' },
  'filters.highestPool': { es: 'Mayor pozo actual', en: 'Highest current pool' },
  'filters.highestMax': { es: 'Mayor pozo máximo', en: 'Highest max pool' },
  'filters.lowestPrice': { es: 'Menor precio', en: 'Lowest price' },
  'filters.highestPrice': { es: 'Mayor precio', en: 'Highest price' },
  'filters.newest': { es: 'Más recientes', en: 'Newest' },
  'filters.closestFull': { es: 'Más cerca de llenarse', en: 'Closest to full' },

  // Detail
  'detail.purchase': { es: 'Comprar tickets', en: 'Buy tickets' },
  'detail.quantity': { es: 'Cantidad', en: 'Quantity' },
  'detail.total': { es: 'Total estimado', en: 'Estimated total' },
  'detail.step1': { es: 'Paso 1: Aprobar USDC', en: 'Step 1: Approve USDC' },
  'detail.step2': { es: 'Paso 2: Comprar tickets', en: 'Step 2: Buy tickets' },
  'detail.approve': { es: 'Aprobar USDC', en: 'Approve USDC' },
  'detail.approving': { es: 'Aprobando...', en: 'Approving...' },
  'detail.approved': { es: 'USDC aprobado', en: 'USDC approved' },
  'detail.buy': { es: 'Comprar tickets', en: 'Buy tickets' },
  'detail.buying': { es: 'Comprando...', en: 'Buying...' },
  'detail.success': { es: 'Compra realizada con éxito', en: 'Purchase successful' },
  'detail.close': { es: 'Cerrar lotería', en: 'Close lottery' },
  'detail.participants': { es: 'Participantes', en: 'Participants' },
  'detail.tickets': { es: 'tickets', en: 'tickets' },
  'detail.winner': { es: 'Ganador', en: 'Winner' },
  'detail.share': { es: 'Compartir', en: 'Share' },
  'detail.transparency': { es: 'Transparencia', en: 'Transparency' },
  'detail.qr.title': { es: 'Comprar con QR', en: 'Buy with QR' },
  'detail.qr.step1': { es: 'Aprobar USDC', en: 'Approve USDC' },
  'detail.qr.step2': { es: 'Escanear y comprar', en: 'Scan and buy' },
  'detail.noWinner': { es: 'Lotería cerrada sin ventas', en: 'Lottery closed with no sales' },

  // Create
  'create.title': { es: 'Crear nueva lotería', en: 'Create new lottery' },
  'create.name': { es: 'Nombre de la lotería', en: 'Lottery name' },
  'create.blockchain': { es: 'Blockchain', en: 'Blockchain' },
  'create.ticketPrice': { es: 'Precio por ticket en USDC', en: 'Ticket price in USDC' },
  'create.maxTickets': { es: 'Cantidad máxima de tickets', en: 'Max tickets' },
  'create.summary': { es: 'Resumen', en: 'Summary' },
  'create.chain': { es: 'Blockchain seleccionada', en: 'Selected blockchain' },
  'create.estimatedMax': { es: 'Pozo máximo estimado', en: 'Estimated max pool' },
  'create.submit': { es: 'Crear lotería', en: 'Create lottery' },
  'create.creating': { es: 'Creando...', en: 'Creating...' },

  // Dashboard
  'dashboard.myLotteries': { es: 'Mis loterías', en: 'My lotteries' },
  'dashboard.participating': { es: 'En las que participo', en: 'Participating' },
  'dashboard.history': { es: 'Historial', en: 'History' },
  'dashboard.results': { es: 'Resultados', en: 'Results' },
  'dashboard.myTickets': { es: 'Mis tickets', en: 'My tickets' },
  'dashboard.won': { es: 'Ganado', en: 'Won' },
  'dashboard.lost': { es: 'Perdido', en: 'Lost' },
  'dashboard.empty': { es: 'No hay datos disponibles', en: 'No data available' },

  // Distribution
  'distribution.title': { es: 'Distribución de fondos', en: 'Fund distribution' },
  'distribution.winner': { es: 'Ganador: 80%', en: 'Winner: 80%' },
  'distribution.creator': { es: 'Creador: 10%', en: 'Creator: 10%' },
  'distribution.fees': { es: 'Comisiones: 10%', en: 'Fees: 10%' },
};

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
}

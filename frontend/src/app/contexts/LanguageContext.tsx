import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  es: {
    // Navigation
    'nav.explore': 'Explorar',
    'nav.create': 'Crear',
    'nav.dashboard': 'Dashboard',
    'nav.connectWallet': 'Conectar Wallet',
    'nav.disconnect': 'Desconectar',
    'nav.search': 'Buscar loterías...',
    
    // Hero
    'hero.title': 'Loterías Transparentes Onchain en Base',
    'hero.subtitle': 'Crea y participa en loterías descentralizadas con USDC. Transparencia total, pagos automáticos.',
    'hero.exploreCta': 'Explorar loterías',
    'hero.createCta': 'Crear lotería',
    'hero.badge.onchain': 'Onchain',
    'hero.badge.usdc': 'USDC en Base',
    'hero.badge.transparent': 'Pagos transparentes',
    
    // Stats
    'stats.openLotteries': 'Loterías abiertas',
    'stats.totalPool': 'USDC total en pozos',
    'stats.highestPool': 'Pozo más alto',
    'stats.totalParticipants': 'Participantes totales',
    
    // Explorer
    'explorer.title': 'Explorar loterías',
    'explorer.featured': 'Mayor pozo ahora',
    'explorer.mostActive': 'Más activas',
    'explorer.recent': 'Recientes',
    'explorer.allLotteries': 'Todas las loterías',
    'explorer.filters': 'Filtros',
    'explorer.resetFilters': 'Resetear filtros',
    'explorer.sortBy': 'Ordenar por',
    'explorer.searchPlaceholder': 'Buscar por nombre o ID...',
    
    // Sort options
    'sort.highestPool': 'Mayor pozo actual',
    'sort.highestMaxPool': 'Mayor pozo máximo',
    'sort.lowestPrice': 'Precio más bajo',
    'sort.highestPrice': 'Precio más alto',
    'sort.newest': 'Más recientes',
    'sort.closestToFull': 'Más cerca de llenarse',
    
    // Filters
    'filter.currentPool': 'Pozo actual',
    'filter.maxPool': 'Pozo máximo',
    'filter.ticketPrice': 'Precio por ticket',
    'filter.ticketsSold': 'Tickets vendidos',
    'filter.totalTickets': 'Total de tickets',
    'filter.remainingTickets': 'Tickets restantes',
    'filter.min': 'Mín',
    'filter.max': 'Máx',
    
    // Lottery card
    'card.creator': 'Creador',
    'card.ticketPrice': 'Precio ticket',
    'card.ticketsSold': 'Vendidos',
    'card.currentPool': 'Pozo actual',
    'card.maxPool': 'Pozo máximo',
    'card.status.open': 'Abierta',
    'card.status.closed': 'Cerrada',
    'card.viewDetails': 'Ver detalles',
    'card.remaining': 'restantes',
    
    // Detail page
    'detail.title': 'Detalles de lotería',
    'detail.id': 'ID',
    'detail.creator': 'Creador',
    'detail.status': 'Estado',
    'detail.ticketPrice': 'Precio por ticket',
    'detail.maxTickets': 'Máximo de tickets',
    'detail.ticketsSold': 'Tickets vendidos',
    'detail.remainingTickets': 'Tickets restantes',
    'detail.currentPool': 'Pozo actual',
    'detail.maxPool': 'Pozo máximo',
    'detail.shareLink': 'Compartir enlace',
    'detail.buyTickets': 'Comprar tickets',
    'detail.quantity': 'Cantidad',
    'detail.estimatedTotal': 'Total estimado',
    'detail.buy': 'Comprar',
    'detail.connectFirst': 'Conecta tu wallet para comprar tickets',
    'detail.closeLottery': 'Cerrar lotería',
    'detail.transparency': 'Transparencia',
    'detail.participants': 'Participantes',
    'detail.wallet': 'Wallet',
    'detail.tickets': 'Tickets',
    'detail.winner': 'Ganador',
    'detail.winnerAnnouncement': '¡Lotería finalizada!',
    'detail.winnerWallet': 'Wallet ganador',
    'detail.prizeAmount': 'Premio',
    'detail.noParticipants': 'Sin participantes todavía',
    'detail.qrCode': 'Código QR para compra rápida',

    // Purchase flow - Approval
    'detail.approval.title': 'Aprobación de USDC',
    'detail.approval.required': 'Aprobación requerida',
    'detail.approval.ready': 'Aprobación lista',
    'detail.approval.approving': 'Aprobando...',
    'detail.approval.approved': 'USDC aprobado correctamente',
    'detail.approval.buttonApprove': 'Aprobar USDC',
    'detail.approval.explanation': 'Antes de comprar, debes autorizar el uso de tus USDC para esta operación.',
    'detail.approval.insufficient': 'Aprobación insuficiente',

    // Purchase flow - Buy
    'detail.buy.button': 'Comprar tickets',
    'detail.buy.buying': 'Comprando...',
    'detail.buy.success': 'Compra realizada con éxito',
    'detail.buy.failed': 'Error en la compra',
    'detail.buy.approveFirst': 'Primero debes aprobar USDC',

    // Purchase flow - QR
    'detail.qr.title': 'Compra rápida con QR',
    'detail.qr.step1': 'Paso 1: Aprobar USDC',
    'detail.qr.step2': 'Paso 2: Escanear y comprar',
    'detail.qr.notice': 'Primero debes aprobar USDC desde tu wallet antes de completar la compra por QR.',

    // Purchase flow - Steps
    'detail.step.quantity': 'Paso 1: Cantidad de tickets',
    'detail.step.approval': 'Paso 2: Aprobación USDC',
    'detail.step.purchase': 'Paso 3: Comprar',
    'detail.ticketPriceSingle': 'Precio por ticket',

    // Create page
    'create.title': 'Crear nueva lotería',
    'create.subtitle': 'Configura los parámetros de tu lotería onchain',
    'create.lotteryName': 'Nombre de la lotería',
    'create.namePlaceholder': 'Ej: Gran Sorteo Base 2026',
    'create.ticketPrice': 'Precio por ticket (USDC)',
    'create.pricePlaceholder': '10',
    'create.maxTickets': 'Cantidad máxima de tickets',
    'create.maxTicketsPlaceholder': '100',
    'create.summary': 'Resumen',
    'create.estimatedMaxPool': 'Pozo máximo estimado',
    'create.rules': 'Reglas',
    'create.rule1': 'No se puede editar después de crear',
    'create.rule2': 'Cualquier wallet puede comprar tickets ilimitados',
    'create.rule3': 'El creador también puede participar',
    'create.rule4': 'Si se cierra con tickets vendidos, se sortea automáticamente',
    'create.rule5': 'Si no hay tickets, se cierra sin ganador',
    'create.createButton': 'Crear lotería',
    'create.creating': 'Creando...',
    'create.success': '¡Lotería creada exitosamente!',
    'create.viewLottery': 'Ver lotería',
    
    // Dashboard
    'dashboard.title': 'Mi Dashboard',
    'dashboard.myLotteries': 'Mis loterías abiertas',
    'dashboard.participating': 'En las que participo',
    'dashboard.history': 'Historial',
    'dashboard.results': 'Resultados',
    'dashboard.name': 'Nombre',
    'dashboard.id': 'ID',
    'dashboard.status': 'Estado',
    'dashboard.myTickets': 'Mis tickets',
    'dashboard.pool': 'Pozo',
    'dashboard.result': 'Resultado',
    'dashboard.actions': 'Acciones',
    'dashboard.close': 'Cerrar',
    'dashboard.view': 'Ver',
    'dashboard.won': 'Ganado',
    'dashboard.lost': 'Perdido',
    'dashboard.pending': 'Pendiente',
    'dashboard.noLotteries': 'No tienes loterías abiertas',
    'dashboard.notParticipating': 'No estás participando en ninguna lotería',
    'dashboard.noHistory': 'Sin historial todavía',
    'dashboard.connectWallet': 'Conecta tu wallet para ver tu dashboard',
    
    // Common
    'common.usdc': 'USDC',
    'common.loading': 'Cargando...',
    'common.noResults': 'No se encontraron resultados',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.copied': '¡Copiado!',
    'common.copy': 'Copiar',
    'common.close': 'Cerrar',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.back': 'Volver',
    'common.notFound': 'Página no encontrada',
    'common.goHome': 'Ir al inicio',
  },
  en: {
    // Navigation
    'nav.explore': 'Explore',
    'nav.create': 'Create',
    'nav.dashboard': 'Dashboard',
    'nav.connectWallet': 'Connect Wallet',
    'nav.disconnect': 'Disconnect',
    'nav.search': 'Search lotteries...',
    
    // Hero
    'hero.title': 'Transparent Onchain Lotteries on Base',
    'hero.subtitle': 'Create and participate in decentralized lotteries with USDC. Full transparency, automatic payouts.',
    'hero.exploreCta': 'Explore lotteries',
    'hero.createCta': 'Create lottery',
    'hero.badge.onchain': 'Onchain',
    'hero.badge.usdc': 'USDC on Base',
    'hero.badge.transparent': 'Transparent payouts',
    
    // Stats
    'stats.openLotteries': 'Open lotteries',
    'stats.totalPool': 'Total USDC in pools',
    'stats.highestPool': 'Highest pool',
    'stats.totalParticipants': 'Total participants',
    
    // Explorer
    'explorer.title': 'Explore lotteries',
    'explorer.featured': 'Highest pool now',
    'explorer.mostActive': 'Most active',
    'explorer.recent': 'Recent',
    'explorer.allLotteries': 'All lotteries',
    'explorer.filters': 'Filters',
    'explorer.resetFilters': 'Reset filters',
    'explorer.sortBy': 'Sort by',
    'explorer.searchPlaceholder': 'Search by name or ID...',
    
    // Sort options
    'sort.highestPool': 'Highest current pool',
    'sort.highestMaxPool': 'Highest max pool',
    'sort.lowestPrice': 'Lowest price',
    'sort.highestPrice': 'Highest price',
    'sort.newest': 'Newest',
    'sort.closestToFull': 'Closest to full',
    
    // Filters
    'filter.currentPool': 'Current pool',
    'filter.maxPool': 'Max pool',
    'filter.ticketPrice': 'Ticket price',
    'filter.ticketsSold': 'Tickets sold',
    'filter.totalTickets': 'Total tickets',
    'filter.remainingTickets': 'Remaining tickets',
    'filter.min': 'Min',
    'filter.max': 'Max',
    
    // Lottery card
    'card.creator': 'Creator',
    'card.ticketPrice': 'Ticket price',
    'card.ticketsSold': 'Sold',
    'card.currentPool': 'Current pool',
    'card.maxPool': 'Max pool',
    'card.status.open': 'Open',
    'card.status.closed': 'Closed',
    'card.viewDetails': 'View details',
    'card.remaining': 'remaining',
    
    // Detail page
    'detail.title': 'Lottery details',
    'detail.id': 'ID',
    'detail.creator': 'Creator',
    'detail.status': 'Status',
    'detail.ticketPrice': 'Ticket price',
    'detail.maxTickets': 'Max tickets',
    'detail.ticketsSold': 'Tickets sold',
    'detail.remainingTickets': 'Remaining tickets',
    'detail.currentPool': 'Current pool',
    'detail.maxPool': 'Max pool',
    'detail.shareLink': 'Share link',
    'detail.buyTickets': 'Buy tickets',
    'detail.quantity': 'Quantity',
    'detail.estimatedTotal': 'Estimated total',
    'detail.buy': 'Buy',
    'detail.connectFirst': 'Connect your wallet to buy tickets',
    'detail.closeLottery': 'Close lottery',
    'detail.transparency': 'Transparency',
    'detail.participants': 'Participants',
    'detail.wallet': 'Wallet',
    'detail.tickets': 'Tickets',
    'detail.winner': 'Winner',
    'detail.winnerAnnouncement': 'Lottery ended!',
    'detail.winnerWallet': 'Winner wallet',
    'detail.prizeAmount': 'Prize',
    'detail.noParticipants': 'No participants yet',
    'detail.qrCode': 'QR code for quick purchase',

    // Purchase flow - Approval
    'detail.approval.title': 'USDC Approval',
    'detail.approval.required': 'Approval required',
    'detail.approval.ready': 'Approval ready',
    'detail.approval.approving': 'Approving...',
    'detail.approval.approved': 'USDC approved successfully',
    'detail.approval.buttonApprove': 'Approve USDC',
    'detail.approval.explanation': 'Before purchasing, you must authorize the use of your USDC for this operation.',
    'detail.approval.insufficient': 'Insufficient approval',

    // Purchase flow - Buy
    'detail.buy.button': 'Buy tickets',
    'detail.buy.buying': 'Buying...',
    'detail.buy.success': 'Purchase completed successfully',
    'detail.buy.failed': 'Purchase failed',
    'detail.buy.approveFirst': 'You must approve USDC first',

    // Purchase flow - QR
    'detail.qr.title': 'Quick purchase with QR',
    'detail.qr.step1': 'Step 1: Approve USDC',
    'detail.qr.step2': 'Step 2: Scan and buy',
    'detail.qr.notice': 'You must first approve USDC from your wallet before completing the QR purchase.',

    // Purchase flow - Steps
    'detail.step.quantity': 'Step 1: Ticket quantity',
    'detail.step.approval': 'Step 2: USDC Approval',
    'detail.step.purchase': 'Step 3: Purchase',
    'detail.ticketPriceSingle': 'Price per ticket',

    // Create page
    'create.title': 'Create new lottery',
    'create.subtitle': 'Configure your onchain lottery parameters',
    'create.lotteryName': 'Lottery name',
    'create.namePlaceholder': 'E.g: Grand Base Raffle 2026',
    'create.ticketPrice': 'Ticket price (USDC)',
    'create.pricePlaceholder': '10',
    'create.maxTickets': 'Maximum tickets',
    'create.maxTicketsPlaceholder': '100',
    'create.summary': 'Summary',
    'create.estimatedMaxPool': 'Estimated max pool',
    'create.rules': 'Rules',
    'create.rule1': 'Cannot be edited after creation',
    'create.rule2': 'Any wallet can buy unlimited tickets',
    'create.rule3': 'Creator can also participate',
    'create.rule4': 'If closed with tickets sold, winner is drawn automatically',
    'create.rule5': 'If no tickets sold, closes without winner',
    'create.createButton': 'Create lottery',
    'create.creating': 'Creating...',
    'create.success': 'Lottery created successfully!',
    'create.viewLottery': 'View lottery',
    
    // Dashboard
    'dashboard.title': 'My Dashboard',
    'dashboard.myLotteries': 'My open lotteries',
    'dashboard.participating': 'Participating in',
    'dashboard.history': 'History',
    'dashboard.results': 'Results',
    'dashboard.name': 'Name',
    'dashboard.id': 'ID',
    'dashboard.status': 'Status',
    'dashboard.myTickets': 'My tickets',
    'dashboard.pool': 'Pool',
    'dashboard.result': 'Result',
    'dashboard.actions': 'Actions',
    'dashboard.close': 'Close',
    'dashboard.view': 'View',
    'dashboard.won': 'Won',
    'dashboard.lost': 'Lost',
    'dashboard.pending': 'Pending',
    'dashboard.noLotteries': 'You have no open lotteries',
    'dashboard.notParticipating': 'You are not participating in any lottery',
    'dashboard.noHistory': 'No history yet',
    'dashboard.connectWallet': 'Connect your wallet to view your dashboard',
    
    // Common
    'common.usdc': 'USDC',
    'common.loading': 'Loading...',
    'common.noResults': 'No results found',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.copied': 'Copied!',
    'common.copy': 'Copy',
    'common.close': 'Close',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.notFound': 'Page not found',
    'common.goHome': 'Go home',
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

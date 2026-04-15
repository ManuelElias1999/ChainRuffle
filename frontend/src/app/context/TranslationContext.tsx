import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'es' | 'en';

interface Translations {
  [key: string]: {
    es: string;
    en: string;
  };
}

type TranslationVars = Record<string, string | number>;

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
  'home.badge.almostFull': { es: 'Por llenarse', en: 'Almost full' },
  'home.badge.highPool': { es: 'Pozo alto', en: 'High pool' },
  'home.badge.new': { es: 'Nueva', en: 'New' },
  'home.badges.transparent': { es: 'Transparente', en: 'Transparent' },
  'home.badges.multichain': { es: 'Multichain', en: 'Multichain' },
  'home.badges.usdc': { es: 'USDC', en: 'USDC' },
  'home.badges.autoDraw': { es: 'Sorteo automático', en: 'Automatic draw' },
  'home.badges.onchainPayments': { es: 'Pagos onchain', en: 'Onchain payments' },
  'home.refresh': { es: 'Actualizar', en: 'Refresh' },
  'home.loading_lotteries': { es: 'Cargando loterías multichain...', en: 'Loading multichain lotteries...' },
  'home.partial_error_title': { es: 'Algunas redes no respondieron correctamente.', en: 'Some networks did not respond correctly.' },
  'home.partial_error_body': { es: 'Se mostrarán las loterías disponibles de las redes que sí cargaron.', en: 'Available lotteries from networks that responded correctly will be shown.' },
  'home.retry': { es: 'Reintentar', en: 'Retry' },
  'home.no_open_title': { es: 'No hay loterías abiertas', en: 'There are no open lotteries' },
  'home.no_open_body': { es: 'Crea la primera lotería o cambia los filtros.', en: 'Create the first lottery or change the filters.' },
  'home.creator_label': { es: 'Creador', en: 'Creator' },
  'home.ticket_label': { es: 'Ticket', en: 'Ticket' },
  'home.sold_label': { es: 'Vendidos', en: 'Sold' },
  'home.progress_label': { es: 'Progreso', en: 'Progress' },
  'home.current_pool_label': { es: 'Pozo actual', en: 'Current pool' },
  'home.max_pool_label': { es: 'Pozo máximo', en: 'Max pool' },
  'home.featured': {
    es: 'Lotería destacada',
    en: 'Featured lottery',
  },
  'home.buy_tickets': {
    es: 'Comprar tickets',
    en: 'Buy tickets',
  },
  'home.view_more': {
    es: 'Ver más',
    en: 'View more',
  },
  'home.hero.badge': {
  es: 'Loterías onchain multichain',
  en: 'Multichain onchain raffles',
},
'home.participants_label': {
  es: 'Participantes',
  en: 'Participants',
},
'home.stats.badge_live': {
  es: 'Live',
  en: 'Live',
},
'home.stats.badge_top': {
  es: 'Top',
  en: 'Top',
},
'home.stats.badge_users': {
  es: 'Users',
  en: 'Users',
},
'home.discover_badge': {
  es: 'Descubre',
  en: 'Discover',
},
'home.view_raffle_details': {
  es: 'Ver detalles del sorteo',
  en: 'View raffle details',
},
'home.explore_title': {
  es: 'Explora loterías activas',
  en: 'Explore active raffles',
},
'home.explore_subtitle': {
  es: 'Encuentra sorteos con mejores pozos, tickets más baratos o los que están a punto de llenarse.',
  en: 'Find raffles with bigger pools, cheaper tickets, or the ones closest to selling out.',
},
'home.how.subtitle': {
  es: 'Cómo funciona para el usuario',
  en: 'How it works for the user',
},
'home.create.subtitle': {
  es: 'Cómo crear tu propio sorteo',
  en: 'How to create your own raffle',
},
'home.distribution.badge': {
  es: 'Distribución',
  en: 'Distribution',
},
'home.distribution.note': {
  es: 'Transparencia, recompensas claras y una experiencia visual más sólida para que la plataforma se sienta como un producto real.',
  en: 'Transparency, clear rewards, and a stronger visual experience so the platform feels like a real product.',
},
'home.view_less': {
  es: 'Ver menos',
  en: 'View less',
},

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

  // Lottery
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

  // Detail existing
  'detail.purchase': { es: 'Comprar tickets', en: 'Buy tickets' },
  'detail.invalid_quantity': { es: 'Cantidad inválida', en: 'Invalid quantity' },
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
  'detail.share_lottery_text': { es: 'Mira esta lotería', en: 'Check out this lottery' },
  'detail.link_copied': { es: 'Link copiado', en: 'Link copied' },
  'detail.copy_this_link': { es: 'Copia este link', en: 'Copy this link' },

  // Detail added
  'detail.loading': { es: 'Cargando lotería...', en: 'Loading lottery...' },
  'detail.load_error': { es: 'No se pudo cargar la lotería', en: 'Could not load lottery' },
  'detail.back_to_explorer': { es: 'Volver al explorador', en: 'Back to explorer' },
  'detail.creator': { es: 'Creador', en: 'Creator' },
  'detail.progress': { es: 'Progreso', en: 'Progress' },
  'detail.result': { es: 'Resultado', en: 'Result' },
  'detail.winning_ticket': { es: 'Ticket ganador', en: 'Winning ticket' },
  'detail.winner_prize': { es: 'Premio del ganador', en: 'Winner prize' },
  'detail.creator_earnings': { es: 'Ganancia del creador', en: 'Creator earnings' },
  'detail.fees_distributed': { es: 'Fees distribuidos', en: 'Distributed fees' },
  'detail.closed_without_winner': { es: 'Cerrada sin ganador', en: 'Closed without winner' },
  'detail.closed_without_winner_explain': { es: 'Esta lotería cerró sin ganador. No hubo tickets válidos para el sorteo final.', en: 'This lottery closed without a winner. There were no valid tickets for the final draw.' },
  'detail.status_finished_with_winner': { es: 'Finalizada con ganador', en: 'Finished with winner' },
  'detail.status_finished_without_winner': { es: 'Finalizada sin ganador', en: 'Finished without winner' },
  'detail.connect_wallet_to_buy': { es: 'Conecta tu wallet para comprar tickets', en: 'Connect your wallet to buy tickets' },
  'detail.purchase_flow': { es: 'Flujo de compra', en: 'Purchase flow' },
  'detail.purchase_flow_explain_approve_then_buy': { es: 'Con un solo click iniciaremos approve y luego la compra automáticamente.', en: 'With one click we will start approval and then automatically continue with the purchase.' },
  'detail.purchase_flow_explain_direct_buy': { es: 'Ya tienes aprobación suficiente. Iremos directo a la compra.', en: 'You already have enough approval. We will go directly to the purchase.' },
  'detail.purchase_approve_wallet': { es: 'Paso 1/2: Confirma la aprobación de USDC en tu wallet.', en: 'Step 1/2: Confirm USDC approval in your wallet.' },
  'detail.purchase_verifying_allowance': { es: 'USDC aprobado correctamente. Verificando allowance...', en: 'USDC approved successfully. Verifying allowance...' },
  'detail.purchase_preparing': { es: 'USDC aprobado correctamente. Preparando compra...', en: 'USDC approved successfully. Preparing purchase...' },
  'detail.purchase_confirm_buy_wallet': { es: 'Paso 2/2: Confirma la compra de tickets en tu wallet.', en: 'Step 2/2: Confirm ticket purchase in your wallet.' },
  'detail.purchase_allowance_not_ready': { es: 'El approve salió bien, pero el allowance aún no se reflejó. Intenta de nuevo en unos segundos.', en: 'The approval succeeded, but the allowance is not reflected yet. Please try again in a few seconds.' },
  'detail.purchase_error': { es: 'La compra no se completó. Revisa si cancelaste una firma, si tienes balance suficiente o si la red respondió lento.', en: 'The purchase could not be completed. Check whether you canceled a signature, if you have enough balance, or if the network responded slowly.' },
  'detail.purchase_success': { es: 'Ya compraste {{count}} ticket(s).', en: 'You bought {{count}} ticket(s).' },
  'detail.purchase_success_closed': { es: 'Ya compraste {{count}} ticket(s). La lotería se cerró automáticamente.', en: 'You bought {{count}} ticket(s). The lottery closed automatically.' },
  'detail.transaction_incomplete': { es: 'La transacción no se completó. Revisa la wallet, allowance o balance.', en: 'The transaction was not completed. Check your wallet, allowance, or balance.' },
  'detail.wrong_network': { es: 'Red incorrecta', en: 'Wrong network' },
  'detail.view_any_chain_interact_same_chain': { es: 'Puedes ver esta lotería desde cualquier red, pero para comprar o cerrar debes cambiar a {{chain}}.', en: 'You can view this lottery from any network, but to buy or close it you must switch to {{chain}}.' },
  'detail.switching_network': { es: 'Cambiando red...', en: 'Switching network...' },
  'detail.switch_to_chain': { es: 'Cambiar a {{chain}}', en: 'Switch to {{chain}}' },
  'detail.buy_tickets': { es: 'Comprar tickets', en: 'Buy tickets' },
  'detail.buy_again': { es: 'Comprar de nuevo', en: 'Buy again' },
  'detail.try_again': { es: 'Intentar de nuevo', en: 'Try again' },
  'detail.button_approving': { es: 'Paso 1/2: Aprobando USDC...', en: 'Step 1/2: Approving USDC...' },
  'detail.button_preparing': { es: 'Preparando compra...', en: 'Preparing purchase...' },
  'detail.button_buying': { es: 'Paso 2/2: Comprando tickets...', en: 'Step 2/2: Buying tickets...' },
  'detail.button_closing': { es: 'Cerrando lotería...', en: 'Closing lottery...' },
  'detail.max': { es: 'Max', en: 'Max' },
  'detail.previous': { es: 'Anterior', en: 'Previous' },
  'detail.next': { es: 'Siguiente', en: 'Next' },
  'detail.page_of': { es: 'Página {{current}} de {{total}}', en: 'Page {{current}} of {{total}}' },
  'detail.participants_range': { es: 'Mostrando {{start}}-{{end}} de {{total}}', en: 'Showing {{start}}-{{end}} of {{total}}' },
  'detail.no_participants': { es: 'Todavía no hay participantes.', en: 'There are no participants yet.' },
  'detail.view_creation_explorer': { es: 'Ver creación en explorer', en: 'View creation in explorer' },
  'detail.view_purchase_explorer': { es: 'Ver compra en explorer', en: 'View purchase in explorer' },
  'detail.view_close_explorer': { es: 'Ver cierre en explorer', en: 'View closure in explorer' },
  'detail.close_confirm_wallet': { es: 'Confirma el cierre de la lotería en tu wallet.', en: 'Confirm lottery closure in your wallet.' },
  'detail.close_updating': { es: 'Cierre confirmado en blockchain. Actualizando resultado...', en: 'Closure confirmed onchain. Updating result...' },
  'detail.close_success': { es: 'Lotería cerrada correctamente.', en: 'Lottery closed successfully.' },
  'detail.close_delayed': { es: 'El cierre fue confirmado, pero la UI tardó en actualizar. Recarga la vista.', en: 'Closure was confirmed, but the UI took longer to update. Reload the view.' },
  'detail.close_error': { es: 'No se pudo cerrar la lotería.', en: 'Could not close the lottery.' },
  'detail.qr.steps': { es: 'Paso 1: Aprobar USDC → Paso 2: Escanear y comprar', en: 'Step 1: Approve USDC → Step 2: Scan and buy' },

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
  'dashboard.connect_to_view': { es: 'Conecta tu wallet para ver tu dashboard.', en: 'Connect your wallet to view your dashboard.' },
  'dashboard.overview_multichain': { es: 'Vista general de tus loterías creadas y en las que participas en Base, Avalanche y Arbitrum.', en: 'Overview of your created lotteries and the ones you participate in across Base, Avalanche and Arbitrum.' },
  'dashboard.refresh': { es: 'Actualizar', en: 'Refresh' },
  'dashboard.created_count': { es: 'Loterías creadas', en: 'Created lotteries' },
  'dashboard.won_lotteries': { es: 'Loterías ganadas', en: 'Won lotteries' },
  'dashboard.total_won': { es: 'Total ganado', en: 'Total won' },
  'dashboard.participating_count': { es: 'Loterías donde participas', en: 'Participating lotteries' },
  'dashboard.total_tickets_bought': { es: 'Tickets comprados', en: 'Tickets bought' },
  'dashboard.total_pool_generated': { es: 'Pozo total generado', en: 'Total generated pool' },
  'dashboard.creator_estimated_revenue': { es: 'Ingresos estimados del creador', en: 'Estimated creator revenue' },
  'dashboard.creator_estimated_revenue_help': { es: 'Estimado con base en el 10% del pozo recaudado de tus loterías.', en: 'Estimated based on 10% of the pool raised by your lotteries.' },
  'dashboard.multichain_distribution': { es: 'Distribución multichain', en: 'Multichain distribution' },
  'dashboard.open': { es: 'Abiertas', en: 'Open' },
  'dashboard.closed': { es: 'Cerradas', en: 'Closed' },
  'dashboard.all': { es: 'Todas', en: 'All' },
  'dashboard.loading': { es: 'Cargando dashboard...', en: 'Loading dashboard...' },
  'dashboard.partial_error_title': { es: 'Algunas redes no respondieron correctamente.', en: 'Some networks did not respond correctly.' },
  'dashboard.partial_error_body': { es: 'El dashboard mostrará las loterías que sí pudieron cargarse.', en: 'The dashboard will show the lotteries that could be loaded.' },
  'dashboard.empty_title': { es: 'No hay loterías para mostrar', en: 'There are no lotteries to show' },
  'dashboard.empty_created': { es: 'Aún no has creado loterías en esta vista.', en: 'You have not created lotteries in this view yet.' },
  'dashboard.empty_participating': { es: 'Aún no participas en loterías en esta vista.', en: 'You are not participating in lotteries in this view yet.' },
  'dashboard.created_open': { es: 'Creadas abiertas', en: 'Created open' },
  'dashboard.created_closed': { es: 'Creadas cerradas', en: 'Created closed' },
  'dashboard.participating_open': { es: 'Participando abiertas', en: 'Participating open' },
  'dashboard.participating_closed': { es: 'Participando cerradas', en: 'Participating closed' },
  'dashboard.badge_created': { es: 'Creada por mí', en: 'Created by me' },
  'dashboard.badge_participating': { es: 'Participando', en: 'Participating' },
  'dashboard.badge_open': { es: 'Abierta', en: 'Open' },
  'dashboard.badge_closed': { es: 'Cerrada', en: 'Closed' },
  'dashboard.badge_winner_selected': { es: 'Ganador seleccionado', en: 'Winner selected' },
  'dashboard.badge_closed_no_winner': { es: 'Cerrada sin ganador', en: 'Closed without winner' },
  'dashboard.current_pool': { es: 'Pozo actual', en: 'Current pool' },
  'dashboard.creator_share': { es: 'Tu 10%', en: 'Your 10%' },
  'dashboard.sold': { es: 'Vendidos', en: 'Sold' },
  'dashboard.participants_label': { es: 'Participantes', en: 'Participants' },
  'dashboard.my_tickets_label': { es: 'Mis tickets', en: 'My tickets' },
  'dashboard.progress': { es: 'Progreso', en: 'Progress' },
  'dashboard.winner_label': { es: 'Ganador', en: 'Winner' },
  'dashboard.recent_activity': { es: 'Actividad reciente', en: 'Recent activity' },
  'dashboard.no_activity': { es: 'Todavía no hay actividad registrada.', en: 'There is no recorded activity yet.' },
  'dashboard.activity_create': { es: 'Lotería creada', en: 'Lottery created' },
  'dashboard.activity_buy': { es: 'Compra de tickets', en: 'Ticket purchase' },
  'dashboard.activity_close': { es: 'Lotería cerrada', en: 'Lottery closed' },
  'dashboard.view_in_explorer': { es: 'Ver en explorer', en: 'View in explorer' },
  'dashboard.lottery_fallback': { es: 'Lotería {{id}}', en: 'Lottery {{id}}' },
  'dashboard.activity_filter_all': { es: 'Todas', en: 'All' },
  'dashboard.activity_filter_create': { es: 'Creaciones', en: 'Creates' },
  'dashboard.activity_filter_buy': { es: 'Compras', en: 'Buys' },
  'dashboard.activity_filter_close': { es: 'Cierres', en: 'Closes' },

  // Distribution
  'distribution.title': { es: 'Distribución de fondos', en: 'Fund distribution' },
  'distribution.winner': { es: 'Ganador: 80%', en: 'Winner: 80%' },
  'distribution.creator': { es: 'Creador: 10%', en: 'Creator: 10%' },
  'distribution.fees': { es: 'Comisiones: 10%', en: 'Fees: 10%' },

  
};

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: TranslationVars) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

function interpolate(template: string, vars?: TranslationVars) {
  if (!vars) return template;

  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = vars[key];
    return value !== undefined ? String(value) : `{{${key}}}`;
  });
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: string, vars?: TranslationVars): string => {
    const base = translations[key]?.[language] || key;
    return interpolate(base, vars);
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
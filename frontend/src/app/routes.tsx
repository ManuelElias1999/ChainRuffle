import { createBrowserRouter } from 'react-router';
import { Root } from './Root';
import { Home } from './pages/Home';
import { LotteryDetail } from './pages/LotteryDetail';
import { CreateLottery } from './pages/CreateLottery';
import { Dashboard } from './pages/Dashboard';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: 'lottery/:id', Component: LotteryDetail },
      { path: 'create', Component: CreateLottery },
      { path: 'dashboard', Component: Dashboard },
      { path: '*', Component: NotFound },
    ],
  },
]);

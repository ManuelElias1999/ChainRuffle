import React from 'react';
import { Outlet } from 'react-router';
import { Navigation } from './components/Navigation';
import { Toaster } from './components/ui/sonner';

export const Root: React.FC = () => {
  return (
    <div className="dark min-h-screen">
      <Navigation />
      <Outlet />
      <Toaster />
    </div>
  );
};

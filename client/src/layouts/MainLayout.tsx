import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-cream-200">
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      {/* Instagram-style Fixed Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};

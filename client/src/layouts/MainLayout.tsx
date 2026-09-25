import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import { ScrollToTop } from '../components/common/ScrollToTop';

export const MainLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-cream-200">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{
              duration: 0.32,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      {/* Instagram-style Fixed Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};

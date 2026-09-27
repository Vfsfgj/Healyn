/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArtistProvider, useArtist } from './context/ArtistContext';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { MusicSection } from './components/MusicSection';
import { ShopSection } from './components/ShopSection';
import { TourSection } from './components/TourSection';
import { NewsSection } from './components/NewsSection';
import { AboutSection } from './components/AboutSection';
import { NewsletterSection } from './components/NewsletterSection';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/AdminDashboard';
import { CheckCircle2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { toast, currentPage } = useArtist();

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-neutral-950 selection:text-white flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Navbar />

      {/* Main Dedicated Page View according to currentPage */}
      <main className="flex-1">
        {currentPage === 'accueil' && <HomeView />}
        {currentPage === 'musique' && <MusicSection />}
        {currentPage === 'boutique' && <ShopSection />}
        {currentPage === 'concerts' && <TourSection />}
        {currentPage === 'actualites' && <NewsSection />}
        {currentPage === 'le-cercle' && <NewsletterSection />}
        {currentPage === 'a-propos' && <AboutSection />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Artist Studio Admin Panel (Full Screen) */}
      <AdminDashboard />

      {/* Minimalist Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 bg-neutral-950 text-white px-4 py-2.5 rounded-full shadow-2xl border border-neutral-800 flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ArtistProvider>
      <MainLayout />
    </ArtistProvider>
  );
}

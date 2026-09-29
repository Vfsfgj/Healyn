import React, { useState, useEffect, useRef } from 'react';
import { useArtist } from '../context/ArtistContext';
import { AppPage } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Menu,
  X,
  Play,
  Pause,
  Search
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    profile,
    cart,
    setIsCartOpen,
    isPlaying,
    togglePlayPause,
    activeTrack,
    currentPage,
    setCurrentPage,
    searchQuery,
    setSearchQuery
  } = useArtist();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const lastScrollYRef = useRef(0);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Close expanded search when navigating pages
  useEffect(() => {
    setIsSearchExpanded(false);
  }, [currentPage]);

  // Handle click outside to collapse search if empty
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) {
        if (!searchQuery) {
          setIsSearchExpanded(false);
        }
      }
    };
    if (isSearchExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isSearchExpanded, searchQuery]);

  // Prevent background body scroll when mobile menu is open without breaking touch scroll inside overlay
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Smooth scroll listener for sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (mobileMenuOpen) return;

      const currentScrollY = window.scrollY;
      const lastScrollY = lastScrollYRef.current;

      if (currentScrollY < 60) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY + 10) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY - 10) {
        setIsVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen]);

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks: { label: string; page: AppPage }[] = [
    { label: 'Accueil', page: 'accueil' },
    { label: 'Musique', page: 'musique' },
    { label: 'Boutique', page: 'boutique' },
    { label: 'Concerts', page: 'concerts' },
    { label: 'Actualités', page: 'actualites' },
    { label: 'Le Cercle', page: 'le-cercle' },
    { label: 'À Propos', page: 'a-propos' }
  ];

  const handleNavClick = (page: AppPage) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  const displayName = (profile.stageName || 'HEALYN').toUpperCase();

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-white/95 transition-transform duration-300 ease-out ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Zone 1: Wordmark / Artist Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setCurrentPage('accueil')}
              className="text-lg sm:text-2xl font-display font-extrabold tracking-widest text-neutral-950 uppercase hover:opacity-80 transition-opacity cursor-pointer text-left"
            >
              {displayName}
            </button>
            <span className="hidden lg:inline text-xs font-mono-code text-neutral-400 tracking-wider">
              [OFFICIEL]
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {navLinks.map(link => {
              const isActive = currentPage === link.page;
              return (
                <button
                  key={link.page}
                  onClick={() => handleNavClick(link.page)}
                  className={`transition-colors py-1 relative group cursor-pointer ${
                    isActive
                      ? 'text-neutral-950 font-bold'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-neutral-950 transition-all duration-200 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Interactive Affordances */}
          <div className="flex items-center gap-3">
            {/* Quick audio toggle in header */}
            {activeTrack && (
              <button
                onClick={togglePlayPause}
                title={isPlaying ? "Mettre en pause l'extrait" : `Écouter : ${activeTrack.title}`}
                aria-label="Contrôle de lecture audio"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-200 text-xs font-medium text-neutral-800 hover:border-neutral-950 transition-colors cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-neutral-950 fill-neutral-950" />
                    <span className="hidden xl:inline max-w-[110px] truncate">{activeTrack.title}</span>
                    <div className="flex items-center gap-0.5 h-3">
                      <span className="w-1 bg-neutral-950 animate-soundwave-1 inline-block" />
                      <span className="w-1 bg-neutral-950 animate-soundwave-2 inline-block" />
                      <span className="w-1 bg-neutral-950 animate-soundwave-3 inline-block" />
                    </div>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-neutral-800 fill-neutral-800" />
                    <span className="text-neutral-600">Écouter</span>
                  </>
                )}
              </button>
            )}

            {/* Cart Trigger (On mobile, only visible when in boutique section and search is not expanded) */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Ouvrir le panier"
              className={`${
                currentPage === 'boutique' && !isSearchExpanded ? 'flex' : 'hidden sm:flex'
              } items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200 hover:border-neutral-950 text-neutral-900 transition-colors text-xs font-semibold cursor-pointer`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Sac</span>
              <span className="font-mono-code tabular-nums px-1.5 py-0.2 bg-neutral-950 text-white rounded-full text-[10px]">
                {cartItemsCount}
              </span>
            </button>

            {/* Mobile Search - Loupe de recherche qui s'agrandit au clic */}
            {['musique', 'boutique', 'concerts', 'actualites'].includes(currentPage) && (
              <div ref={mobileSearchRef} className="md:hidden flex items-center">
                <AnimatePresence initial={false}>
                  {isSearchExpanded ? (
                    <motion.div
                      key="search-input"
                      initial={{ width: 36, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      exit={{ width: 36, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="flex items-center relative bg-neutral-100 border border-transparent focus-within:border-neutral-950 focus-within:bg-white rounded-full px-3 py-1.5 w-56 xs:w-64 sm:w-72 transition-colors"
                    >
                      <Search className="w-3.5 h-3.5 text-neutral-500 shrink-0 mr-1.5 pointer-events-none" />
                      <input
                        ref={mobileInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher..."
                        className="w-full bg-transparent text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          if (searchQuery) {
                            setSearchQuery('');
                          } else {
                            setIsSearchExpanded(false);
                          }
                        }}
                        className="p-0.5 text-neutral-400 hover:text-neutral-900 cursor-pointer shrink-0 ml-1"
                        title={searchQuery ? "Effacer" : "Fermer"}
                        aria-label="Fermer la recherche"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="search-button"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => {
                        setIsSearchExpanded(true);
                        setTimeout(() => mobileInputRef.current?.focus(), 80);
                      }}
                      aria-label="Ouvrir la recherche"
                      title="Rechercher"
                      className="p-2 text-neutral-800 hover:text-neutral-950 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <Search className="w-5 h-5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile Menu Toggle Button (Caché lorsque la recherche est agrandie) */}
            {!isSearchExpanded && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                className="md:hidden p-2 text-neutral-900 hover:text-neutral-950 cursor-pointer rounded-lg hover:bg-neutral-100 transition-colors shrink-0"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hardware Accelerated Fixed Viewport Mobile Overlay (Outside Sticky Container) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 bg-white md:hidden flex flex-col h-[100dvh] w-screen overflow-hidden select-none"
          >
            {/* Mobile Header Bar Inside Overlay */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-neutral-200/80 shrink-0 bg-white">
              <button
                onClick={() => handleNavClick('accueil')}
                className="text-2xl font-display font-extrabold tracking-widest text-neutral-950 uppercase text-left cursor-pointer"
              >
                {displayName}
              </button>

              <div className="flex items-center gap-3">
                {/* Cart Badge Button in Mobile Menu Header */}
                {currentPage === 'boutique' && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsCartOpen(true);
                    }}
                    className="flex items-center justify-center min-w-[32px] h-8 px-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-950 text-xs font-mono-code font-bold transition-colors cursor-pointer gap-1"
                    aria-label="Voir le panier"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span className="tabular-nums font-bold">{cartItemsCount}</span>
                  </button>
                )}

                {/* Close Button */}
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-full text-neutral-950 hover:bg-neutral-100 transition-colors cursor-pointer"
                  aria-label="Fermer le menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Fluid Navigation List */}
            <div className="flex-1 px-6 py-6 flex flex-col justify-between max-w-lg mx-auto w-full overflow-y-auto">
              <motion.nav
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.025,
                      delayChildren: 0.01,
                    },
                  },
                }}
                className="space-y-2"
              >
                {navLinks.map((link) => {
                  const isActive = currentPage === link.page;
                  return (
                    <motion.button
                      key={link.page}
                      variants={{
                        hidden: { opacity: 0, y: 6 },
                        show: {
                          opacity: 1,
                          y: 0,
                          transition: {
                            duration: 0.18,
                            ease: [0.25, 0.1, 0.25, 1],
                          },
                        },
                      }}
                      onClick={() => handleNavClick(link.page)}
                      className={`w-full text-left py-3.5 px-4 rounded-2xl transition-colors duration-150 cursor-pointer flex items-center justify-between touch-manipulation ${
                        isActive
                          ? 'bg-neutral-950 text-white font-bold shadow-sm'
                          : 'text-neutral-900 hover:bg-neutral-100/90 active:bg-neutral-200/80 font-medium'
                      }`}
                    >
                      <span className="text-xl font-display tracking-tight">
                        {link.label}
                      </span>
                    </motion.button>
                  );
                })}
              </motion.nav>

              {/* Bottom Quick Audio Control & Copyright */}
              <div className="pt-6 mt-6 border-t border-neutral-200/80 space-y-4 shrink-0">
                {activeTrack && (
                  <button
                    onClick={togglePlayPause}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200/80 transition-colors text-neutral-900 text-xs font-medium cursor-pointer touch-manipulation"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-lg bg-neutral-950 flex items-center justify-center text-white shrink-0">
                        {isPlaying ? (
                          <Pause className="w-4 h-4 fill-white" />
                        ) : (
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                        )}
                      </div>
                      <div className="text-left truncate">
                        <div className="font-bold truncate text-neutral-950">{activeTrack.title}</div>
                        <div className="text-[10px] text-neutral-500 font-mono-code uppercase">
                          {isPlaying ? 'En lecture audio' : 'Extrait en pause'}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono-code text-neutral-700 font-semibold underline ml-2 shrink-0">
                      {isPlaying ? 'Pause' : 'Écouter'}
                    </span>
                  </button>
                )}

                <div className="flex items-center justify-between text-xs text-neutral-400 font-mono-code uppercase pt-1">
                  <span>{displayName}</span>
                  <span>© 2026</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

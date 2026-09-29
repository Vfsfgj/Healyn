import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useArtist } from '../context/ArtistContext';
import { Concert, TicketTier, TicketOrder } from '../types';
import { formatFCFA } from '../utils/formatters';
import {
  Calendar,
  MapPin,
  Ticket,
  Clock,
  CheckCircle2,
  X,
  QrCode,
  Download,
  AlertCircle,
  ArrowLeft,
  Search
} from 'lucide-react';

export const TourSection: React.FC = () => {
  const {
    profile,
    concerts,
    selectedConcertForTicket,
    setSelectedConcertForTicket,
    bookTickets,
    setCurrentPage,
    searchQuery,
    setSearchQuery
  } = useArtist();

  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null);
  const [ticketQuantity, setTicketQuantity] = useState<number>(1);
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerEmail, setBuyerEmail] = useState<string>('');
  const [bookedOrder, setBookedOrder] = useState<TicketOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const filteredConcerts = concerts.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.city.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.venue.toLowerCase().includes(q) ||
      c.date.toLowerCase().includes(q) ||
      (c.formattedDate && c.formattedDate.toLowerCase().includes(q)) ||
      (c.status && c.status.toLowerCase().includes(q))
    );
  });

  const handleOpenBooking = (concert: Concert) => {
    setSelectedConcertForTicket(concert);
    setBookedOrder(null);
    setTicketQuantity(1);
    const availableTier = concert.ticketTiers.find(t => t.remaining > 0);
    setSelectedTier(availableTier || concert.ticketTiers[0]);
  };

  const handleCloseBooking = () => {
    setSelectedConcertForTicket(null);
    setBookedOrder(null);
    setSelectedTier(null);
  };

  const handleConfirmTickets = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConcertForTicket || !selectedTier) return;
    if (!buyerName.trim() || !buyerEmail.trim() || !buyerEmail.includes('@')) {
      alert("Veuillez renseigner votre nom complet et un e-mail valide.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const order = bookTickets({
        concert: selectedConcertForTicket,
        tierName: selectedTier.name,
        quantity: ticketQuantity,
        unitPrice: selectedTier.price,
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim()
      });
      setBookedOrder(order);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <section id="concerts" className="py-12 sm:py-16 bg-neutral-50/50 min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Breadcrumb & Desktop Search Bar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono-code text-neutral-500">
            <button
              onClick={() => setCurrentPage('accueil')}
              className="hover:text-neutral-950 transition-colors cursor-pointer"
            >
              Accueil
            </button>
            <span>/</span>
            <span className="text-neutral-950 font-bold uppercase">Concerts &amp; Billetterie</span>
          </div>

          {/* Desktop Search Bar (alignée avec le fil d'Ariane) */}
          <div className="hidden md:flex items-center relative w-72 lg:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une ville, salle, date..."
              className="w-full pl-9 pr-8 py-1.5 bg-neutral-100 border border-transparent rounded-full text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-950 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-0.5 text-neutral-400 hover:text-neutral-900 cursor-pointer rounded-full"
                title="Effacer la recherche"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-neutral-200">
          <div>
            <div className="text-xs font-mono-code uppercase tracking-widest text-neutral-400 mb-2">
              03. Scénographie Lumineuse &amp; Live
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-neutral-950 uppercase">
              Tournée 2026 — 2027
            </h2>
          </div>

          <div className="text-xs font-mono-code text-neutral-500 flex items-center gap-3">
            <span>Diffusion Quadraphonique 360°</span>
            <span aria-hidden="true">·</span>
            <span>Billetterie Sécurisée</span>
          </div>
        </div>

        {/* Concerts List */}
        <div className="mt-8 bg-white -mx-4 sm:mx-0 sm:rounded-2xl overflow-hidden shadow-none">
          {filteredConcerts.map((concert, index) => {
            const isSoldOut = concert.status === 'Complet';
            const minPrice = Math.min(...concert.ticketTiers.map(t => t.price));

            return (
              <React.Fragment key={concert.id}>
                <div
                  className="p-5 sm:p-6 px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-6 hover:bg-neutral-50/80 transition-colors"
                >
                  {/* Date & Location */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 flex-1 min-w-0">
                    <div className="min-w-[150px] shrink-0">
                      <div className="text-sm font-mono-code font-bold text-neutral-950">
                        {concert.formattedDate}
                      </div>
                      <div className="text-xs font-mono-code text-neutral-950 font-medium">
                        Ouverture des portes : {concert.doorsOpen}
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-4 flex-1 min-w-0">
                      <div className="min-w-0">
                        <div className="text-lg font-bold text-neutral-950 flex items-center gap-2">
                          <span>{concert.city}</span>
                          <span className="text-xs font-mono-code text-neutral-400 font-normal">
                            ({concert.country})
                          </span>
                        </div>
                        <div className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate">{concert.venue}</span>
                        </div>
                      </div>

                      {/* Price on mobile (same horizontal line as Paris / Venue) */}
                      <div className="text-right md:hidden shrink-0">
                        <div className="text-[11px] font-mono-code text-neutral-400">À partir de</div>
                        <div className="text-base font-mono-code font-bold text-neutral-950 tabular-nums">
                          {formatFCFA(minPrice)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status & Ticket Button */}
                  <div className="flex items-center justify-between md:justify-end gap-5 md:gap-6 pt-2 md:pt-0 shrink-0">
                    {/* Price on desktop - fixed column width for strict vertical alignment */}
                    <div className="text-right hidden md:block w-32 shrink-0">
                      <div className="text-xs font-mono-code text-neutral-400">À partir de</div>
                      <div className="text-sm font-mono-code font-bold text-neutral-950 tabular-nums">
                        {formatFCFA(minPrice)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-end shrink-0">
                      <span
                        className={`w-[140px] py-2 rounded-xl text-xs font-semibold inline-flex items-center justify-center shrink-0 ${
                          concert.status === 'Complet'
                            ? 'bg-neutral-100 text-neutral-400'
                            : concert.status === 'Dernières Places'
                            ? 'bg-[#6B1724] text-white'
                            : 'bg-[#1b4332] text-white'
                        }`}
                      >
                        {concert.status}
                      </span>

                      <button
                        onClick={() => handleOpenBooking(concert)}
                        disabled={isSoldOut}
                        className={`w-[115px] py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                          isSoldOut
                            ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                            : 'bg-neutral-950 text-white hover:bg-neutral-800'
                        }`}
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>{isSoldOut ? 'Complet' : 'Réserver'}</span>
                      </button>
                    </div>
                  </div>
                </div>
                {index < filteredConcerts.length - 1 && (
                  <div className="mx-4 sm:mx-6 border-b border-neutral-200" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Empty Search Result State */}
        {filteredConcerts.length === 0 && (
          <div className="py-16 text-center space-y-3 bg-white sm:rounded-2xl mt-8">
            <p className="text-sm font-semibold text-neutral-800">
              {searchQuery ? `Aucune date de concert trouvée pour "${searchQuery}"` : "Aucune date de concert disponible"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-1.5 text-xs font-mono-code font-semibold uppercase bg-neutral-950 text-white rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        )}

        {/* Ticket Booking Full Screen Page */}
        {selectedConcertForTicket && (
          <div
            className="fixed inset-0 z-50 bg-white w-full h-full min-h-screen overflow-y-auto flex flex-col"
          >
            {/* Full Screen Top Navigation Bar */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 sm:px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCloseBooking}
                  className="px-2.5 py-1 sm:px-4 sm:py-2 rounded-full border border-neutral-950 hover:bg-neutral-950 hover:text-white text-neutral-950 text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Retour à la tournée</span>
                </button>
                <span className="hidden sm:inline text-neutral-300">|</span>
                <span className="hidden sm:inline text-xs font-mono-code uppercase text-neutral-500">
                  Billetterie Officielle {profile.stageName}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono-code text-neutral-400 hidden md:inline">
                  {selectedConcertForTicket.city} · {selectedConcertForTicket.venue}
                </span>
              </div>
            </div>

            {/* Main Full Screen Content */}
            <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12">
              {!bookedOrder ? (
                /* Ticket Selection & Order Form */
                <form onSubmit={handleConfirmTickets} className="space-y-8">
                  {/* Hero Header */}
                  <div className="border-b border-neutral-200 pb-6">
                    <div className="text-xs font-mono-code uppercase text-neutral-400 tracking-wider">
                      Billetterie Officielle {profile.stageName}
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-display font-bold text-neutral-950 mt-2 uppercase tracking-tight">
                      {selectedConcertForTicket.city} · {selectedConcertForTicket.venue}
                    </h2>
                    <div className="text-xs sm:text-sm text-neutral-600 mt-2 flex flex-wrap items-center gap-3 font-mono-code">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-neutral-400" />
                        <span>{selectedConcertForTicket.formattedDate}</span>
                      </div>
                      <span aria-hidden="true">·</span>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-neutral-400" />
                        <span>Ouverture des portes : {selectedConcertForTicket.doorsOpen}</span>
                      </div>
                      <span aria-hidden="true">·</span>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-neutral-400" />
                        <span>{selectedConcertForTicket.country}</span>
                      </div>
                    </div>
                  </div>

                  {/* 2-Column Responsive Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Category Tiers (Concert Ticket Shape & Noir Aesthetic) */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="pb-1">
                        <label className="text-xs sm:text-sm font-bold text-neutral-950 uppercase font-mono-code flex items-center gap-1.5">
                          <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-950 shrink-0" />
                          <span>Sélectionnez votre billet :</span>
                        </label>
                      </div>

                      <div className="space-y-4">
                        {selectedConcertForTicket.ticketTiers.map((tier, idx) => {
                          const isAvailable = tier.remaining > 0;
                          const isSelected = selectedTier?.id === tier.id;
                          const isVIP = tier.name.toLowerCase().includes('vip');

                          return (
                            <div key={tier.id} className="space-y-3">
                              <div
                                onClick={() => {
                                  if (!isAvailable) return;
                                  setSelectedTier(isSelected ? null : tier);
                                }}
                                className={`relative select-none ${
                                  !isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                              >
                                {/* 100% Locked Geometry Concert Ticket Shape (Identical on Mobile & Desktop, Stable when Selected) */}
                                <div className="relative overflow-hidden rounded-2xl bg-neutral-950 text-white shadow-md flex items-stretch">
                                  
                                  {/* Left Side: Ticket Main Body */}
                                  <div className="flex-1 p-4 sm:p-6 pr-5 sm:pr-8 flex flex-col justify-between space-y-3 min-w-0">
                                    <div>
                                      {/* Top Bar: Pass Number, VIP badge & Live remaining text */}
                                      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 font-semibold tracking-wider">
                                            BILLET #{String(idx + 1).padStart(2, '0')}
                                          </span>
                                          {isVIP && (
                                            <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 font-semibold">
                                              ★ VIP
                                            </span>
                                          )}
                                        </div>

                                        <div className="text-[10px] sm:text-[11px] font-mono-code text-neutral-400">
                                          {isAvailable ? (
                                            <span>{tier.remaining} billets restants</span>
                                          ) : (
                                            <span className="text-neutral-500 font-bold uppercase">Épuisé</span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Tier Title */}
                                      <div className="flex items-center gap-2">
                                        <h4 className="text-base sm:text-lg md:text-xl font-bold font-display text-white uppercase tracking-tight truncate">
                                          {tier.name}
                                        </h4>
                                        {isSelected && (
                                          <span className="text-[9px] sm:text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-white text-neutral-950 font-bold uppercase shrink-0">
                                            Sélectionné
                                          </span>
                                        )}
                                      </div>

                                      {/* Tier Description */}
                                      <p className="text-[11px] sm:text-xs text-neutral-300 mt-1.5 sm:mt-2 leading-relaxed font-sans">
                                        {tier.description}
                                      </p>
                                    </div>

                                    {/* Sub-bar: Concert location & admit stamp */}
                                    <div className="pt-2 flex items-center justify-between text-[10px] sm:text-[11px] font-mono-code text-neutral-400 border-t border-neutral-900">
                                      <div className="flex items-center gap-1.5 truncate pr-2">
                                        <span className="text-neutral-200 shrink-0">{selectedConcertForTicket.city}</span>
                                        <span>·</span>
                                        <span className="truncate">{selectedConcertForTicket.venue}</span>
                                      </div>
                                      <div className="tracking-widest uppercase text-[9px] sm:text-[10px] text-neutral-500 shrink-0 font-bold">
                                        ADMIT ONE
                                      </div>
                                    </div>
                                  </div>

                                  {/* Center Vertical Divider with Top & Bottom Notch Cutouts */}
                                  <div className="relative w-0 flex flex-col items-center justify-between pointer-events-none z-20">
                                    {/* Top Notch Cutout */}
                                    <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-white -mt-2.5 sm:-mt-3 shrink-0"></div>
                                    
                                    {/* Perforated Vertical Dashed Line */}
                                    <div className="flex-1 w-0 border-r border-dashed border-neutral-800 my-1"></div>
                                    
                                    {/* Bottom Notch Cutout */}
                                    <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-white -mb-2.5 sm:-mb-3 shrink-0"></div>
                                  </div>

                                  {/* Right Side: Ticket Stub (Talon de Billet) */}
                                  <div className="w-28 sm:w-36 md:w-40 p-3 sm:p-5 bg-neutral-900 flex flex-col justify-between items-center sm:items-end text-center sm:text-right shrink-0">
                                    
                                    {/* Price Display */}
                                    <div className="w-full">
                                      <div className="text-[9px] sm:text-[10px] font-mono-code uppercase tracking-widest text-neutral-400 truncate">
                                        TARIF PLACE
                                      </div>
                                      <div className="text-lg sm:text-xl md:text-2xl font-display font-extrabold text-white font-mono-code tabular-nums mt-0.5">
                                        {tier.price.toLocaleString('fr-FR')} <span className="text-[10px] sm:text-xs font-normal text-neutral-400">FCFA</span>
                                      </div>
                                    </div>

                                    {/* Barcode & Button */}
                                    <div className="flex flex-col items-center sm:items-end gap-2 w-full mt-2">
                                      {/* Decorative Barcode Lines */}
                                      <div className="hidden sm:flex items-center justify-center sm:justify-end gap-[2px] h-5 w-20 opacity-50">
                                        <div className="w-[2px] h-full bg-white"></div>
                                        <div className="w-[1px] h-full bg-white"></div>
                                        <div className="w-[3px] h-full bg-white"></div>
                                        <div className="w-[1px] h-full bg-white"></div>
                                        <div className="w-[3px] h-full bg-white"></div>
                                        <div className="w-[2px] h-full bg-white"></div>
                                        <div className="w-[1px] h-full bg-white"></div>
                                        <div className="w-[2px] h-full bg-white"></div>
                                      </div>

                                      {/* Button State */}
                                      <div className="w-full">
                                        {isSelected ? (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedTier(null);
                                            }}
                                            className="w-full py-1.5 px-2 rounded-lg bg-white text-neutral-950 text-[10px] sm:text-[11px] font-bold font-mono-code flex items-center justify-center gap-1 shadow-xs hover:bg-neutral-200 transition-colors cursor-pointer"
                                          >
                                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                                            <span>CHOISI</span>
                                          </button>
                                        ) : isAvailable ? (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedTier(tier);
                                            }}
                                            className="w-full py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] sm:text-[11px] font-semibold font-mono-code flex items-center justify-center transition-colors cursor-pointer"
                                          >
                                            CHOISIR
                                          </button>
                                        ) : (
                                          <div className="w-full py-1.5 px-2 rounded-lg bg-neutral-800 text-neutral-500 text-[10px] sm:text-[11px] font-mono-code">
                                            COMPLET
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                  </div>

                                </div>
                              </div>

                              {/* ON MOBILE: Appears directly beneath the selected ticket tier with smooth motion */}
                              <AnimatePresence>
                                {isSelected && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0, y: -14, filter: 'blur(3px)' }}
                                    animate={{ opacity: 1, height: 'auto', y: 0, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, height: 0, y: -14, filter: 'blur(3px)' }}
                                    transition={{
                                      height: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                                      opacity: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
                                      y: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                                      filter: { duration: 0.42, ease: 'easeOut' }
                                    }}
                                    className="block lg:hidden overflow-hidden"
                                  >
                                    <div className="bg-neutral-100/70 p-5 rounded-2xl space-y-4 mt-2">
                                      {/* Quantity Selector */}
                                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-white shadow-xs">
                                        <span className="text-xs font-semibold text-neutral-900">
                                          Nombre de places :
                                        </span>
                                        <div className="flex items-center gap-3">
                                          <button
                                            type="button"
                                            onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                                            className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-900 text-sm font-bold flex items-center justify-center cursor-pointer hover:bg-neutral-200 active:scale-95"
                                          >
                                            -
                                          </button>
                                          <span className="font-mono-code font-bold text-base tabular-nums w-4 text-center text-neutral-950">
                                            {ticketQuantity}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => setTicketQuantity(Math.min(tier.remaining, Math.min(6, ticketQuantity + 1)))}
                                            className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-900 text-sm font-bold flex items-center justify-center cursor-pointer hover:bg-neutral-200 active:scale-95"
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>

                                      {/* Buyer Form */}
                                      <div className="space-y-3.5">
                                        <div>
                                          <label className="text-xs font-medium text-neutral-700 block mb-1">
                                            Nom et Prénom du titulaire :
                                          </label>
                                          <input
                                            type="text"
                                            required
                                            value={buyerName}
                                            onChange={e => setBuyerName(e.target.value)}
                                            placeholder="ex. Camille Laurent"
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-white text-xs text-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950 shadow-xs border-0"
                                          />
                                        </div>

                                        <div>
                                          <label className="text-xs font-medium text-neutral-700 block mb-1">
                                            Adresse e-mail pour réception des e-billets :
                                          </label>
                                          <input
                                            type="email"
                                            required
                                            value={buyerEmail}
                                            onChange={e => setBuyerEmail(e.target.value)}
                                            placeholder="camille@exemple.com"
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-white text-xs text-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950 shadow-xs border-0"
                                          />
                                        </div>
                                      </div>

                                      {/* Price & Confirmation */}
                                      <div className="pt-3 border-t border-neutral-200/60 space-y-3">
                                        <div className="flex items-center justify-between text-base font-bold text-neutral-950">
                                          <span>Total Billetterie :</span>
                                          <span className="font-mono-code tabular-nums text-xl">
                                            {formatFCFA(tier.price * ticketQuantity)}
                                          </span>
                                        </div>

                                        <button
                                          type="submit"
                                          disabled={isSubmitting || !isAvailable}
                                          className="w-full py-3.5 bg-neutral-950 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:bg-neutral-300 shadow-sm"
                                        >
                                          <Ticket className="w-4 h-4" />
                                          <span>
                                            {isSubmitting ? "Validation de la réservation..." : "Confirmer et Générer mes Billets"}
                                          </span>
                                        </button>

                                        <p className="text-[10px] text-center text-neutral-500 font-mono-code">
                                          Paiement direct sécurisé · Billets électroniques nominatifs instantanés
                                        </p>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Column: Quantity, Buyer Info & Checkout Summary (Desktop Only) */}
                    <div className="hidden lg:block lg:col-span-5 bg-neutral-50 p-6 sm:p-8 rounded-3xl space-y-6">
                      
                      {/* Quantity Selector */}
                      {selectedTier ? (
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white shadow-xs">
                          <div>
                            <span className="text-xs font-semibold text-neutral-900 block">
                              Nombre de places :
                            </span>
                            <span className="text-[10px] font-mono-code text-neutral-400">
                              {selectedTier.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                              className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-900 text-sm font-bold flex items-center justify-center cursor-pointer hover:bg-neutral-200"
                            >
                              -
                            </button>
                            <span className="font-mono-code font-bold text-base tabular-nums w-4 text-center">
                              {ticketQuantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => setTicketQuantity(Math.min(selectedTier.remaining, Math.min(6, ticketQuantity + 1)))}
                              className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-900 text-sm font-bold flex items-center justify-center cursor-pointer hover:bg-neutral-200"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-white/70 text-center space-y-1">
                          <div className="text-xs font-bold text-neutral-900">Aucun billet sélectionné</div>
                          <div className="text-[11px] text-neutral-500">Cliquez sur une catégorie de billet à gauche pour configurer votre commande.</div>
                        </div>
                      )}

                      {/* Buyer Form */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium text-neutral-700 block mb-1">
                            Nom et Prénom du titulaire :
                          </label>
                          <input
                            type="text"
                            required
                            value={buyerName}
                            onChange={e => setBuyerName(e.target.value)}
                            placeholder="ex. Camille Laurent"
                            className="w-full px-4 py-3 rounded-xl bg-white text-xs text-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950 shadow-xs border-0"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-neutral-700 block mb-1">
                            Adresse e-mail pour réception des e-billets :
                          </label>
                          <input
                            type="email"
                            required
                            value={buyerEmail}
                            onChange={e => setBuyerEmail(e.target.value)}
                            placeholder="camille@exemple.com"
                            className="w-full px-4 py-3 rounded-xl bg-white text-xs text-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950 shadow-xs border-0"
                          />
                        </div>
                      </div>

                      {/* Price & Confirmation */}
                      <div className="pt-4 border-t border-neutral-200/60 space-y-4">
                        <div className="flex items-center justify-between text-base font-bold text-neutral-950">
                          <span>Total Billetterie :</span>
                          <span className="font-mono-code tabular-nums text-xl">
                            {formatFCFA(selectedTier ? selectedTier.price * ticketQuantity : 0)}
                          </span>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting || !selectedTier || selectedTier.remaining === 0}
                          className="w-full py-4 bg-neutral-950 text-white rounded-2xl text-xs font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:bg-neutral-300 disabled:cursor-not-allowed shadow-sm"
                        >
                          <Ticket className="w-4 h-4" />
                          <span>
                            {isSubmitting
                              ? "Validation de la réservation..."
                              : !selectedTier
                              ? "Sélectionnez une place pour continuer"
                              : "Confirmer et Générer mes Billets"}
                          </span>
                        </button>

                        <p className="text-[11px] text-center text-neutral-500 font-mono-code">
                          Paiement direct sécurisé · Billets électroniques nominatifs instantanés
                        </p>
                      </div>

                    </div>

                  </div>
                </form>
              ) : (
                /* Ticket Success Confirmation Pass Full Screen */
                <div className="max-w-2xl mx-auto text-center space-y-6 py-6">
                  <div className="w-16 h-16 bg-neutral-100 text-neutral-950 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h2 className="text-3xl font-display font-bold text-neutral-950">
                      Réservation Validée !
                    </h2>
                    <p className="text-sm text-neutral-600 mt-2">
                      Un e-mail de confirmation avec votre pass a été envoyé à <strong>{bookedOrder.buyerEmail}</strong>
                    </p>
                  </div>

                  {/* Digital Ticket Pass Card */}
                  <div className="p-8 rounded-3xl bg-neutral-950 text-white text-left space-y-6 shadow-2xl border border-neutral-800">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                      <div className="text-sm font-display font-extrabold tracking-widest uppercase">
                        {profile.stageName} LIVE 2026-2027
                      </div>
                      <div className="text-xs font-mono-code text-neutral-400">
                        PASS OFFICIEL
                      </div>
                    </div>

                    <div>
                      <div className="text-2xl font-bold">
                        {bookedOrder.concertCity} — {bookedOrder.venue}
                      </div>
                      <div className="text-sm text-neutral-300 font-mono-code mt-1">
                        {bookedOrder.date}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-mono-code text-neutral-300 border-t border-neutral-800 pt-4">
                      <div>
                        <div className="text-[10px] text-neutral-500 uppercase">CATÉGORIE</div>
                        <div className="text-sm font-bold text-white mt-0.5">{bookedOrder.tierName} (x{bookedOrder.quantity})</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-neutral-500 uppercase">TITULAIRE</div>
                        <div className="text-sm font-bold text-white mt-0.5">{bookedOrder.buyerName}</div>
                      </div>
                    </div>

                    {/* QR Code Simulation */}
                    <div className="p-4 bg-white rounded-2xl text-neutral-950 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <QrCode className="w-10 h-10 text-neutral-950" />
                        <div className="text-left font-mono-code text-xs leading-tight">
                          <div className="font-bold">{bookedOrder.qrCodeData}</div>
                          <div className="text-neutral-500 mt-0.5">Contrôle à l'entrée du concert</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono-code px-3 py-1 rounded bg-neutral-100 font-bold">
                        VALIDÉ
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                    <button
                      onClick={() => alert(`Téléchargement de votre pass PDF pour ${bookedOrder.concertCity}...`)}
                      className="w-full sm:flex-1 py-3.5 rounded-2xl border border-neutral-300 text-neutral-900 text-xs font-semibold hover:border-neutral-950 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Télécharger le Pass (PDF)</span>
                    </button>
                    <button
                      onClick={handleCloseBooking}
                      className="w-full sm:flex-1 py-3.5 rounded-2xl bg-neutral-950 text-white text-xs font-semibold hover:bg-neutral-800 cursor-pointer transition-colors"
                    >
                      Fermer et retourner au site
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

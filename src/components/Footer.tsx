import React, { useState } from 'react';
import { useArtist } from '../context/ArtistContext';
import { ArrowUp, Shield, X, Lock, FileText, Disc } from 'lucide-react';

export const Footer: React.FC = () => {
  const { profile, setIsAdminOpen, setCurrentPage } = useArtist();
  const [legalModal, setLegalModal] = useState<'mentions' | 'privacy' | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white text-neutral-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* Main 4-column minimal grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-neutral-200/80">
          
          {/* Brand & Identity */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => setCurrentPage('accueil')}
              className="text-2xl font-display font-extrabold tracking-widest text-neutral-950 uppercase text-left cursor-pointer"
            >
              {profile.stageName}
            </button>
            <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
              Compositeur &amp; performer sonore contemporain. Création indépendante, tirages vinyles artisanaux et tournée quadraphonique.
            </p>
            <div className="text-[11px] font-mono-code text-neutral-400">
              Studio : Paris · Kyoto · Berlin
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <div className="font-mono-code text-[11px] font-bold text-neutral-950 uppercase tracking-wider">
              Navigation
            </div>
            <ul className="space-y-2">
              <li><button onClick={() => setCurrentPage('accueil')} className="hover:text-neutral-950 transition-colors cursor-pointer">Accueil</button></li>
              <li><button onClick={() => setCurrentPage('musique')} className="hover:text-neutral-950 transition-colors cursor-pointer">Discographie &amp; Extraits HD</button></li>
              <li><button onClick={() => setCurrentPage('boutique')} className="hover:text-neutral-950 transition-colors cursor-pointer">Boutique &amp; Vinyles</button></li>
              <li><button onClick={() => setCurrentPage('concerts')} className="hover:text-neutral-950 transition-colors cursor-pointer">Dates &amp; Billetterie</button></li>
              <li><button onClick={() => setCurrentPage('actualites')} className="hover:text-neutral-950 transition-colors cursor-pointer">Actualités &amp; Journal</button></li>
              <li><button onClick={() => setCurrentPage('le-cercle')} className="hover:text-neutral-950 transition-colors cursor-pointer">Le Cercle (VIP)</button></li>
              <li><button onClick={() => setCurrentPage('a-propos')} className="hover:text-neutral-950 transition-colors cursor-pointer">Démarche Artistique</button></li>
            </ul>
          </div>

          {/* Socials & Streaming */}
          <div className="space-y-3">
            <div className="font-mono-code text-[11px] font-bold text-neutral-950 uppercase tracking-wider">
              Écoute &amp; Réseaux
            </div>
            <ul className="space-y-2">
              <li>
                <a
                  href={profile.socials.spotify}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-neutral-950 transition-colors inline-flex items-center gap-2 group"
                >
                  <svg className="w-3.5 h-3.5 shrink-0 fill-[#1DB954] transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.435-5.308-1.76-8.793-.963-.335.077-.67-.133-.746-.468-.077-.334.132-.67.467-.746 3.809-.871 7.077-.497 9.722 1.113.294.18.387.563.207.857zm1.226-2.723c-.226.367-.707.483-1.074.257-2.69-1.653-6.79-2.131-9.97-1.165-.413.125-.85-.107-.975-.52-.125-.414.107-.85.52-.976 3.632-1.102 8.147-.568 11.242 1.33.367.226.483.707.257 1.074zm.105-2.835C14.692 8.95 8.085 8.73 4.708 9.756c-.495.15-1.022-.13-1.172-.625-.15-.495.13-1.022.625-1.172 3.944-1.197 11.233-.946 15.11 1.358.444.264.59.84.327 1.285-.264.444-.84.59-1.285.326z"/>
                  </svg>
                  <span>Spotify Official</span>
                </a>
              </li>
              <li>
                <a
                  href={profile.socials.appleMusic}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-neutral-950 transition-colors inline-flex items-center gap-2 group"
                >
                  <svg className="w-3.5 h-3.5 shrink-0 fill-[#FA243C] transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.8 6.476v6.192c0 1.305-.98 2.054-2.222 2.054-1.26 0-2.18-.76-2.18-1.996 0-1.258.95-2.025 2.222-2.025.498 0 .973.125 1.332.327v-3.72l-4.137.917v4.675c0 1.305-.98 2.054-2.222 2.054-1.26 0-2.18-.76-2.18-1.996 0-1.258.95-2.025 2.222-2.025.498 0 .973.125 1.332.327v-5.617c0-.42.316-.763.73-.836l5.228-1.156c.465-.102.896.24.896.705z"/>
                  </svg>
                  <span>Apple Music</span>
                </a>
              </li>
              <li>
                <a
                  href={profile.socials.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-neutral-950 transition-colors inline-flex items-center gap-2 group"
                >
                  <svg className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id="ig-footer-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FFDC80" />
                        <stop offset="50%" stopColor="#F56040" />
                        <stop offset="70%" stopColor="#FD1D1D" />
                        <stop offset="100%" stopColor="#C13584" />
                      </linearGradient>
                    </defs>
                    <path fill="url(#ig-footer-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href={profile.socials.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-neutral-950 transition-colors inline-flex items-center gap-2 group"
                >
                  <svg className="w-3.5 h-3.5 shrink-0 fill-[#FF0000] transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>YouTube Channel</span>
                </a>
              </li>
              <li>
                <a
                  href={profile.socials.soundcloud}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-neutral-950 transition-colors inline-flex items-center gap-2 group"
                >
                  <Disc className="w-3.5 h-3.5 text-[#FF5500] transition-transform group-hover:scale-110" />
                  <span>SoundCloud</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Management */}
          <div className="space-y-3">
            <div className="font-mono-code text-[11px] font-bold text-neutral-950 uppercase tracking-wider">
              Management
            </div>
            <div className="space-y-1.5 text-neutral-500">
              <div>Booking &amp; Spectacles :</div>
              <div className="text-neutral-900 font-medium font-mono-code">live@healing-music.com</div>
              <div className="pt-2">Presse &amp; Médias :</div>
              <div className="text-neutral-900 font-medium font-mono-code">press@healing-music.com</div>
            </div>
          </div>

        </div>

        {/* Bottom bar - Highly Ergonomic Responsive Layout */}
        <div className="pt-8 flex flex-col md:flex-row md:items-center justify-between gap-6 text-[11px] font-mono-code">
          
          {/* Legal Links & Back to Top - Optimized for mobile tap targets */}
          <div className="flex flex-wrap items-center justify-between sm:justify-start gap-3 sm:gap-6 order-1 md:order-2">
            <div className="flex items-center gap-3 sm:gap-4 text-neutral-500">
              <button
                onClick={() => setLegalModal('mentions')}
                className="hover:text-neutral-950 transition-colors cursor-pointer py-1.5 text-left"
              >
                Mentions Légales &amp; CGV
              </button>
              <span aria-hidden="true" className="text-neutral-300">·</span>
              <button
                onClick={() => setLegalModal('privacy')}
                className="hover:text-neutral-950 transition-colors cursor-pointer py-1.5 text-left"
              >
                Confidentialité
              </button>
            </div>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-neutral-900 transition-all cursor-pointer font-bold text-xs shrink-0 ml-auto md:ml-0"
              aria-label="Remonter en haut de la page"
            >
              <span>Haut de page</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Copyright & Discreet Admin Access */}
          <div className="flex items-center justify-between md:justify-start gap-2 text-neutral-400 order-2 md:order-1 pt-4 md:pt-0 border-t md:border-t-0 border-neutral-100">
            <span className="leading-relaxed">
              © {new Date().getFullYear()} {profile.stageName}. Tous droits réservés. Production indépendante.
            </span>
            {/* Discreet Admin Trigger */}
            <button
              onClick={() => setIsAdminOpen(true)}
              className="opacity-50 hover:opacity-100 transition-opacity p-1.5 text-neutral-400 hover:text-neutral-900 cursor-pointer shrink-0"
              title="Accès Administration"
              aria-label="Accès Administration"
            >
              <Shield className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Legal / Privacy Modal */}
      {legalModal && (
        <div
          className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLegalModal(null)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2 font-display font-bold text-base text-neutral-950 uppercase">
                {legalModal === 'mentions' ? (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Mentions Légales &amp; CGV</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Politique de Confidentialité</span>
                  </>
                )}
              </div>
              <button
                onClick={() => setLegalModal(null)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-950 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-neutral-600 space-y-3 leading-relaxed">
              {legalModal === 'mentions' ? (
                <>
                  <p>
                    <strong>Éditeur du site :</strong> Production indépendante {profile.stageName}.
                  </p>
                  <p>
                    <strong>Hébergement :</strong> Plateforme Cloud sécurisée haute disponibilité avec chiffrement SSL/TLS.
                  </p>
                  <p>
                    <strong>Conditions Générales de Vente :</strong> Les commandes de vinyles et merch sont expédiées sous 48 à 72h ouvrées avec suivi. Les billets de concert électroniques sont nominatifs et transmis immédiatement par email.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Protection des données :</strong> Les données collectées (nom, email, adresse de livraison) sont exclusivement réservées au traitement de vos commandes de boutique et à l'émission de vos billets de concert.
                  </p>
                  <p>
                    <strong>Aucune revente tierce :</strong> Vos données ne sont jamais cédées ni vendues à des tiers.
                  </p>
                </>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setLegalModal(null)}
                className="w-full py-2.5 bg-neutral-950 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

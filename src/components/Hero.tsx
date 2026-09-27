import React from 'react';
import { useArtist } from '../context/ArtistContext';
import { MusicalPointCloudCanvas } from './MusicalPointCloudCanvas';
import {
  ArrowRight,
  Disc3,
  Calendar
} from 'lucide-react';

export const Hero: React.FC = () => {
  const { profile, setCurrentPage } = useArtist();

  return (
    <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 bg-white overflow-hidden">
      {/* Editorial background subtle grain / line structure */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Grand 3D Immersive Musical Point Cloud World */}
        <div className="mb-6">
          <MusicalPointCloudCanvas />
        </div>

        {/* Sub-header meta line */}
        <div className="flex items-center justify-between pb-6 mb-10 border-b border-neutral-200/60 text-[10px] sm:text-xs text-neutral-500 font-mono-code">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-neutral-900 font-medium">{profile.city}</span>
          </div>
        </div>

        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Presentation & Typography */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight text-neutral-950 uppercase leading-none">
                {(() => {
                  const name = profile.stageName.toUpperCase();
                  const lIndex = name.indexOf('L');
                  if (lIndex !== -1) {
                    return (
                      <>
                        {name.slice(0, lIndex)}
                        <span className="bg-neutral-700 text-white px-1 sm:px-2 py-0.5 rounded-xs mx-0.5 inline-block">
                          {name[lIndex]}
                        </span>
                        {name.slice(lIndex + 1)}
                      </>
                    );
                  }
                  return name;
                })()}
              </h1>
            </div>

            <p className="text-lg md:text-xl font-editorial italic text-neutral-700 max-w-2xl leading-relaxed">
              {profile.statement}
            </p>

            <p className="text-sm md:text-base text-neutral-600 max-w-xl leading-relaxed">
              {profile.bio}
            </p>

            {/* Quick Action Navigation to Respective Sections */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setCurrentPage('musique')}
                className="inline-flex items-center gap-2 px-5 py-3 bg-neutral-950 text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
              >
                <Disc3 className="w-3.5 h-3.5" />
                <span>Musique</span>
              </button>

              <button
                onClick={() => setCurrentPage('boutique')}
                className="inline-flex items-center gap-2 px-5 py-3 border border-neutral-950 hover:bg-neutral-100 text-neutral-950 rounded-full text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Boutique</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setCurrentPage('concerts')}
                className="inline-flex items-center gap-2 px-5 py-3 border border-neutral-950 hover:bg-neutral-100 text-neutral-950 rounded-full text-xs font-semibold transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Concerts</span>
              </button>

              <button
                onClick={() => setCurrentPage('actualites')}
                className="inline-flex items-center gap-1.5 px-4 py-3 text-xs font-medium text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
              >
                <span>Actualités</span>
              </button>

              <button
                onClick={() => setCurrentPage('le-cercle')}
                className="inline-flex items-center gap-1.5 px-4 py-3 text-xs font-medium text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
              >
                <span>Le Cercle</span>
              </button>
            </div>

            {/* Social media connections with official brand colored logos */}
            <div className="pt-6 border-t border-neutral-100 grid grid-cols-4 sm:flex sm:flex-wrap items-center gap-2 sm:gap-5 text-xs text-neutral-600">
              <a
                href={profile.socials.spotify}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col sm:flex-row items-center justify-center gap-1.5 hover:text-neutral-950 transition-colors py-1 group text-center"
              >
                <svg className="w-5 h-5 sm:w-4 sm:h-4 shrink-0 fill-[#1DB954] transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.435-5.308-1.76-8.793-.963-.335.077-.67-.133-.746-.468-.077-.334.132-.67.467-.746 3.809-.871 7.077-.497 9.722 1.113.294.18.387.563.207.857zm1.226-2.723c-.226.367-.707.483-1.074.257-2.69-1.653-6.79-2.131-9.97-1.165-.413.125-.85-.107-.975-.52-.125-.414.107-.85.52-.976 3.632-1.102 8.147-.568 11.242 1.33.367.226.483.707.257 1.074zm.105-2.835C14.692 8.95 8.085 8.73 4.708 9.756c-.495.15-1.022-.13-1.172-.625-.15-.495.13-1.022.625-1.172 3.944-1.197 11.233-.946 15.11 1.358.444.264.59.84.327 1.285-.264.444-.84.59-1.285.326z"/>
                </svg>
                <span className="text-[11px] sm:text-xs group-hover:text-neutral-950 font-medium">Spotify</span>
              </a>

              <span aria-hidden="true" className="hidden sm:inline text-neutral-300">/</span>

              <a
                href={profile.socials.appleMusic}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col sm:flex-row items-center justify-center gap-1.5 hover:text-neutral-950 transition-colors py-1 group text-center"
              >
                <svg className="w-5 h-5 sm:w-4 sm:h-4 shrink-0 fill-[#FA243C] transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.8 6.476v6.192c0 1.305-.98 2.054-2.222 2.054-1.26 0-2.18-.76-2.18-1.996 0-1.258.95-2.025 2.222-2.025.498 0 .973.125 1.332.327v-3.72l-4.137.917v4.675c0 1.305-.98 2.054-2.222 2.054-1.26 0-2.18-.76-2.18-1.996 0-1.258.95-2.025 2.222-2.025.498 0 .973.125 1.332.327v-5.617c0-.42.316-.763.73-.836l5.228-1.156c.465-.102.896.24.896.705z"/>
                </svg>
                <span className="text-[11px] sm:text-xs group-hover:text-neutral-950 font-medium">Apple Music</span>
              </a>

              <span aria-hidden="true" className="hidden sm:inline text-neutral-300">/</span>

              <a
                href={profile.socials.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col sm:flex-row items-center justify-center gap-1.5 hover:text-neutral-950 transition-colors py-1 group text-center"
              >
                <svg className="w-5 h-5 sm:w-4 sm:h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="ig-hero-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FFDC80" />
                      <stop offset="50%" stopColor="#F56040" />
                      <stop offset="70%" stopColor="#FD1D1D" />
                      <stop offset="100%" stopColor="#C13584" />
                    </linearGradient>
                  </defs>
                  <path fill="url(#ig-hero-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="text-[11px] sm:text-xs group-hover:text-neutral-950 font-medium">Instagram</span>
              </a>

              <span aria-hidden="true" className="hidden sm:inline text-neutral-300">/</span>

              <a
                href={profile.socials.youtube}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col sm:flex-row items-center justify-center gap-1.5 hover:text-neutral-950 transition-colors py-1 group text-center"
              >
                <svg className="w-5 h-5 sm:w-4 sm:h-4 shrink-0 fill-[#FF0000] transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span className="text-[11px] sm:text-xs group-hover:text-neutral-950 font-medium">YouTube</span>
              </a>
            </div>

          </div>

          {/* Right Column: Visual Portrait */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 shadow-sm">
              <img
                src={profile.heroImage}
                alt={`Portrait de l'artiste ${profile.stageName}`}
                className="w-full aspect-[4/5] object-cover filter grayscale contrast-105 hover:contrast-100 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              
              {/* Subtle architectural overlay info */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <div className="space-y-1">
                  <div className="text-xs font-mono-code tracking-widest text-neutral-300 uppercase">
                    Dernière Création
                  </div>
                  <div className="text-xl font-display font-bold">
                    {profile.latestRelease.title}
                  </div>
                  <div className="text-xs text-neutral-300 flex items-center justify-between pt-1">
                    <span>{profile.latestRelease.type}</span>
                    <span className="font-mono-code tabular-nums">{profile.latestRelease.year}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

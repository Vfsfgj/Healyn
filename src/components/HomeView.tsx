import React from 'react';
import { useArtist } from '../context/ArtistContext';
import { Hero } from './Hero';
import {
  Sparkles,
  Radio,
  Award,
  Disc3,
  ArrowRight,
  ArrowUpRight,
  Headphones,
  Sliders,
  Layers,
  Volume2
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { profile, setCurrentPage } = useArtist();

  const milestones = [
    { year: '2026', title: 'Double EP "Éphémère"', description: 'Enregistrement analogique entre Paris et les studios Kraftwerk Berlin.' },
    { year: '2025', title: 'Résidence de Recherche Sonore à Kyoto', description: 'Exploration de la réverbération acoustique dans les temples bouddhistes traditionnels.' },
    { year: '2024', title: 'Création Scénographique Quadraphonique', description: 'Conception du système immersif 360° pour les tournées en salles contemporaines.' },
    { year: '2023', title: 'Premier Album "Silences Hybrides"', description: 'Distinction audiophile internationale et tirage vinyle sold-out en 48 heures.' }
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Presentation */}
      <Hero />

      {/* Replaced Space: Section À Propos & Démarche de l'Artiste */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="border-b border-neutral-200 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono-code uppercase text-neutral-400 tracking-wider">
              Démarche &amp; Manifeste · {profile.stageName}
            </div>
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-neutral-950 uppercase tracking-tight mt-1">
              À Propos de l'Artiste
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-md font-sans">
            Une exploration sonore organique où synthétiseurs vintage, piano préparé et enregistrements sur bande magnétique s'unissent pour apaiser l'esprit.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-10 items-start">
          
          {/* Left Column: Manifeste, Bio & Studio Principles */}
          <div className="lg:col-span-7 space-y-8">
            {profile.statement && (
              <blockquote className="text-xl sm:text-2xl font-editorial italic text-neutral-900 leading-snug border-l-2 border-neutral-950 pl-5 sm:pl-6 py-1">
                « {profile.statement} »
              </blockquote>
            )}

            <div className="space-y-4 text-sm text-neutral-600 leading-relaxed font-sans">
              <p>
                {profile.bio}
              </p>
              <p>
                Refusant la surproduction et l'accumulation d'artifices numériques, {profile.stageName} compose exclusivement à partir d'instruments acoustiques feutrés, de synthétiseurs analogiques discrets (Prophet-6, Moog Minitaur, Buchla 200e) et d'échantillons de paysages sonores capturés sur bandes magnétiques.
              </p>
              <p>
                Chaque création proposée dans la boutique officielle — qu'il s'agisse d'un pressage vinyle 180 grammes marbré, d'une sérigraphie sur vélin d'Arches ou d'une pièce textile — fait l'objet d'un travail artisanal rigoureux, réalisé en séries numérotées afin de préserver l'authenticité de l'objet d'art.
              </p>
            </div>

            {/* Studio Acoustic Principles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono-code text-neutral-400 uppercase">
                  <Sliders className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Acoustique</span>
                </div>
                <div className="text-sm font-bold text-neutral-950">Analogique Pur</div>
                <div className="text-[11px] text-neutral-500 leading-normal">Bandes 2 pouces &amp; console à lampes vintage</div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono-code text-neutral-400 uppercase">
                  <Layers className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Éditions</span>
                </div>
                <div className="text-sm font-bold text-neutral-950">Séries Limitées</div>
                <div className="text-[11px] text-neutral-500 leading-normal">Tirages vinyles 180g &amp; objets numérotés</div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono-code text-neutral-400 uppercase">
                  <Volume2 className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Scène Live</span>
                </div>
                <div className="text-sm font-bold text-neutral-950">Quadraphonie 360°</div>
                <div className="text-[11px] text-neutral-500 leading-normal">Dispositif immersif en églises &amp; auditoriums</div>
              </div>
            </div>

            {/* Direct Link to Discography */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => setCurrentPage('musique')}
                className="px-6 py-3.5 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Disc3 className="w-4 h-4" />
                <span>Écouter la Discographie HD</span>
              </button>
              <button
                onClick={() => setCurrentPage('boutique')}
                className="px-5 py-3.5 rounded-full border border-neutral-950 hover:bg-neutral-100 text-neutral-950 text-xs font-semibold transition-colors cursor-pointer"
              >
                Explorer la Boutique d'Objets
              </button>
            </div>

          </div>

          {/* Right Column: Milestones & Chronology */}
          <div className="lg:col-span-5 bg-neutral-900 text-white -mx-4 sm:mx-0 px-5 sm:px-8 py-8 rounded-none border-y sm:border border-neutral-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <span className="text-xs font-mono-code uppercase tracking-wider text-white font-bold">
                Chronologie &amp; Résidences
              </span>
              <span className="text-xs font-mono-code text-neutral-400 font-bold">
                2023 — 2026
              </span>
            </div>

            <div className="space-y-6">
              {milestones.map((m, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="font-mono-code text-xs font-bold text-neutral-300 pt-0.5 shrink-0 tabular-nums">
                    {m.year}
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-white">
                      {m.title}
                    </div>
                    <div className="text-xs text-neutral-400 leading-relaxed">
                      {m.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Newsletter CTA */}
            <div className="pt-5 border-t border-neutral-800 space-y-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider font-mono-code">
                Le Cercle Privé
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Rejoignez la communauté intime pour recevoir en avant-première les extraits d'enregistrements et les accès aux tirages numérotés.
              </p>
              <button
                onClick={() => setCurrentPage('le-cercle')}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-semibold flex items-center justify-between transition-colors shadow-sm cursor-pointer mt-2"
              >
                <span>Accéder au Cercle des Passionnés</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

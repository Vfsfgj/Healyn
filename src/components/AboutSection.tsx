import React from 'react';
import { useArtist } from '../context/ArtistContext';
import { Sparkles, Radio, Award, Disc3, ArrowUpRight } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { profile, setCurrentPage } = useArtist();

  const milestones = [
    { year: '2026', title: 'Double EP "Éphémère"', description: 'Enregistrement analogique entre Paris et les studios Kraftwerk Berlin.' },
    { year: '2025', title: 'Résidence de Recherche Sonore à Kyoto', description: 'Exploration de la réverbération acoustique dans les temples bouddhistes traditionnels.' },
    { year: '2024', title: 'Création Scénographique Quadraphonique', description: 'Conception du système immersif 360° pour les tournées en salles contemporaines.' },
    { year: '2023', title: 'Premier Album "Silences Hybrides"', description: 'Distinction audiophile internationale et tirage vinyle sold-out en 48 heures.' }
  ];

  return (
    <section id="a-propos" className="py-12 sm:py-16 bg-neutral-50/50 min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs font-mono-code text-neutral-500">
          <button
            onClick={() => setCurrentPage('accueil')}
            className="hover:text-neutral-950 transition-colors cursor-pointer"
          >
            Accueil
          </button>
          <span>/</span>
          <span className="text-neutral-950 font-bold uppercase">À Propos &amp; Démarche</span>
        </div>
        
        {/* Section Header */}
        <div className="pb-8 border-b border-neutral-200">
          <div className="text-xs font-mono-code uppercase tracking-widest text-neutral-400 mb-2">
            05. Démarche &amp; Manifeste
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-neutral-950 uppercase">
            À Propos de l'Artiste
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-10 items-start">
          
          {/* Left: Manifeste & Biography */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-2xl sm:text-3xl font-editorial italic text-neutral-800 leading-snug">
              {profile.statement}
            </h3>

            <div className="space-y-4 text-sm text-neutral-600 leading-relaxed">
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

            {/* Studio Principles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-100/80 space-y-1.5">
                <div className="text-xs font-mono-code text-neutral-400 uppercase">Acoustique</div>
                <div className="text-sm font-bold text-neutral-950 mt-1">Analogique Pur</div>
                <div className="text-[11px] text-neutral-500 mt-1">Bandes 2 pouces &amp; console vintage</div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-100/80 space-y-1.5">
                <div className="text-xs font-mono-code text-neutral-400 uppercase">Éditions</div>
                <div className="text-sm font-bold text-neutral-950 mt-1">Séries Limitées</div>
                <div className="text-[11px] text-neutral-500 mt-1">Tirages artisanaux numérotés</div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-100/80 space-y-1.5">
                <div className="text-xs font-mono-code text-neutral-400 uppercase">Live</div>
                <div className="text-sm font-bold text-neutral-950 mt-1">Quadraphonie 360°</div>
                <div className="text-[11px] text-neutral-500 mt-1">Scénographie lumineuse minimale</div>
              </div>
            </div>

          </div>

          {/* Right: Milestones & Chronology */}
          <div className="lg:col-span-5 bg-neutral-900 text-white -mx-4 sm:mx-0 px-5 sm:px-8 py-8 rounded-none sm:rounded-3xl border-y sm:border border-neutral-800 shadow-xl space-y-6">
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
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

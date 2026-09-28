import React, { useState } from 'react';
import { useArtist } from '../context/ArtistContext';
import { Track, TrackStatus } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { ImmersiveTrackModal } from './ImmersiveTrackModal';
import {
  Play,
  Pause,
  Heart,
  Share2,
  Disc3,
  Sliders,
  Check,
  Headphones,
  Sparkles,
  Maximize2
} from 'lucide-react';

export const MusicSection: React.FC = () => {
  const {
    tracks,
    activeTrack,
    isPlaying,
    playTrack,
    selectTrack,
    stopAudio,
    togglePlayPause,
    toggleFavoriteTrack,
    showToast,
    setCurrentPage
  } = useArtist();

  const [filter, setFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isImmersiveModalOpen, setIsImmersiveModalOpen] = useState(false);

  const filterOptions = [
    { label: 'Tous les titres', value: 'all' },
    { label: 'Nouveaux singles', value: 'Nouveau Single' },
    { label: 'Extraits exclusifs', value: 'Extrait Exclusif' },
    { label: 'Projets à venir', value: 'Album à venir' }
  ];

  const filteredTracks = tracks.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const handleShareTrack = (track: Track) => {
    const url = `${window.location.origin}#musique-${track.id}`;
    if (navigator.share) {
      navigator.share({
        title: `${track.title} — ${track.status} par AURÈLE`,
        text: `Écoutez l'extrait haute définition de "${track.title}" (${track.bpm} BPM / ${track.key})`,
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedId(track.id);
      showToast(`Lien d'écoute de "${track.title}" copié !`);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <section id="musique" className="py-12 sm:py-16 bg-neutral-50/50 min-h-[80vh]">
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
          <span className="text-neutral-950 font-bold uppercase">Musique &amp; Discographie</span>
        </div>
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-neutral-200">
          <div>
            <div className="text-xs font-mono-code uppercase tracking-widest text-white mb-2 font-bold">
              01. Recherches Sonores &amp; Master Studio
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-neutral-950 uppercase">
              Extraits &amp; Discographie
            </h2>
          </div>

          {/* Interactive filter tabs (clean segmented controls) */}
          <div className="flex items-center gap-1 p-1 bg-neutral-200/60 rounded-xl overflow-x-auto">
            {filterOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  filter === opt.value
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Quality Notice */}
        <div className="my-6 py-2 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 text-neutral-600">
            <Headphones className="w-4 h-4 text-neutral-950 shrink-0" />
            <span>
              Diffusion Web Audio Engine en <strong>Stéréo 24-bit non compressée</strong>. Casque ou moniteurs studio recommandés.
            </span>
          </div>
          <div className="flex items-center gap-4 text-neutral-500 font-mono-code">
            <span>Latence ultra-faible</span>
            <span aria-hidden="true">·</span>
            <span>Égalisation analogique</span>
          </div>
        </div>

        {/* Master Studio Audio Player Component */}
        <AudioPlayer />

        {/* Tracklist Table / Cards (Spotify-inspired Layout) */}
        <div className="space-y-3">
          {filteredTracks.length > 0 ? (
            filteredTracks.map((track, index) => {
            const isCurrentTrack = activeTrack?.id === track.id;
            const isTrackPlaying = isCurrentTrack && isPlaying;

            return (
              <div
                key={track.id}
                onClick={() => {
                  if (isCurrentTrack) {
                    // Already current track: keep state
                  } else {
                    if (isPlaying) {
                      stopAudio();
                    }
                    selectTrack(track);
                  }
                  setIsImmersiveModalOpen(true);
                }}
                className={`group relative p-2.5 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-200 cursor-pointer ${
                  isTrackPlaying
                    ? 'bg-white shadow-md'
                    : 'bg-white hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                  
                  {/* Left Section: Cover Image, Play Trigger & Track Info */}
                  <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
                    
                    {/* Spotify-style Square Cover Image with Hover Play Overlay */}
                    <div className="relative group/cover w-10 h-10 sm:w-16 sm:h-16 shrink-0 rounded-lg sm:rounded-xl overflow-hidden bg-neutral-900 shadow-xs">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/cover:scale-105"
                      />

                      {/* Play/Pause Overlay Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isCurrentTrack) {
                            togglePlayPause();
                          } else {
                            playTrack(track);
                          }
                          setIsImmersiveModalOpen(true);
                        }}
                        aria-label={`Écouter ${track.title}`}
                        className={`absolute inset-0 flex items-center justify-center transition-all cursor-pointer ${
                          isTrackPlaying
                            ? 'bg-neutral-950/70 text-white opacity-100'
                            : 'bg-neutral-950/40 text-white opacity-0 group-hover/cover:opacity-100'
                        }`}
                      >
                        {isTrackPlaying ? (
                          <Pause className="w-4 h-4 sm:w-6 sm:h-6 fill-white" />
                        ) : (
                          <Play className="w-4 h-4 sm:w-6 sm:h-6 fill-white ml-0.5" />
                        )}
                      </button>
                    </div>

                    {/* Track Title & Description */}
                    <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isCurrentTrack) {
                            // Already current track: keep state
                          } else {
                            if (isPlaying) {
                              stopAudio();
                            }
                            selectTrack(track);
                          }
                          setIsImmersiveModalOpen(true);
                        }}
                        className="text-xs sm:text-lg font-bold text-neutral-950 hover:text-neutral-700 transition-colors truncate text-left cursor-pointer block leading-tight"
                      >
                        {track.title}
                      </button>

                      <p className="text-[10px] sm:text-sm text-neutral-500 line-clamp-1 leading-tight">
                        {track.description}
                      </p>
                    </div>

                  </div>

                  {/* Right Section: Technical Specs & Quick Actions */}
                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    
                    {/* Audio Technical Specs Line (BPM / Key / Duration) */}
                    <div className="flex items-center gap-1 sm:gap-2.5 text-[10px] sm:text-xs font-mono-code text-neutral-500 tabular-nums">
                      <span className="hidden sm:inline">{track.bpm} BPM</span>
                      <span aria-hidden="true" className="text-neutral-300 hidden sm:inline">/</span>
                      <span className="hidden sm:inline">{track.key}</span>
                      <span aria-hidden="true" className="text-neutral-300 hidden sm:inline">/</span>
                      <span className="font-bold text-neutral-900">{track.duration}</span>
                    </div>

                    {/* Action Buttons: Favorite & Share */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavoriteTrack(track.id);
                        }}
                        title={track.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                        className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors cursor-pointer ${
                          track.isFavorite
                            ? 'text-[#800020] bg-[#800020]/10'
                            : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${track.isFavorite ? 'fill-[#800020] stroke-none' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareTrack(track);
                        }}
                        title="Partager cet extrait"
                        className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                      >
                        {copiedId === track.id ? (
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-900" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                      </button>
                    </div>

                  </div>

                </div>

                {/* Animated waveform row when playing */}
                {isTrackPlaying && (
                  <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-end text-xs text-neutral-500 font-mono-code">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1 h-3">
                        <span className="w-0.5 h-full bg-neutral-950 animate-soundwave-1" />
                        <span className="w-0.5 h-full bg-neutral-950 animate-soundwave-2" />
                        <span className="w-0.5 h-full bg-neutral-950 animate-soundwave-3" />
                        <span className="w-0.5 h-full bg-neutral-950 animate-soundwave-4" />
                        <span className="w-0.5 h-full bg-neutral-950 animate-soundwave-5" />
                      </div>
                      <Maximize2 className="w-3.5 h-3.5 text-neutral-700 ml-2" />
                    </div>
                  </div>
                )}
              </div>
            );
          })
          ) : (
            <div className="py-12 px-6 bg-white rounded-2xl text-center space-y-2 border border-neutral-100">
              <Disc3 className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-sm font-semibold text-neutral-800">Aucun morceau disponible pour le moment</p>
              <p className="text-xs text-neutral-500 font-mono-code">Ajoutez vos propres créations audio depuis votre Espace Admin.</p>
            </div>
          )}
        </div>

        {/* Full-Screen Immersive Track View Modal */}
        <ImmersiveTrackModal
          isOpen={isImmersiveModalOpen}
          onClose={() => setIsImmersiveModalOpen(false)}
        />

      </div>
    </section>
  );
};

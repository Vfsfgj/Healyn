import React from 'react';
import { useArtist } from '../context/ArtistContext';
import { Announcement } from '../types';
import {
  Heart,
  Share2,
  Calendar,
  Clock,
  Pin,
  X,
  ExternalLink,
  Check,
  ArrowLeft,
  Search
} from 'lucide-react';

export const NewsSection: React.FC = () => {
  const {
    profile,
    announcements,
    toggleLikeAnnouncement,
    selectedAnnouncementForModal,
    setSelectedAnnouncementForModal,
    showToast,
    setCurrentPage,
    searchQuery,
    setSearchQuery
  } = useArtist();

  const filteredAnnouncements = announcements.filter(a => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      a.title.toLowerCase().includes(q) ||
      (a.summary && a.summary.toLowerCase().includes(q)) ||
      (a.content && a.content.toLowerCase().includes(q)) ||
      (a.category && a.category.toLowerCase().includes(q)) ||
      (a.date && a.date.toLowerCase().includes(q))
    );
  });

  const handleShareNews = (news: Announcement, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}#actualites-${news.id}`;
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: news.summary,
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      showToast("Lien de l'annonce copié dans le presse-papier !");
    }
  };

  const handleShareToTwitter = (news: Announcement) => {
    const text = encodeURIComponent(`Actualité ${profile.stageName} : ${news.title}\n`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="actualites" className="py-12 sm:py-16 bg-white min-h-[80vh]">
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
            <span className="text-neutral-950 font-bold uppercase">Actualités &amp; Journal</span>
          </div>

          {/* Desktop Search Bar (alignée avec le fil d'Ariane) */}
          <div className="hidden md:flex items-center relative w-72 lg:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un article, annonce..."
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
              04. Journal &amp; Notes d'Atelier
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-neutral-950 uppercase">
              Actualités &amp; Annonces
            </h2>
          </div>

          <div className="text-xs font-mono-code text-neutral-500">
            Dernières publications de l'artiste
          </div>
        </div>

        {/* Announcements Grid - Full width edge-to-edge on mobile */}
        <div className="-mx-4 sm:mx-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-8 sm:pt-10">
          {filteredAnnouncements.map(item => (
            <article
              key={item.id}
              onClick={() => setSelectedAnnouncementForModal(item)}
              className="group flex flex-col justify-between bg-white border-0 rounded-none overflow-hidden transition-all duration-300 cursor-pointer w-full"
            >
              {item.imageUrl && (
                <div className="aspect-[16/9] w-full bg-neutral-100 overflow-hidden relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {item.pinned && (
                    <div className="absolute top-3 left-3 bg-neutral-950 text-white text-[10px] font-mono-code px-2.5 py-1 rounded-none flex items-center gap-1 shadow-sm">
                      <Pin className="w-3 h-3 fill-white" />
                      <span>Épinglé</span>
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 sm:p-6 flex flex-col flex-1 justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono-code text-neutral-400">
                    <span className="text-neutral-900 font-semibold">{item.category}</span>
                    <div className="flex items-center gap-2">
                      <span>{item.date}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.readTime}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-neutral-950 group-hover:text-neutral-700 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-neutral-500 line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                {/* Footer of card */}
                <div className="pt-3 mt-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-900 group-hover:underline">
                    Lire la suite →
                  </span>

                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => toggleLikeAnnouncement(item.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-none text-xs font-mono-code transition-colors cursor-pointer ${
                        item.isLiked
                          ? 'bg-rose-50 text-rose-600'
                          : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${item.isLiked ? 'fill-rose-600' : ''}`} />
                      <span className="tabular-nums">{item.likes}</span>
                    </button>

                    <button
                      onClick={e => handleShareNews(item, e)}
                      title="Partager"
                      className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-none hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty Search Result State */}
        {filteredAnnouncements.length === 0 && (
          <div className="py-16 text-center space-y-3">
            <p className="text-sm font-semibold text-neutral-800">
              {searchQuery ? `Aucune actualité trouvée pour "${searchQuery}"` : "Aucune actualité publiée pour le moment"}
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

        {/* Reading Article Full Screen Page */}
        {selectedAnnouncementForModal && (
          <div
            className="fixed inset-0 z-50 bg-white w-full h-full min-h-screen overflow-y-auto flex flex-col"
          >
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 sm:px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedAnnouncementForModal(null)}
                  className="px-2.5 py-1 sm:px-4 sm:py-2 rounded-full border border-neutral-950 hover:bg-neutral-950 hover:text-white text-neutral-950 text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Retour aux actualités</span>
                </button>
                <span className="hidden sm:inline text-neutral-300">|</span>
                <span className="hidden sm:inline text-xs font-mono-code uppercase text-neutral-500">
                  {selectedAnnouncementForModal.category}
                </span>
              </div>
            </div>

            {/* Main Full Screen Article View */}
            <article className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-10 sm:py-16 space-y-8">
              {/* Meta */}
              <div className="flex items-center gap-2 text-xs font-mono-code text-neutral-500">
                <span className="font-semibold text-neutral-950 px-2.5 py-1 bg-neutral-100 rounded-md">
                  {selectedAnnouncementForModal.category}
                </span>
                <span>{selectedAnnouncementForModal.date}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedAnnouncementForModal.readTime}</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-neutral-950 leading-tight">
                {selectedAnnouncementForModal.title}
              </h1>

              {/* Hero Image */}
              {selectedAnnouncementForModal.imageUrl && (
                <div className="aspect-[16/9] w-full rounded-3xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-sm">
                  <img
                    src={selectedAnnouncementForModal.imageUrl}
                    alt={selectedAnnouncementForModal.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Chapeau / Lead Summary */}
              <div className="p-6 rounded-2xl bg-neutral-50 text-neutral-800 text-base sm:text-lg font-editorial italic leading-relaxed">
                {selectedAnnouncementForModal.summary}
              </div>

              {/* Full Content Prose */}
              <div className="text-base sm:text-lg text-neutral-700 leading-relaxed space-y-6 pt-2">
                <p>{selectedAnnouncementForModal.content}</p>
                <p className="text-sm text-neutral-500 italic">
                  Pour ne manquer aucune annonce ou sortie exclusive en avant-première, rejoignez Le Cercle {profile.stageName} via le formulaire en bas de page.
                </p>
              </div>

              {/* Social Share & Interactions Bar */}
              <div className="pt-8 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-4">
                <button
                  onClick={() => toggleLikeAnnouncement(selectedAnnouncementForModal.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                    selectedAnnouncementForModal.isLiked
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${selectedAnnouncementForModal.isLiked ? 'fill-rose-600' : ''}`} />
                  <span>{selectedAnnouncementForModal.likes} mentions "J'aime"</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleShareToTwitter(selectedAnnouncementForModal)}
                    className="px-4 py-2.5 rounded-full border border-neutral-950 hover:bg-neutral-100 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors text-neutral-950"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Partager sur X</span>
                  </button>
                  <button
                    onClick={e => handleShareNews(selectedAnnouncementForModal, e)}
                    className="px-5 py-2.5 bg-neutral-950 text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Copier le lien</span>
                  </button>
                </div>
              </div>

              {/* Bottom Back Button */}
              <div className="pt-8 text-center">
                <button
                  onClick={() => setSelectedAnnouncementForModal(null)}
                  className="px-6 py-3 rounded-full border border-neutral-950 text-neutral-950 text-xs font-semibold hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Retourner au journal
                </button>
              </div>
            </article>
          </div>
        )}

      </div>
    </section>
  );
};

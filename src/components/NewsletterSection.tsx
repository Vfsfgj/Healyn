import React, { useState } from 'react';
import { useArtist } from '../context/ArtistContext';
import {
  Mail,
  CheckCircle,
  Eye,
  Sparkles,
  Lock,
  ArrowRight,
  X,
  ArrowLeft
} from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  const { subscribeNewsletter, profile, setCurrentPage } = useArtist();

  const [email, setEmail] = useState('');
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([
    'Préventes Concerts',
    'Sorties Vinyles & Merch',
    'Extraits Exclusifs'
  ]);
  const [statusMessage, setStatusMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const availablePrefs = [
    'Préventes Concerts',
    'Sorties Vinyles & Merch',
    'Extraits Exclusifs',
    'Notes de Studio & Carnet'
  ];

  const togglePref = (pref: string) => {
    setSelectedPrefs(prev =>
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const res = subscribeNewsletter(email, selectedPrefs);
    setStatusMessage({ success: res.success, text: res.message });
    if (res.success) {
      setEmail('');
    }
  };

  return (
    <section id="le-cercle" className="py-6 sm:py-16 bg-white scroll-mt-12 min-h-[80vh]">
      <a id="newsletter" className="sr-only" aria-hidden="true" />
      
      {/* Breadcrumb Navigation - with standard mobile padding */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 text-xs font-mono-code text-neutral-500">
          <button
            onClick={() => setCurrentPage('accueil')}
            className="hover:text-neutral-950 transition-colors cursor-pointer"
          >
            Accueil
          </button>
          <span>/</span>
          <span className="text-neutral-950 font-bold uppercase">Le Cercle (Espace VIP)</span>
        </div>
      </div>

      {/* Main Full-Width on Mobile / Centered Card on Desktop */}
      <div className="max-w-4xl mx-auto px-0 sm:px-6 lg:px-8 w-full">
        <div className="px-5 py-8 sm:p-12 rounded-none sm:rounded-3xl bg-neutral-950 text-white relative overflow-hidden shadow-xl sm:border border-neutral-800 border-y sm:border-y border-x-0 sm:border-x w-full">
          
          {/* Subtle architectural background texture */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-neutral-800/40 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-8 sm:space-y-8">
            
            <div className="space-y-3 pb-2 sm:pb-0">
              <div className="text-xs font-mono-code text-neutral-400 uppercase tracking-widest">
                <span>Espace Privé des Passionnés</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-display font-extrabold uppercase tracking-tight">
                Le Cercle {profile.stageName}
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Preferences Checklist */}
              <div className="space-y-2.5">
                <div className="text-xs font-medium text-neutral-400">
                  Choisissez les notifications qui vous intéressent :
                </div>
                <div className="flex flex-wrap gap-2">
                  {availablePrefs.map(pref => {
                    const isChecked = selectedPrefs.includes(pref);
                    return (
                      <button
                        type="button"
                        key={pref}
                        onClick={() => togglePref(pref)}
                        className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                          isChecked
                            ? 'bg-white text-neutral-950 border-white font-semibold'
                            : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        {pref}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input & Button row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      if (statusMessage) setStatusMessage(null);
                    }}
                    placeholder="Votre adresse e-mail personnelle..."
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-white text-neutral-950 text-xs sm:text-sm font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm active:scale-98"
                >
                  <span>Rejoindre le Cercle</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Status Message */}
              {statusMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    statusMessage.success
                      ? 'bg-neutral-900 text-white border border-neutral-700'
                      : 'bg-neutral-900 text-neutral-300 border border-neutral-700'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 shrink-0 text-white" />
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Footer Guarantee & Preview trigger */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>Aucun spam. Désinscription immédiate en un clic.</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="flex items-center gap-1.5 text-neutral-300 hover:text-white transition-colors cursor-pointer text-left py-1"
                >
                  <Eye className="w-3.5 h-3.5 shrink-0" />
                  <span>Aperçu de la lettre de bienvenue</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      </div>

      {/* Welcome Email Preview Full Screen Modal */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 z-50 bg-white w-full h-full min-h-screen overflow-y-auto flex flex-col text-neutral-950"
        >
          {/* Top Full Screen Navigation Bar */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 sm:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-2.5 py-1 sm:px-4 sm:py-2 rounded-full border border-neutral-950 hover:bg-neutral-950 hover:text-white text-neutral-950 text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Retour au Cercle</span>
              </button>
              <span className="hidden sm:inline text-neutral-300">|</span>
              <span className="hidden sm:inline text-xs font-mono-code uppercase text-neutral-500">
                Aperçu de la lettre de bienvenue
              </span>
            </div>
          </div>

          {/* Main Full-Screen Content */}
          <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 flex flex-col justify-between">
            <div className="space-y-6">
              
              <div className="border-b border-neutral-200 pb-4">
                <div className="text-xs font-mono-code text-neutral-400 uppercase tracking-widest">
                  Aperçu du Courriel Envoyé aux Nouveaux Membres
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-neutral-950 uppercase tracking-tight mt-1">
                  Bienvenue dans Le Cercle {profile.stageName}
                </h3>
              </div>

              {/* Email Meta Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-100 space-y-1.5 text-xs font-mono-code">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <span className="text-neutral-500 w-16">De :</span>
                  <span className="text-neutral-950 font-medium">
                    {profile.stageName} Studio &lt;cercle@healing-music.com&gt;
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <span className="text-neutral-500 w-16">Objet :</span>
                  <span className="text-neutral-950 font-bold">
                    Bienvenue dans Le Cercle — Votre code d'accès prévente officiel
                  </span>
                </div>
              </div>

              {/* Letter Body */}
              <div className="space-y-4 text-sm sm:text-base text-neutral-800 leading-relaxed font-serif-editorial bg-neutral-50/50 p-6 sm:p-8 rounded-3xl">
                <p className="font-semibold text-neutral-950">Cher passionné,</p>
                <p>
                  Merci pour votre confiance. En rejoignant ce cercle, vous avez désormais accès aux coulisses de notre travail en studio et bénéficierez d'un créneau prioritaire pour toutes les prochaines ouvertures de billetterie.
                </p>

                {/* VIP Pass Coupon Card */}
                <div className="my-6 p-5 bg-neutral-950 text-white rounded-2xl shadow-md space-y-2 font-mono-code">
                  <div className="text-[10px] uppercase text-neutral-400 tracking-wider">
                    Votre Code Coupe-File Membre :
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold tracking-widest text-white">
                    HEALING-FAN-CLUB
                  </div>
                  <div className="text-xs text-neutral-400 pt-1 border-t border-neutral-800">
                    -10% sur votre première commande boutique &amp; priorité billetterie
                  </div>
                </div>

                <p>
                  À très bientôt sur scène ou au détour d'une nouvelle vibration.
                </p>
                <div className="pt-4">
                  <p className="font-display font-extrabold text-lg text-neutral-950 uppercase">
                    — {profile.stageName}
                  </p>
                  <p className="text-xs font-mono-code text-neutral-500">
                    Studio &amp; Production Indépendante
                  </p>
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-8 border-t border-neutral-200 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-mono-code text-neutral-400">
                Transmission instantanée et automatisée lors de votre inscription
              </span>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="w-full sm:w-auto px-6 py-3.5 bg-neutral-950 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Fermer l'aperçu
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { useArtist, parseDurationToSec } from '../context/ArtistContext';
import {
  X,
  FileText,
  Music,
  ShoppingBag,
  Calendar,
  Ticket,
  Users,
  User,
  Plus,
  Trash2,
  Edit2,
  Pin,
  Download,
  Send,
  RotateCcw,
  Check,
  CheckCircle2,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Camera,
  RefreshCw,
  Eye,
  Sliders,
  Lock,
  KeyRound,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Mic,
  Save,
  Play,
  Pause,
  VolumeX,
  Volume2
} from 'lucide-react';
import { AudioPreset, TrackStatus } from '../types';
import { compressImageFile } from '../utils/imageCompressor';
import { compressAudioFile } from '../utils/audioCompressor';
import { LyricsTranscriberModal } from './LyricsTranscriberModal';
import { StudioSelect } from './StudioSelect';

export const AdminDashboard: React.FC = () => {
  const {
    isAdminOpen,
    setIsAdminOpen,
    profile,
    setProfile,
    announcements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    tracks,
    addTrack,
    updateTrack,
    deleteTrack,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    concerts,
    addConcert,
    updateConcert,
    deleteConcert,
    addTicketsToConcert,
    setConcertTicketsRemaining,
    subscribers,
    shopOrders,
    ticketOrders,
    currentUser,
    isSuperAdmin,
    loginWithGoogle,
    logoutSuperAdmin,
    uploadTrackAudio,
    resetToDefaultData,
    showToast
  } = useArtist();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('artist_studio_authenticated') === 'true';
  });
  const [accessCode, setAccessCode] = useState('');
  const [authError, setAuthError] = useState(false);
  const [audioUploadProgress, setAudioUploadProgress] = useState<number>(0);

  // Global secret shortcut (Ctrl/Cmd + Shift + A) to toggle Dashboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsAdminOpen(!isAdminOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminOpen, setIsAdminOpen]);

  const [activeTab, setActiveTab] = useState<'news' | 'music' | 'shop' | 'tour' | 'fans' | 'profile'>('news');

  // Announcement Form State
  const [newNewsTitle, setNewNewsTitle] = useState('');
  const [newNewsCategory, setNewNewsCategory] = useState<'Sortie Musique' | 'Tournée' | 'Studio' | 'Boutique'>('Sortie Musique');
  const [newNewsSummary, setNewNewsSummary] = useState('');
  const [newNewsContent, setNewNewsContent] = useState('');
  const [newNewsImage, setNewNewsImage] = useState('/src/assets/images/album_vinyl_artwork_1790345759457.jpg');
  const [newNewsPinned, setNewNewsPinned] = useState(false);

  // Track Form State
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackDuration, setNewTrackDuration] = useState('02:30');
  const [newTrackDurationSec, setNewTrackDurationSec] = useState<number>(150);
  const [newTrackBpm, setNewTrackBpm] = useState(120);
  const [newTrackKey, setNewTrackKey] = useState('C Min');
  const [newTrackStatus, setNewTrackStatus] = useState<TrackStatus>('Extrait Exclusif');
  const [newTrackGenre, setNewTrackGenre] = useState('Minimal Ambient');
  const [newTrackPreset, setNewTrackPreset] = useState<AudioPreset>('ambient');
  const [newTrackDesc, setNewTrackDesc] = useState('');
  const [newTrackCover, setNewTrackCover] = useState('/src/assets/images/album_vinyl_artwork_1790345759457.jpg');
  const [isTrackCoverImported, setIsTrackCoverImported] = useState<boolean>(false);
  const isCoverImported = isTrackCoverImported || newTrackCover.startsWith('data:');
  const [newTrackAudioUrl, setNewTrackAudioUrl] = useState<string>('');
  const [newTrackAudioName, setNewTrackAudioName] = useState<string>('');
  const [isCompressingAudio, setIsCompressingAudio] = useState<boolean>(false);
  const [audioOrigSize, setAudioOrigSize] = useState<string>('');
  const [audioCompSize, setAudioCompSize] = useState<string>('');
  const [lyricsEditingTrack, setLyricsEditingTrack] = useState<any | null>(null);

  // Product Form State & Sub-tabs
  const [shopSubTab, setShopSubTab] = useState<'add' | 'catalog' | 'orders'>('add');
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<'Vinyles & Disques' | 'Textiles & Merch' | 'Art & Sérigraphie' | 'Édition Collector'>('Vinyles & Disques');
  const [newProdPrice, setNewProdPrice] = useState(39);
  const [newProdStock, setNewProdStock] = useState(50);
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('/src/assets/images/album_vinyl_artwork_1790345759457.jpg');

  // Concert Form State & Sub-tabs
  const [tourSubTab, setTourSubTab] = useState<'add' | 'dates' | 'bookings'>('add');
  const [newConcertCity, setNewConcertCity] = useState('');
  const [newConcertVenue, setNewConcertVenue] = useState('');
  const [newConcertCountry, setNewConcertCountry] = useState('France');
  const [newConcertDate, setNewConcertDate] = useState('2027-03-20');
  const [newConcertPrice, setNewConcertPrice] = useState(38);
  const [newConcertTickets, setNewConcertTickets] = useState(100);

  // Ticket stock increase confirmation modal for already published dates
  const [ticketConfirmModal, setTicketConfirmModal] = useState<{
    concertId: string;
    city: string;
    venue: string;
    currentRemaining: number;
    amountToAdd: number;
  } | null>(null);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({ ...profile });
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const productFileInputRef = useRef<HTMLInputElement>(null);
  const newsFileInputRef = useRef<HTMLInputElement>(null);
  const trackCoverFileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 60 * 1024 * 1024) {
        showToast("Le fichier audio est trop volumineux (maximum 60 Mo).");
        return;
      }
      setIsCompressingAudio(true);
      setAudioUploadProgress(5);
      showToast("Publication sur Firebase Cloud Storage en cours...");
      
      try {
        // Calculate audio duration
        const objectUrl = URL.createObjectURL(file);
        const tempAudio = new Audio(objectUrl);
        tempAudio.onloadedmetadata = () => {
          if (tempAudio.duration && !isNaN(tempAudio.duration)) {
            const totalSecs = Math.round(tempAudio.duration);
            const mins = Math.floor(totalSecs / 60);
            const secs = totalSecs % 60;
            const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            setNewTrackDuration(formatted);
            setNewTrackDurationSec(totalSecs);
          }
        };

        // Upload to Firebase Storage
        const uploadRes = await uploadTrackAudio(file, `track-${Date.now()}`, (pct) => {
          setAudioUploadProgress(pct);
        });

        setNewTrackAudioName(uploadRes.fileName);
        setNewTrackAudioUrl(uploadRes.downloadUrl);
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        setAudioOrigSize(sizeMb);
        setAudioCompSize(sizeMb);
        showToast("Fichier audio publié sur Firebase Storage ! Accessible instantanément à tous les visiteurs.");
      } catch (err) {
        console.warn("Upload Storage error, falling back to local audio compression:", err);
        showToast("Téléversement cloud indisponible, utilisation du compresseur local.");
        
        try {
          const res = await compressAudioFile(file);
          setNewTrackAudioName(file.name);
          setNewTrackAudioUrl(res.audioUrl);
          setNewTrackDuration(res.duration);
          setNewTrackDurationSec(res.durationSec || parseDurationToSec(res.duration));
          setAudioOrigSize(res.originalSizeMb);
          setAudioCompSize(res.compressedSizeMb);
        } catch {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              setNewTrackAudioName(file.name);
              setNewTrackAudioUrl(reader.result);
            }
          };
          reader.readAsDataURL(file);
        }
      } finally {
        setIsCompressingAudio(false);
      }
    }
  };

  const handleTrackCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        showToast("L'image est trop volumineuse (maximum 15 Mo).");
        return;
      }
      try {
        const compressed = await compressImageFile(file, 900, 0.82);
        setNewTrackCover(compressed);
        setIsTrackCoverImported(true);
        showToast("Pochette / Cover de l'extrait audio importée avec succès !");
      } catch {
        showToast("Erreur lors de la lecture du fichier image.");
      }
    }
  };

  const handleNewsImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        showToast("L'image est trop volumineuse (maximum 15 Mo).");
        return;
      }
      try {
        const compressed = await compressImageFile(file, 900, 0.82);
        setNewNewsImage(compressed);
        showToast("Illustration de l'annonce chargée !");
      } catch {
        showToast("Erreur lors de la lecture du fichier image.");
      }
    }
  };

  const handleProductImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        showToast("L'image est trop volumineuse (maximum 15 Mo).");
        return;
      }
      try {
        const compressed = await compressImageFile(file, 900, 0.82);
        setNewProdImage(compressed);
        showToast("Image du produit importée avec succès !");
      } catch {
        showToast("Erreur lors de la lecture du fichier image.");
      }
    }
  };

  // Sync profileForm when profile changes
  useEffect(() => {
    setProfileForm({ ...profile });
  }, [profile]);

  const HERO_IMAGE_PRESETS = [
    {
      id: 'album-vinyl',
      label: 'Vinyle Restoration (Artwork)',
      tag: 'Pochette Album',
      url: '/src/assets/images/album_vinyl_artwork_1790345759457.jpg'
    },
    {
      id: 'artist-portrait',
      label: 'Portrait Studio healing',
      tag: 'Portrait Artiste',
      url: '/src/assets/images/hero_artist_portrait_1790345746015.jpg'
    },
    {
      id: 'concert-stage',
      label: 'Atmosphère Concert Live 360°',
      tag: 'Scénographie',
      url: '/src/assets/images/concert_stage_atmosphere_1790345781544.jpg'
    },
    {
      id: 'merch-hoodie',
      label: 'Pièce Textile & Studio Merch',
      tag: 'Boutique',
      url: '/src/assets/images/product_merch_hoodie_1790345771258.jpg'
    },
    {
      id: 'modular-synth',
      label: 'Synthétiseur Analogique Vintage',
      tag: 'Studio Sonore',
      url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'audiophile-vinyl',
      label: 'Platine Audiophile & Sillon',
      tag: 'Haute Fidélité',
      url: 'https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  const handleHeroImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        showToast("L'image est trop volumineuse (maximum 15 Mo).");
        return;
      }
      try {
        const compressedUrl = await compressImageFile(file, 1200, 0.82);
        setProfileForm(prev => ({
          ...prev,
          heroImage: compressedUrl,
          latestRelease: {
            ...prev.latestRelease,
            coverImage: compressedUrl
          }
        }));
        showToast("Nouvelle photo chargée ! Cliquez sur 'Enregistrer' pour appliquer.");
      } catch {
        showToast("Erreur lors de la lecture du fichier image.");
      }
    }
  };

  const handleSelectPresetHeroImage = (imageUrl: string) => {
    setProfileForm(prev => ({
      ...prev,
      heroImage: imageUrl,
      latestRelease: {
        ...prev.latestRelease,
        coverImage: imageUrl
      }
    }));
    showToast("Photo sélectionnée ! Pensez à enregistrer.");
  };

  if (!isAdminOpen) return null;

  const handlePostNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNewsTitle.trim() || !newNewsContent.trim()) return;

    addAnnouncement({
      title: newNewsTitle.trim(),
      category: newNewsCategory,
      summary: newNewsSummary.trim() || newNewsTitle.trim(),
      content: newNewsContent.trim(),
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      readTime: '2 min de lecture',
      imageUrl: newNewsImage,
      pinned: newNewsPinned
    });

    setNewNewsTitle('');
    setNewNewsSummary('');
    setNewNewsContent('');
  };

  const handleAddTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackTitle.trim()) return;

    const finalDurationSec = newTrackDurationSec || parseDurationToSec(newTrackDuration) || 90;

    addTrack({
      title: newTrackTitle.trim(),
      duration: newTrackDuration,
      durationSec: finalDurationSec,
      bpm: Number(newTrackBpm),
      key: newTrackKey,
      releaseDate: 'Actuel',
      status: newTrackStatus,
      genre: newTrackGenre,
      description: newTrackDesc.trim() || "Extrait inédit composé en studio.",
      preset: newTrackPreset,
      coverUrl: newTrackCover,
      audioUrl: newTrackAudioUrl || undefined,
      audioFileName: newTrackAudioName || undefined
    });

    setNewTrackTitle('');
    setNewTrackDesc('');
    setNewTrackAudioUrl('');
    setNewTrackAudioName('');
    setIsTrackCoverImported(false);
    setNewTrackCover('/src/assets/images/album_vinyl_artwork_1790345759457.jpg');
    setNewTrackDuration('02:30');
    setNewTrackDurationSec(150);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdTitle.trim()) return;

    addProduct({
      title: newProdTitle.trim(),
      category: newProdCategory,
      price: Number(newProdPrice),
      stock: Number(newProdStock),
      maxStock: Number(newProdStock),
      isLimitedEdition: true,
      description: newProdDesc.trim() || "Création originale signée en série limitée.",
      details: ["Édition numérotée", "Conception artisanale", "Livraison internationale"],
      imageUrl: newProdImage
    });

    setNewProdTitle('');
    setNewProdDesc('');
    showToast("Produit ajouté avec succès à la boutique !");
    setShopSubTab('catalog');
  };

  const handleAddConcert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConcertCity.trim() || !newConcertVenue.trim()) return;

    const parts = newConcertDate.split('-');
    const formatted = `${parts[2]} / ${parts[1]} / ${parts[0]}`;
    const initialTickets = Math.max(0, Number(newConcertTickets) || 100);
    const computedStatus = initialTickets === 0 ? 'Complet' : initialTickets <= 25 ? 'Dernières Places' : 'Disponible';

    addConcert({
      date: newConcertDate,
      formattedDate: formatted,
      city: newConcertCity.trim(),
      venue: newConcertVenue.trim(),
      country: newConcertCountry.trim(),
      status: computedStatus,
      doorsOpen: '19h30',
      totalCapacity: initialTickets,
      ticketTiers: [
        {
          id: `tier-${Date.now()}-1`,
          name: 'Entrée Standard',
          price: Number(newConcertPrice),
          remaining: initialTickets,
          total: initialTickets,
          description: 'Accès général au concert et spectacle lumineux 360°.'
        }
      ]
    });

    setNewConcertCity('');
    setNewConcertVenue('');
    setNewConcertTickets(100);
    showToast(`Date ajoutée avec succès (${initialTickets} billets · ${computedStatus}) !`);
    setTourSubTab('dates');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(profileForm);
  };

  const exportSubscribersCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["ID,Email,Date,Preferences"].concat(
        subscribers.map(s => `"${s.id}","${s.email}","${s.subscribedAt}","${s.preferences.join(';')}"`)
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `healing_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Fichier CSV des abonnés exporté avec succès");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = accessCode.trim();
    // Default passcodes: 2026, admin, or healing
    if (cleanCode === '2026' || cleanCode.toLowerCase() === 'admin' || cleanCode.toLowerCase() === 'healing') {
      setIsAuthenticated(true);
      sessionStorage.setItem('artist_studio_authenticated', 'true');
      setAuthError(false);
      setAccessCode('');
      showToast("Session Studio Artiste déverrouillée");
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('artist_studio_authenticated');
    await logoutSuperAdmin();
    setIsAdminOpen(false);
  };

  if (!isAdminOpen) return null;

  const isUnlocked = isAuthenticated || isSuperAdmin;

  // Security Gate Screen if not logged in
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4 admin-dashboard-root">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-neutral-200 text-neutral-900 space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-neutral-950 text-white flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono-code text-neutral-950">
                  Espace Super Admin
                </h3>
                <p className="text-[11px] text-neutral-500 font-mono-code">
                  Firebase Cloud Database &amp; Storage
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsAdminOpen(false);
                setAuthError(false);
                setAccessCode('');
              }}
              className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-neutral-600 leading-relaxed">
              Connectez-vous pour publier de la musique en direct sur Firebase Storage et synchroniser la boutique, les concerts et les actualités.
            </p>
          </div>

          {/* Primary Google Auth Button for Super Admin */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={async () => {
                const ok = await loginWithGoogle();
                if (ok) {
                  setIsAuthenticated(true);
                }
              }}
              className="w-full py-3.5 px-4 bg-neutral-950 text-white rounded-2xl text-xs font-semibold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2.5 shadow-md cursor-pointer group"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Connexion avec Google (Super Admin)</span>
            </button>
            <div className="text-[10px] text-neutral-400 text-center font-mono-code">
              Super Admin autorisé : businessplussmile0@gmail.com
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px bg-neutral-200 flex-1" />
            <span className="text-[10px] uppercase font-mono-code text-neutral-400">ou code studio</span>
            <div className="h-px bg-neutral-200 flex-1" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="password"
                  value={accessCode}
                  onChange={e => {
                    setAccessCode(e.target.value);
                    if (authError) setAuthError(false);
                  }}
                  placeholder="Code studio secret..."
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-0 text-sm font-mono-code bg-neutral-100 focus:bg-neutral-200/80 focus:outline-none focus:ring-0 transition-all ${
                    authError
                      ? 'ring-2 ring-red-500'
                      : ''
                  }`}
                />
              </div>
              {authError && (
                <div className="flex items-center gap-1.5 text-red-600 text-xs mt-1.5 font-mono-code">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Code d'accès incorrect.</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAdminOpen(false);
                  setAuthError(false);
                  setAccessCode('');
                }}
                className="flex-1 py-2.5 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-neutral-950 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Déverrouiller</span>
              </button>
            </div>
          </form>

          <div className="pt-1 text-center text-[10px] text-neutral-400 font-mono-code">
            Raccourci clavier discret : Ctrl + Shift + A
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white w-full h-full min-h-screen overflow-hidden flex flex-col admin-dashboard-root">
      {/* Dashboard Top Bar */}
      <div className="px-4 sm:px-8 py-3.5 border-b border-neutral-200 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdminOpen(false)}
            className="flex items-center gap-1.5 text-xs font-mono-code text-neutral-600 hover:text-neutral-950 px-3 py-1.5 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <span>← Quitter le Dashboard</span>
          </button>
          <span className="hidden sm:inline text-neutral-300">|</span>
          <div className="hidden sm:block">
            <h2 className="text-sm font-bold text-neutral-950 uppercase tracking-tight">
              Studio Artistique &amp; Administration
            </h2>
            <div className="text-[10px] font-mono-code text-neutral-400">
              Gestionnaire de Contenu en Direct · {profile.stageName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Cloud Firebase Badge */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-emerald-50 border border-emerald-200/90 rounded-full text-[11px] font-mono-code text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">Firebase Cloud Sync</span>
            {currentUser?.email && (
              <span className="text-emerald-700 hidden lg:inline">({currentUser.email})</span>
            )}
          </div>

          <button
            onClick={handleLogout}
            title="Verrouiller la session d'administration"
            className="text-xs text-neutral-600 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors flex items-center gap-1.5 cursor-pointer font-mono-code"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Verrouiller</span>
          </button>
          <button
            onClick={() => {
              if (confirm("Réinitialiser toutes les données aux valeurs par défaut ?")) {
                resetToDefaultData();
              }
            }}
            title="Réinitialiser les données de démo"
            className="text-xs text-neutral-500 hover:text-neutral-950 px-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors flex items-center gap-1 cursor-pointer font-mono-code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Démo</span>
          </button>

          <button
            onClick={() => setIsAdminOpen(false)}
            className="p-2 text-neutral-400 hover:text-neutral-950 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Fermer le dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 sm:px-8 border-b border-neutral-200 bg-white flex items-center gap-2 overflow-x-auto shrink-0">
        {[
          { id: 'news', label: 'Annonces & Actualités', icon: FileText, count: announcements.length },
          { id: 'music', label: 'Musique & Extraits', icon: Music, count: tracks.length },
          { id: 'shop', label: 'Boutique & Produits', icon: ShoppingBag, count: products.length },
          { id: 'tour', label: 'Concerts & Billetterie', icon: Calendar, count: concerts.length },
          { id: 'fans', label: 'Abonnés Le Cercle', icon: Users, count: subscribers.length },
          { id: 'profile', label: 'Photo Accueil & Profil', icon: User }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-3.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-neutral-950 text-neutral-950'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="font-mono-code text-[10px] px-1.5 py-0.2 bg-neutral-100 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Body */}
      <div className="p-4 sm:p-8 flex-1 overflow-y-auto space-y-6 max-w-7xl mx-auto w-full">
          
          {/* TAB 1: NEWS & ANNOUNCEMENTS */}
          {activeTab === 'news' && (
            <div className="w-full space-y-12">
              
              {/* Full Width Clean Studio Announcement Composer */}
              <div className="w-full space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div>
                    <h3 className="text-base font-bold uppercase tracking-wider font-mono-code text-neutral-950">
                      Poster une Nouvelle Annonce
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Rédigez et publiez une actualité visible instantanément sur la page d'accueil.
                    </p>
                  </div>
                </div>

                <form onSubmit={handlePostNews} className="space-y-6 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Column: Title, Category & Excerpt */}
                    <div className="md:col-span-8 space-y-5">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-2">
                          Titre de l'annonce :
                        </label>
                        <input
                          type="text"
                          required
                          value={newNewsTitle}
                          onChange={e => setNewNewsTitle(e.target.value)}
                          placeholder="ex. Sortie du nouveau projet studio & dates exclusives"
                          className="w-full text-base sm:text-lg font-medium py-3 px-4 rounded-xl bg-neutral-100 focus:bg-neutral-200/80 border-0 focus:outline-none focus:ring-0 transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-2">
                            Catégorie :
                          </label>
                          <StudioSelect
                            value={newNewsCategory}
                            onChange={val => setNewNewsCategory(val as typeof newNewsCategory)}
                            size="lg"
                            options={[
                              { value: 'Sortie Musique', label: 'Sortie Musique' },
                              { value: 'Tournée', label: 'Tournée' },
                              { value: 'Studio', label: 'Studio & Coulisses' },
                              { value: 'Boutique', label: 'Boutique & Édition' },
                            ]}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-2">
                            Mise en avant :
                          </label>
                          <label className="flex items-center gap-3 py-3 px-4 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={newNewsPinned}
                              onChange={e => setNewNewsPinned(e.target.checked)}
                              className="w-4 h-4 rounded accent-neutral-950"
                            />
                            <span className="text-xs font-medium text-neutral-800">
                              Épingler en haut de page
                            </span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-2">
                          Bref résumé (chapeau) :
                        </label>
                        <input
                          type="text"
                          value={newNewsSummary}
                          onChange={e => setNewNewsSummary(e.target.value)}
                          placeholder="Une ou deux phrases courtes d'accroche pour la vignette..."
                          className="w-full text-sm py-3 px-4 rounded-xl bg-neutral-100 focus:bg-neutral-200/80 border-0 focus:outline-none focus:ring-0 transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-2">
                          Contenu complet :
                        </label>
                        <textarea
                          required
                          rows={6}
                          value={newNewsContent}
                          onChange={e => setNewNewsContent(e.target.value)}
                          placeholder="Rédigez ici le texte complet de votre actualité pour les fans et visiteurs..."
                          className="w-full text-sm leading-relaxed p-4 rounded-xl bg-neutral-100 focus:bg-neutral-200/80 border-0 focus:outline-none focus:ring-0 transition-all"
                        />
                      </div>
                    </div>

                    {/* Right Column: Visual illustration */}
                    <div className="md:col-span-4 space-y-4">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-2">
                          Visuel d'illustration :
                        </label>
                        <input
                          type="file"
                          ref={newsFileInputRef}
                          accept="image/*"
                          onChange={handleNewsImageFileUpload}
                          className="hidden"
                        />

                        <div className="space-y-3">
                          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 group">
                            <img
                              src={newNewsImage}
                              alt="Aperçu visuel"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/src/assets/images/album_vinyl_artwork_1790345759457.jpg';
                              }}
                            />
                            <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                              <button
                                type="button"
                                onClick={() => newsFileInputRef.current?.click()}
                                className="py-2 px-4 bg-white text-neutral-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg hover:bg-neutral-100 transition-all cursor-pointer"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Changer l'image</span>
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => newsFileInputRef.current?.click()}
                            className="w-full py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Importer une image depuis mon appareil</span>
                          </button>

                          <StudioSelect
                            value={newNewsImage}
                            onChange={setNewNewsImage}
                            size="md"
                            options={[
                              { value: '/src/assets/images/album_vinyl_artwork_1790345759457.jpg', label: 'Pochette Vinyle Éphémère' },
                              { value: '/src/assets/images/concert_stage_atmosphere_1790345781544.jpg', label: 'Atmosphère Scène Concert' },
                              { value: '/src/assets/images/hero_artist_portrait_1790345746015.jpg', label: 'Portrait Studio Artiste' },
                              { value: '/src/assets/images/product_merch_hoodie_1790345771258.jpg', label: 'Pièce Textile Hoodie' },
                            ]}
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-neutral-950 text-white rounded-xl text-sm font-bold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Publier immédiatement sur le site</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Publications List */}
              <div className="pt-8 border-t border-neutral-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono-code uppercase font-bold text-neutral-900">
                    Publications Actuellement en Ligne ({announcements.length})
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {announcements.map(item => (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl border border-neutral-200 bg-white flex items-start justify-between gap-4 hover:border-neutral-300 transition-all"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 text-[11px] font-mono-code text-neutral-400">
                          <span className="text-neutral-900 font-semibold">{item.category}</span>
                          <span>·</span>
                          <span>{item.date}</span>
                          {item.pinned && (
                            <span className="px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-700 font-bold">
                              Épinglé
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-bold text-neutral-950">
                          {item.title}
                        </div>
                        <div className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                          {item.summary}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => updateAnnouncement(item.id, { pinned: !item.pinned })}
                          title={item.pinned ? "Désépingler" : "Épingler"}
                          className={`p-2 rounded-lg transition-colors cursor-pointer ${
                            item.pinned ? 'text-neutral-950 bg-neutral-100' : 'text-neutral-400 hover:text-neutral-900'
                          }`}
                        >
                          <Pin className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteAnnouncement(item.id)}
                          title="Supprimer cette publication"
                          className="p-2 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MUSIC & TRACKS */}
          {activeTab === 'music' && (
            <div className="w-full space-y-12">
              
              {/* Full Width Clean Studio Audio Composer */}
              <div className="w-full space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div>
                    <h3 className="text-base font-bold uppercase tracking-wider font-mono-code text-neutral-950">
                      Ajouter un Nouvel Extrait Audio
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Téléversez vos masters audio (MP3, WAV, AAC...) ou configurez les synthétiseurs génératifs du lecteur.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleAddTrack} className="space-y-6 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Column: Track Info & Audio File */}
                    <div className="md:col-span-7 lg:col-span-8 space-y-5">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-2">
                          Titre du morceau :
                        </label>
                        <input
                          type="text"
                          required
                          value={newTrackTitle}
                          onChange={e => setNewTrackTitle(e.target.value)}
                          placeholder="ex. Résonance V (Live Kyoto) ou Silence Éternel"
                          className="w-full text-base sm:text-lg font-medium py-3 px-4 rounded-xl bg-neutral-100 focus:bg-neutral-200/80 border-0 focus:outline-none focus:ring-0 transition-all"
                        />
                      </div>

                      {/* Technical Specs 4-column Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-1.5">
                            Durée :
                          </label>
                          <input
                            type="text"
                            value={newTrackDuration}
                            onChange={e => setNewTrackDuration(e.target.value)}
                            placeholder="02:30"
                            className="w-full py-2.5 px-3 rounded-xl bg-neutral-100 focus:bg-neutral-200/80 border-0 text-xs font-mono-code focus:outline-none focus:ring-0 transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-1.5">
                            BPM :
                          </label>
                          <input
                            type="number"
                            value={newTrackBpm}
                            onChange={e => setNewTrackBpm(Number(e.target.value))}
                            className="w-full py-2.5 px-3 rounded-xl bg-neutral-100 focus:bg-neutral-200/80 border-0 text-xs font-mono-code focus:outline-none focus:ring-0 transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-1.5">
                            Tonalité :
                          </label>
                          <input
                            type="text"
                            value={newTrackKey}
                            onChange={e => setNewTrackKey(e.target.value)}
                            placeholder="D Min"
                            className="w-full py-2.5 px-3 rounded-xl bg-neutral-100 focus:bg-neutral-200/80 border-0 text-xs font-mono-code focus:outline-none focus:ring-0 transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-1.5">
                            Statut :
                          </label>
                          <StudioSelect
                            value={newTrackStatus}
                            onChange={val => setNewTrackStatus(val as TrackStatus)}
                            size="md"
                            options={[
                              { value: 'Extrait Exclusif', label: 'Extrait Exclusif' },
                              { value: 'Nouveau Single', label: 'Nouveau Single' },
                              { value: 'Album à venir', label: 'Album à venir' },
                              { value: 'Sorti', label: 'Sorti' },
                            ]}
                          />
                        </div>
                      </div>

                      {/* Audio File Section */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block">
                          Fichier Audio / Morceau de l'Admin :
                        </label>

                        {/* Hidden Audio File Input */}
                        <input
                          type="file"
                          ref={audioFileInputRef}
                          accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
                          onChange={handleAudioFileUpload}
                          className="hidden"
                        />

                        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                          <button
                            type="button"
                            disabled={isCompressingAudio}
                            onClick={() => audioFileInputRef.current?.click()}
                            className={`w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                              isCompressingAudio 
                                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed' 
                                : 'bg-neutral-950 text-white hover:bg-neutral-800'
                            }`}
                          >
                            {isCompressingAudio ? (
                              <RefreshCw className="w-4 h-4 text-[#52b788] animate-spin" />
                            ) : (
                              <Music className="w-4 h-4 text-[#52b788]" />
                            )}
                            <span>
                              {isCompressingAudio ? "Publication sur Firebase Storage..." : "Importer ma propre musique (MP3, WAV, AAC, FLAC...)"}
                            </span>
                          </button>

                          {isCompressingAudio && (
                            <div className="p-3 text-xs text-emerald-900 font-mono-code bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5 animate-pulse">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                                  <span>Téléversement vers Firebase Storage...</span>
                                </span>
                                {audioUploadProgress > 0 && (
                                  <span className="font-bold">{audioUploadProgress}%</span>
                                )}
                              </div>
                              {audioUploadProgress > 0 && (
                                <div className="w-full h-1.5 bg-emerald-200/80 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-600 transition-all duration-150"
                                    style={{ width: `${audioUploadProgress}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {newTrackAudioUrl && !isCompressingAudio ? (
                            <div className="space-y-2">
                              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2.5 truncate">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <div className="truncate">
                                    <span className="font-semibold truncate block">
                                      {newTrackAudioName || "Morceau audio importé"}
                                    </span>
                                    <span className="text-[10px] text-emerald-700 font-mono-code">
                                      {newTrackAudioUrl.startsWith('http') ? '☁️ Hébergé sur Firebase Cloud Storage' : '💾 Fichier local chargé'}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewTrackAudioUrl('');
                                    setNewTrackAudioName('');
                                    setAudioOrigSize('');
                                    setAudioCompSize('');
                                    showToast("Morceau audio retiré. Utilisation du synthétiseur de secours.");
                                  }}
                                  className="text-[11px] font-mono-code text-rose-600 hover:underline shrink-0 cursor-pointer"
                                >
                                  Supprimer
                                </button>
                              </div>

                              {audioCompSize && audioOrigSize && (
                                <div className="text-[11px] text-neutral-600 font-mono-code flex items-center justify-between px-2">
                                  <span>Taille du fichier : <b>{audioOrigSize} Mo</b></span>
                                  <span className="text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-md">
                                    Diffusion HD activée
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            !isCompressingAudio && (
                              <div className="text-[11px] text-neutral-400 text-center font-mono-code">
                                Format MP3, WAV, FLAC, M4A ou AAC (Max 60 Mo) · Stockage Cloud Firebase inclus
                              </div>
                            )
                          )}

                          {/* Web Audio Synth Preset Fallback */}
                          <div className="pt-2 border-t border-neutral-200">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="text-[11px] font-mono-code text-neutral-500 block">
                                Ou choisir un synthétiseur Web Audio génératif (si pas de fichier audio importé) :
                              </span>
                              {newTrackAudioUrl && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono-code text-[#1b4332] bg-[#1b4332]/10 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                                  <Lock className="w-2.5 h-2.5" />
                                  Option bloquée
                                </span>
                              )}
                            </div>
                            <div className={newTrackAudioUrl ? 'opacity-40 pointer-events-none select-none cursor-not-allowed' : ''}>
                              <StudioSelect
                                value={newTrackPreset}
                                onChange={val => setNewTrackPreset(val as AudioPreset)}
                                size="md"
                                disabled={!!newTrackAudioUrl}
                                options={[
                                  { value: 'ambient', label: 'Ambient Nappes Célestes & Prophet-6' },
                                  { value: 'synthwave', label: 'Synthwave Arpèges 80s & Basse Acide' },
                                  { value: 'neoclassical', label: 'Néo-Classique Piano Feutré & Réverbe' },
                                  { value: 'minimal', label: 'Minimal Sub-Kick & Chime Cloche' },
                                  { value: 'chillpulse', label: 'Chillpulse Lo-Fi & Ondes Méditatives' },
                                ]}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-2">
                          Description instrumentale :
                        </label>
                        <textarea
                          rows={3}
                          value={newTrackDesc}
                          onChange={e => setNewTrackDesc(e.target.value)}
                          placeholder="Notes de production, intention artistique ou instruments utilisés..."
                          className="w-full text-sm leading-relaxed p-3.5 rounded-xl bg-neutral-100 focus:bg-neutral-200/80 border-0 focus:outline-none focus:ring-0 transition-all"
                        />
                      </div>
                    </div>

                    {/* Right Column: Track Artwork / Cover */}
                    <div className="md:col-span-5 lg:col-span-4 space-y-4">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-2">
                          Pochette / Cover de l'extrait :
                        </label>

                        {/* Hidden File Input */}
                        <input
                          type="file"
                          ref={trackCoverFileInputRef}
                          accept="image/*"
                          onChange={handleTrackCoverFileUpload}
                          className="hidden"
                        />

                        <div className="space-y-3">
                          {/* Square Cover Preview */}
                          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 group">
                            <img
                              src={newTrackCover}
                              alt="Aperçu Pochette"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/src/assets/images/album_vinyl_artwork_1790345759457.jpg';
                              }}
                            />
                            <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                              <button
                                type="button"
                                onClick={() => trackCoverFileInputRef.current?.click()}
                                className="py-2 px-4 bg-white text-neutral-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg hover:bg-neutral-100 transition-all cursor-pointer"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Changer la pochette</span>
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => trackCoverFileInputRef.current?.click()}
                              className="flex-1 py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            >
                              <Upload className="w-4 h-4" />
                              <span>Importer la pochette (Fichier local)</span>
                            </button>
                            {isCoverImported && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsTrackCoverImported(false);
                                  setNewTrackCover('/src/assets/images/album_vinyl_artwork_1790345759457.jpg');
                                  showToast("Pochette importée retirée. Options démo et lien URL débloquées.");
                                }}
                                className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                                title="Supprimer la pochette importée"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Retirer</span>
                              </button>
                            )}
                          </div>

                          {isCoverImported && (
                            <div className="p-2.5 rounded-xl bg-[#800020]/10 text-[#800020] text-xs flex items-center justify-between gap-2 animate-in fade-in duration-200">
                              <div className="flex items-center gap-1.5 font-mono-code text-[11px] font-bold">
                                <Lock className="w-3.5 h-3.5 shrink-0" />
                                <span>Options démo et lien URL bloquées (Pochette importée active)</span>
                              </div>
                            </div>
                          )}

                          <div className={`space-y-2 transition-all ${isCoverImported ? 'opacity-40 pointer-events-none select-none cursor-not-allowed' : ''}`}>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-mono-code text-neutral-400 block">Ou pochette démo :</span>
                                {isCoverImported && (
                                  <span className="text-[9px] font-mono-code text-[#800020] font-bold uppercase flex items-center gap-1">
                                    <Lock className="w-2.5 h-2.5" /> Bloqué
                                  </span>
                                )}
                              </div>
                              <StudioSelect
                                value={newTrackCover}
                                onChange={setNewTrackCover}
                                size="sm"
                                disabled={isCoverImported}
                                options={[
                                  { value: '/src/assets/images/album_vinyl_artwork_1790345759457.jpg', label: 'Vinyle Pochette Éphémère' },
                                  { value: '/src/assets/images/hero_artist_portrait_1790345746015.jpg', label: 'Portrait Studio' },
                                  { value: '/src/assets/images/concert_stage_atmosphere_1790345781544.jpg', label: 'Ambiance Concert 360°' },
                                  { value: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80', label: 'Synthétiseur Analogique' },
                                ]}
                              />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-mono-code text-neutral-400 block">Ou lien Web URL :</span>
                                {isCoverImported && (
                                  <span className="text-[9px] font-mono-code text-[#800020] font-bold uppercase flex items-center gap-1">
                                    <Lock className="w-2.5 h-2.5" /> Bloqué
                                  </span>
                                )}
                              </div>
                              <input
                                type="url"
                                placeholder="https://..."
                                disabled={isCoverImported}
                                value={isCoverImported ? '' : (newTrackCover.startsWith('data:') ? '' : newTrackCover)}
                                onChange={e => {
                                  if (!isCoverImported && e.target.value.trim()) setNewTrackCover(e.target.value.trim());
                                }}
                                className="w-full py-2 px-3 text-xs rounded-xl bg-neutral-100 border-0 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:text-neutral-400"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-neutral-950 text-white rounded-xl text-sm font-bold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter l'extrait musical</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Tracks List */}
              <div className="pt-8 border-t border-neutral-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono-code uppercase font-bold text-neutral-900">
                    Morceaux Actuellement Disponibles ({tracks.length})
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tracks.map(t => (
                    <div
                      key={t.id}
                      className="p-5 rounded-2xl border border-neutral-200 bg-white flex items-center justify-between gap-4 hover:border-neutral-300 transition-all"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-neutral-950 truncate">{t.title}</span>
                          <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                            {t.status}
                          </span>
                          {t.audioUrl && (
                            <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#1b4332]/15 text-[#1b4332] font-semibold flex items-center gap-1">
                              <Music className="w-3 h-3" /> Audio Personnalisé
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono-code text-neutral-400">
                          {t.bpm} BPM · {t.key} · {t.duration} · Preset: {t.preset}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setLyricsEditingTrack(t)}
                          className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all border border-neutral-200"
                        >
                          <Mic className="w-3.5 h-3.5 text-[#2d6a4f] animate-pulse" />
                          <span>Paroles ({t.lyrics?.length || 0})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteTrack(t.id)}
                          className="p-2 text-neutral-400 hover:text-rose-600 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
                          title="Supprimer ce morceau"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: SHOP & ORDERS */}
          {activeTab === 'shop' && (
            <div className="w-full space-y-6">
              
              {/* 3 Sub-Navigation Buttons Spanning Full Width (Border-free & Mobile-Optimized) */}
              <div className="w-full grid grid-cols-3 gap-1 sm:gap-2 p-1 sm:p-1.5 bg-neutral-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setShopSubTab('add')}
                  className={`w-full py-2 sm:py-3.5 px-1.5 sm:px-4 rounded-xl text-[10px] sm:text-xs md:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer font-mono-code uppercase tracking-wider text-center ${
                    shopSubTab === 'add'
                      ? 'bg-neutral-950 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="hidden md:inline">AJOUTER UN PRODUIT / CRÉATION</span>
                  <span className="hidden sm:inline md:hidden">AJOUTER PRODUIT</span>
                  <span className="sm:hidden leading-tight">AJOUTER</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShopSubTab('catalog')}
                  className={`w-full py-2 sm:py-3.5 px-1.5 sm:px-4 rounded-xl text-[10px] sm:text-xs md:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer font-mono-code uppercase tracking-wider text-center ${
                    shopSubTab === 'catalog'
                      ? 'bg-neutral-950 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="hidden md:inline">CATALOGUE ACTUELLEMENT EN VENTE ({products.length})</span>
                  <span className="hidden sm:inline md:hidden">CATALOGUE ({products.length})</span>
                  <span className="sm:hidden leading-tight">CATALOGUE ({products.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShopSubTab('orders')}
                  className={`w-full py-2 sm:py-3.5 px-1.5 sm:px-4 rounded-xl text-[10px] sm:text-xs md:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer font-mono-code uppercase tracking-wider text-center ${
                    shopSubTab === 'orders'
                      ? 'bg-neutral-950 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="hidden md:inline">COMMANDES REÇUES ({shopOrders.length})</span>
                  <span className="hidden sm:inline md:hidden">COMMANDES ({shopOrders.length})</span>
                  <span className="sm:hidden leading-tight">COMMANDES ({shopOrders.length})</span>
                </button>
              </div>

              {/* Sub-Page 1: AJOUTER UN PRODUIT / CRÉATION */}
              {shopSubTab === 'add' && (
                <div className="w-full space-y-6 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div>
                      <h3 className="text-base font-bold uppercase tracking-wider font-mono-code text-neutral-950">
                        Ajouter un Produit / Création
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Publiez un article de merch, vinyle collector, vêtement ou création artistique dans la boutique officielle.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleAddProduct} className="space-y-6 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      
                      {/* Left Column: Product Info */}
                      <div className="md:col-span-7 lg:col-span-8 space-y-5">
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-2">
                            Nom du produit :
                          </label>
                          <input
                            type="text"
                            required
                            value={newProdTitle}
                            onChange={e => setNewProdTitle(e.target.value)}
                            placeholder="ex. Vinyle 180g Édition Tokyo, Hoodie Studio Noir..."
                            className="w-full text-base sm:text-lg font-medium py-3 px-4 rounded-xl bg-neutral-100 focus:bg-neutral-200/80 border-0 focus:outline-none focus:ring-0 transition-all"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-2">
                              Catégorie :
                            </label>
                            <StudioSelect
                              value={newProdCategory}
                              onChange={val => setNewProdCategory(val as typeof newProdCategory)}
                              size="lg"
                              options={[
                                { value: 'Vinyles & Disques', label: 'Vinyles & Disques' },
                                { value: 'Textiles & Merch', label: 'Textiles & Merch' },
                                { value: 'Art & Sérigraphie', label: 'Art & Sérigraphie' },
                                { value: 'Édition Collector', label: 'Édition Collector' },
                              ]}
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-2">
                              Prix (€) :
                            </label>
                            <input
                              type="number"
                              value={newProdPrice}
                              onChange={e => setNewProdPrice(Number(e.target.value))}
                              className="w-full py-3 px-4 rounded-xl bg-neutral-100 focus:bg-neutral-200/80 border-0 text-sm font-mono-code focus:outline-none focus:ring-0 transition-all"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-2">
                              Stock initial :
                            </label>
                            <input
                              type="number"
                              value={newProdStock}
                              onChange={e => setNewProdStock(Number(e.target.value))}
                              className="w-full py-3 px-4 rounded-xl bg-neutral-100 focus:bg-neutral-200/80 border-0 text-sm font-mono-code focus:outline-none focus:ring-0 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-2">
                            Description :
                          </label>
                          <textarea
                            rows={4}
                            value={newProdDesc}
                            onChange={e => setNewProdDesc(e.target.value)}
                            placeholder="Détails du produit, composition, finitions artisanales, tirage limité..."
                            className="w-full text-sm leading-relaxed p-4 rounded-xl bg-neutral-100 focus:bg-neutral-200/80 border-0 focus:outline-none focus:ring-0 transition-all"
                          />
                        </div>
                      </div>

                      {/* Right Column: Product Image */}
                      <div className="md:col-span-5 lg:col-span-4 space-y-4">
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-2">
                            Image du produit :
                          </label>
                          
                          {/* Hidden File Input */}
                          <input
                            type="file"
                            ref={productFileInputRef}
                            accept="image/*"
                            onChange={handleProductImageFileUpload}
                            className="hidden"
                          />

                          <div className="space-y-3">
                            {/* Square Preview */}
                            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 group">
                              <img
                                src={newProdImage}
                                alt="Aperçu produit"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/src/assets/images/album_vinyl_artwork_1790345759457.jpg';
                                }}
                              />
                              <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                                <button
                                  type="button"
                                  onClick={() => productFileInputRef.current?.click()}
                                  className="py-2 px-4 bg-white text-neutral-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg hover:bg-neutral-100 transition-all cursor-pointer"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Changer l'image</span>
                                </button>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => productFileInputRef.current?.click()}
                              className="w-full py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            >
                              <Upload className="w-4 h-4" />
                              <span>Importer une image (Fichier local)</span>
                            </button>

                            <div className="space-y-2">
                              <div>
                                <span className="text-[10px] font-mono-code text-neutral-400 block mb-1">Ou choisir une image démo :</span>
                                <StudioSelect
                                  value={newProdImage}
                                  onChange={setNewProdImage}
                                  size="sm"
                                  options={[
                                    { value: '/src/assets/images/album_vinyl_artwork_1790345759457.jpg', label: 'Vinyle Marbré' },
                                    { value: '/src/assets/images/product_merch_hoodie_1790345771258.jpg', label: 'Hoodie Lourd' },
                                    { value: '/src/assets/images/concert_stage_atmosphere_1790345781544.jpg', label: 'Sérigraphie Scène' },
                                    { value: '/src/assets/images/hero_artist_portrait_1790345746015.jpg', label: 'Pack Digital Stems' },
                                  ]}
                                />
                              </div>

                              <div>
                                <span className="text-[10px] font-mono-code text-neutral-400 block mb-1">Ou coller une URL web :</span>
                                <input
                                  type="url"
                                  placeholder="https://..."
                                  value={newProdImage.startsWith('data:') ? '' : newProdImage}
                                  onChange={e => {
                                    if (e.target.value.trim()) setNewProdImage(e.target.value.trim());
                                  }}
                                  className="w-full py-2 px-3 text-xs rounded-xl bg-neutral-100 border-0 focus:outline-none focus:ring-0"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3.5 bg-neutral-950 text-white rounded-xl text-sm font-bold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer font-mono-code uppercase tracking-wider"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter à la boutique</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Sub-Page 2: CATALOGUE ACTUELLEMENT EN VENTE */}
              {shopSubTab === 'catalog' && (
                <div className="w-full space-y-6 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div>
                      <h3 className="text-base font-bold uppercase tracking-wider font-mono-code text-neutral-950">
                        Catalogue Actuellement en Vente ({products.length})
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Gérez les stocks en direct, modifiez ou retirez vos créations de la boutique officielle.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShopSubTab('add')}
                      className="py-2.5 px-4 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer font-mono-code uppercase tracking-wider"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nouveau Produit</span>
                    </button>
                  </div>

                  {products.length === 0 ? (
                    <div className="p-12 rounded-3xl bg-neutral-50 text-center border border-dashed border-neutral-200 space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-200/60 flex items-center justify-center mx-auto text-neutral-400">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-neutral-900 font-mono-code uppercase">
                          Aucun article en vente dans la boutique
                        </p>
                        <p className="text-xs text-neutral-500">
                          Commencez dès maintenant par publier votre premier vinyle, textile ou édition d'art.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShopSubTab('add')}
                        className="py-2.5 px-5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 transition-all cursor-pointer font-mono-code uppercase tracking-wider"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Créer un produit</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {products.map(p => (
                        <div
                          key={p.id}
                          className="p-5 rounded-2xl border border-neutral-200 bg-white flex items-center justify-between gap-4 hover:border-neutral-300 transition-all shadow-xs"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <img
                              src={p.imageUrl}
                              alt={p.title}
                              className="w-16 h-16 rounded-xl object-cover bg-neutral-100 border border-neutral-200 shrink-0"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/src/assets/images/album_vinyl_artwork_1790345759457.jpg';
                              }}
                            />
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-neutral-950 truncate">{p.title}</div>
                              <div className="text-xs font-mono-code text-neutral-400 mt-1">
                                {p.category} · <span className="font-semibold text-neutral-900">{p.price} €</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <div className="text-xs font-mono-code font-bold text-neutral-950">
                                Stock : {p.stock}
                              </div>
                              <button
                                onClick={() => updateProduct(p.id, { stock: p.stock + 10 })}
                                className="text-[11px] text-neutral-500 hover:text-neutral-950 underline font-mono-code cursor-pointer"
                              >
                                +10 unités
                              </button>
                            </div>

                            <button
                              onClick={() => deleteProduct(p.id)}
                              className="p-2 text-neutral-400 hover:text-rose-600 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
                              title="Supprimer cet article"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Page 3: COMMANDES REÇUES */}
              {shopSubTab === 'orders' && (
                <div className="w-full flex-1 flex flex-col space-y-6 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div>
                      <h3 className="text-base font-bold uppercase tracking-wider font-mono-code text-neutral-950">
                        Commandes Reçues ({shopOrders.length})
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Consultez les commandes et coordonnées de livraison passées par les fans.
                      </p>
                    </div>
                  </div>

                  {shopOrders.length === 0 ? (
                    <div className="w-full flex-1 min-h-[52vh] sm:min-h-[62vh] rounded-3xl bg-neutral-50 flex flex-col items-center justify-center p-8 sm:p-16 text-center space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-neutral-200/60 flex items-center justify-center mx-auto text-neutral-400 mb-2">
                        <FileText className="w-8 h-8" />
                      </div>
                      <p className="text-base sm:text-lg font-bold text-neutral-900 font-mono-code uppercase tracking-wider">
                        Aucune commande pour l'instant
                      </p>
                      <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto leading-relaxed">
                        Les commandes passées par vos fans dans la boutique apparaîtront ici automatiquement avec le détail des articles et de la livraison.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-2xl overflow-hidden text-xs bg-white shadow-xs">
                      {shopOrders.map(order => (
                        <div key={order.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                          <div>
                            <div className="font-bold font-mono-code text-neutral-950 text-sm">
                              {order.orderNumber} — {order.total} €
                            </div>
                            <div className="text-neutral-500 text-xs mt-0.5">
                              {order.customerName} ({order.customerEmail}) · {order.city}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-800 font-mono-code text-xs font-semibold">
                              {order.status}
                            </span>
                            <div className="text-[11px] text-neutral-400 font-mono-code mt-1">
                              {order.createdAt}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* TAB 4: TOUR & TICKETS */}
          {activeTab === 'tour' && (
            <div className="w-full space-y-6">
              
              {/* 3 Sub-Navigation Buttons Spanning Full Width (Border-free & Mobile-Optimized) */}
              <div className="w-full grid grid-cols-3 gap-1 sm:gap-2 p-1 sm:p-1.5 bg-neutral-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setTourSubTab('add')}
                  className={`w-full py-2 sm:py-3.5 px-1.5 sm:px-4 rounded-xl text-[10px] sm:text-xs md:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer font-mono-code uppercase tracking-wider text-center ${
                    tourSubTab === 'add'
                      ? 'bg-neutral-950 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="hidden md:inline">AJOUTER UNE DATE DE CONCERT</span>
                  <span className="hidden sm:inline md:hidden">AJOUTER DATE</span>
                  <span className="sm:hidden leading-tight">AJOUTER</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTourSubTab('dates')}
                  className={`w-full py-2 sm:py-3.5 px-1.5 sm:px-4 rounded-xl text-[10px] sm:text-xs md:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer font-mono-code uppercase tracking-wider text-center ${
                    tourSubTab === 'dates'
                      ? 'bg-neutral-950 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="hidden md:inline">DATES PROGRAMMÉES ({concerts.length})</span>
                  <span className="hidden sm:inline md:hidden">DATES ({concerts.length})</span>
                  <span className="sm:hidden leading-tight">DATES ({concerts.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTourSubTab('bookings')}
                  className={`w-full py-2 sm:py-3.5 px-1.5 sm:px-4 rounded-xl text-[10px] sm:text-xs md:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer font-mono-code uppercase tracking-wider text-center ${
                    tourSubTab === 'bookings'
                      ? 'bg-neutral-950 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="hidden md:inline">RÉSERVATIONS BILLETTERIE ({ticketOrders.length})</span>
                  <span className="hidden sm:inline md:hidden">RÉSERVATIONS ({ticketOrders.length})</span>
                  <span className="sm:hidden leading-tight">RÉSERVATIONS ({ticketOrders.length})</span>
                </button>
              </div>

              {/* Sub-Page 1: AJOUTER UNE DATE DE CONCERT */}
              {tourSubTab === 'add' && (
                <div className="w-full space-y-6 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div>
                      <h3 className="text-base font-bold uppercase tracking-wider font-mono-code text-neutral-950">
                        Ajouter une Date de Concert
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Programmez de nouvelles étapes de tournée, concerts 360° ou dates de festivals avec billetterie intégrée.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleAddConcert} className="space-y-6 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5 items-start">
                      
                      <div className="lg:col-span-4">
                        <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-2">
                          Ville :
                        </label>
                        <input
                          type="text"
                          required
                          value={newConcertCity}
                          onChange={e => setNewConcertCity(e.target.value)}
                          placeholder="ex. Paris, Lyon, Tokyo, Berlin..."
                          className="w-full text-sm sm:text-base font-medium py-3 px-4 rounded-xl bg-neutral-100 focus:bg-neutral-200/80 border-0 focus:outline-none focus:ring-0 transition-all"
                        />
                      </div>

                      <div className="lg:col-span-3">
                        <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-2">
                          Pays :
                        </label>
                        <input
                          type="text"
                          required
                          value={newConcertCountry}
                          onChange={e => setNewConcertCountry(e.target.value)}
                          placeholder="France"
                          className="w-full text-sm sm:text-base font-medium py-3 px-4 rounded-xl bg-neutral-100 focus:bg-neutral-200/80 border-0 focus:outline-none focus:ring-0 transition-all"
                        />
                      </div>

                      <div className="lg:col-span-5">
                        <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-2">
                          Salle / Venue :
                        </label>
                        <input
                          type="text"
                          required
                          value={newConcertVenue}
                          onChange={e => setNewConcertVenue(e.target.value)}
                          placeholder="ex. Le Transbordeur, L'Olympia, Philharmonie..."
                          className="w-full text-sm sm:text-base font-medium py-3 px-4 rounded-xl bg-neutral-100 focus:bg-neutral-200/80 border-0 focus:outline-none focus:ring-0 transition-all"
                        />
                      </div>

                      <div className="sm:col-span-1 lg:col-span-4">
                        <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-2">
                          Date du concert :
                        </label>
                        <input
                          type="date"
                          value={newConcertDate}
                          onChange={e => setNewConcertDate(e.target.value)}
                          className="w-full text-sm py-3 px-4 rounded-xl bg-neutral-100 focus:bg-neutral-200/80 border-0 font-mono-code focus:outline-none focus:ring-0 transition-all"
                        />
                      </div>

                      <div className="sm:col-span-1 lg:col-span-4">
                        <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-2">
                          Tarif de départ (€) :
                        </label>
                        <input
                          type="number"
                          value={newConcertPrice}
                          onChange={e => setNewConcertPrice(Number(e.target.value))}
                          className="w-full text-sm py-3 px-4 rounded-xl bg-neutral-100 focus:bg-neutral-200/80 border-0 font-mono-code focus:outline-none focus:ring-0 transition-all"
                        />
                      </div>

                      {/* Billets / Quota initial avec statut auto */}
                      <div className="sm:col-span-2 lg:col-span-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700">
                            Nombre de billets :
                          </label>
                          <span
                            className={`text-[10px] font-mono-code px-2 py-0.5 rounded-full font-bold uppercase ${
                              newConcertTickets <= 0
                                ? 'bg-neutral-200 text-neutral-600'
                                : newConcertTickets <= 25
                                ? 'bg-[#6B1724]/10 text-[#6B1724]'
                                : 'bg-[#1b4332]/10 text-[#1b4332]'
                            }`}
                          >
                            {newConcertTickets <= 0 ? 'Complet' : newConcertTickets <= 25 ? 'Dernières Places' : 'Disponible'}
                          </span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          required
                          value={newConcertTickets}
                          onChange={e => setNewConcertTickets(Number(e.target.value))}
                          placeholder="100"
                          className="w-full text-sm py-3 px-4 rounded-xl bg-neutral-100 focus:bg-neutral-200/80 border-0 font-mono-code focus:outline-none focus:ring-0 transition-all"
                        />
                        <p className="text-[10px] text-neutral-400 font-mono-code mt-1.5 flex items-center justify-between">
                          <span>Statut auto : calculé en temps réel</span>
                          <span>&le; 25 : Dernières Places</span>
                        </p>
                      </div>

                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3.5 bg-neutral-950 text-white rounded-xl text-sm font-bold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer font-mono-code uppercase tracking-wider"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter au calendrier de tournée</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Sub-Page 2: DATES ACTUELLEMENT PROGRAMMÉES */}
              {tourSubTab === 'dates' && (
                <div className="w-full space-y-6 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div>
                      <h3 className="text-base font-bold uppercase tracking-wider font-mono-code text-neutral-950">
                        Dates Actuellement Programmées ({concerts.length})
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Statuts synchronisés en continu : disponible, dernières places (&le; 25 billets), ou complet.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTourSubTab('add')}
                      className="py-2.5 px-4 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer font-mono-code uppercase tracking-wider"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Programmer une date</span>
                    </button>
                  </div>

                  {concerts.length === 0 ? (
                    <div className="p-12 rounded-3xl bg-neutral-50 text-center border-0 space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-200/60 flex items-center justify-center mx-auto text-neutral-400">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-neutral-900 font-mono-code uppercase">
                          Aucune date programmée pour le moment
                        </p>
                        <p className="text-xs text-neutral-500">
                          Ajoutez vos premières étapes de tournée pour ouvrir la billetterie aux fans.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTourSubTab('add')}
                        className="py-2.5 px-5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 transition-all cursor-pointer font-mono-code uppercase tracking-wider"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ajouter une date</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {concerts.map(c => {
                        const totalRemaining = c.ticketTiers.reduce((acc, t) => acc + Math.max(0, t.remaining || 0), 0);
                        const autoStatus = totalRemaining <= 0 ? 'Complet' : totalRemaining <= 25 ? 'Dernières Places' : 'Disponible';

                        return (
                          <div
                            key={c.id}
                            className="p-5 rounded-2xl border border-neutral-200 bg-white flex flex-col justify-between gap-4 hover:border-neutral-300 transition-all shadow-xs"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1 min-w-0">
                                <div className="text-sm font-bold text-neutral-950 truncate">
                                  {c.city} — {c.venue}
                                </div>
                                <div className="text-xs font-mono-code text-neutral-400">
                                  {c.formattedDate} · {c.country}
                                </div>
                              </div>

                              <button
                                onClick={() => deleteConcert(c.id)}
                                className="p-2 text-neutral-400 hover:text-rose-600 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
                                title="Supprimer cette date"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Ticket Status & Stock Management */}
                            <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              
                              {/* Automatic status badge (without dots) */}
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold font-mono-code ${
                                    autoStatus === 'Complet'
                                      ? 'bg-neutral-100 text-neutral-600'
                                      : autoStatus === 'Dernières Places'
                                      ? 'bg-[#6B1724] text-white'
                                      : 'bg-[#1b4332] text-white'
                                  }`}
                                >
                                  {autoStatus}
                                </span>

                                <div className="text-xs font-mono-code text-neutral-500">
                                  <span className="font-bold text-neutral-950">{totalRemaining}</span> billet{totalRemaining > 1 ? 's' : ''} restant{totalRemaining > 1 ? 's' : ''}
                                </div>
                              </div>

                              {/* Tickets restock with required confirmation */}
                              <div className="flex items-center gap-1 self-end sm:self-auto bg-neutral-100 p-1 rounded-xl">
                                <button
                                  type="button"
                                  onClick={() => setTicketConfirmModal({
                                    concertId: c.id,
                                    city: c.city,
                                    venue: c.venue,
                                    currentRemaining: totalRemaining,
                                    amountToAdd: 10
                                  })}
                                  className="px-2.5 py-1 text-[11px] font-mono-code font-bold text-neutral-700 hover:text-neutral-950 hover:bg-white rounded-lg transition-colors cursor-pointer"
                                  title="Ajouter 10 billets (confirmation requise)"
                                >
                                  +10
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setTicketConfirmModal({
                                    concertId: c.id,
                                    city: c.city,
                                    venue: c.venue,
                                    currentRemaining: totalRemaining,
                                    amountToAdd: 50
                                  })}
                                  className="px-2.5 py-1 text-[11px] font-mono-code font-bold text-neutral-700 hover:text-neutral-950 hover:bg-white rounded-lg transition-colors cursor-pointer"
                                  title="Ajouter 50 billets (confirmation requise)"
                                >
                                  +50
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setTicketConfirmModal({
                                    concertId: c.id,
                                    city: c.city,
                                    venue: c.venue,
                                    currentRemaining: totalRemaining,
                                    amountToAdd: 20
                                  })}
                                  className="px-2 py-1 text-[11px] font-mono-code text-neutral-500 hover:text-neutral-950 hover:bg-white rounded-lg transition-colors cursor-pointer"
                                  title="Ajuster et augmenter les billets avec confirmation"
                                >
                                  + Billets
                                </button>
                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Page 3: RÉSERVATIONS BILLETTERIE */}
              {tourSubTab === 'bookings' && (
                <div className="w-full flex-1 flex flex-col space-y-6 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div>
                      <h3 className="text-base font-bold uppercase tracking-wider font-mono-code text-neutral-950">
                        Réservations Billetterie ({ticketOrders.length})
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Consultez les e-pass générés par les fans avec justificatif et QR code.
                      </p>
                    </div>
                  </div>

                  {ticketOrders.length === 0 ? (
                    <div className="w-full flex-1 min-h-[52vh] sm:min-h-[62vh] rounded-3xl bg-neutral-50 flex flex-col items-center justify-center p-8 sm:p-16 text-center space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-neutral-200/60 flex items-center justify-center mx-auto text-neutral-400 mb-2">
                        <Ticket className="w-8 h-8" />
                      </div>
                      <p className="text-base sm:text-lg font-bold text-neutral-900 font-mono-code uppercase tracking-wider">
                        Aucun billet réservé pour l'instant
                      </p>
                      <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto leading-relaxed">
                        Les e-pass générés par les fans lors de leurs réservations apparaîtront ici automatiquement avec le détail des places et QR codes.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-2xl overflow-hidden text-xs bg-white shadow-xs">
                      {ticketOrders.map(t => (
                        <div key={t.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                          <div>
                            <div className="font-bold text-neutral-950 text-sm">
                              {t.concertCity} ({t.venue}) — {t.tierName} <span className="font-mono-code text-xs text-neutral-500">(x{t.quantity})</span>
                            </div>
                            <div className="text-neutral-500 text-xs font-mono-code mt-0.5">
                              Pass QR : {t.qrCodeData} · Titulaire : {t.buyerName} ({t.buyerEmail})
                            </div>
                          </div>
                          <div className="text-right font-mono-code font-bold text-neutral-950 text-sm">
                            {t.totalPrice} €
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* TAB 5: FAN SUBSCRIBERS */}
          {activeTab === 'fans' && (
            <div className="w-full space-y-12">
              
              {/* Header & Newsletter Dispatch Studio */}
              <div className="w-full space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-100">
                  <div>
                    <h3 className="text-base font-bold uppercase tracking-wider font-mono-code text-neutral-950">
                      Membres du Cercle Privé ({subscribers.length})
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Base d'abonnés qualifiée pour les annonces prioritaires, préventes exclusives et sorties vinyles.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={exportSubscribersCSV}
                      className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Exporter la liste (CSV)</span>
                    </button>
                  </div>
                </div>

                {/* Newsletter Direct Dispatch */}
                <div className="space-y-4">
                  <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#2d6a4f]" />
                    <span>Envoyer un bulletin exclusif aux abonnés :</span>
                  </label>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Objet ou message flash : ex. Code secret prévente débloqué, teaser exclusif ou ouverture du shop..."
                      className="flex-1 text-sm py-3.5 px-4 rounded-xl bg-neutral-100 focus:bg-neutral-200/80 border-0 focus:outline-none focus:ring-0 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => showToast("Message d'information envoyé aux membres du Cercle Privé !")}
                      className="py-3.5 px-8 bg-neutral-950 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Diffuser le message</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Subscribers Table Full Width */}
              <div className="pt-8 border-t border-neutral-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono-code uppercase font-bold text-neutral-900">
                    Répertoire des Abonnés ({subscribers.length})
                  </div>
                </div>

                <div className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-mono-code uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-4 px-5">E-mail du Fan</th>
                          <th className="py-4 px-5">Date d'inscription</th>
                          <th className="py-4 px-5">Préférences choisies</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {subscribers.map(sub => (
                          <tr key={sub.id} className="hover:bg-neutral-50/70 transition-colors">
                            <td className="py-4 px-5 font-semibold text-neutral-950 text-sm">
                              {sub.email}
                            </td>
                            <td className="py-4 px-5 font-mono-code text-neutral-500 text-xs">
                              {sub.subscribedAt}
                            </td>
                            <td className="py-4 px-5">
                              <div className="flex flex-wrap gap-1.5">
                                {sub.preferences.map(pref => (
                                  <span
                                    key={pref}
                                    className="px-2.5 py-1 bg-neutral-100 rounded-lg text-[11px] font-mono-code text-neutral-700 font-medium"
                                  >
                                    {pref}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: ARTIST PROFILE & HERO / DERNIÈRE CRÉATION */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="w-full space-y-12">
              
              {/* SECTION 1: DERNIÈRE CRÉATION & HERO PHOTO (PAGE D'ACCUEIL) */}
              <div className="w-full space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-100">
                  <div>
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-neutral-900 text-white text-[10px] font-mono-code uppercase font-semibold mb-1">
                      <span>Page d'Accueil · Hero Principal</span>
                    </div>
                    <h3 className="text-base font-bold uppercase tracking-wider font-mono-code text-neutral-950">
                      Photo &amp; Encart « DERNIÈRE CRÉATION »
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Remplacez la photo du visuel principal ainsi que les informations de la dernière création affichée en haut de la page d'accueil.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="self-start sm:self-auto px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Enregistrer la photo</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Controls: Upload, URL, Presets, Texts */}
                  <div className="lg:col-span-7 space-y-6">
                    
                    {/* Method 1: Local File Upload */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 flex items-center justify-between">
                        <span>1. Importer une photo locale (Ordinateur / Mobile)</span>
                        <span className="text-[11px] font-mono-code text-neutral-400">JPG, PNG, WEBP, GIF</span>
                      </label>
                      
                      <input
                        type="file"
                        ref={heroFileInputRef}
                        onChange={handleHeroImageFileUpload}
                        accept="image/*"
                        className="hidden"
                      />

                      <div
                        onClick={() => heroFileInputRef.current?.click()}
                        className="border-2 border-dashed border-neutral-200 hover:border-neutral-950 rounded-2xl p-6 text-center cursor-pointer transition-all bg-neutral-50 hover:bg-white flex flex-col items-center justify-center gap-2 group"
                      >
                        <div className="w-10 h-10 rounded-full bg-white group-hover:bg-neutral-950 group-hover:text-white flex items-center justify-center transition-colors text-neutral-700 shadow-sm border border-neutral-200">
                          <Upload className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-bold text-neutral-900">
                          Cliquez pour sélectionner une photo sur votre appareil
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Le visuel s'adaptera automatiquement au format 4:5 du cadre de l'artiste.
                        </div>
                      </div>
                    </div>

                    {/* Method 2: Image URL */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5 text-neutral-500" />
                        <span>2. Ou coller une URL d'image directe :</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={profileForm.heroImage}
                          onChange={e => {
                            const val = e.target.value;
                            setProfileForm(prev => ({
                              ...prev,
                              heroImage: val,
                              latestRelease: {
                                ...prev.latestRelease,
                                coverImage: val
                              }
                            }));
                          }}
                          placeholder="https://images.unsplash.com/... ou lien d'image web"
                          className="flex-1 px-4 py-3 text-xs rounded-xl border-0 bg-neutral-100 focus:bg-neutral-200/80 font-mono-code focus:outline-none focus:ring-0 transition-all"
                        />
                        {profileForm.heroImage && (
                          <button
                            type="button"
                            onClick={() => {
                              setProfileForm(prev => ({
                                ...prev,
                                heroImage: '/src/assets/images/album_vinyl_artwork_1790345759457.jpg',
                                latestRelease: {
                                  ...prev.latestRelease,
                                  coverImage: '/src/assets/images/album_vinyl_artwork_1790345759457.jpg'
                                }
                              }));
                              showToast("Visuel réinitialisé à la pochette d'album originale.");
                            }}
                            className="px-4 py-2 text-xs font-mono-code text-neutral-600 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer shrink-0 font-semibold"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Method 3: Presets Gallery */}
                    <div className="space-y-2.5">
                      <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-neutral-500" />
                        <span>3. Sélection rapide parmi les visuels du studio :</span>
                      </label>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {HERO_IMAGE_PRESETS.map(preset => {
                          const isSelected = profileForm.heroImage === preset.url;
                          return (
                            <div
                              key={preset.id}
                              onClick={() => handleSelectPresetHeroImage(preset.url)}
                              className={`relative rounded-xl overflow-hidden border p-2.5 bg-neutral-50 hover:bg-white cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-neutral-950 ring-2 ring-neutral-950/20 bg-white shadow-sm'
                                  : 'border-neutral-200 hover:border-neutral-400'
                              }`}
                            >
                              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-neutral-100 mb-2 relative">
                                <img
                                  src={preset.url}
                                  alt={preset.label}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                {isSelected && (
                                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-neutral-950 text-white flex items-center justify-center shadow-md">
                                    <Check className="w-3 h-3" />
                                  </div>
                                )}
                              </div>
                              <div className="text-[11px] font-bold text-neutral-900 truncate">
                                {preset.label}
                              </div>
                              <div className="text-[10px] font-mono-code text-neutral-400">
                                {preset.tag}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Texts Overlay for Dernière Création */}
                    <div className="pt-6 border-t border-neutral-200 space-y-4">
                      <div className="text-xs font-mono-code uppercase font-bold text-neutral-900 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Textes superposés sur la photo (Dernière Création) :</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="text-xs font-medium text-neutral-700 block mb-1.5">
                            Titre de la création / Album :
                          </label>
                          <input
                            type="text"
                            value={profileForm.latestRelease.title}
                            onChange={e => setProfileForm({
                              ...profileForm,
                              latestRelease: {
                                ...profileForm.latestRelease,
                                title: e.target.value
                              }
                            })}
                            className="w-full py-2.5 px-3.5 text-xs rounded-xl border-0 bg-neutral-100 focus:bg-neutral-200/80 focus:outline-none focus:ring-0 transition-all font-medium"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-neutral-700 block mb-1.5">
                            Année :
                          </label>
                          <input
                            type="text"
                            value={profileForm.latestRelease.year}
                            onChange={e => setProfileForm({
                              ...profileForm,
                              latestRelease: {
                                ...profileForm.latestRelease,
                                year: e.target.value
                              }
                            })}
                            className="w-full py-2.5 px-3.5 text-xs rounded-xl border-0 bg-neutral-100 focus:bg-neutral-200/80 font-mono-code focus:outline-none focus:ring-0 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-neutral-700 block mb-1.5">
                          Format &amp; Description (ex. Double Album &amp; Vinyle Audiophile 180g) :
                        </label>
                        <input
                          type="text"
                          value={profileForm.latestRelease.type}
                          onChange={e => setProfileForm({
                            ...profileForm,
                            latestRelease: {
                              ...profileForm.latestRelease,
                              type: e.target.value
                            }
                          })}
                          className="w-full py-2.5 px-3.5 text-xs rounded-xl border-0 bg-neutral-100 focus:bg-neutral-200/80 focus:outline-none focus:ring-0 transition-all"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Right: Live Realistic Preview */}
                  <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                      <div className="text-xs font-mono-code uppercase font-bold text-neutral-900 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-neutral-600" />
                        <span>Aperçu en Direct sur l'Accueil</span>
                      </div>
                      <span className="text-[10px] font-mono-code px-2.5 py-0.5 rounded-full bg-[#1b4332]/10 text-[#1b4332] font-semibold">
                        Live Preview
                      </span>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 shadow-sm">
                      <img
                        src={profileForm.heroImage || "/src/assets/images/album_vinyl_artwork_1790345759457.jpg"}
                        alt={`Aperçu ${profileForm.stageName}`}
                        className="w-full aspect-[4/5] object-cover filter grayscale contrast-105 hover:contrast-100 transition-all duration-500"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Architectural overlay badge */}
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/20 to-transparent flex flex-col justify-end p-5 text-white">
                        <div className="space-y-1">
                          <div className="text-[10px] font-mono-code tracking-widest text-neutral-300 uppercase flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                            <span>Dernière Création</span>
                          </div>
                          <div className="text-lg font-display font-bold leading-tight">
                            {profileForm.latestRelease.title || "Restoration (Part I & II)"}
                          </div>
                          <div className="text-[11px] text-neutral-300 flex items-center justify-between pt-1">
                            <span className="truncate pr-2">{profileForm.latestRelease.type || "Double Album & Vinyle Audiophile 180g"}</span>
                            <span className="font-mono-code tabular-nums font-semibold shrink-0">{profileForm.latestRelease.year || "2026"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-neutral-500 font-mono-code text-center pt-1">
                      Effet argentique monochrome 4:5 appliqué automatiquement.
                    </div>
                  </div>

                </div>
              </div>

              {/* SECTION 2: ARTIST GENERAL INFO & BIO */}
              <div className="pt-8 border-t border-neutral-200 space-y-6">
                <div>
                  <h3 className="text-base font-bold uppercase tracking-wider font-mono-code text-neutral-950">
                    Informations Générales &amp; Textes de Présentation
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Modifiez le nom de scène, votre localisation, votre signature éditoriale et la biographie.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-2">
                      Nom d'artiste :
                    </label>
                    <input
                      type="text"
                      value={profileForm.stageName}
                      onChange={e => setProfileForm({ ...profileForm, stageName: e.target.value })}
                      className="w-full py-3 px-4 text-sm font-medium rounded-xl border-0 bg-neutral-100 focus:bg-neutral-200/80 focus:outline-none focus:ring-0 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-2">
                      Villes / Base :
                    </label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={e => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="w-full py-3 px-4 text-sm font-medium rounded-xl border-0 bg-neutral-100 focus:bg-neutral-200/80 focus:outline-none focus:ring-0 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-2">
                    Tagline artistique (en-tête) :
                  </label>
                  <input
                    type="text"
                    value={profileForm.tagline}
                    onChange={e => setProfileForm({ ...profileForm, tagline: e.target.value })}
                    className="w-full py-3 px-4 text-sm font-medium rounded-xl border-0 bg-neutral-100 focus:bg-neutral-200/80 focus:outline-none focus:ring-0 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-2">
                    Citation / Phrase d'ouverture :
                  </label>
                  <input
                    type="text"
                    value={profileForm.statement}
                    onChange={e => setProfileForm({ ...profileForm, statement: e.target.value })}
                    className="w-full py-3 px-4 text-sm font-editorial italic rounded-xl border-0 bg-neutral-100 focus:bg-neutral-200/80 focus:outline-none focus:ring-0 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block mb-2">
                    Biographie détaillée :
                  </label>
                  <textarea
                    rows={5}
                    value={profileForm.bio}
                    onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="w-full text-sm leading-relaxed p-4 rounded-xl border-0 bg-neutral-100 focus:bg-neutral-200/80 focus:outline-none focus:ring-0 transition-all"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-6 py-3.5 bg-neutral-950 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#52b788]" />
                    <span>Enregistrer toutes les modifications</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileForm({ ...profile });
                      showToast("Modifications annulées.");
                    }}
                    className="px-5 py-3.5 text-xs font-medium text-neutral-600 hover:text-neutral-950 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              </div>

            </form>
          )}

        </div>

        {lyricsEditingTrack && (
          <LyricsTranscriberModal
            track={lyricsEditingTrack}
            onClose={() => setLyricsEditingTrack(null)}
            onSave={(id, lyrics) => {
              updateTrack(id, { lyrics });
              showToast("Paroles synchronisées enregistrées avec succès !");
            }}
            showToast={showToast}
          />
        )}

        {/* Modal de Confirmation Avant Augmentation des Billets d'une Date Déjà Publiée */}
        {ticketConfirmModal && (
          <div className="fixed inset-0 z-[120] bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-0 space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-800">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-mono-code uppercase tracking-wider text-neutral-950">
                      Augmenter les Billets
                    </h4>
                    <p className="text-xs text-neutral-500 font-mono-code">
                      {ticketConfirmModal.city} — {ticketConfirmModal.venue}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTicketConfirmModal(null)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-950 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Récapitulatif clair avant validation */}
              <div className="p-4 rounded-2xl bg-neutral-50 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500 font-mono-code">Places actuelles :</span>
                  <span className="font-bold text-neutral-950 font-mono-code">{ticketConfirmModal.currentRemaining} restants</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500 font-mono-code">Ajout demandé :</span>
                  <span className="font-bold text-[#1b4332] font-mono-code">+{ticketConfirmModal.amountToAdd} billets</span>
                </div>

                <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between text-xs">
                  <span className="text-neutral-700 font-semibold font-mono-code">Nouveau stock total :</span>
                  <span className="font-bold text-neutral-950 font-mono-code text-sm">
                    {ticketConfirmModal.currentRemaining + ticketConfirmModal.amountToAdd} billets
                  </span>
                </div>

                {/* Statut auto recalculé */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-neutral-500 font-mono-code">Statut automatique :</span>
                  {(() => {
                    const newTotal = ticketConfirmModal.currentRemaining + ticketConfirmModal.amountToAdd;
                    const nextStatus = newTotal <= 0 ? 'Complet' : newTotal <= 25 ? 'Dernières Places' : 'Disponible';
                    return (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono-code ${
                        nextStatus === 'Complet'
                          ? 'bg-neutral-200 text-neutral-700'
                          : nextStatus === 'Dernières Places'
                          ? 'bg-[#6B1724] text-white'
                          : 'bg-[#1b4332] text-white'
                      }`}>
                        {nextStatus}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Sélection ou saisie du nombre de billets à ajouter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider font-mono-code text-neutral-700 block">
                  Sélectionner la quantité :
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 25, 50, 100].map(qty => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setTicketConfirmModal(prev => prev ? { ...prev, amountToAdd: qty } : null)}
                      className={`py-2 text-xs font-bold font-mono-code rounded-xl transition-all cursor-pointer ${
                        ticketConfirmModal.amountToAdd === qty
                          ? 'bg-neutral-950 text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      +{qty}
                    </button>
                  ))}
                </div>
                <div className="pt-1.5">
                  <input
                    type="number"
                    min="1"
                    value={ticketConfirmModal.amountToAdd}
                    onChange={e => {
                      const val = parseInt(e.target.value, 10);
                      setTicketConfirmModal(prev => prev ? { ...prev, amountToAdd: isNaN(val) ? 0 : Math.max(1, val) } : null);
                    }}
                    placeholder="Montant personnalisé..."
                    className="w-full py-2.5 px-3.5 text-xs rounded-xl bg-neutral-100 border-0 font-mono-code focus:outline-none focus:ring-0"
                  />
                </div>
              </div>

              <div className="text-[11px] text-neutral-600 bg-amber-500/10 p-3 rounded-xl border-0 leading-relaxed font-mono-code">
                ⚠️ Cette date est <strong>déjà publiée</strong>. L'augmentation des billets sera immédiatement visible et disponible à la réservation pour les fans.
              </div>

              {/* Actions de confirmation */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTicketConfirmModal(null)}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer font-mono-code uppercase tracking-wider"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (ticketConfirmModal.amountToAdd > 0) {
                      addTicketsToConcert(ticketConfirmModal.concertId, ticketConfirmModal.amountToAdd);
                    }
                    setTicketConfirmModal(null);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-neutral-950 hover:bg-neutral-800 text-white transition-all cursor-pointer font-mono-code uppercase tracking-wider shadow-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Confirmer (+{ticketConfirmModal.amountToAdd})</span>
                </button>
              </div>

            </div>
          </div>
        )}
    </div>
  );
};

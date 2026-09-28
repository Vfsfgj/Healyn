import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  ArtistProfile,
  Track,
  Product,
  Concert,
  TicketTier,
  Announcement,
  Subscriber,
  CartItem,
  TicketOrder,
  ShopOrder,
  AppPage
} from '../types';
import {
  INITIAL_PROFILE,
  INITIAL_TRACKS,
  INITIAL_PRODUCTS,
  INITIAL_CONCERTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_SUBSCRIBERS
} from '../data/initialData';
import { audioEngine } from '../utils/audioEngine';
import {
  db,
  auth,
  googleProvider,
  isUserSuperAdmin,
  SUPER_ADMIN_EMAIL,
  uploadAudioToFirebaseStorage,
  handleFirestoreError,
  OperationType
} from '../firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  fetchAllSupabaseData,
  upsertSupabaseTrack,
  deleteSupabaseTrack,
  upsertSupabaseProduct,
  deleteSupabaseProduct,
  upsertSupabaseConcert,
  deleteSupabaseConcert,
  upsertSupabaseAnnouncement,
  deleteSupabaseAnnouncement,
  insertSupabaseSubscriber,
  deleteSupabaseSubscriber,
  insertSupabaseTicketOrder,
  insertSupabaseShopOrder,
  saveSupabaseProfile,
  isSupabaseConnected,
  uploadAudioToSupabaseStorage,
  subscribeToSupabaseRealtime
} from '../supabase';

export function calculateConcertStatus(tiers: TicketTier[] = []): 'Disponible' | 'Dernières Places' | 'Complet' {
  const total = tiers.reduce((acc, t) => acc + Math.max(0, t.remaining || 0), 0);
  if (total <= 0) return 'Complet';
  if (total <= 25) return 'Dernières Places';
  return 'Disponible';
}

export function parseDurationToSec(durStr?: string): number {
  if (!durStr) return 90;
  const parts = durStr.split(':');
  if (parts.length === 2) {
    const mins = parseInt(parts[0], 10) || 0;
    const secs = parseInt(parts[1], 10) || 0;
    return mins * 60 + secs;
  }
  return 90;
}

interface ArtistContextType {
  currentPage: AppPage;
  setCurrentPage: (page: AppPage) => void;
  profile: ArtistProfile;
  setProfile: (p: ArtistProfile) => void;
  tracks: Track[];
  products: Product[];
  concerts: Concert[];
  announcements: Announcement[];
  subscribers: Subscriber[];
  cart: CartItem[];
  ticketOrders: TicketOrder[];
  shopOrders: ShopOrder[];
  
  // Audio state
  activeTrack: Track | null;
  isPlaying: boolean;
  audioVolume: number;
  playTrack: (track: Track, forceRestart?: boolean) => void;
  togglePlayPause: () => void;
  stopAudio: () => void;
  setAudioVolume: (vol: number) => void;

  // Cart & UI Modals
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  selectedConcertForTicket: Concert | null;
  setSelectedConcertForTicket: (c: Concert | null) => void;
  selectedProductForModal: Product | null;
  setSelectedProductForModal: (p: Product | null) => void;
  selectedAnnouncementForModal: Announcement | null;
  setSelectedAnnouncementForModal: (a: Announcement | null) => void;

  // Cart Actions
  addToCart: (product: Product, variant?: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, qty: number) => void;
  clearCart: () => void;
  completeShopOrder: (customer: { name: string; email: string; address: string; city: string; postalCode: string }) => ShopOrder;

  // Ticket Actions
  bookTickets: (orderData: {
    concert: Concert;
    tierName: string;
    quantity: number;
    unitPrice: number;
    buyerName: string;
    buyerEmail: string;
  }) => TicketOrder;

  // Newsletter
  subscribeNewsletter: (email: string, preferences?: string[]) => { success: boolean; message: string };
  deleteSubscriber: (id: string) => void;

  // Likes / Interactions
  toggleLikeAnnouncement: (id: string) => void;
  toggleFavoriteTrack: (id: string) => void;

  // Admin CRUD operations
  addAnnouncement: (a: Omit<Announcement, 'id' | 'likes'>) => void;
  updateAnnouncement: (id: string, a: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;

  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addConcert: (c: Omit<Concert, 'id'>) => void;
  updateConcert: (id: string, c: Partial<Concert>) => void;
  deleteConcert: (id: string) => void;
  addTicketsToConcert: (concertId: string, count: number) => void;
  setConcertTicketsRemaining: (concertId: string, newRemaining: number) => void;

  addTrack: (t: Omit<Track, 'id' | 'plays'>) => void;
  updateTrack: (id: string, t: Partial<Track>) => void;
  deleteTrack: (id: string) => void;

  // Firebase Authentication & Cloud Storage for Super Admin
  currentUser: User | null;
  isSuperAdmin: boolean;
  isAuthLoading: boolean;
  loginWithGoogle: () => Promise<boolean>;
  logoutSuperAdmin: () => Promise<void>;
  uploadTrackAudio: (file: File, trackId: string, onProgress?: (pct: number) => void) => Promise<{ downloadUrl: string; fileName: string }>;

  resetToDefaultData: () => void;
  toast: string | null;
  showToast: (msg: string) => void;
}

const STORAGE_KEYS = {
  PROFILE: 'healing_artist_profile',
  TRACKS: 'healing_artist_tracks',
  PRODUCTS: 'healing_artist_products',
  CONCERTS: 'healing_artist_concerts',
  ANNOUNCEMENTS: 'healing_artist_announcements',
  SUBSCRIBERS: 'healing_artist_subscribers',
  CART: 'healing_artist_cart',
  ORDERS_SHOP: 'healing_artist_orders_shop',
  ORDERS_TICKETS: 'healing_artist_orders_tickets'
};

const ArtistContext = createContext<ArtistContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Failed to parse localStorage for ${key}`, err);
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Storage error for key ${key}:`, err);
  }
}

const VALID_PAGES: AppPage[] = ['accueil', 'musique', 'boutique', 'concerts', 'actualites', 'le-cercle', 'a-propos'];

function getPageFromHash(): AppPage {
  const hash = window.location.hash.replace('#', '');
  if (VALID_PAGES.includes(hash as AppPage)) {
    return hash as AppPage;
  }
  return 'accueil';
}

export const ArtistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPageState] = useState<AppPage>(() => getPageFromHash());

  // Entity States initialized with cache/fallback
  const [profile, setProfileState] = useState<ArtistProfile>(() => {
    const loaded = loadFromStorage(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
    if (!loaded.stageName || loaded.stageName.toLowerCase() === 'healing' || loaded.name === 'Healing Project') {
      return { ...loaded, name: 'HEALYN', stageName: 'HEALYN' };
    }
    return loaded;
  });
  const [tracks, setTracks] = useState<Track[]>(() => {
    const loaded = loadFromStorage(STORAGE_KEYS.TRACKS, INITIAL_TRACKS);
    const demoIds = new Set(['track-1', 'track-2', 'track-3', 'track-4', 'track-5']);
    const demoTitles = new Set([
      "L'Onde Blanche (432Hz)",
      "Solstice Intérieur",
      "Résonance & Silence IV",
      "Respiration Nocture",
      "Fragments d'Aube"
    ]);
    return (loaded || []).filter(t => !demoIds.has(t.id) && !demoTitles.has(t.title));
  });
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS));
  const [concerts, setConcerts] = useState<Concert[]>(() => loadFromStorage(STORAGE_KEYS.CONCERTS, INITIAL_CONCERTS));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => loadFromStorage(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS));
  const [subscribers, setSubscribers] = useState<Subscriber[]>(() => loadFromStorage(STORAGE_KEYS.SUBSCRIBERS, INITIAL_SUBSCRIBERS));
  const [cart, setCart] = useState<CartItem[]>(() => loadFromStorage(STORAGE_KEYS.CART, []));
  const [ticketOrders, setTicketOrders] = useState<TicketOrder[]>(() => loadFromStorage(STORAGE_KEYS.ORDERS_TICKETS, []));
  const [shopOrders, setShopOrders] = useState<ShopOrder[]>(() => loadFromStorage(STORAGE_KEYS.ORDERS_SHOP, []));

  // Audio Playback
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioVolume, setAudioVolumeState] = useState<number>(0.8);

  // Modals & UI Navigation
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedConcertForTicket, setSelectedConcertForTicket] = useState<Concert | null>(null);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [selectedAnnouncementForModal, setSelectedAnnouncementForModal] = useState<Announcement | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(prev => (prev === msg ? null : prev));
    }, 3200);
  };

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
      if (user && isUserSuperAdmin(user)) {
        sessionStorage.setItem('artist_studio_authenticated', 'true');
      }
    });
    return () => unsubAuth();
  }, []);

  const isSuperAdmin = !!(currentUser && isUserSuperAdmin(currentUser)) || sessionStorage.getItem('artist_studio_authenticated') === 'true';

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (isUserSuperAdmin(user)) {
        sessionStorage.setItem('artist_studio_authenticated', 'true');
        showToast(`Connecté en tant que Super Admin (${user.email}) !`);
        return true;
      } else {
        sessionStorage.setItem('artist_studio_authenticated', 'true'); // Allow access with notice
        showToast(`Connecté : ${user.email}`);
        return true;
      }
    } catch (err) {
      console.error("Erreur de connexion Google:", err);
      showToast("Connexion Google annulée ou indisponible.");
      return false;
    }
  };

  const logoutSuperAdmin = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Erreur de déconnexion:", err);
    }
    sessionStorage.removeItem('artist_studio_authenticated');
    showToast("Session administrateur verrouillée.");
  };

  const uploadTrackAudio = async (
    file: File,
    trackId: string,
    onProgress?: (pct: number) => void
  ) => {
    if (isSupabaseConnected()) {
      return await uploadAudioToSupabaseStorage(file, trackId, onProgress);
    }
    return await uploadAudioToFirebaseStorage(file, trackId, onProgress);
  };

  // ==========================================
  // REAL-TIME FIRESTORE SYNCHRONIZATION (Fallback when Supabase not used)
  // ==========================================
  useEffect(() => {
    // When Supabase is configured, bypass Firestore listeners to avoid '(default) not found' warnings
    if (isSupabaseConnected()) {
      return;
    }

    // 1. Sync Tracks
    const unsubTracks = onSnapshot(collection(db, 'tracks'), (snapshot) => {
      if (!snapshot.empty) {
        const remoteTracks: Track[] = [];
        snapshot.forEach(docSnap => {
          remoteTracks.push(docSnap.data() as Track);
        });
        setTracks(remoteTracks);
      } else if (isSuperAdmin) {
        // Seed initial tracks on Firestore if empty
        INITIAL_TRACKS.forEach(t => {
          setDoc(doc(db, 'tracks', t.id), t).catch(err => {
            console.warn("Initial track seed info:", err);
          });
        });
      }
    }, () => {
      // Offline fallback
    });

    // 2. Sync Products
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      if (!snapshot.empty) {
        const remoteProducts: Product[] = [];
        snapshot.forEach(docSnap => {
          remoteProducts.push(docSnap.data() as Product);
        });
        setProducts(remoteProducts);
      } else if (isSuperAdmin) {
        INITIAL_PRODUCTS.forEach(p => {
          setDoc(doc(db, 'products', p.id), p).catch(err => console.warn(err));
        });
      }
    }, () => {
      // Offline fallback
    });

    // 3. Sync Concerts
    const unsubConcerts = onSnapshot(collection(db, 'concerts'), (snapshot) => {
      if (!snapshot.empty) {
        const remoteConcerts: Concert[] = [];
        snapshot.forEach(docSnap => {
          remoteConcerts.push(docSnap.data() as Concert);
        });
        setConcerts(remoteConcerts);
      } else if (isSuperAdmin) {
        INITIAL_CONCERTS.forEach(c => {
          setDoc(doc(db, 'concerts', c.id), c).catch(err => console.warn(err));
        });
      }
    }, () => {
      // Offline fallback
    });

    // 4. Sync Announcements
    const unsubNews = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      if (!snapshot.empty) {
        const remoteNews: Announcement[] = [];
        snapshot.forEach(docSnap => {
          remoteNews.push(docSnap.data() as Announcement);
        });
        setAnnouncements(remoteNews);
      } else if (isSuperAdmin) {
        INITIAL_ANNOUNCEMENTS.forEach(a => {
          setDoc(doc(db, 'announcements', a.id), a).catch(err => console.warn(err));
        });
      }
    }, () => {
      // Offline fallback
    });

    // 5. Sync Artist Profile
    const unsubProfile = onSnapshot(doc(db, 'settings', 'artistProfile'), (snap) => {
      if (snap.exists()) {
        setProfileState(snap.data() as ArtistProfile);
      } else if (isSuperAdmin) {
        setDoc(doc(db, 'settings', 'artistProfile'), INITIAL_PROFILE).catch(err => console.warn(err));
      }
    }, () => {
      // Offline fallback
    });

    return () => {
      unsubTracks();
      unsubProducts();
      unsubConcerts();
      unsubNews();
      unsubProfile();
    };
  }, [isSuperAdmin]);

  // Sync Admin collections if authenticated
  useEffect(() => {
    if (!isSuperAdmin || isSupabaseConnected()) return;

    const unsubSubscribers = onSnapshot(collection(db, 'subscribers'), (snap) => {
      if (!snap.empty) {
        const list: Subscriber[] = [];
        snap.forEach(d => list.push(d.data() as Subscriber));
        setSubscribers(list);
      }
    }, () => {});

    const unsubTickets = onSnapshot(collection(db, 'ticketOrders'), (snap) => {
      if (!snap.empty) {
        const list: TicketOrder[] = [];
        snap.forEach(d => list.push(d.data() as TicketOrder));
        setTicketOrders(list);
      }
    }, () => {});

    const unsubShop = onSnapshot(collection(db, 'shopOrders'), (snap) => {
      if (!snap.empty) {
        const list: ShopOrder[] = [];
        snap.forEach(d => list.push(d.data() as ShopOrder));
        setShopOrders(list);
      }
    }, () => {});

    return () => {
      unsubSubscribers();
      unsubTickets();
      unsubShop();
    };
  }, [isSuperAdmin]);

  // ==========================================
  // SUPABASE POSTGRESQL LIVE INITIALIZATION & REALTIME
  // ==========================================
  useEffect(() => {
    if (!isSupabaseConnected()) return;

    const loadData = () => {
      fetchAllSupabaseData().then((res) => {
        if (res) {
          if (res.tracks) {
            const demoIds = new Set(['track-1', 'track-2', 'track-3', 'track-4', 'track-5']);
            const demoTitles = new Set([
              "L'Onde Blanche (432Hz)",
              "Solstice Intérieur",
              "Résonance & Silence IV",
              "Respiration Nocture",
              "Fragments d'Aube"
            ]);
            const filteredTracks = res.tracks.filter(t => !demoIds.has(t.id) && !demoTitles.has(t.title));
            setTracks(filteredTracks);
          }
          if (res.products && res.products.length > 0) {
            setProducts(res.products);
          }
          if (res.concerts && res.concerts.length > 0) {
            setConcerts(res.concerts);
          }
          if (res.announcements && res.announcements.length > 0) {
            setAnnouncements(res.announcements);
          }
          if (res.subscribers && res.subscribers.length > 0) {
            setSubscribers(res.subscribers);
          }
          if (res.profile) {
            setProfileState(res.profile);
          }
        }
      }).catch(err => {
        console.warn("Supabase initial load notice:", err);
      });
    };

    // 1. Initial fetch for all visitors
    loadData();

    // 2. Realtime subscription (instant update when admin publishes audio/tracks/products)
    const unsubRealtime = subscribeToSupabaseRealtime(() => {
      loadData();
    });

    return () => {
      unsubRealtime();
    };
  }, []);

  // Page URL Hash Sync
  const setCurrentPage = (page: AppPage) => {
    setCurrentPageState(page);
    const targetHash = page === 'accueil' ? '' : `#${page}`;
    if (window.location.hash !== targetHash) {
      if (page === 'accueil') {
        window.history.pushState(null, '', window.location.pathname);
      } else {
        window.location.hash = page;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const page = getPageFromHash();
      setCurrentPageState(page);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync to localStorage as local cache
  useEffect(() => { saveToStorage(STORAGE_KEYS.PROFILE, profile); }, [profile]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.TRACKS, tracks); }, [tracks]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.PRODUCTS, products); }, [products]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.CONCERTS, concerts); }, [concerts]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, announcements); }, [announcements]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.SUBSCRIBERS, subscribers); }, [subscribers]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.CART, cart); }, [cart]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.ORDERS_SHOP, shopOrders); }, [shopOrders]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.ORDERS_TICKETS, ticketOrders); }, [ticketOrders]);

  useEffect(() => {
    if (activeTrack) {
      const exists = tracks.some(t => t.id === activeTrack.id);
      if (!exists) {
        setActiveTrack(tracks[0] || null);
        if (tracks.length === 0) {
          audioEngine.stop();
          setIsPlaying(false);
        }
      }
    } else if (tracks.length > 0) {
      setActiveTrack(tracks[0]);
    }
  }, [tracks, activeTrack]);

  // Audio Controls
  const playTrack = (track: Track, forceRestart: boolean = false) => {
    const isDifferentTrack = activeTrack?.id !== track.id;
    const durSec = track.durationSec || parseDurationToSec(track.duration);
    const sanitizedTrack = { ...track, durationSec: durSec };
    setActiveTrack(sanitizedTrack);
    setIsPlaying(true);
    audioEngine.play(track.preset, track.audioUrl, durSec, forceRestart || isDifferentTrack);
    showToast(`Lecture en HD : ${track.title} (${track.status})`);
  };

  const togglePlayPause = () => {
    if (!activeTrack) {
      if (tracks.length > 0) {
        playTrack(tracks[0], false);
      }
      return;
    }
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      const durSec = activeTrack.durationSec || parseDurationToSec(activeTrack.duration);
      audioEngine.play(activeTrack.preset, activeTrack.audioUrl, durSec, false);
      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    audioEngine.stop(true);
    setIsPlaying(false);
  };

  const setAudioVolume = (vol: number) => {
    setAudioVolumeState(vol);
    audioEngine.setVolume(vol);
  };

  const setProfile = (newP: ArtistProfile) => {
    setProfileState(newP);
    if (!isSupabaseConnected()) {
      setDoc(doc(db, 'settings', 'artistProfile'), newP).catch(() => {});
    }
    saveSupabaseProfile(newP);
    showToast("Profil de l'artiste mis à jour et synchronisé");
  };

  // Cart Management
  const addToCart = (product: Product, variant?: string, quantity: number = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.productId === product.id && item.selectedVariant === variant);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        const newItem: CartItem = {
          id: `${product.id}-${variant || 'default'}-${Date.now()}`,
          productId: product.id,
          product,
          selectedVariant: variant,
          quantity
        };
        return [...prev, newItem];
      }
    });
    setIsCartOpen(true);
    showToast(`Ajouté au panier : ${product.title}`);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(i => i.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity: qty } : item));
  };

  const clearCart = () => setCart([]);

  const completeShopOrder = (customer: { name: string; email: string; address: string; city: string; postalCode: string }): ShopOrder => {
    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const orderNumber = `HLG-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: ShopOrder = {
      id: `order-${Date.now()}`,
      orderNumber,
      items: [...cart],
      total: subtotal,
      customerName: customer.name,
      customerEmail: customer.email,
      address: customer.address,
      city: customer.city,
      postalCode: customer.postalCode,
      createdAt: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      status: 'Confirmée'
    };

    setShopOrders(prev => [newOrder, ...prev]);

    // Save to Firestore (only if Supabase is not active) and Supabase
    if (!isSupabaseConnected()) {
      setDoc(doc(db, 'shopOrders', newOrder.id), newOrder).catch(() => {});
    }
    insertSupabaseShopOrder(newOrder);

    // Deduct stock
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        const ordered = cart.find(c => c.productId === p.id);
        if (ordered) {
          const newStock = Math.max(0, p.stock - ordered.quantity);
          if (!isSupabaseConnected()) {
            updateDoc(doc(db, 'products', p.id), { stock: newStock }).catch(() => {});
          }
          return { ...p, stock: newStock };
        }
        return p;
      });
    });

    clearCart();
    setIsCartOpen(false);
    showToast(`Commande ${orderNumber} validée avec succès !`);
    return newOrder;
  };

  // Ticket Booking
  const bookTickets = (orderData: {
    concert: Concert;
    tierName: string;
    quantity: number;
    unitPrice: number;
    buyerName: string;
    buyerEmail: string;
  }): TicketOrder => {
    const qrData = `HLG-TCK-${orderData.concert.id}-${Date.now().toString(36).toUpperCase()}`;
    const newTicketOrder: TicketOrder = {
      id: `ticket-${Date.now()}`,
      concertId: orderData.concert.id,
      concertCity: orderData.concert.city,
      venue: orderData.concert.venue,
      date: orderData.concert.formattedDate,
      tierName: orderData.tierName,
      quantity: orderData.quantity,
      unitPrice: orderData.unitPrice,
      totalPrice: orderData.unitPrice * orderData.quantity,
      buyerName: orderData.buyerName,
      buyerEmail: orderData.buyerEmail,
      qrCodeData: qrData,
      createdAt: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    // Save to Firestore and Supabase
    if (!isSupabaseConnected()) {
      setDoc(doc(db, 'ticketOrders', newTicketOrder.id), newTicketOrder).catch(() => {});
    }
    insertSupabaseTicketOrder(newTicketOrder);

    // Deduct remaining tickets
    setConcerts(prevConcerts => {
      return prevConcerts.map(c => {
        if (c.id === orderData.concert.id) {
          const updatedTiers = c.ticketTiers.map(tier => {
            if (tier.name === orderData.tierName) {
               const updatedRemaining = Math.max(0, tier.remaining - orderData.quantity);
               return { ...tier, remaining: updatedRemaining };
            }
            return tier;
          });
          const newStatus = calculateConcertStatus(updatedTiers);
          if (!isSupabaseConnected()) {
            updateDoc(doc(db, 'concerts', c.id), {
              ticketTiers: updatedTiers,
              status: newStatus
            }).catch(() => {});
          }
          return { ...c, ticketTiers: updatedTiers, status: newStatus };
        }
        return c;
      });
    });

    setTicketOrders(prev => [newTicketOrder, ...prev]);
    showToast(`${orderData.quantity} billet(s) confirmés pour ${orderData.concert.city} !`);
    return newTicketOrder;
  };

  // Newsletter
  const subscribeNewsletter = (email: string, preferences: string[] = ['Sorties Musique', 'Préventes Concerts']) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      return { success: false, message: "Veuillez entrer une adresse e-mail valide." };
    }
    const exists = subscribers.some(s => s.email.toLowerCase() === trimmed);
    if (exists) {
      return { success: true, message: "Vous êtes déjà membre du Cercle HEALYN." };
    }
    const newSubscriber: Subscriber = {
      id: `sub-${Date.now()}`,
      email: trimmed,
      subscribedAt: new Date().toISOString().split('T')[0],
      preferences
    };
    setSubscribers(prev => [newSubscriber, ...prev]);
    if (!isSupabaseConnected()) {
      setDoc(doc(db, 'subscribers', newSubscriber.id), newSubscriber).catch(() => {});
    }
    insertSupabaseSubscriber(newSubscriber);
    showToast("Bienvenue dans Le Cercle HEALYN !");
    return { success: true, message: "Bienvenue dans Le Cercle. Vous recevrez nos exclusivités en avant-première." };
  };

  const deleteSubscriber = (id: string) => {
    setSubscribers(prev => prev.filter(s => s.id !== id));
    if (!isSupabaseConnected()) {
      deleteDoc(doc(db, 'subscribers', id)).catch(() => {});
    }
    deleteSupabaseSubscriber(id);
    showToast("Membre retiré du Cercle et de Supabase");
  };

  // Likes & Favorites
  const toggleLikeAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.map(item => {
      if (item.id === id) {
        const isLiked = !item.isLiked;
        const newLikes = isLiked ? item.likes + 1 : Math.max(0, item.likes - 1);
        updateDoc(doc(db, 'announcements', id), { likes: newLikes }).catch(() => {});
        return {
          ...item,
          isLiked,
          likes: newLikes
        };
      }
      return item;
    }));
  };

  const toggleFavoriteTrack = (id: string) => {
    setTracks(prev => prev.map(t => {
      if (t.id === id) {
        const fav = !t.isFavorite;
        showToast(fav ? `Ajouté aux favoris : ${t.title}` : `Retiré des favoris : ${t.title}`);
        return { ...t, isFavorite: fav };
      }
      return t;
    }));
  };

  // Admin CRUD Announcement
  const addAnnouncement = (a: Omit<Announcement, 'id' | 'likes'>) => {
    const newItem: Announcement = {
      ...a,
      id: `news-${Date.now()}`,
      likes: 0
    };
    setAnnouncements(prev => [newItem, ...prev]);
    if (!isSupabaseConnected()) {
      setDoc(doc(db, 'announcements', newItem.id), newItem).catch(() => {});
    }
    upsertSupabaseAnnouncement(newItem);
    showToast("Actualité publiée avec succès");
  };

  const updateAnnouncement = (id: string, a: Partial<Announcement>) => {
    let updatedItem: Announcement | null = null;
    setAnnouncements(prev => prev.map(item => {
      if (item.id === id) {
        const merged = { ...item, ...a };
        updatedItem = merged;
        return merged;
      }
      return item;
    }));
    if (!isSupabaseConnected()) {
      updateDoc(doc(db, 'announcements', id), a).catch(() => {});
    }
    if (updatedItem) upsertSupabaseAnnouncement(updatedItem);
    showToast("Actualité mise à jour");
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(item => item.id !== id));
    if (!isSupabaseConnected()) {
      deleteDoc(doc(db, 'announcements', id)).catch(() => {});
    }
    deleteSupabaseAnnouncement(id);
    showToast("Actualité supprimée");
  };

  // Admin CRUD Product
  const addProduct = (p: Omit<Product, 'id'>) => {
    const newItem: Product = {
      ...p,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => [newItem, ...prev]);
    if (!isSupabaseConnected()) {
      setDoc(doc(db, 'products', newItem.id), newItem).catch(() => {});
    }
    upsertSupabaseProduct(newItem);
    showToast("Produit ajouté à la boutique");
  };

  const updateProduct = (id: string, p: Partial<Product>) => {
    let updatedItem: Product | null = null;
    setProducts(prev => prev.map(item => {
      if (item.id === id) {
        const merged = { ...item, ...p };
        updatedItem = merged;
        return merged;
      }
      return item;
    }));
    if (!isSupabaseConnected()) {
      updateDoc(doc(db, 'products', id), p).catch(() => {});
    }
    if (updatedItem) upsertSupabaseProduct(updatedItem);
    showToast("Produit mis à jour");
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(item => item.id !== id));
    if (!isSupabaseConnected()) {
      deleteDoc(doc(db, 'products', id)).catch(() => {});
    }
    deleteSupabaseProduct(id);
    showToast("Produit retiré");
  };

  // Admin CRUD Concert
  const addConcert = (c: Omit<Concert, 'id'>) => {
    const computedStatus = calculateConcertStatus(c.ticketTiers);
    const newItem: Concert = {
      ...c,
      status: computedStatus,
      id: `tour-${Date.now()}`
    };
    setConcerts(prev => [...prev, newItem]);
    if (!isSupabaseConnected()) {
      setDoc(doc(db, 'concerts', newItem.id), newItem).catch(() => {});
    }
    upsertSupabaseConcert(newItem);
    showToast(`Date de concert ajoutée : ${c.city} (${computedStatus})`);
  };

  const updateConcert = (id: string, c: Partial<Concert>) => {
    let updatedMerged: Concert | null = null;
    setConcerts(prev => prev.map(item => {
      if (item.id === id) {
        const merged = { ...item, ...c };
        if (c.ticketTiers) {
          merged.status = calculateConcertStatus(c.ticketTiers);
        }
        updatedMerged = merged;
        return merged;
      }
      return item;
    }));
    if (updatedMerged) {
      if (!isSupabaseConnected()) {
        updateDoc(doc(db, 'concerts', id), updatedMerged).catch(() => {});
      }
      upsertSupabaseConcert(updatedMerged);
    }
    showToast("Date de concert mise à jour");
  };

  const deleteConcert = (id: string) => {
    setConcerts(prev => prev.filter(item => item.id !== id));
    if (!isSupabaseConnected()) {
      deleteDoc(doc(db, 'concerts', id)).catch(() => {});
    }
    deleteSupabaseConcert(id);
    showToast("Date supprimée");
  };

  const addTicketsToConcert = (concertId: string, count: number) => {
    let targetUpdated: Concert | null = null;
    setConcerts(prev => prev.map(c => {
      if (c.id === concertId) {
        const updatedTiers = c.ticketTiers.map((tier, idx) => {
          if (idx === 0) {
            const newRemaining = Math.max(0, tier.remaining + count);
            const newTotal = (tier.total ?? tier.remaining) + count;
            return { ...tier, remaining: newRemaining, total: newTotal };
          }
          return tier;
        });
        const newStatus = calculateConcertStatus(updatedTiers);
        const totalRemaining = updatedTiers.reduce((acc, t) => acc + Math.max(0, t.remaining || 0), 0);
        showToast(`${count > 0 ? `+${count}` : count} billet(s) pour ${c.city} (${totalRemaining} restants · ${newStatus})`);
        const updatedConcert: Concert = {
          ...c,
          ticketTiers: updatedTiers,
          status: newStatus,
          totalCapacity: (c.totalCapacity ?? totalRemaining) + count
        };
        targetUpdated = updatedConcert;
        return updatedConcert;
      }
      return c;
    }));
    if (targetUpdated) {
      if (!isSupabaseConnected()) {
        updateDoc(doc(db, 'concerts', concertId), targetUpdated).catch(() => {});
      }
      upsertSupabaseConcert(targetUpdated);
    }
  };

  const setConcertTicketsRemaining = (concertId: string, newRemaining: number) => {
    let targetUpdated: Concert | null = null;
    setConcerts(prev => prev.map(c => {
      if (c.id === concertId) {
        const sanitized = Math.max(0, newRemaining);
        const updatedTiers = c.ticketTiers.map((tier, idx) => {
          if (idx === 0) {
            return { ...tier, remaining: sanitized, total: Math.max(tier.total ?? sanitized, sanitized) };
          }
          return { ...tier, remaining: 0 };
        });
        const newStatus = calculateConcertStatus(updatedTiers);
        showToast(`Stock billets ${c.city} : ${sanitized} restant(s) · ${newStatus}`);
        const updatedConcert: Concert = {
          ...c,
          ticketTiers: updatedTiers,
          status: newStatus
        };
        targetUpdated = updatedConcert;
        return updatedConcert;
      }
      return c;
    }));
    if (targetUpdated) {
      if (!isSupabaseConnected()) {
        updateDoc(doc(db, 'concerts', concertId), targetUpdated).catch(() => {});
      }
      upsertSupabaseConcert(targetUpdated);
    }
  };

  // Admin CRUD Track
  const addTrack = (t: Omit<Track, 'id' | 'plays'>) => {
    const newItem: Track = {
      ...t,
      id: `track-${Date.now()}`,
      plays: 0
    };
    setTracks(prev => [newItem, ...prev]);
    if (!isSupabaseConnected()) {
      setDoc(doc(db, 'tracks', newItem.id), newItem).catch(() => {});
    }
    upsertSupabaseTrack(newItem);
    showToast("Extrait musical publié avec succès !");
  };

  const updateTrack = (id: string, t: Partial<Track>) => {
    let updatedItem: Track | null = null;
    setTracks(prev => prev.map(item => {
      if (item.id === id) {
        const merged = { ...item, ...t };
        updatedItem = merged;
        return merged;
      }
      return item;
    }));
    if (!isSupabaseConnected()) {
      updateDoc(doc(db, 'tracks', id), t).catch(() => {});
    }
    if (updatedItem) upsertSupabaseTrack(updatedItem);
    showToast("Morceau et paroles synchronisés !");
  };

  const deleteTrack = (id: string) => {
    const trackToDelete = tracks.find(item => item.id === id);
    setTracks(prev => prev.filter(item => item.id !== id));
    if (activeTrack?.id === id) {
      audioEngine.stop();
      setIsPlaying(false);
      const remaining = tracks.filter(item => item.id !== id);
      setActiveTrack(remaining.length > 0 ? remaining[0] : null);
    }
    if (!isSupabaseConnected()) {
      deleteDoc(doc(db, 'tracks', id)).catch(() => {});
    }
    deleteSupabaseTrack(id, trackToDelete?.audioUrl);
    showToast("Morceau retiré de votre discographie et de Supabase");
  };

  const resetToDefaultData = () => {
    localStorage.clear();
    setProfileState(INITIAL_PROFILE);
    setTracks(INITIAL_TRACKS);
    setProducts(INITIAL_PRODUCTS);
    setConcerts(INITIAL_CONCERTS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setSubscribers(INITIAL_SUBSCRIBERS);
    setCart([]);
    setTicketOrders([]);
    setShopOrders([]);
    showToast("Données réinitialisées aux valeurs initiales de HEALYN");
  };

  return (
    <ArtistContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        profile,
        setProfile,
        tracks,
        products,
        concerts,
        announcements,
        subscribers,
        cart,
        ticketOrders,
        shopOrders,
        activeTrack,
        isPlaying,
        audioVolume,
        playTrack,
        togglePlayPause,
        stopAudio,
        setAudioVolume,
        isCartOpen,
        setIsCartOpen,
        isAdminOpen,
        setIsAdminOpen,
        selectedConcertForTicket,
        setSelectedConcertForTicket,
        selectedProductForModal,
        setSelectedProductForModal,
        selectedAnnouncementForModal,
        setSelectedAnnouncementForModal,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        completeShopOrder,
        bookTickets,
        subscribeNewsletter,
        deleteSubscriber,
        toggleLikeAnnouncement,
        toggleFavoriteTrack,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        addProduct,
        updateProduct,
        deleteProduct,
        addConcert,
        updateConcert,
        deleteConcert,
        addTicketsToConcert,
        setConcertTicketsRemaining,
        addTrack,
        updateTrack,
        deleteTrack,
        currentUser,
        isSuperAdmin,
        isAuthLoading,
        loginWithGoogle,
        logoutSuperAdmin,
        uploadTrackAudio,
        resetToDefaultData,
        toast,
        showToast
      }}
    >
      {children}
    </ArtistContext.Provider>
  );
};

export const useArtist = (): ArtistContextType => {
  const context = useContext(ArtistContext);
  if (!context) {
    throw new Error('useArtist must be used within an ArtistProvider');
  }
  return context;
};

export interface ArtistProfile {
  name: string;
  stageName: string;
  tagline: string;
  bio: string;
  statement: string;
  city: string;
  heroImage: string;
  latestRelease: {
    title: string;
    type: string;
    year: string;
    coverImage: string;
  };
  socials: {
    spotify: string;
    appleMusic: string;
    instagram: string;
    youtube: string;
    soundcloud: string;
    x: string;
  };
}

export type TrackStatus = 'Extrait Exclusif' | 'Nouveau Single' | 'Album à venir' | 'Sorti';

export type AudioPreset = 'ambient' | 'synthwave' | 'minimal' | 'neoclassical' | 'chillpulse';

export interface LyricLine {
  timeSec: number;
  text: string;
}

export interface Track {
  id: string;
  title: string;
  duration: string;
  durationSec: number;
  bpm: number;
  key: string;
  releaseDate: string;
  status: TrackStatus;
  genre: string;
  description: string;
  preset: AudioPreset;
  audioUrl?: string;
  audioFileName?: string;
  coverUrl: string;
  plays: number;
  isFavorite?: boolean;
  lyrics?: LyricLine[];
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  title: string;
  category: 'Vinyles & Disques' | 'Textiles & Merch' | 'Art & Sérigraphie' | 'Édition Collector';
  price: number;
  stock: number;
  maxStock: number;
  isLimitedEdition: boolean;
  description: string;
  details: string[];
  imageUrl: string;
  variants?: {
    type: string;
    options: string[];
  };
}

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  remaining: number;
  total?: number;
  description: string;
}

export interface Concert {
  id: string;
  date: string;
  formattedDate: string;
  city: string;
  venue: string;
  country: string;
  status: 'Disponible' | 'Dernières Places' | 'Complet';
  doorsOpen: string;
  ticketTiers: TicketTier[];
  totalCapacity?: number;
}

export interface Announcement {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'Sortie Musique' | 'Tournée' | 'Studio' | 'Boutique';
  date: string;
  readTime: string;
  imageUrl?: string;
  likes: number;
  isLiked?: boolean;
  pinned?: boolean;
}

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  preferences: string[];
}

export interface CartItem {
  id: string; // unique item cart entry id
  productId: string;
  product: Product;
  selectedVariant?: string;
  quantity: number;
}

export interface TicketOrder {
  id: string;
  concertId: string;
  concertCity: string;
  venue: string;
  date: string;
  tierName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  buyerName: string;
  buyerEmail: string;
  qrCodeData: string;
  createdAt: string;
}

export interface ShopOrder {
  id: string;
  orderNumber: string;
  items: CartItem[];
  total: number;
  customerName: string;
  customerEmail: string;
  address: string;
  city: string;
  postalCode: string;
  createdAt: string;
  status: 'Confirmée' | 'En préparation' | 'Expédiée';
}

export type AppPage = 'accueil' | 'musique' | 'boutique' | 'concerts' | 'actualites' | 'le-cercle' | 'a-propos';

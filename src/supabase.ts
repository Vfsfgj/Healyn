import { createClient, SupabaseClient } from '@supabase/supabase-js';
import initialConfig from '../supabase-config.json';
import { Track, Product, Concert, Announcement, Subscriber, ShopOrder, TicketOrder, ArtistProfile } from './types';

export const DEFAULT_SUPABASE_URL = "https://fbcehxsspduhfjrjsnsf.supabase.co";
export const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_pmTz1cJKH14KO8oV7F33tg_MwASeoXC";

const STORAGE_SUPABASE_URL = 'healyn_supabase_url';
const STORAGE_SUPABASE_ANON_KEY = 'healyn_supabase_anon_key';

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = localStorage.getItem(STORAGE_SUPABASE_URL) || '';
  const localKey = localStorage.getItem(STORAGE_SUPABASE_ANON_KEY) || '';

  const jsonUrl = (initialConfig as any).supabaseUrl || '';
  const jsonKey = (initialConfig as any).supabaseAnonKey || '';

  const url = envUrl || localUrl || jsonUrl || DEFAULT_SUPABASE_URL;
  const anonKey = envKey || localKey || jsonKey || DEFAULT_SUPABASE_ANON_KEY;

  return {
    url: url.trim(),
    anonKey: anonKey.trim()
  };
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (url) {
    localStorage.setItem(STORAGE_SUPABASE_URL, url.trim());
  } else {
    localStorage.removeItem(STORAGE_SUPABASE_URL);
  }

  if (anonKey) {
    localStorage.setItem(STORAGE_SUPABASE_ANON_KEY, anonKey.trim());
  } else {
    localStorage.removeItem(STORAGE_SUPABASE_ANON_KEY);
  }
}

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();

  if (!url || !anonKey) {
    return null;
  }

  if (cachedClient && lastUrl === url && lastKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    lastUrl = url;
    lastKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error("Erreur initialisation client Supabase:", err);
    return null;
  }
}

export function isSupabaseConnected(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey && url.startsWith('http'));
}

// ----------------------------------------------------
// DATABASE SYNC HELPERS
// ----------------------------------------------------

export async function fetchAllSupabaseData() {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const [tracksRes, productsRes, concertsRes, newsRes, subsRes, profileRes] = await Promise.all([
      client.from('tracks').select('*'),
      client.from('products').select('*'),
      client.from('concerts').select('*'),
      client.from('announcements').select('*'),
      client.from('subscribers').select('*'),
      client.from('artist_profile').select('*').limit(1)
    ]);

    const result: {
      tracks?: Track[];
      products?: Product[];
      concerts?: Concert[];
      announcements?: Announcement[];
      subscribers?: Subscriber[];
      profile?: ArtistProfile;
    } = {};

    if (tracksRes.data && tracksRes.data.length > 0) {
      result.tracks = tracksRes.data.map((r: any) => ({
        id: r.id,
        title: r.title,
        duration: r.duration,
        durationSec: r.duration_sec,
        bpm: r.bpm,
        key: r.key,
        releaseDate: r.release_date,
        status: r.status,
        genre: r.genre,
        description: r.description,
        preset: r.preset,
        coverUrl: r.cover_url,
        audioUrl: r.audio_url,
        audioFileName: r.audio_file_name,
        plays: r.plays || 0,
        lyrics: typeof r.lyrics === 'string' ? (() => { try { return JSON.parse(r.lyrics); } catch { return []; } })() : (Array.isArray(r.lyrics) ? r.lyrics : []),
        isFavorite: r.is_favorite || false
      }));
    }

    if (productsRes.data && productsRes.data.length > 0) {
      result.products = productsRes.data.map((r: any) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        price: Number(r.price),
        stock: r.stock,
        maxStock: r.max_stock,
        isLimitedEdition: r.is_limited_edition,
        description: r.description,
        details: r.details || [],
        imageUrl: r.image_url,
        variants: (r.variants && typeof r.variants === 'object' && !Array.isArray(r.variants) && Array.isArray(r.variants.options) && r.variants.options.length > 0)
          ? { type: r.variants.type || 'Format', options: r.variants.options }
          : (typeof r.variants === 'string' ? (() => {
              try {
                const parsed = JSON.parse(r.variants);
                return (parsed && Array.isArray(parsed.options) && parsed.options.length > 0) ? { type: parsed.type || 'Format', options: parsed.options } : undefined;
              } catch {
                return undefined;
              }
            })() : undefined)
      }));
    }

    if (concertsRes.data && concertsRes.data.length > 0) {
      result.concerts = concertsRes.data.map((r: any) => ({
        id: r.id,
        date: r.date,
        formattedDate: r.formatted_date,
        city: r.city,
        venue: r.venue,
        country: r.country || 'France',
        status: r.status,
        doorsOpen: r.doors_open || '20:00',
        ticketTiers: r.ticket_tiers || [],
        totalCapacity: r.total_capacity
      }));
    }

    if (newsRes.data && newsRes.data.length > 0) {
      result.announcements = newsRes.data.map((r: any) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        summary: r.summary,
        content: r.content,
        date: r.date,
        readTime: r.read_time,
        imageUrl: r.image_url,
        pinned: r.pinned,
        likes: r.likes || 0
      }));
    }

    if (subsRes.data && subsRes.data.length > 0) {
      result.subscribers = subsRes.data.map((r: any) => ({
        id: r.id,
        email: r.email,
        subscribedAt: r.subscribed_at,
        preferences: r.preferences || []
      }));
    }

    if (profileRes.data && profileRes.data.length > 0 && profileRes.data[0].data) {
      result.profile = profileRes.data[0].data as ArtistProfile;
    }

    return result;
  } catch (err) {
    console.warn("Supabase fetch warning:", err);
    return null;
  }
}

export async function upsertSupabaseTrack(track: Track) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('tracks').upsert({
      id: track.id,
      title: track.title,
      duration: track.duration,
      duration_sec: track.durationSec,
      bpm: track.bpm,
      key: track.key,
      release_date: track.releaseDate,
      status: track.status,
      genre: track.genre,
      description: track.description,
      preset: track.preset,
      cover_url: track.coverUrl,
      audio_url: track.audioUrl || null,
      audio_file_name: track.audioFileName || null,
      plays: track.plays || 0,
      lyrics: track.lyrics || [],
      is_favorite: track.isFavorite || false
    });
  } catch (err) {
    console.warn("Supabase upsertTrack error:", err);
  }
}

export async function deleteSupabaseTrack(id: string, audioUrl?: string) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    // 1. Delete from database table
    await client.from('tracks').delete().eq('id', id);

    // 2. Also remove storage file if hosted on Supabase Storage
    if (audioUrl && audioUrl.includes('/audio/')) {
      const parts = audioUrl.split('/audio/');
      if (parts[1]) {
        const filePath = decodeURIComponent(parts[1].split('?')[0]);
        await client.storage.from('audio').remove([filePath]);
      }
    }
  } catch (err) {
    console.warn("Supabase deleteTrack error:", err);
  }
}

export async function upsertSupabaseProduct(product: Product) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('products').upsert({
      id: product.id,
      title: product.title,
      category: product.category,
      price: product.price,
      stock: product.stock,
      max_stock: product.maxStock,
      is_limited_edition: product.isLimitedEdition ?? true,
      description: product.description,
      details: product.details || [],
      image_url: product.imageUrl,
      variants: product.variants || null
    });
  } catch (err) {
    console.warn("Supabase upsertProduct error:", err);
  }
}

export async function deleteSupabaseProduct(id: string) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('products').delete().eq('id', id);
  } catch (err) {
    console.warn("Supabase deleteProduct error:", err);
  }
}

export async function upsertSupabaseConcert(concert: Concert) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('concerts').upsert({
      id: concert.id,
      date: concert.date,
      formatted_date: concert.formattedDate,
      city: concert.city,
      venue: concert.venue,
      status: concert.status,
      ticket_tiers: concert.ticketTiers || [],
      total_capacity: concert.totalCapacity || 500,
      coordinates: (concert as any).coordinates || null
    });
  } catch (err) {
    console.warn("Supabase upsertConcert error:", err);
  }
}

export async function deleteSupabaseConcert(id: string) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('concerts').delete().eq('id', id);
  } catch (err) {
    console.warn("Supabase deleteConcert error:", err);
  }
}

export async function upsertSupabaseAnnouncement(news: Announcement) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('announcements').upsert({
      id: news.id,
      title: news.title,
      category: news.category,
      summary: news.summary,
      content: news.content,
      date: news.date,
      read_time: news.readTime,
      image_url: news.imageUrl || null,
      pinned: news.pinned || false,
      likes: news.likes || 0
    });
  } catch (err) {
    console.warn("Supabase upsertAnnouncement error:", err);
  }
}

export async function deleteSupabaseAnnouncement(id: string) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('announcements').delete().eq('id', id);
  } catch (err) {
    console.warn("Supabase deleteAnnouncement error:", err);
  }
}

export async function insertSupabaseSubscriber(sub: Subscriber) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('subscribers').upsert({
      id: sub.id,
      email: sub.email,
      subscribed_at: sub.subscribedAt,
      preferences: sub.preferences || []
    });
  } catch (err) {
    console.warn("Supabase insertSubscriber error:", err);
  }
}

export async function deleteSupabaseSubscriber(id: string) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('subscribers').delete().eq('id', id);
  } catch (err) {
    console.warn("Supabase deleteSubscriber error:", err);
  }
}

export async function insertSupabaseTicketOrder(order: TicketOrder) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('ticket_orders').insert({
      id: order.id,
      concert_id: order.concertId,
      concert_city: order.concertCity,
      venue: order.venue,
      date: order.date,
      tier_name: order.tierName,
      quantity: order.quantity,
      unit_price: order.unitPrice,
      total_price: order.totalPrice,
      buyer_name: order.buyerName,
      buyer_email: order.buyerEmail,
      qr_code_data: order.qrCodeData,
      created_at: order.createdAt
    });
  } catch (err) {
    console.warn("Supabase insertTicketOrder error:", err);
  }
}

export async function insertSupabaseShopOrder(order: ShopOrder) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('shop_orders').insert({
      id: order.id,
      order_number: order.orderNumber,
      items: order.items,
      total: order.total,
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      address: order.address,
      city: order.city,
      postal_code: order.postalCode,
      status: order.status,
      created_at: order.createdAt
    });
  } catch (err) {
    console.warn("Supabase insertShopOrder error:", err);
  }
}

export async function saveSupabaseProfile(profile: ArtistProfile) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('artist_profile').upsert({
      id: 'main_profile',
      data: profile,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Supabase saveProfile error:", err);
  }
}

// SQL Schema for Supabase SQL Editor
export const SUPABASE_SETUP_SQL = `-- ==========================================
-- SCRIPT SQL D'INITIALISATION POUR SUPABASE
-- Projet: https://fbcehxsspduhfjrjsnsf.supabase.co
-- À exécuter dans: Supabase > SQL Editor > New query > Run
-- ==========================================

-- 1. Table des Morceaux / Tracks
CREATE TABLE IF NOT EXISTS public.tracks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  duration TEXT NOT NULL,
  duration_sec INT DEFAULT 90,
  bpm INT DEFAULT 120,
  key TEXT,
  release_date TEXT,
  status TEXT DEFAULT 'Disponible',
  genre TEXT DEFAULT 'Ambient & Électronique',
  description TEXT,
  preset TEXT DEFAULT 'ambient',
  cover_url TEXT,
  audio_url TEXT,
  audio_file_name TEXT,
  plays INT DEFAULT 0,
  lyrics JSONB DEFAULT '[]'::jsonb,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des Produits Boutique / Products
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  stock INT DEFAULT 10,
  max_stock INT DEFAULT 10,
  is_limited_edition BOOLEAN DEFAULT true,
  description TEXT,
  details JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  variants JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table des Concerts / Dates de Tournée
CREATE TABLE IF NOT EXISTS public.concerts (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  formatted_date TEXT NOT NULL,
  city TEXT NOT NULL,
  venue TEXT NOT NULL,
  status TEXT DEFAULT 'Disponible',
  ticket_tiers JSONB DEFAULT '[]'::jsonb,
  total_capacity INT DEFAULT 500,
  coordinates JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table des Actualités / Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  date TEXT NOT NULL,
  read_time TEXT DEFAULT '2 min de lecture',
  image_url TEXT,
  pinned BOOLEAN DEFAULT false,
  likes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Table des Abonnés Newsletter (Le Cercle HEALYN)
CREATE TABLE IF NOT EXISTS public.subscribers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TEXT NOT NULL,
  preferences JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Table des Commandes Billetterie
CREATE TABLE IF NOT EXISTS public.ticket_orders (
  id TEXT PRIMARY KEY,
  concert_id TEXT NOT NULL,
  concert_city TEXT NOT NULL,
  venue TEXT NOT NULL,
  date TEXT NOT NULL,
  tier_name TEXT NOT NULL,
  quantity INT NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  qr_code_data TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- 7. Table des Commandes Boutique
CREATE TABLE IF NOT EXISTS public.shop_orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  status TEXT DEFAULT 'Confirmée',
  created_at TEXT NOT NULL
);

-- 8. Table des Paramètres & Profil Artiste
CREATE TABLE IF NOT EXISTS public.artist_profile (
  id TEXT PRIMARY KEY DEFAULT 'main_profile',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer Row Level Security (RLS) et politiques d'accès
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_profile ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité (Lecture et Écriture autorisées)
CREATE POLICY "Allow public read tracks" ON public.tracks FOR SELECT USING (true);
CREATE POLICY "Allow public insert tracks" ON public.tracks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update tracks" ON public.tracks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete tracks" ON public.tracks FOR DELETE USING (true);

CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Allow public read concerts" ON public.concerts FOR SELECT USING (true);
CREATE POLICY "Allow public insert concerts" ON public.concerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update concerts" ON public.concerts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete concerts" ON public.concerts FOR DELETE USING (true);

CREATE POLICY "Allow public read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Allow public insert announcements" ON public.announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update announcements" ON public.announcements FOR UPDATE USING (true);
CREATE POLICY "Allow public delete announcements" ON public.announcements FOR DELETE USING (true);

CREATE POLICY "Allow public insert subscribers" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read subscribers" ON public.subscribers FOR SELECT USING (true);
CREATE POLICY "Allow public delete subscribers" ON public.subscribers FOR DELETE USING (true);

CREATE POLICY "Allow public insert ticket_orders" ON public.ticket_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read ticket_orders" ON public.ticket_orders FOR SELECT USING (true);

CREATE POLICY "Allow public insert shop_orders" ON public.shop_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read shop_orders" ON public.shop_orders FOR SELECT USING (true);

CREATE POLICY "Allow public read artist_profile" ON public.artist_profile FOR SELECT USING (true);
CREATE POLICY "Allow public insert artist_profile" ON public.artist_profile FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update artist_profile" ON public.artist_profile FOR UPDATE USING (true);

-- 9. Bucket Supabase Storage pour Fichiers Audio & Extraits
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Allow public read audio bucket" ON storage.objects FOR SELECT USING (bucket_id = 'audio');
CREATE POLICY "Allow public upload audio bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'audio');
CREATE POLICY "Allow public update audio bucket" ON storage.objects FOR UPDATE USING (bucket_id = 'audio');
CREATE POLICY "Allow public delete audio bucket" ON storage.objects FOR DELETE USING (bucket_id = 'audio');
`;

export async function uploadAudioToSupabaseStorage(
  file: File,
  trackId: string,
  onProgress?: (progress: number) => void
): Promise<{ downloadUrl: string; fileName: string }> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error("Client Supabase non initialisé");
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `track_${trackId}_${Date.now()}_${sanitizedName}`;

  if (onProgress) onProgress(25);

  const bucketName = 'audio';
  const { error } = await client.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'audio/mpeg'
    });

  if (error) {
    console.warn("Supabase storage upload notice:", error);
    throw error;
  }

  if (onProgress) onProgress(85);

  const { data: publicUrlData } = client.storage.from(bucketName).getPublicUrl(filePath);

  if (onProgress) onProgress(100);

  return {
    downloadUrl: publicUrlData.publicUrl,
    fileName: file.name
  };
}

export function subscribeToSupabaseRealtime(onDataChanged: () => void): () => void {
  const client = getSupabaseClient();
  if (!client) return () => {};

  try {
    const channel = client
      .channel('public:healyn_live_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        () => {
          onDataChanged();
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.warn("Supabase Realtime subscription notice:", err);
    return () => {};
  }
}

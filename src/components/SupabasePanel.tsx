import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Save,
  Key,
  Globe,
  Sparkles,
  Layers,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  getSupabaseClient,
  isSupabaseConnected,
  SUPABASE_SETUP_SQL
} from '../supabase';
import { useArtist } from '../context/ArtistContext';

export const SupabasePanel: React.FC = () => {
  const { showToast, tracks, products, concerts, announcements, subscribers } = useArtist();

  const [creds, setCreds] = useState(() => getSupabaseCredentials());
  const [copiedSql, setCopiedSql] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncingData, setSyncingData] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>(() => {
    return isSupabaseConnected() ? 'success' : 'idle';
  });
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    showToast("Script SQL copié dans le presse-papier !");
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creds.url.trim() || !creds.anonKey.trim()) {
      showToast("Veuillez renseigner l'URL et la clé anonyme de votre projet Supabase.");
      return;
    }

    saveSupabaseCredentials(creds.url.trim(), creds.anonKey.trim());
    setTestingConnection(true);
    setStatusMessage("Test de connexion en cours...");

    const client = getSupabaseClient();
    if (!client) {
      setConnectionStatus('error');
      setStatusMessage("URL ou clé invalide.");
      setTestingConnection(false);
      return;
    }

    try {
      // Test read on tracks or public table
      const { data, error } = await client.from('tracks').select('id').limit(1);

      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          setConnectionStatus('success');
          setStatusMessage("Connexion réussie ! Pensez à exécuter le script SQL ci-dessous pour créer les tables.");
          showToast("Connecté à Supabase ! Tables à initialiser avec le script SQL.");
        } else {
          setConnectionStatus('error');
          setStatusMessage(`Erreur Supabase : ${error.message}`);
          showToast(`Erreur : ${error.message}`);
        }
      } else {
        setConnectionStatus('success');
        setStatusMessage("Connexion réussie et base de données prête !");
        showToast("Base de données Supabase connectée avec succès !");
      }
    } catch (err: any) {
      setConnectionStatus('error');
      setStatusMessage(`Erreur de connexion : ${err.message || 'Vérifiez votre URL'}`);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSyncAllToSupabase = async () => {
    const client = getSupabaseClient();
    if (!client) {
      showToast("Veuillez d'abord configurer et enregistrer vos identifiants Supabase.");
      return;
    }

    setSyncingData(true);
    try {
      // 1. Sync tracks
      if (tracks.length > 0) {
        const mappedTracks = tracks.map(t => ({
          id: t.id,
          title: t.title,
          duration: t.duration,
          duration_sec: t.durationSec || 90,
          bpm: t.bpm || 120,
          key: t.key || 'C Min',
          release_date: t.releaseDate || 'Actuel',
          status: t.status,
          genre: t.genre,
          description: t.description,
          preset: t.preset,
          cover_url: t.coverUrl,
          audio_url: t.audioUrl || null,
          audio_file_name: t.audioFileName || null,
          plays: t.plays || 0,
          lyrics: t.lyrics || [],
          is_favorite: t.isFavorite || false
        }));
        await client.from('tracks').upsert(mappedTracks);
      }

      // 2. Sync products
      if (products.length > 0) {
        const mappedProducts = products.map(p => ({
          id: p.id,
          title: p.title,
          category: p.category,
          price: p.price,
          stock: p.stock,
          max_stock: p.maxStock,
          is_limited_edition: p.isLimitedEdition ?? true,
          description: p.description,
          details: p.details || [],
          image_url: p.imageUrl,
          variants: p.variants || []
        }));
        await client.from('products').upsert(mappedProducts);
      }

      // 3. Sync concerts
      if (concerts.length > 0) {
        const mappedConcerts = concerts.map(c => ({
          id: c.id,
          date: c.date,
          formatted_date: c.formattedDate,
          city: c.city,
          venue: c.venue,
          status: c.status,
          ticket_tiers: c.ticketTiers || [],
          total_capacity: c.totalCapacity || 500,
          coordinates: (c as any).coordinates || null
        }));
        await client.from('concerts').upsert(mappedConcerts);
      }

      // 4. Sync announcements
      if (announcements.length > 0) {
        const mappedNews = announcements.map(a => ({
          id: a.id,
          title: a.title,
          category: a.category,
          summary: a.summary,
          content: a.content,
          date: a.date,
          read_time: a.readTime || '2 min',
          image_url: a.imageUrl || null,
          pinned: a.pinned || false,
          likes: a.likes || 0
        }));
        await client.from('announcements').upsert(mappedNews);
      }

      // 5. Sync subscribers
      if (subscribers.length > 0) {
        const mappedSubs = subscribers.map(s => ({
          id: s.id,
          email: s.email,
          subscribed_at: s.subscribedAt,
          preferences: s.preferences || []
        }));
        await client.from('subscribers').upsert(mappedSubs);
      }

      showToast("Toutes vos données ont été synchronisées vers Supabase !");
    } catch (err: any) {
      console.error("Sync error:", err);
      showToast(`Erreur lors de la synchronisation : ${err.message || 'Vérifiez la console'}`);
    } finally {
      setSyncingData(false);
    }
  };

  const isConnected = connectionStatus === 'success' || isSupabaseConnected();

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-neutral-900 to-neutral-950 text-white rounded-3xl p-6 sm:p-8 border border-emerald-900/40 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono-code">
              <Database className="w-3.5 h-3.5" />
              <span>Base de Données PostgreSQL Supabase</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Connexion Supabase pour HEALYN
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
              Connectez votre projet Supabase officiel. Vos morceaux de musique, commandes de boutique, réservations de billets et abonnés au Cercle seront stockés dans votre base de données PostgreSQL temps réel.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className={`px-4 py-2 rounded-2xl flex items-center gap-2.5 text-xs font-mono-code border ${
              isConnected
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                : 'bg-neutral-800/80 border-neutral-700 text-neutral-400'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
              <span>{isConnected ? 'Supabase Actif' : 'Non Connecté'}</span>
            </div>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-2xl bg-white text-neutral-950 hover:bg-neutral-100 transition-colors text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <span>Console Supabase</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Credentials Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider font-mono-code text-neutral-950">
                    Identifiants de votre Projet
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-mono-code">
                    Disponibles dans Project Settings &gt; API
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveAndTest} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-800 block mb-1.5 font-mono-code">
                  Project URL (URL de votre projet Supabase) :
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="url"
                    required
                    value={creds.url}
                    onChange={e => setCreds(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://votre-projet.supabase.co"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-0 text-sm font-mono-code bg-neutral-100 focus:bg-neutral-200/80 focus:outline-none focus:ring-0 transition-all"
                  />
                </div>
                <p className="text-[10px] text-neutral-400 mt-1 font-mono-code">
                  Exemple : https://abcdefghijklm.supabase.co
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-800 block mb-1.5 font-mono-code">
                  Anon / Public Key (Clé API Anonyme Publique) :
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="password"
                    required
                    value={creds.anonKey}
                    onChange={e => setCreds(prev => ({ ...prev, anonKey: e.target.value }))}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-0 text-sm font-mono-code bg-neutral-100 focus:bg-neutral-200/80 focus:outline-none focus:ring-0 transition-all"
                  />
                </div>
                <p className="text-[10px] text-neutral-400 mt-1 font-mono-code">
                  Cette clé permet les lectures et écritures selon les politiques Row Level Security (RLS).
                </p>
              </div>

              {statusMessage && (
                <div className={`p-3.5 rounded-2xl text-xs font-mono-code flex items-start gap-2.5 ${
                  connectionStatus === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-red-50 text-red-900 border border-red-200'
                }`}>
                  {connectionStatus === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <span>{statusMessage}</span>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={testingConnection}
                  className="flex-1 py-3 px-5 bg-neutral-950 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {testingConnection ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{testingConnection ? 'Vérification...' : 'Enregistrer & Tester la Connexion'}</span>
                </button>

                {isConnected && (
                  <button
                    type="button"
                    onClick={handleSyncAllToSupabase}
                    disabled={syncingData}
                    className="py-3 px-5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {syncingData ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Layers className="w-4 h-4" />
                    )}
                    <span>{syncingData ? 'Synchronisation...' : 'Exporter Données vers Supabase'}</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Quick Guide */}
          <div className="bg-neutral-50 rounded-3xl p-6 border border-neutral-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono-code text-neutral-900">
              Guide d'installation rapide en 3 étapes :
            </h4>
            <ol className="text-xs text-neutral-600 space-y-2 list-decimal list-inside leading-relaxed font-sans">
              <li>
                Créez un projet sur <b>supabase.com</b> (formule gratuite généreuse).
              </li>
              <li>
                Dans votre tableau de bord Supabase, allez dans <b>SQL Editor</b>, collez le script ci-contre et cliquez sur <b>Run</b>.
              </li>
              <li>
                Allez dans <b>Project Settings &gt; API</b>, copiez l'URL et la clé <b>anon/public</b>, collez-les ci-dessus et enregistrez.
              </li>
            </ol>
          </div>
        </div>

        {/* Right Column: SQL Schema Ready to Run */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-neutral-900 text-neutral-100 rounded-3xl p-6 sm:p-7 border border-neutral-800 shadow-md flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono-code text-white">
                  Script SQL d'Initialisation
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopySql}
                className="py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-mono-code flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedSql ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le SQL</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Ce script crée automatiquement toutes les tables (morceaux, produits, concerts, commandes, actualités, abonnés) ainsi que les politiques de sécurité (Row Level Security).
            </p>

            <div className="relative flex-1 bg-black/60 rounded-2xl p-4 border border-neutral-800 overflow-hidden font-mono-code text-[11px] text-emerald-300">
              <pre className="overflow-x-auto overflow-y-auto max-h-[380px] scrollbar-thin text-neutral-300">
                {SUPABASE_SETUP_SQL}
              </pre>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-neutral-400 font-mono-code">
              <span>8 tables · Bucket Storage Audio · RLS activé</span>
              <a
                href="https://supabase.com/dashboard/project/_/sql"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Ouvrir SQL Editor</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

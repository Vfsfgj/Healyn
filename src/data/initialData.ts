import {
  ArtistProfile,
  Track,
  Product,
  Concert,
  Announcement,
  Subscriber
} from '../types';

export const INITIAL_PROFILE: ArtistProfile = {
  name: "HEALYN",
  stageName: "HEALYN",
  tagline: "",
  bio: "HEALYN est un projet musical et artistique immersif explorant les fréquences sonores thérapeutiques, le piano contemporain et les textures électroniques modulaires. Pensé comme un refuge auditif, HEALYN sculpte des espaces où chaque onde sonore favorise l'apaisement, la résonance intérieure et la méditation profonde.",
  statement: "« La musique n'est pas seulement un art, c'est une fréquence de guérison et de reconnexion au silence. »",
  city: "Paris / Tokyo / Berlin",
  heroImage: "/src/assets/images/hero_artist_portrait_1790345746015.jpg",
  latestRelease: {
    title: "Restoration (Part I & II)",
    type: "Double Album & Vinyle Audiophile 180g",
    year: "2026",
    coverImage: "/src/assets/images/album_vinyl_artwork_1790345759457.jpg"
  },
  socials: {
    spotify: "https://open.spotify.com",
    appleMusic: "https://music.apple.com",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    soundcloud: "https://soundcloud.com",
    x: "https://x.com"
  }
};

export const INITIAL_TRACKS: Track[] = [];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-vinyl-white",
    title: "Restoration — Vinyle Collector 180g (White Marble)",
    category: "Vinyles & Disques",
    price: 39,
    stock: 24,
    maxStock: 300,
    isLimitedEdition: true,
    description: "Édition audiophile limitée pressée sur vinyle blanc marbré 180 grammes par healing. Pochette gatefold gaufrée avec livret de méditation et code FLAC 24-bit.",
    details: [
      "Masterisé pour le vinyle en studio analogique",
      "Pressage haute fidélité 180g, 33 tours",
      "Téléchargement WAV / FLAC 24-bit inclus",
      "Numéroté à la main (1 à 300 exemplaires)"
    ],
    imageUrl: "/src/assets/images/album_vinyl_artwork_1790345759457.jpg",
    variants: {
      type: "Format",
      options: ["Vinyle Collector Marbré", "Vinyle Noir Classique", "Bundle Vinyle + T-shirt"]
    }
  },
  {
    id: "prod-hoodie-heavy",
    title: "Sweat à Capuche 'healing' — 480 GSM Coton Bio",
    category: "Textiles & Merch",
    price: 85,
    stock: 18,
    maxStock: 100,
    isLimitedEdition: true,
    description: "Sweat lourd coupe boxy confectionné au Portugal en coton 100% biologique certifié GOTS. Broderie discrète 'healing' au niveau du cœur et typographie au dos.",
    details: [
      "Poids ultra-lourd 480 g/m², molleton gratté doux",
      "Capuche double épaisseur sans cordon pour une ligne pure",
      "Confection éthique et responsable à Porto",
      "Couleur : Noir Minéral délavé aux pigments naturels"
    ],
    imageUrl: "/src/assets/images/product_merch_hoodie_1790345771258.jpg",
    variants: {
      type: "Taille",
      options: ["S (Oversized)", "M (Oversized)", "L (Oversized)", "XL (Oversized)"]
    }
  },
  {
    id: "prod-art-print",
    title: "Sérigraphie 'Ondes & Guérison' (40 × 60 cm)",
    category: "Art & Sérigraphie",
    price: 65,
    stock: 12,
    maxStock: 50,
    isLimitedEdition: true,
    description: "Tirage d'art sérigraphié artisanalement à 2 passages d'encre sur papier d'art vélin d'Arches 300g. Chaque pièce est numérotée et signée par l'artiste du projet healing.",
    details: [
      "Dimensions : 40 x 60 cm (format cadre standard)",
      "Papier pur chiffon Arches 300g sans acide, bords frangés",
      "Tirage strict limité à 50 exemplaires dans le monde",
      "Certificat d'authenticité signé inclus"
    ],
    imageUrl: "/src/assets/images/concert_stage_atmosphere_1790345781544.jpg"
  },
  {
    id: "prod-digital-stems",
    title: "Stems Pack & Stéréo Master FLAC 24-bit (Healing Audio Lab)",
    category: "Édition Collector",
    price: 29,
    stock: 999,
    maxStock: 999,
    isLimitedEdition: false,
    description: "Les pistes multipistes isolées de l'album healing (synthétiseurs modulaires, piano feutré, sous-basses 432Hz) pour producteurs, sonothérapeutes et audiophiles.",
    details: [
      "48 fichiers Stems isolés en haute résolution 24-bit / 48kHz",
      "Fichiers MIDI des thèmes et progressions harmoniques",
      "Livret digital PDF 32 pages avec notes d'atelier",
      "Accès immédiat par téléchargement sécurisé après commande"
    ],
    imageUrl: "/src/assets/images/hero_artist_portrait_1790345746015.jpg"
  }
];

export const INITIAL_CONCERTS: Concert[] = [
  {
    id: "tour-paris-olympia",
    date: "2026-11-12",
    formattedDate: "12 Novembre 2026",
    city: "Paris",
    venue: "L'Olympia",
    country: "France",
    status: "Dernières Places",
    doorsOpen: "19h30",
    ticketTiers: [
      {
        id: "tier-fosse",
        name: "Fosse Debout",
        price: 38,
        remaining: 14,
        description: "Accès à la fosse principale au plus près de la scénographie lumineuse healing."
      },
      {
        id: "tier-balcon",
        name: "Mezzanine & Balcon Assis",
        price: 52,
        remaining: 6,
        description: "Siège numéroté avec acoustique optimale et vue panoramique."
      },
      {
        id: "tier-vip",
        name: "Pass Immersion VIP + Soundcheck",
        price: 95,
        remaining: 3,
        description: "Accès aux balances sonores privées, rencontre avec l'artiste healing, vinyle dédicacé."
      }
    ]
  },
  {
    id: "tour-berlin-kraftwerk",
    date: "2026-11-28",
    formattedDate: "28 Novembre 2026",
    city: "Berlin",
    venue: "Kraftwerk Berlin",
    country: "Allemagne",
    status: "Disponible",
    doorsOpen: "20h00",
    ticketTiers: [
      {
        id: "tier-berlin-standard",
        name: "Admission Générale",
        price: 36,
        remaining: 85,
        description: "Accès complet au hall cathédrale et performance sonore 360° quadraphonique."
      },
      {
        id: "tier-berlin-soundcheck",
        name: "Soundcheck Experience + Vinyl",
        price: 88,
        remaining: 12,
        description: "Entrée anticipée 17h, écoute commentée des balances et vinyle exclusif."
      }
    ]
  },
  {
    id: "tour-london-roundhouse",
    date: "2026-12-05",
    formattedDate: "05 Décembre 2026",
    city: "Londres",
    venue: "Roundhouse Camden",
    country: "Royaume-Uni",
    status: "Disponible",
    doorsOpen: "19h00",
    ticketTiers: [
      {
        id: "tier-london-standing",
        name: "Stalls Standing",
        price: 42,
        remaining: 64,
        description: "Debout au rez-de-chaussée sous la verrière circulaire historique."
      },
      {
        id: "tier-london-circle",
        name: "Circle Seated",
        price: 55,
        remaining: 28,
        description: "Siège réservé en balcon circulaire."
      }
    ]
  },
  {
    id: "tour-tokyo-liquidroom",
    date: "2027-01-18",
    formattedDate: "18 Janvier 2027",
    city: "Tokyo",
    venue: "Liquidroom Ebisu",
    country: "Japon",
    status: "Dernières Places",
    doorsOpen: "18h30",
    ticketTiers: [
      {
        id: "tier-tokyo-all",
        name: "All-Standing + Drink Ticket",
        price: 45,
        remaining: 9,
        description: "Accès live avec boisson incluse au bar de Liquidroom."
      }
    ]
  },
  {
    id: "tour-montreal-mtelus",
    date: "2027-02-06",
    formattedDate: "06 Février 2027",
    city: "Montréal",
    venue: "MTELUS",
    country: "Canada",
    status: "Disponible",
    doorsOpen: "19h30",
    ticketTiers: [
      {
        id: "tier-mtl-admission",
        name: "Admission Générale Parterre",
        price: 39,
        remaining: 120,
        description: "Accès debout au parterre principal."
      }
    ]
  },
  {
    id: "tour-newyork-knockdown",
    date: "2027-02-14",
    formattedDate: "14 Février 2027",
    city: "New York",
    venue: "Knockdown Center (Queens)",
    country: "États-Unis",
    status: "Complet",
    doorsOpen: "20h00",
    ticketTiers: [
      {
        id: "tier-ny-ga",
        name: "General Admission",
        price: 48,
        remaining: 0,
        description: "Événement complet. Inscription sur liste d'attente."
      }
    ]
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "news-1",
    title: "Sortie du Double Album 'Restoration' & Écoute Intégrale",
    summary: "Deux ans d'explorations acoustiques et fréquentielles réunis dans une œuvre pure.",
    content: "Nous sommes heureux de vous dévoiler le nouveau chapitre musical de healing. Enregistré sur bandes analogiques 2 pouces, 'Restoration' explore la guérison par le son et la résonance du silence. Vous pouvez écouter les extraits haute fidélité directement sur cette page ou commander l'édition limitée sur vinyle blanc.",
    category: "Sortie Musique",
    date: "22 Septembre 2026",
    readTime: "3 min de lecture",
    imageUrl: "/src/assets/images/album_vinyl_artwork_1790345759457.jpg",
    likes: 382,
    isLiked: false,
    pinned: true
  },
  {
    id: "news-2",
    title: "Tournée Mondiale healing 2026-2027 : Billetterie Officielle Ouverte",
    summary: "6 escales capitales à Paris, Berlin, Londres, Tokyo, Montréal et New York avec scénographie lumineuse immersive.",
    content: "Pour cette nouvelle tournée, l'espace scénique a été conçu comme un sanctuaire lumineux et sonore en diffusion quadraphonique 360°. Chaque concert offre une expérience contemplative hors du temps. Les places pour Paris et Tokyo sont presque épuisées.",
    category: "Tournée",
    date: "15 Septembre 2026",
    readTime: "2 min de lecture",
    imageUrl: "/src/assets/images/concert_stage_atmosphere_1790345781544.jpg",
    likes: 549,
    isLiked: true,
    pinned: false
  },
  {
    id: "news-3",
    title: "Carnet de Studio : Les Fréquences d'Apaisement & la Synthèse Modulaire",
    summary: "Comment l'enregistrement au Japon a transformé notre rapport aux réverbérations naturelles.",
    content: "Pendant l'hiver à Kyoto, la résonance des cloches dans les vallées a inspiré l'accordage harmonique de nos synthétiseurs à 432Hz. Pourquoi chercher le volume quand une onde pure égrenée dans le silence apporte un calme si profond ? Retrouvez les stems et réglages de patchs dans la boutique.",
    category: "Studio",
    date: "02 Septembre 2026",
    readTime: "4 min de lecture",
    imageUrl: "/src/assets/images/hero_artist_portrait_1790345746015.jpg",
    likes: 247,
    isLiked: false,
    pinned: false
  }
];

export const INITIAL_SUBSCRIBERS: Subscriber[] = [
  {
    id: "sub-1",
    email: "claire.sound@audiophile.fr",
    subscribedAt: "2026-09-24",
    preferences: ["Préventes Concerts", "Sorties Vinyles", "Extraits Exclusifs"]
  },
  {
    id: "sub-2",
    email: "marc.v@berlinminimal.de",
    subscribedAt: "2026-09-23",
    preferences: ["Préventes Concerts", "Extraits Exclusifs"]
  },
  {
    id: "sub-3",
    email: "elena.k@tokyovinyl.jp",
    subscribedAt: "2026-09-21",
    preferences: ["Sorties Vinyles", "Merchandise"]
  },
  {
    id: "sub-4",
    email: "lucas.audio@musiclab.com",
    subscribedAt: "2026-09-18",
    preferences: ["Préventes Concerts", "Sorties Vinyles", "Stems & Production"]
  }
];

import React, { useState } from 'react';
import { useArtist } from '../context/ArtistContext';
import { Product } from '../types';
import { CartDrawer } from './CartDrawer';
import {
  ShoppingBag,
  Check,
  Sparkles,
  Info,
  X,
  Truck,
  ShieldCheck,
  Disc,
  Plus,
  Minus,
  ArrowLeft,
  Search
} from 'lucide-react';

export const ShopSection: React.FC = () => {
  const {
    products,
    addToCart,
    selectedProductForModal,
    setSelectedProductForModal,
    cart,
    setIsCartOpen,
    setCurrentPage,
    searchQuery,
    setSearchQuery
  } = useArtist();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToast, setAddedToast] = useState<boolean>(false);

  const categories = [
    { label: 'Toutes les créations', value: 'all' },
    { label: 'Vinyles & Disques', value: 'Vinyles & Disques' },
    { label: 'Textiles & Merch', value: 'Textiles & Merch' },
    { label: 'Art & Sérigraphie', value: 'Art & Sérigraphie' },
    { label: 'Édition Collector', value: 'Édition Collector' }
  ];

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    if (!searchQuery.trim()) return matchesCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      p.title.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const handleOpenProduct = (product: Product) => {
    setSelectedProductForModal(product);
    setQuantity(1);
    setAddedToast(false);
    if (product.variants && Array.isArray(product.variants.options) && product.variants.options.length > 0) {
      setSelectedVariant(product.variants.options[0]);
    } else {
      setSelectedVariant('');
    }
  };

  return (
    <section id="boutique" className="py-12 sm:py-16 bg-white min-h-[80vh]">
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
            <span className="text-neutral-950 font-bold uppercase">Boutique Officielle</span>
          </div>

          {/* Desktop Search Bar (alignée avec le fil d'Ariane) */}
          <div className="hidden md:flex items-center relative w-72 lg:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un vinyle, textile..."
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
              02. Objets Physiques &amp; Éditions Limitées
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-neutral-950 uppercase">
              La Boutique Officielle
            </h2>
          </div>

          {/* Right Header: Filters & Cart Trigger */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category filter tabs */}
            <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl overflow-x-auto">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    activeCategory === cat.value
                      ? 'bg-white text-neutral-950 shadow-xs font-semibold'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-950 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
              title="Ouvrir le panier d'achats"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Panier ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
            </button>
          </div>
        </div>

        {/* Products Grid (2 columns on mobile, 3 columns on desktop, rounded cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 pt-6 sm:pt-10">
          {filteredProducts.map(product => {
            const hasStock = product.stock > 0;

            return (
              <div
                key={product.id}
                onClick={() => handleOpenProduct(product)}
                className="group flex flex-col bg-white border border-neutral-200/80 rounded-2xl overflow-hidden hover:border-neutral-950 transition-all duration-300 cursor-pointer shadow-2xs hover:shadow-md"
              >
                {/* Product Image Slot */}
                <div
                  className="relative aspect-[4/3] bg-neutral-100 overflow-hidden"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />

                  {/* Stock notice / Limited badge */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-1 text-[9px] sm:text-[11px] font-mono-code px-2 py-0.5 sm:px-2.5 sm:py-1 bg-white/65 backdrop-blur-md rounded-md shadow-sm text-neutral-950 max-w-[90%] truncate">
                    {hasStock ? (
                      product.isLimitedEdition ? (
                        <span className="truncate">Édition limitée · {product.stock} restants</span>
                      ) : (
                        <span>En stock</span>
                      )
                    ) : (
                      <span className="text-rose-600 font-semibold">Épuisé</span>
                    )}
                  </div>
                </div>

                {/* Content info */}
                <div className="p-3 sm:p-5 flex flex-col flex-1 justify-between">
                  <div className="space-y-1 mb-3 sm:mb-4">
                    <div className="text-[9px] sm:text-xs font-mono-code uppercase tracking-wider text-neutral-400 truncate">
                      {product.category}
                    </div>
                    <h3
                      className="text-xs sm:text-base font-semibold text-neutral-950 group-hover:text-neutral-700 transition-colors cursor-pointer line-clamp-1 leading-snug"
                    >
                      {product.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-neutral-500 line-clamp-2 leading-tight sm:leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-2 sm:pt-3 border-t border-neutral-100 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
                    <div className="text-xs sm:text-lg font-mono-code font-bold text-neutral-950 tabular-nums">
                      {product.price} €
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 w-full xs:w-auto justify-between xs:justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenProduct(product);
                        }}
                        className="px-1.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-medium text-neutral-600 hover:text-neutral-950 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                      >
                        Détails
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const variant = (product.variants && Array.isArray(product.variants.options) && product.variants.options.length > 0)
                            ? product.variants.options[0]
                            : undefined;
                          addToCart(product, variant, 1);
                        }}
                        disabled={!hasStock}
                        className={`flex items-center gap-1 px-2 py-1 sm:px-3.5 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-all cursor-pointer ${
                          hasStock
                            ? 'bg-neutral-950 text-white hover:bg-neutral-800'
                            : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>{hasStock ? 'Ajouter' : 'Épuisé'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty Search Result State */}
        {filteredProducts.length === 0 && (
          <div className="py-16 text-center space-y-3">
            <p className="text-sm font-semibold text-neutral-800">
              {searchQuery ? `Aucune création trouvée pour "${searchQuery}"` : "Aucun produit disponible dans cette catégorie"}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="px-4 py-1.5 text-xs font-mono-code font-semibold uppercase bg-neutral-950 text-white rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        )}

        {/* Full Article Page View Modal */}
        {selectedProductForModal && (
          <div className="fixed inset-0 z-50 bg-white w-full h-full min-h-screen overflow-y-auto flex flex-col">
            
            {/* Sticky Top Bar Navigation */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
              <button
                onClick={() => setSelectedProductForModal(null)}
                className="px-2.5 py-1 sm:px-4 sm:py-2 rounded-full border border-neutral-950 hover:bg-neutral-950 hover:text-white text-neutral-950 text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Retour à la boutique</span>
              </button>

              <div className="hidden xs:flex items-center gap-2 text-xs font-mono-code text-neutral-400 uppercase truncate">
                <span>BOUTIQUE</span>
                <span>/</span>
                <span className="text-neutral-900 font-bold">{selectedProductForModal.category}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-950 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Panier ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
                </button>
              </div>
            </div>

            {/* Main Article Content */}
            <div className="max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-12 flex-1">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
                
                {/* Left Column: Media & Stock */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="aspect-[4/3] sm:aspect-square w-full rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-xs relative">
                    <img
                      src={selectedProductForModal.imageUrl}
                      alt={selectedProductForModal.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5 text-xs font-mono-code px-3 py-1.5 bg-white/65 backdrop-blur-md rounded-md shadow-sm text-neutral-950">
                      {selectedProductForModal.stock > 0 ? (
                        selectedProductForModal.isLimitedEdition ? (
                          <span className="font-semibold text-neutral-900">Édition limitée · {selectedProductForModal.stock} restants</span>
                        ) : (
                          <span className="text-emerald-700 font-semibold">● En stock disponible</span>
                        )
                      ) : (
                        <span className="text-rose-600 font-semibold">● Épuisé (Rupture)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Title, Specs, Ordering Actions */}
                <div className="lg:col-span-6 space-y-6">
                  
                  {/* Category & Title */}
                  <div className="space-y-2 border-b border-neutral-100 pb-5">
                    <div className="text-xs font-mono-code uppercase tracking-widest text-neutral-400 font-bold">
                      {selectedProductForModal.category}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-display font-bold text-neutral-950 leading-tight uppercase">
                      {selectedProductForModal.title}
                    </h1>
                    <div className="text-2xl sm:text-3xl font-mono-code font-bold text-neutral-950 tabular-nums pt-1">
                      {selectedProductForModal.price} €
                      <span className="text-xs font-normal text-neutral-500 font-sans ml-2">TVA incluse</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans">
                    {selectedProductForModal.description}
                  </p>

                  {/* Variant Selector */}
                  {selectedProductForModal.variants && Array.isArray(selectedProductForModal.variants.options) && selectedProductForModal.variants.options.length > 0 && (
                    <div className="space-y-2.5 pt-2">
                      <label className="text-xs font-bold text-neutral-900 uppercase font-mono-code block">
                        {selectedProductForModal.variants.type || 'Format'} : <span className="text-neutral-500 font-normal">{selectedVariant}</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedProductForModal.variants.options.map(opt => (
                          <button
                            key={opt}
                            onClick={() => setSelectedVariant(opt)}
                            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                              selectedVariant === opt
                                ? 'bg-neutral-950 text-white shadow-xs'
                                : 'text-neutral-800 hover:bg-neutral-300 bg-neutral-200/80'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-neutral-900 uppercase font-mono-code block">
                      Quantité :
                    </label>
                    <div className="inline-flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200 transition-colors cursor-pointer"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-4 text-xs font-mono-code font-bold text-neutral-950 tabular-nums">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(selectedProductForModal.stock || 99, quantity + 1))}
                        className="px-3 py-2 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Order / Add to Cart Action Buttons */}
                  <div className="space-y-3 pt-4 border-t border-neutral-200">
                    {/* Primary Instant Order CTA */}
                    <button
                      onClick={() => {
                        addToCart(selectedProductForModal, selectedVariant || undefined, quantity);
                        setIsCartOpen(true);
                        setSelectedProductForModal(null);
                      }}
                      disabled={selectedProductForModal.stock <= 0}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-neutral-950 text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all cursor-pointer disabled:bg-neutral-200 disabled:text-neutral-400 shadow-md active:scale-[0.99]"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>
                        {selectedProductForModal.stock > 0
                          ? `Commander Directement — ${(selectedProductForModal.price * quantity).toFixed(2)} €`
                          : 'Article Épuisé'}
                      </span>
                    </button>

                    {/* Secondary Add To Cart Button */}
                    {selectedProductForModal.stock > 0 && (
                      <button
                        onClick={() => {
                          addToCart(selectedProductForModal, selectedVariant || undefined, quantity);
                          setAddedToast(true);
                          setTimeout(() => setAddedToast(false), 3000);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-neutral-200/80 hover:bg-neutral-300 text-neutral-900 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {addedToast ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Produit Ajouté au Panier !</span>
                          </>
                        ) : (
                          <span>Ajouter au panier et continuer mes achats</span>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Specifications & Details List */}
                  {selectedProductForModal.details && selectedProductForModal.details.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-neutral-100">
                      <div className="text-xs font-bold text-neutral-900 uppercase font-mono-code">
                        Caractéristiques du produit :
                      </div>
                      <ul className="space-y-1.5 text-xs text-neutral-600">
                        {selectedProductForModal.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-neutral-400 pt-0.5">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Trust & Shipping Badges */}
                  <div className="p-4 rounded-xl bg-neutral-200/60 space-y-2.5 text-xs text-neutral-700 font-medium">
                    <div className="flex items-center gap-2 font-medium text-neutral-900">
                      <Truck className="w-4 h-4 text-neutral-800" />
                      <span>Expédition sécurisée sous 24 à 48 heures</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium text-neutral-900">
                      <ShieldCheck className="w-4 h-4 text-neutral-800" />
                      <span>Emballage renforcé spécifique vinyles &amp; objets d'art</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium text-neutral-900">
                      <Check className="w-4 h-4 text-neutral-800" />
                      <span>Paiement sécurisé · Satisfait ou remboursé 14 jours</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* Cart Drawer Component of Boutique */}
        <CartDrawer />

      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { useArtist } from '../context/ArtistContext';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Package
} from 'lucide-react';
import { ShopOrder } from '../types';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    completeShopOrder
  } = useArtist();

  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<ShopOrder | null>(null);

  // Form fields
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 80;
  const missingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingCost = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 7;
  const total = subtotal + shippingCost;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !address || !city || !postalCode) {
      alert("Veuillez remplir tous les champs de livraison.");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const order = completeShopOrder({
        name: customerName,
        email: customerEmail,
        address,
        city,
        postalCode
      });
      setCompletedOrder(order);
      setIsProcessing(false);
    }, 700);
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setIsCheckingOut(false);
    setCompletedOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-white sm:bg-neutral-950/60 sm:backdrop-blur-xs transition-opacity">
      <div className="hidden sm:block absolute inset-0" onClick={handleClose} />

      <div className="absolute inset-0 sm:inset-y-0 sm:left-auto sm:right-0 w-full sm:max-w-md flex">
        <div className="w-full h-full bg-white shadow-2xl flex flex-col justify-between border-l-0 sm:border-l border-neutral-200">
          
          {/* Header */}
          <div className="px-5 py-4 sm:p-6 border-b border-neutral-200 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2.5">
              {isCheckingOut && !completedOrder && (
                <button
                  onClick={() => setIsCheckingOut(false)}
                  className="flex items-center gap-1 text-xs font-mono-code text-neutral-600 hover:text-neutral-950 mr-1 sm:hidden cursor-pointer"
                  title="Retour au panier"
                >
                  <span>←</span>
                </button>
              )}
              <ShoppingBag className="w-4 h-4 text-neutral-950" />
              <h2 className="text-sm sm:text-base font-bold text-neutral-950 uppercase tracking-tight">
                {completedOrder ? 'Confirmation de Commande' : isCheckingOut ? 'Validation & Expédition' : 'Mon Panier'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-neutral-400 hover:text-neutral-950 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Fermer le panier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="px-5 py-5 sm:p-6 flex-1 overflow-y-auto space-y-6">
            
            {completedOrder ? (
              /* Order Success View */
              <div className="text-center space-y-5 py-6">
                <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-950 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-950">
                    Merci pour votre commande !
                  </h3>
                  <div className="text-xs font-mono-code text-neutral-500 mt-1">
                    Numéro de commande : <strong>{completedOrder.orderNumber}</strong>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-left text-xs space-y-2">
                  <div className="text-neutral-500">Un e-mail de confirmation avec le numéro de suivi postal a été envoyé à <strong>{completedOrder.customerEmail}</strong>.</div>
                  <div className="pt-2 border-t border-neutral-200">
                    <div><strong>Adresse d'expédition :</strong></div>
                    <div className="text-neutral-600">{completedOrder.customerName}</div>
                    <div className="text-neutral-600">{completedOrder.address}, {completedOrder.postalCode} {completedOrder.city}</div>
                  </div>
                  <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-neutral-950">
                    <span>Total payé :</span>
                    <span className="font-mono-code">{completedOrder.total} €</span>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full py-3 bg-neutral-950 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 cursor-pointer"
                >
                  Retourner au site
                </button>
              </div>
            ) : isCheckingOut ? (
              /* Checkout Form View - Styled identically to TourSection booking */
              <div className="bg-neutral-100/70 p-5 rounded-2xl space-y-4">
                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <div className="text-xs font-mono-code text-neutral-500">
                    Veuillez renseigner vos coordonnées pour l'envoi de vos objets :
                  </div>

                  {/* Quantity Counter Card */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white shadow-xs">
                    <span className="text-xs font-semibold text-neutral-900">
                      Nombre d'articles :
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (cart.length > 0) {
                            const lastItem = cart[cart.length - 1];
                            updateCartQuantity(lastItem.id, Math.max(1, lastItem.quantity - 1));
                          }
                        }}
                        className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-900 text-sm font-bold flex items-center justify-center cursor-pointer hover:bg-neutral-200 active:scale-95"
                      >
                        -
                      </button>
                      <span className="font-mono-code font-bold text-base tabular-nums w-4 text-center text-neutral-950">
                        {cart.reduce((a, b) => a + b.quantity, 0)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (cart.length > 0) {
                            const lastItem = cart[cart.length - 1];
                            updateCartQuantity(lastItem.id, lastItem.quantity + 1);
                          }
                        }}
                        className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-900 text-sm font-bold flex items-center justify-center cursor-pointer hover:bg-neutral-200 active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Buyer Form Inputs with shadow-xs and border-0 matching TourSection */}
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-xs font-medium text-neutral-700 block mb-1">
                        Nom &amp; Prénom :
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        placeholder="Jean Dupont"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white text-xs text-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950 shadow-xs border-0"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-neutral-700 block mb-1">
                        Adresse e-mail :
                      </label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={e => setCustomerEmail(e.target.value)}
                        placeholder="jean@exemple.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white text-xs text-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950 shadow-xs border-0"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-neutral-700 block mb-1">
                        Adresse postale :
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="12 rue de la Paix"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white text-xs text-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950 shadow-xs border-0"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-neutral-700 block mb-1">
                          Code Postal :
                        </label>
                        <input
                          type="text"
                          required
                          value={postalCode}
                          onChange={e => setPostalCode(e.target.value)}
                          placeholder="75001"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white text-xs text-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950 shadow-xs border-0"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-neutral-700 block mb-1">
                          Ville :
                        </label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={e => setCity(e.target.value)}
                          placeholder="Paris"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white text-xs text-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950 shadow-xs border-0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Banner */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white shadow-xs text-xs">
                    <span className="text-neutral-700 font-medium">Méthode de règlement :</span>
                    <span className="font-mono-code font-semibold text-neutral-950">Carte Bancaire Sécurisée</span>
                  </div>

                  {/* Price & Confirmation */}
                  <div className="pt-3 border-t border-neutral-200/60 space-y-3">
                    <div className="flex items-center justify-between text-base font-bold text-neutral-950">
                      <span>Total Commande :</span>
                      <span className="font-mono-code tabular-nums text-xl">
                        {total} €
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3.5 bg-neutral-950 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:bg-neutral-300 shadow-sm"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isProcessing ? 'Validation du paiement...' : `Payer ${total} €`}</span>
                    </button>

                    <p className="text-[10px] text-center text-neutral-500 font-mono-code">
                      Paiement direct sécurisé · Expédition suivie avec numéro de tracking
                    </p>

                    <button
                      type="button"
                      onClick={() => setIsCheckingOut(false)}
                      className="w-full py-1 text-xs text-neutral-500 hover:text-neutral-950 cursor-pointer font-medium text-center"
                    >
                      ← Revenir au panier
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Regular Cart List View */
              <>
                {/* Free shipping progress */}
                {cart.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/10 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-mono-code text-[11px]">
                      <span className="text-emerald-950 font-medium">
                        {missingForFreeShipping === 0
                          ? 'Livraison standard offerte !'
                          : `Plus que ${missingForFreeShipping} € pour la livraison offerte`}
                      </span>
                      <span className="text-emerald-800 font-bold">
                        {Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-900/15 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-800 transition-all duration-300"
                        style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Items list */}
                {cart.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                      <Package className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-semibold text-neutral-950">
                      Votre panier est vide
                    </div>
                    <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                      Découvrez nos éditions vinyles 180g marbrées, hoodies lourds et sérigraphies numérotées.
                    </p>
                    <a
                      href="#boutique"
                      onClick={() => setIsCartOpen(false)}
                      className="inline-block mt-2 px-4 py-2 bg-neutral-950 text-white rounded-xl text-xs font-semibold"
                    >
                      Explorer les créations
                    </a>
                  </div>
                ) : (
                  <div className="bg-neutral-100/70 p-4 sm:p-5 rounded-2xl space-y-3">
                    {cart.map(item => (
                      <div
                        key={item.id}
                        className="bg-white p-3.5 sm:p-4 rounded-xl shadow-xs flex items-center gap-3.5"
                      >
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.title}
                          className="w-16 h-16 rounded-xl object-cover bg-neutral-100 border border-neutral-100 shrink-0"
                          referrerPolicy="no-referrer"
                        />

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-neutral-950 truncate">
                            {item.product.title}
                          </h4>
                          {item.selectedVariant && (
                            <div className="text-[11px] font-mono-code text-neutral-500 truncate">
                              {item.selectedVariant}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono-code font-bold text-neutral-950 tabular-nums">
                              {item.product.price} €
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="p-1 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer rounded-md hover:bg-neutral-100"
                              title="Supprimer l'article"
                              aria-label="Supprimer l'article"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Quantity Counter - 1 + matching TourSection style */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-900 text-sm font-bold flex items-center justify-center cursor-pointer hover:bg-neutral-200 active:scale-95 transition-colors"
                            title="Diminuer"
                          >
                            -
                          </button>
                          <span className="font-mono-code font-bold text-base tabular-nums w-4 text-center text-neutral-950">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-900 text-sm font-bold flex items-center justify-center cursor-pointer hover:bg-neutral-200 active:scale-95 transition-colors"
                            title="Augmenter"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

          </div>

          {/* Footer Subtotal & Action */}
          {!completedOrder && !isCheckingOut && cart.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-neutral-200 bg-neutral-50 space-y-4 shrink-0">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Sous-total créations :</span>
                  <span className="font-mono-code font-semibold tabular-nums text-neutral-950">{subtotal} €</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Frais de port :</span>
                  <span className="font-mono-code font-semibold tabular-nums text-neutral-950">
                    {shippingCost === 0 ? 'Offert' : `${shippingCost} €`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-neutral-950 text-base pt-2.5 border-t border-neutral-200/80">
                  <span>Total :</span>
                  <span className="font-mono-code tabular-nums text-xl">{total} €</span>
                </div>
              </div>

              <button
                onClick={() => setIsCheckingOut(true)}
                className="w-full py-3.5 sm:py-4 bg-neutral-950 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Commander les créations</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-center text-neutral-500 font-mono-code">
                Paiement chiffré SSL · Expédition sécurisée
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

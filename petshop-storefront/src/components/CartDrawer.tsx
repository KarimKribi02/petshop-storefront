'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { getMediaUrl } from '@/lib/axios';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  Sparkles,
  Building2
} from 'lucide-react';

export default function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    isDrawerOpen,
    closeDrawer,
    openCheckout,
    totalItems,
    totalPrice,
    shippingFee,
    freeShippingThreshold,
    finalTotal,
    currentStore,
  } = useCart();

  if (!isDrawerOpen) return null;

  const progressPercent = Math.min(
    100,
    Math.round((totalPrice / freeShippingThreshold) * 100)
  );
  const remainingForFreeShipping = Math.max(
    0,
    freeShippingThreshold - totalPrice
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-slide-in-right">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Votre Panier
                </h2>
                <span className="text-xs font-semibold text-emerald-800">
                  {totalItems} {totalItems > 1 ? 'articles' : 'article'} sélectionné(s)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={closeDrawer}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Fermer le panier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Store Indicator */}
          {items.length > 0 && currentStore && (
            <div className="px-5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
              <span>Magasin assigné :</span>
              <span className="font-bold text-emerald-900 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-800" />
                {currentStore.store_name}
              </span>
            </div>
          )}

          {/* Free Shipping Progress Indicator */}
          {items.length > 0 && (
            <div className="p-4 bg-emerald-50/60 border-b border-emerald-100/60">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-950 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  {remainingForFreeShipping > 0 ? (
                    <span>
                      Plus que <strong className="text-emerald-800">{remainingForFreeShipping.toFixed(2)} DH</strong> pour la livraison gratuite !
                    </span>
                  ) : (
                    <span className="text-emerald-800 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Félicitations ! Livraison gratuite accordée 🎉
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-700 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
            {items.length > 0 ? (
              items.map((item) => {
                const isWeightProduct =
                  item.product.unit_type === 'WEIGHT' ||
                  item.product.unit_type === 'kg' ||
                  item.product.unit_type === 'g';
                const unitPrice =
                  parseFloat(String(item.product.price_sell)) || 0;
                const itemTotal = unitPrice * item.quantity;
                const imageUrl = getMediaUrl(
                  item.product.image || item.product.image_url
                );

                return (
                  <div
                    key={item.product.barcode || item.product.id}
                    className="py-4 first:pt-0 last:pb-0 flex items-start gap-4"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center shrink-0">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.product.title}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-slate-300" />
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-bold text-slate-900 line-clamp-2">
                          {item.product.title}
                        </h3>
                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              item.product.barcode || item.product.id
                            )
                          }
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Supprimer l'article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {isWeightProduct ? (
                          <span>
                            {unitPrice.toFixed(2)} DH / Kg (soit {(unitPrice / 10).toFixed(2)} DH / 100g)
                          </span>
                        ) : (
                          <span>
                            {unitPrice.toFixed(2)} DH l&apos;unité
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls & Line Price */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.product.barcode || item.product.id,
                                isWeightProduct
                                  ? Math.max(0.1, Number((item.quantity - 0.25).toFixed(2)))
                                  : item.quantity - 1
                              )
                            }
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-white rounded-lg transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-black text-slate-900 min-w-[2.5rem] text-center">
                            {isWeightProduct
                              ? item.quantity >= 1
                                ? `${item.quantity} kg`
                                : `${Math.round(item.quantity * 1000)}g`
                              : item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.product.barcode || item.product.id,
                                isWeightProduct
                                  ? Number((item.quantity + 0.25).toFixed(2))
                                  : item.quantity + 1
                              )
                            }
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-white rounded-lg transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-sm font-black text-emerald-950 price-tag">
                          {itemTotal.toFixed(2)} DH
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  Votre panier est vide
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mb-6">
                  Découvrez nos délicieuses croquettes, accessoires et jouets pour faire plaisir à vos compagnons.
                </p>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="px-6 py-2.5 bg-emerald-800 text-white rounded-2xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  Découvrir les produits
                </button>
              </div>
            )}
          </div>

          {/* Footer Summary & Checkout Button */}
          {items.length > 0 && (
            <div className="p-5 bg-slate-50/80 border-t border-slate-100 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Sous-total articles</span>
                  <span className="font-bold text-slate-800 price-tag">
                    {totalPrice.toFixed(2)} DH
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Frais de livraison</span>
                  <span className="font-bold text-slate-800">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-extrabold uppercase text-[11px]">
                        Gratuit
                      </span>
                    ) : (
                      `${shippingFee.toFixed(2)} DH`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total à payer (COD)</span>
                  <span className="text-base font-black text-emerald-950 price-tag">
                    {finalTotal.toFixed(2)} DH
                  </span>
                </div>
              </div>

              {/* Guarantees snippet */}
              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  Paiement à la livraison
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-700" />
                  Livraison Express Marrakech & Maroc
                </span>
              </div>

              {/* Checkout Trigger */}
              <button
                type="button"
                onClick={openCheckout}
                className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-700 active:scale-98 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/15 transition-all duration-200 cursor-pointer"
              >
                <span>Commander / Passer au Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

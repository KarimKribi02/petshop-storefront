'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { getMediaUrl } from '@/lib/axios';
import { Heart, X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

export default function WishlistModal() {
  const { wishlist, totalWishlist, isWishlistOpen, closeWishlist, removeFromWishlist, clearWishlist, isHydrated } = useWishlist();
  const { addItem } = useCart();

  if (!isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={closeWishlist}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 animate-scale-up max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-rose-600" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900">
                Mes Favoris
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isHydrated ? `${totalWishlist} article${totalWishlist > 1 ? 's' : ''} sauvegardé${totalWishlist > 1 ? 's' : ''}` : 'Chargement…'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {totalWishlist > 0 && (
              <button
                type="button"
                onClick={clearWishlist}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-800 hover:underline px-2 py-1 cursor-pointer transition-colors"
              >
                Tout effacer
              </button>
            )}
            <button
              type="button"
              onClick={closeWishlist}
              className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {totalWishlist === 0 ? (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h4 className="font-bold text-base text-slate-900 mb-1">
              Votre liste de favoris est vide
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mb-6 leading-relaxed">
              Cliquez sur le petit cœur sur n&apos;importe quel produit pour le sauvegarder dans vos favoris.
            </p>
            <Link
              href="/products"
              onClick={closeWishlist}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <span>Découvrir nos produits</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 pr-1 space-y-3">
            {wishlist.map((item) => {
              const price = parseFloat(String(item.price_sell)) || 0;
              const imageUrl = getMediaUrl(item.image || item.image_url);
              const isOutOfStock = item.stock_quantity <= 0;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 transition-all"
                >
                  {/* Left: image & info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-14 h-14 rounded-xl bg-white border border-slate-200/80 overflow-hidden flex items-center justify-center shrink-0 p-1">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.title}
                          className="w-full h-full object-contain object-center"
                        />
                      ) : (
                        <Heart className="w-5 h-5 text-slate-300" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {item.title}
                      </h5>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-sm font-black text-emerald-800">
                          {price.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700">DH</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => {
                        addItem(item, 1);
                        closeWishlist();
                      }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isOutOfStock
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs cursor-pointer'
                      }`}
                      title={isOutOfStock ? 'Rupture de stock' : 'Ajouter au panier'}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Ajouter</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeFromWishlist(item.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Retirer des favoris"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {totalWishlist > 0 && (
          <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={closeWishlist}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Fermer
            </button>
            <Link
              href="/wishlist"
              onClick={closeWishlist}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5"
            >
              <span>Voir tous mes favoris</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

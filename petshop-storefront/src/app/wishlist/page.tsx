'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { Product, Category, StoreSettings } from '@/types';
import apiClient, { getMediaUrl } from '@/lib/axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductModal from '@/components/ProductModal';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Package,
  Check,
  ShoppingBasket,
  Truck,
  Leaf,
  ShieldCheck,
  Star
} from 'lucide-react';

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, totalWishlist, removeFromWishlist, clearWishlist, isHydrated } = useWishlist();
  const { addItem } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [addedAll, setAddedAll] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [catRes, settingsRes] = await Promise.allSettled([
          apiClient.get('/shop/categories'),
          apiClient.get('/settings'),
        ]);
        if (catRes.status === 'fulfilled') setCategories(catRes.value.data?.data || []);
        if (settingsRes.status === 'fulfilled') setSettings(settingsRes.value.data?.data || null);
      } catch (e) { /* silently fail */ }
    };
    init();
  }, []);

  const handleAddAllToCart = () => {
    const available = wishlist.filter((p) => (p.stock_quantity ?? 1) > 0);
    if (available.length === 0) return;
    available.forEach((prod) => {
      addItem(prod, 1);
    });
    setAddedAll(true);
    setTimeout(() => setAddedAll(false), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf8] text-slate-900 selection:bg-emerald-200 selection:text-emerald-950 font-sans">

      {/* Header */}
      <Header
        categories={categories}
        settings={settings}
      />

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <Link href="/" className="hover:text-emerald-800 transition-colors font-medium">
              Accueil
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/products" className="hover:text-emerald-800 transition-colors font-medium">
              Boutique
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-emerald-950 font-bold">Mes Favoris</span>
          </nav>

          {/* Page Hero Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-black uppercase tracking-wider mb-3">
                <Heart className="w-3.5 h-3.5 fill-rose-600" />
                <span>Liste de souhaits</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Mes Produits Favoris
              </h1>
              <p className="text-sm text-slate-500 mt-1.5 max-w-xl">
                {isHydrated ? (
                  totalWishlist > 0 ? (
                    <>Vous avez <strong className="text-slate-900">{totalWishlist}</strong> produit{totalWishlist > 1 ? 's' : ''} sauvegardé{totalWishlist > 1 ? 's' : ''} dans vos favoris.</>
                  ) : (
                    'Votre liste de souhaits est actuellement vide.'
                  )
                ) : (
                  'Chargement de votre liste de souhaits…'
                )}
              </p>
            </div>

            {totalWishlist > 0 && (
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={clearWishlist}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Tout effacer</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddAllToCart}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-sm cursor-pointer ${
                    addedAll
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-800 hover:bg-emerald-700 active:scale-98 text-white shadow-emerald-950/10'
                  }`}
                >
                  {addedAll ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Ajoutés au panier !</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBasket className="w-4 h-4" />
                      <span>Tout ajouter au panier</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Product Grid / Empty State */}
          {!isHydrated ? (
            <div className="py-20 text-center text-slate-400 font-bold text-sm">
              Chargement de vos favoris…
            </div>
          ) : totalWishlist === 0 ? (
            /* Empty State */
            <div className="bg-white border border-slate-200/80 rounded-3xl p-10 sm:p-16 text-center shadow-xs flex flex-col items-center justify-center max-w-2xl mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mb-5 shadow-xs">
                <Heart className="w-10 h-10 stroke-[1.5]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                Votre liste de favoris est vide
              </h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
                Explorez notre catalogue et cliquez sur le cœur présent sur les produits pour les retrouver ici à tout moment.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#14532d] hover:bg-[#0f3e21] text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-98"
              >
                <span>Découvrir nos produits</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            /* Products Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map((product) => {
                const isOutOfStock = product.stock_quantity <= 0;
                const price = parseFloat(String(product.price_sell)) || 0;
                const imageUrl = getMediaUrl(product.image || product.image_url);

                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-3xl border border-slate-200/80 hover:border-emerald-300/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
                  >
                    {/* Delete button (top-right) */}
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/95 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 shadow-xs flex items-center justify-center cursor-pointer transition-all"
                      title="Retirer des favoris"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Stock badge */}
                    {isOutOfStock && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-[11px] font-bold rounded-full border border-rose-200">
                          Épuisé
                        </span>
                      </div>
                    )}

                    {/* Product Image */}
                    <div
                      onClick={() => router.push(`/products/${product.id}`)}
                      className="w-full h-52 relative overflow-hidden bg-slate-50 cursor-pointer"
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover object-center block transform group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-emerald-50 text-emerald-700 flex flex-col items-center justify-center gap-1.5">
                          <Package className="w-9 h-9 opacity-70" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Animal Market Only</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-5 flex flex-col flex-1 justify-between">
                      <div>
                        {product.category?.name && (
                          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 block mb-1">
                            {product.category.name}
                          </span>
                        )}
                        <h3
                          onClick={() => router.push(`/products/${product.id}`)}
                          className="font-bold text-slate-900 text-sm leading-snug group-hover:text-emerald-800 transition-colors line-clamp-2 cursor-pointer h-10"
                        >
                          {product.title}
                        </h3>
                      </div>

                      {/* Pricing and Action */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-slate-900">
                              {price.toFixed(2)}
                            </span>
                            <span className="text-xs font-bold text-emerald-800">DH</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block font-medium">Prix unitaire</span>
                        </div>

                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => {
                            if (isOutOfStock) return;
                            addItem(product, 1);
                          }}
                          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all duration-200 shadow-xs ${
                            isOutOfStock
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                              : 'bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white cursor-pointer shadow-emerald-950/10'
                          }`}
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Ajouter</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>

      {/* Quick View Modal */}
      <ProductModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* Footer */}
      <Footer settings={settings} />
    </div>
  );
}

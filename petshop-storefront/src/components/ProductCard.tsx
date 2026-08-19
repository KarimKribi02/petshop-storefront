'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { useWishlist } from '@/context/WishlistContext';
import { getMediaUrl } from '@/lib/axios';
import { ShoppingBag, Package, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const router = useRouter();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const isOutOfStock = product.stock_quantity <= 0;
  const isWeightProduct =
    product.unit_type === 'WEIGHT' ||
    product.unit_type === 'kg' ||
    product.unit_type === 'g';
  const price = parseFloat(String(product.price_sell)) || 0;
  const imageUrl = getMediaUrl(product.image || product.image_url);

  /** Open ProductModal — it handles store selection + addItem internally */
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    onQuickView && onQuickView(product);
  };

  const handleCardClick = () => {
    router.push(`/products/${product.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative bg-white rounded-3xl border border-slate-100/80 hover:border-emerald-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_-8px_rgba(6,95,70,0.12)] transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer h-full"
    >
      {/* Wishlist Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(product);
        }}
        className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/95 border border-slate-200/90 shadow-sm flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
        title={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            isWishlisted ? 'fill-rose-600 text-rose-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        />
      </button>

      {/* Stock badge — only shown when out of stock */}
      {isOutOfStock && (
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span className="px-2.5 py-1 bg-rose-50/90 text-rose-700 text-[11px] font-bold rounded-full border border-rose-200">
            Épuisé
          </span>
        </div>
      )}

      {/* Product Image - Full Frame */}
      <div className="w-full h-[190px] relative overflow-hidden bg-slate-50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover object-center block transform group-hover:scale-105 transition-transform duration-300 pointer-events-none select-none"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                const fallback = parent.querySelector('.fallback-placeholder');
                if (fallback) (fallback as HTMLElement).style.display = 'flex';
              }
            }}
          />
        ) : null}

        {/* Fallback Placeholder */}
        <div 
          className={`fallback-placeholder absolute inset-0 w-full h-full bg-emerald-50 text-emerald-700 flex flex-col items-center justify-center gap-1.5 ${imageUrl ? 'hidden' : 'flex'}`}
        >
          <Package className="w-9 h-9 opacity-70" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">PetShop</span>
        </div>
      </div>

      {/* Product Content & Pricing */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-emerald-800 transition-colors line-clamp-2 h-[2.5rem]">
            {product.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-1 mt-1 h-4">
            {product.description || '\u00A0'}
          </p>
        </div>

        {/* Price & Add to Cart Button */}
        <div className="mt-auto pt-3 border-t border-slate-100/80 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-emerald-950 price-tag">
                {price.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-emerald-800">DH</span>
            </div>
            {isWeightProduct ? (
              <span className="text-[10px] text-emerald-800 font-bold">
                Prix au Kg
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">Prix unitaire</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all duration-200 shadow-sm cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white shadow-emerald-900/10'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { getMediaUrl } from '@/lib/axios';
import { ShoppingBag, Check, Package, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState(1); // For weight based products

  const isOutOfStock = product.stock_quantity <= 0;
  const isWeightProduct = product.unit_type === 'kg' || product.unit_type === 'g';
  const price = parseFloat(String(product.price_sell)) || 0;
  const imageUrl = getMediaUrl(product.image || product.image_url);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;

    addItem(product, isWeightProduct ? selectedWeight : 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div 
      onClick={() => onQuickView && onQuickView(product)}
      className="group relative bg-white rounded-3xl border border-slate-100/80 hover:border-emerald-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_-8px_rgba(6,95,70,0.12)] transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* Top Badges */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        {product.category?.name ? (
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-emerald-800 text-[11px] font-bold rounded-full shadow-xs border border-emerald-100">
            {product.category.name}
          </span>
        ) : <span />}

        {isOutOfStock ? (
          <span className="px-2.5 py-1 bg-rose-50/90 text-rose-700 text-[11px] font-bold rounded-full border border-rose-200">
            Épuisé
          </span>
        ) : (
          <span className="px-2.5 py-1 bg-emerald-50/90 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            En Stock
          </span>
        )}
      </div>

      {/* Product Image */}
      <div className="relative pt-12 pb-4 px-6 flex items-center justify-center bg-gradient-to-b from-slate-50/60 to-transparent min-h-[210px] overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="max-h-[170px] w-auto object-contain transform group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback to placeholder icon if image fails to load
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
          className={`fallback-placeholder w-24 h-24 rounded-2xl bg-emerald-50 text-emerald-700 flex flex-col items-center justify-center gap-1.5 ${imageUrl ? 'hidden' : 'flex'}`}
        >
          <Package className="w-10 h-10 opacity-70" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Petshop</span>
        </div>

        {/* Brand overlay if available */}
        {product.brand?.name && (
          <div className="absolute bottom-2 left-4 text-[11px] font-semibold text-slate-400">
            {product.brand.name}
          </div>
        )}
      </div>

      {/* Product Content & Pricing */}
      <div className="p-5 pt-2 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-emerald-800 transition-colors line-clamp-2 min-h-[2.5rem]">
            {product.title}
          </h3>

          {product.description && (
            <p className="text-xs text-slate-500 line-clamp-1 mt-1">
              {product.description}
            </p>
          )}
        </div>

        {/* Weight Selector if product is sold per Kg */}
        {isWeightProduct && !isOutOfStock && (
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
            <span className="text-[11px] font-bold text-slate-500">Poids :</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {[0.5, 1, 2, 5].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setSelectedWeight(w)}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-lg transition-all ${
                    selectedWeight === w
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {w} kg
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price & Add to Cart Button */}
        <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-emerald-950 price-tag">
                {(price * (isWeightProduct ? selectedWeight : 1)).toFixed(2)}
              </span>
              <span className="text-xs font-bold text-emerald-800">DH</span>
            </div>
            {isWeightProduct ? (
              <span className="text-[10px] text-slate-400 font-semibold">
                ({price.toFixed(2)} DH/Kg)
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">Prix unitaire</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all duration-200 shadow-sm ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : isAdded
                ? 'bg-emerald-600 text-white scale-95 shadow-emerald-200'
                : 'bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white shadow-emerald-900/10'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 animate-bounce" />
                <span>Ajouté !</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>{isWeightProduct ? `Ajouter (${selectedWeight}kg)` : 'Ajouter'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

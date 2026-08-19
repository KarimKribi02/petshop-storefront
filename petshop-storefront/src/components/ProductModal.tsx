'use client';

import React, { useState, useEffect } from 'react';
import { Product, StoreStock } from '@/types';
import { useCart } from '@/context/CartContext';
import { getMediaUrl } from '@/lib/axios';
import { 
  X, 
  ShoppingBag, 
  Check, 
  Package, 
  MapPin, 
  Building2, 
  ShieldCheck,
  Sparkles,
  Scale
} from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_STORES_STOCK: StoreStock[] = [
  { store_id: 1, store_name: 'Store A - Gueliz', quantity: 20 },
  { store_id: 2, store_name: 'Store B - Agdal', quantity: 15 },
];

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addItem } = useCart();
  const [selectedStore, setSelectedStore] = useState<StoreStock | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [weightGrams, setWeightGrams] = useState(1000);
  const [isAdded, setIsAdded] = useState(false);

  // Compute available stores stock with safe fallbacks
  const storesStock: StoreStock[] = React.useMemo(() => {
    if (!product) return [];
    if (product.stores_stock && product.stores_stock.length > 0) {
      return product.stores_stock;
    }
    const globalStock = product.stock_quantity ?? 0;
    return [
      { store_id: 1, store_name: 'Store A - Gueliz', quantity: globalStock },
      { store_id: 2, store_name: 'Store B - Agdal', quantity: Math.max(0, globalStock - 2) },
    ];
  }, [product]);

  // Sync selectedStore when product or storesStock change
  useEffect(() => {
    if (storesStock.length > 0) {
      const inStockStore = storesStock.find((s) => s.quantity > 0) || storesStock[0];
      setSelectedStore(inStockStore);
    } else {
      setSelectedStore(null);
    }
    setQuantity(1);
    setWeightGrams(1000);
    setIsAdded(false);
  }, [product, storesStock]);

  if (!isOpen || !product) return null;

  const isWeightProduct = product.unit_type === 'WEIGHT' || product.unit_type === 'kg' || product.unit_type === 'g';
  const unitPrice = parseFloat(String(product.price_sell)) || 0;
  const currentWeightGrams = Math.max(10, weightGrams || 1000);
  const weightInKg = currentWeightGrams / 1000;
  const effectivePrice = isWeightProduct ? (unitPrice * currentWeightGrams) / 1000 : unitPrice;
  const totalPrice = isWeightProduct ? effectivePrice : effectivePrice * quantity;
  const imageUrl = getMediaUrl(product.image || product.image_url);
  const maxAvailableStock = selectedStore ? selectedStore.quantity : (product.stock_quantity ?? 0);
  const isStoreOutOfStock = !selectedStore || selectedStore.quantity <= 0;

  const handleAddToCart = () => {
    if (!selectedStore || selectedStore.quantity <= 0) return;

    const productPayload: Product = {
      ...product,
      selected_store_id: selectedStore.store_id,
    };

    addItem(
      productPayload,
      isWeightProduct ? weightInKg : quantity,
      { store_id: selectedStore.store_id, store_name: selectedStore.store_name }
    );
    setIsAdded(true);

    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-xl border border-slate-100 animate-fade-in">
          
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8">
            
            {/* Header / Product Info */}
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              
              {/* Product Image */}
              <div className="w-full sm:w-36 h-36 bg-slate-50 rounded-2xl p-3 flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden relative">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product.title}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-300 gap-1">
                    <Package className="w-10 h-10" />
                    <span className="text-[10px] font-bold">Petshop</span>
                  </div>
                )}

                {product.brand?.name && (
                  <span className="absolute bottom-1.5 left-2 text-[10px] font-bold text-slate-400">
                    {product.brand.name}
                  </span>
                )}
              </div>

              {/* Title & Price Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  {product.category?.name && (
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {product.category.name}
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-slate-400">
                    REF: {product.barcode}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {product.title}
                </h2>

                {product.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {product.description}
                  </p>
                )}

                {/* Price Display */}
                <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl font-black text-emerald-950 price-tag">
                    {effectivePrice.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-emerald-800">
                    DH {isWeightProduct ? `(${currentWeightGrams >= 1000 ? `${(currentWeightGrams / 1000).toFixed(2)} Kg` : `${currentWeightGrams}g`})` : ''}
                  </span>
                  {isWeightProduct && (
                    <span className="text-[11px] text-slate-400 ml-1">
                      (Tarif : {unitPrice.toFixed(2)} DH/Kg • {(unitPrice / 10).toFixed(2)} DH/100g)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Weight selector if sold per Kg */}
            {isWeightProduct && (
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Poids pesé (en grammes) :</span>
                  </span>
                  <span className="text-[11px] font-mono text-emerald-800 font-bold">
                    1 Kg = {unitPrice.toFixed(2)} DH
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="10"
                      step="10"
                      value={weightGrams}
                      onChange={(e) => setWeightGrams(parseFloat(e.target.value) || 0)}
                      className="w-full pl-3 pr-14 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                      placeholder="Ex: 250"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      grammes
                    </span>
                  </div>
                  <div className="px-3 py-2 bg-emerald-50 text-[#14532d] rounded-xl border border-emerald-200 text-xs font-black shrink-0">
                    = {weightInKg.toFixed(2)} Kg
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {[100, 250, 500, 1000, 2000, 5000].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWeightGrams(w)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer border ${
                        weightGrams === w
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      {w >= 1000 ? `${w / 1000} Kg` : `${w}g`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 📍 Store Selection & Per-Store Stock Display */}
            <div className="space-y-2 pt-2 border-t border-slate-100 my-4">
              <label className="block text-xs font-bold uppercase text-slate-600 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-800" />
                <span>Choisissez le Magasin de Retrait / Livraison *</span>
              </label>
              
              <div className="grid grid-cols-2 gap-2.5">
                {storesStock.map((st) => {
                  const isSelected = selectedStore?.store_id === st.store_id;
                  const isAvailable = st.quantity > 0;

                  return (
                    <button
                      key={st.store_id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedStore(st)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-800 text-emerald-900 font-bold ring-1 ring-emerald-800 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      } ${!isAvailable ? 'opacity-40 cursor-not-allowed bg-slate-100' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold block text-slate-900">
                          {st.store_name}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
                        )}
                      </div>
                      <span className={`text-[11px] font-mono mt-0.5 block ${isAvailable ? 'text-emerald-700 font-semibold' : 'text-rose-600 font-medium'}`}>
                        {isAvailable ? `Stock: ${st.quantity} dispo` : 'Rupture de stock'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector (for standard unit products) & Total */}
            {!isWeightProduct && (
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700">Quantité désirée :</span>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-slate-200 rounded-2xl bg-slate-50 p-1">
                    <button
                      type="button"
                      disabled={quantity <= 1 || isStoreOutOfStock}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center font-extrabold text-slate-700 hover:bg-white rounded-xl transition disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="px-4 text-xs font-black text-slate-900 font-mono">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= maxAvailableStock || isStoreOutOfStock}
                      onClick={() => setQuantity(Math.min(maxAvailableStock, quantity + 1))}
                      className="w-8 h-8 flex items-center justify-center font-extrabold text-slate-700 hover:bg-white rounded-xl transition disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CTA Add to Cart button sends selectedStore.store_id */}
            <div className="mt-5 space-y-2">
              <button
                type="button"
                disabled={!selectedStore || selectedStore.quantity <= 0}
                onClick={handleAddToCart}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all duration-200 shadow-md ${
                  isAdded
                    ? 'bg-emerald-600 text-white'
                    : !selectedStore || selectedStore.quantity <= 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-emerald-800 hover:bg-emerald-700 active:scale-98 text-white shadow-emerald-900/20 cursor-pointer'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 animate-bounce" />
                    <span>Ajouté au panier !</span>
                  </>
                ) : isStoreOutOfStock ? (
                  <span>Indisponible dans ce magasin</span>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      Ajouter au panier ({totalPrice.toFixed(2)} DH {selectedStore ? `• ${selectedStore.store_name}` : ''})
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Paiement à la livraison ou au retrait en magasin</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

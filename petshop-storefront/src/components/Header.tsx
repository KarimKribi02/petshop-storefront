'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Category, Product, StoreSettings } from '@/types';
import apiClient, { getMediaUrl } from '@/lib/axios';
import { 
  ShoppingBag, 
  Search, 
  Phone, 
  Menu, 
  X, 
  ChevronRight, 
  Sparkles,
  MapPin,
  Clock,
  Dog,
  Cat,
  Bird,
  Fish,
  Store
} from 'lucide-react';

interface HeaderProps {
  categories?: Category[];
  selectedCategory?: number | null;
  onSelectCategory?: (categoryId: number | null) => void;
  onSearchSubmit?: (searchTerm: string) => void;
}

export default function Header({
  categories = [],
  selectedCategory = null,
  onSelectCategory,
  onSearchSubmit,
}: HeaderProps) {
  const { totalItems, totalPrice, openDrawer, isHydrated } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Fetch Store Settings
  useEffect(() => {
    apiClient.get('/settings')
      .then((res) => {
        if (res.data?.data) {
          setStoreSettings(res.data.data);
        }
      })
      .catch((err) => console.log('Settings fetch fallback:', err));
  }, []);

  // Debounced live search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      apiClient.get('/shop/products', {
        params: { search: searchQuery, per_page: 5 },
      })
        .then((res) => {
          const prods = res.data?.data?.data || res.data?.data || [];
          setSearchResults(prods);
        })
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearching(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  };

  const handleSelectCategory = (catId: number | null) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
    setMobileMenuOpen(false);
  };

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('chien') || lower.includes('dog')) return <Dog className="w-4 h-4" />;
    if (lower.includes('chat') || lower.includes('cat')) return <Cat className="w-4 h-4" />;
    if (lower.includes('oiseau') || lower.includes('bird')) return <Bird className="w-4 h-4" />;
    if (lower.includes('poisson') || lower.includes('fish') || lower.includes('aqua')) return <Fish className="w-4 h-4" />;
    return <Sparkles className="w-4 h-4" />;
  };

  const logoUrl = getMediaUrl(storeSettings?.logo_url);
  const storeName = storeSettings?.store_name || 'Animal Market Only';
  const storePhone = storeSettings?.phone_number || '+212 6 00 00 00 00';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
      {/* Top Notification Bar */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-4 font-medium">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-800 text-amber-300 text-[10px] font-black">
              ★
            </span>
            <span>
              <strong>Livraison Express</strong> à Marrakech (24h) & partout au Maroc | <strong>Paiement à la livraison</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href={`https://wa.me/${storePhone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>WhatsApp : <strong>{storePhone}</strong></span>
            </a>
            <span className="hidden md:inline-flex items-center gap-1 text-emerald-300/80">
              <Clock className="w-3 h-3" />
              <span>7j/7 : 09h00 - 21h00</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Mobile Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-2xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/" className="flex items-center gap-3 group">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={storeName}
                  className="h-11 w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-sm">
                    <Store className="w-4 h-4" />
                  </div>
                  <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors uppercase">
                    {storeName}
                  </span>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 pl-9">
                  Petshop & Vente en Ligne
                </span>
              </div>
            </Link>
          </div>

          {/* Live Search Bar (Desktop) */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-lg relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="Rechercher croquettes, litière, colliers, jouets..."
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                className="w-full pl-11 pr-24 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-600/10 transition-all shadow-xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />

              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
              >
                Trouver
              </button>
            </form>

            {/* Live Search Results Dropdown */}
            {isSearchOpen && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
                <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Résultats pour &quot;{searchQuery}&quot;</span>
                  {isSearching && <span className="text-emerald-700">Recherche en cours...</span>}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {searchResults.length > 0 ? (
                    searchResults.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          if (onSearchSubmit) onSearchSubmit(prod.title);
                          setIsSearchOpen(false);
                        }}
                        className="p-3 hover:bg-emerald-50/50 flex items-center gap-3 cursor-pointer transition-colors"
                      >
                        <div className="w-12 h-12 rounded-xl bg-slate-100 p-1 flex items-center justify-center shrink-0">
                          {prod.image ? (
                            <img
                              src={getMediaUrl(prod.image)}
                              alt={prod.title}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {prod.title}
                          </h4>
                          <span className="text-[11px] text-slate-400 block">
                            {prod.category?.name || 'Petshop'}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-extrabold text-emerald-800">
                            {parseFloat(String(prod.price_sell)).toFixed(2)} DH
                          </span>
                        </div>
                      </div>
                    ))
                  ) : !isSearching ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Aucun produit trouvé pour cette recherche.
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100/70 text-emerald-900 text-xs font-bold text-center block transition-colors"
                >
                  Voir tous les résultats
                </button>
              </div>
            )}
          </div>

          {/* Cart Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openDrawer}
              className="relative flex items-center gap-2.5 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100/80 active:scale-95 text-emerald-900 rounded-2xl border border-emerald-200/80 transition-all duration-200 shadow-xs cursor-pointer"
              aria-label="Voir le panier"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-emerald-800" />
                {isHydrated && totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-emerald-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                    {totalItems}
                  </span>
                )}
              </div>

              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[10px] uppercase font-black text-emerald-700 tracking-wider">
                  Mon Panier
                </span>
                <span className="text-xs font-black text-emerald-950 price-tag">
                  {isHydrated ? totalPrice.toFixed(2) : '0.00'} DH
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Categories Bar (Desktop) */}
        <nav className="hidden lg:flex items-center gap-2 py-3 border-t border-slate-100 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => handleSelectCategory(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedCategory === null
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tous les Produits</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelectCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {getCategoryIcon(cat.name)}
              <span>{cat.name}</span>
              {cat.products_count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-700 text-emerald-100'
                      : 'bg-white text-slate-500'
                  }`}
                >
                  {cat.products_count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl z-10 flex flex-col justify-between animate-slide-in-right">
            <div>
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center">
                    <Store className="w-4 h-4" />
                  </div>
                  <span className="font-black text-slate-900 text-sm uppercase">
                    {storeName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="p-4 border-b border-slate-100">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher un article..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </form>
              </div>

              {/* Mobile Categories List */}
              <div className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-3 block mb-2">
                  Catégories
                </span>

                <button
                  type="button"
                  onClick={() => handleSelectCategory(null)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    selectedCategory === null
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span>Tous les Produits</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {getCategoryIcon(cat.name)}
                      <span>{cat.name}</span>
                    </div>
                    {cat.products_count !== undefined && (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {cat.products_count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
              <a
                href={`https://wa.me/${storePhone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                <Phone className="w-4 h-4" />
                <span>Commander via WhatsApp</span>
              </a>

              <div className="text-center text-[11px] text-slate-400">
                <span>📍 Marrakech & Livraison Maroc</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Category, Product, StoreSettings } from '@/types';
import apiClient, { getMediaUrl } from '@/lib/axios';
import { 
  Home,
  Store,
  ShieldCheck,
  Info,
  Mail,
  HelpCircle,
  BookOpen,
  Truck,
  Heart,
  ShoppingBag,
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Phone,
  Clock,
  Dog,
  Cat,
  Bird,
  Fish,
  SlidersHorizontal,
  PackageCheck,
  ArrowRight,
  Check
} from 'lucide-react';

interface HeaderProps {
  categories?: Category[];
  selectedCategory?: number | null;
  onSelectCategory?: (categoryId: number | null) => void;
  onSearchSubmit?: (searchTerm: string) => void;
  settings?: StoreSettings | null;
  activePage?: 'home' | 'products' | 'about' | 'contact' | 'track' | 'faqs' | 'blog';
}

export default function Header({
  categories = [],
  selectedCategory = null,
  onSelectCategory,
  onSearchSubmit,
  settings = null,
  activePage = 'home',
}: HeaderProps) {
  const router = useRouter();
  const { totalItems, totalPrice, openDrawer, isHydrated } = useCart();
  const { totalWishlist, openWishlist } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  
  // Menus and modals
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(settings || null);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [compactMegaMenuOpen, setCompactMegaMenuOpen] = useState(false);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const catDropdownRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const compactMegaMenuRef = useRef<HTMLDivElement>(null);

  const validSearchCategories = categories.filter((c) => (c.products_count ?? 0) > 0);
  const selectedCatName = validSearchCategories.find((c) => String(c.id) === searchCategory)?.name || 'Toutes Les Catégories';

  // Robust Hysteresis Scroll Listener (Prevents all flickering / loops)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          setIsScrolled((prev) => {
            // Activate when scrolling down past the main header (> 160px)
            if (!prev && y > 160) return true;
            // Deactivate when scrolling back up near top (< 60px)
            if (prev && y < 60) return false;
            return prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bulletproof scroll lock for mobile & iOS Safari when burger menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const origBodyOverflow = document.body.style.overflow;
      const origHtmlOverflow = document.documentElement.style.overflow;
      const origTouchAction = document.body.style.touchAction;

      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      const preventBackgroundScroll = (e: TouchEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.mobile-drawer-scrollable')) {
          if (e.cancelable) e.preventDefault();
        }
      };

      document.addEventListener('touchmove', preventBackgroundScroll, { passive: false });

      return () => {
        document.body.style.overflow = origBodyOverflow;
        document.documentElement.style.overflow = origHtmlOverflow;
        document.body.style.touchAction = origTouchAction;
        document.removeEventListener('touchmove', preventBackgroundScroll);
      };
    }
  }, [mobileMenuOpen]);

  // Sync settings
  useEffect(() => {
    setMounted(true);
    if (settings) {
      setStoreSettings(settings);
      try {
        localStorage.setItem('petshop_store_settings', JSON.stringify(settings));
      } catch (e) {}
      return;
    }

    try {
      const cached = localStorage.getItem('petshop_store_settings');
      if (cached) {
        setStoreSettings(JSON.parse(cached));
      }
    } catch (e) {}

    apiClient.get('/settings')
      .then((res) => {
        if (res.data?.data) {
          setStoreSettings(res.data.data);
          try {
            localStorage.setItem('petshop_store_settings', JSON.stringify(res.data.data));
          } catch (e) {}
        }
      })
      .catch((err) => console.log('Settings fetch fallback:', err));
  }, [settings]);

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
        params: { 
          search: searchQuery, 
          category_id: searchCategory ? Number(searchCategory) : undefined,
          per_page: 6 
        },
      })
        .then((res) => {
          const prods = res.data?.data?.data || res.data?.data || [];
          setSearchResults(prods);
        })
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearching(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchCategory]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
      if (
        catDropdownRef.current &&
        !catDropdownRef.current.contains(e.target as Node)
      ) {
        setIsCatDropdownOpen(false);
      }
      if (
        megaMenuRef.current &&
        !megaMenuRef.current.contains(e.target as Node)
      ) {
        setMegaMenuOpen(false);
      }
      if (
        compactMegaMenuRef.current &&
        !compactMegaMenuRef.current.contains(e.target as Node)
      ) {
        setCompactMegaMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearchOpen(false);
    setIsCatDropdownOpen(false);

    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (searchCategory) params.set('categoryId', searchCategory);

    const queryString = params.toString();
    router.push(queryString ? `/products?${queryString}` : '/products');
  };

  const handleCategorySelectAndNavigate = (catIdStr: string) => {
    setSearchCategory(catIdStr);
    setIsCatDropdownOpen(false);
    setIsSearchOpen(false);

    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (catIdStr) params.set('categoryId', catIdStr);

    const queryString = params.toString();
    router.push(queryString ? `/products?${queryString}` : '/products');
  };

  const handleSelectCategory = (catId: number | null) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
    setMegaMenuOpen(false);
    setMobileMenuOpen(false);
    if (catId) {
      router.push(`/products?categoryId=${catId}`);
    } else {
      router.push('/products');
    }
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
  const storeName = storeSettings?.store_name && storeSettings.store_name !== 'Petshop Boutique'
    ? storeSettings.store_name
    : 'animal market only';
  const storePhone = storeSettings?.phone_number || '';

  return (
    <>
      {/* ── 1. MAIN NORMAL HEADER (In document flow, scrolls naturally with page) ── */}
      <header className="relative w-full bg-white border-b border-slate-100 z-30">
        
        {/* Top Announcement Bar */}
        <div className="bg-[#fcfdfd] border-b border-slate-200/70 text-slate-600 text-xs py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-medium text-slate-700 truncate">
              <span className="font-semibold text-slate-800" suppressHydrationWarning>
                {mounted && storeSettings?.store_name && storeSettings.store_name !== 'Petshop Boutique'
                  ? storeSettings.store_name
                  : 'animal market only'}
              </span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="hidden sm:inline text-slate-500 text-[11px]">
                Livraison Express & Paiement à la livraison
              </span>
            </div>

            <div className="flex items-center gap-5 text-[11px] font-semibold text-slate-600 shrink-0">
              <Link 
                href="/contact" 
                className="flex items-center gap-1.5 hover:text-emerald-800 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Contact</span>
              </Link>

              <a 
                href={storePhone ? `https://wa.me/${storePhone.replace(/[^0-9]/g, '')}?text=Bonjour,%20j'ai%20besoin%20d'aide` : '#faqs'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-emerald-800 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>Besoin d&apos;aide ?</span>
              </a>
            </div>
          </div>
        </div>

        {/* Middle Main Bar (Logo + Search) */}
        <div className="border-b border-slate-100 py-3.5 sm:py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 md:gap-8">
            
            {/* Mobile Menu Toggle & Brand Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Ouvrir le menu mobile"
              >
                <Menu className="w-6 h-6" />
              </button>

              <Link href="/" className="flex items-center group py-0.5">
                {mounted && logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={storeName}
                    className="h-11 sm:h-13 md:h-14 w-auto max-w-[180px] sm:max-w-[220px] object-contain transition-transform group-hover:scale-102"
                    style={{ maxHeight: '48px', maxWidth: '200px', objectFit: 'contain' }}
                  />
                ) : (
                  <div className="h-11 sm:h-13 w-28 sm:w-36 bg-slate-100 rounded-xl animate-pulse" />
                )}
              </Link>
            </div>

            {/* Integrated Search Bar (Desktop) */}
            <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-2xl relative">
              <form 
                onSubmit={handleSearchSubmit} 
                className="w-full flex items-center bg-slate-50 hover:bg-slate-100/70 focus-within:bg-white border border-slate-200 focus-within:border-emerald-800 rounded-xl overflow-visible shadow-2xs transition-all"
              >
                <input
                  type="text"
                  placeholder="Rechercher des produits..."
                  value={searchQuery}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  className="flex-1 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                />

                {/* Custom Categories Selector inside Search */}
                <div className="relative border-l border-slate-200 shrink-0" ref={catDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                    className="flex items-center gap-2 pl-3 pr-3.5 py-2.5 text-xs font-bold text-slate-700 hover:text-emerald-900 focus:outline-none transition-colors cursor-pointer"
                  >
                    <span className="max-w-[130px] truncate">{selectedCatName}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isCatDropdownOpen ? 'rotate-180 text-emerald-700' : ''}`} />
                  </button>

                  {/* Custom Category Dropdown Menu */}
                  {isCatDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-scale-up max-h-80 overflow-y-auto">
                      <div className="px-3.5 py-1.5 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 mb-1">
                        Filtrer par catégorie
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCategorySelectAndNavigate('')}
                        className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer text-left ${
                          searchCategory === ''
                            ? 'bg-emerald-50 text-emerald-800 font-extrabold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>Toutes Les Catégories</span>
                        {searchCategory === '' && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                      </button>

                      {validSearchCategories.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleCategorySelectAndNavigate(String(c.id))}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer text-left ${
                            searchCategory === String(c.id)
                              ? 'bg-emerald-50 text-emerald-800 font-extrabold'
                            : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate">{c.name}</span>
                          {searchCategory === String(c.id) && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search Submit Button */}
                <button
                  type="submit"
                  aria-label="Lancer la recherche"
                  className="px-4 py-2.5 bg-[#14532d] hover:bg-[#0f3e21] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 rounded-r-xl"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Live Search Results Dropdown */}
              {isSearchOpen && searchQuery.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
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
                            setIsSearchOpen(false);
                            router.push(`/products/${prod.id}`);
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
                            <span className="text-sm font-black text-[#14532d]">
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
                    className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 text-xs font-bold text-center block transition-colors cursor-pointer"
                  >
                    Voir tous les résultats
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Right Icons (Cart quick trigger) */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                onClick={openDrawer}
                className="relative p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Panier mobile"
              >
                <ShoppingBag className="w-6 h-6" />
                {mounted && isHydrated && totalItems > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-[#14532d] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="border-b border-slate-200/80 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 gap-4">
            
            {/* Left: "TOUTES LES CATÉGORIES" Button */}
            <div ref={megaMenuRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                className="bg-[#14532d] hover:bg-[#0f3e21] active:scale-98 text-white px-4 sm:px-5 py-2.5 rounded-xl flex items-center gap-3 text-xs font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer"
              >
                <span className="hidden sm:inline">TOUTES LES CATÉGORIES</span>
                <span className="sm:hidden">CATÉGORIES</span>
                <Menu className="w-4 h-4" />
              </button>

              {/* Mega Menu Dropdown */}
              {megaMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-scale-up">
                  <div className="px-4 py-2 text-[11px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 flex items-center justify-between">
                    <span>Rayons & Produits</span>
                    <button 
                      type="button" 
                      onClick={() => setMegaMenuOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="max-h-96 overflow-y-auto py-1">
                    <button
                      type="button"
                      onClick={() => handleSelectCategory(null)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-colors ${
                        selectedCategory === null
                          ? 'bg-emerald-50 text-emerald-800 font-extrabold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-emerald-700" />
                        <span>Tous les Produits</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {validSearchCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-colors ${
                          selectedCategory === cat.id
                            ? 'bg-emerald-50 text-emerald-800 font-extrabold'
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
              )}
            </div>

            {/* Center: Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-bold">
              <Link
                href="/"
                onClick={() => handleSelectCategory(null)}
                className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
                  activePage === 'home'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-extrabold shadow-xs'
                    : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-50'
                }`}
              >
                <Home className="w-3.5 h-3.5 text-emerald-700" />
                <span>Accueil</span>
              </Link>

              <Link
                href="/products"
                onClick={() => handleSelectCategory(null)}
                className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
                  activePage === 'products'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-extrabold shadow-xs'
                    : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-50'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-slate-400" />
                <span>Boutique</span>
              </Link>

              <a
                href="/#marques"
                className="px-3 py-1.5 rounded-lg text-slate-700 hover:text-emerald-800 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Nos Marques</span>
              </a>

              <Link
                href="/about"
                className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
                  activePage === 'about'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-extrabold shadow-xs'
                    : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-50'
                }`}
              >
                <Info className="w-3.5 h-3.5 text-emerald-700" />
                <span>À Propos</span>
              </Link>

              <Link
                href="/blog"
                className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
                  activePage === 'blog'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-extrabold shadow-xs'
                    : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Blog</span>
              </Link>

              <Link
                href="/contact"
                className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
                  activePage === 'contact'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-extrabold shadow-xs'
                    : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-50'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Contact</span>
              </Link>

              <a
                href="/#faqs"
                className="px-3 py-1.5 rounded-lg text-slate-700 hover:text-emerald-800 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>FAQ</span>
              </a>

              <Link
                href="/track"
                className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
                  activePage === 'track'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-extrabold shadow-xs'
                    : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-50'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                <span>Suivi</span>
              </Link>
            </nav>

            {/* Right: Quick-Action Icons */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <Link
                href="/wishlist"
                title="Mes Favoris"
                className="relative p-2 rounded-xl text-slate-700 hover:text-emerald-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Heart className="w-5 h-5" />
                <span className="absolute top-0.5 -right-0.5 bg-[#14532d] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {mounted && isHydrated ? totalWishlist : 0}
                </span>
              </Link>

              <button
                type="button"
                title="Mon Panier"
                onClick={openDrawer}
                className="relative p-2 rounded-xl text-slate-700 hover:text-emerald-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute top-0.5 -right-0.5 bg-[#14532d] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {mounted && isHydrated ? totalItems : 0}
                </span>
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Search Bar in normal flow */}
        <div className="md:hidden p-3 bg-slate-50 border-b border-slate-100">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Rechercher des produits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#14532d] text-white text-xs font-bold rounded-lg"
            >
              Go
            </button>
          </form>
        </div>

      </header>

      {/* ── 2. FIXED COMPACT STICKY HEADER (Centered horizontally, width 100%, max-w 1500px, height ~60px, rounded-12px) ── */}
      <div
        className={`fixed top-2 sm:top-2.5 left-0 right-0 z-40 px-2.5 sm:px-4 md:px-5 flex justify-center transition-all duration-250 ease-out transform pointer-events-none ${
          isScrolled && !mobileMenuOpen
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0'
        }`}
      >
        <div className="w-full max-w-[1500px] h-[60px] bg-white border border-[#e5e7eb] rounded-[12px] shadow-[0_3px_12px_rgba(0,0,0,0.05)] px-3.5 sm:px-5 flex items-center justify-between pointer-events-auto gap-2 sm:gap-4 lg:gap-6">
          
          {/* Left Group: Logo + All Categories Button */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            {/* Mobile Menu Button on mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
              aria-label="Ouvrir le menu mobile"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Logo in Compact Header */}
            <Link href="/" className="flex items-center group shrink-0">
              {mounted && logoUrl ? (
                <img
                  src={logoUrl}
                  alt={storeName}
                  className="h-[34px] w-auto max-h-[36px] max-w-[130px] sm:max-w-[160px] object-contain transition-transform group-hover:scale-102"
                  style={{ maxHeight: '36px', maxWidth: '160px', objectFit: 'contain' }}
                />
              ) : (
                <div className="h-[34px] w-20 sm:w-24 bg-slate-100 rounded-lg animate-pulse" />
              )}
            </Link>

            {/* "TOUTES LES CATÉGORIES" Button */}
            <div ref={compactMegaMenuRef} className="relative shrink-0 hidden sm:block">
              <button
                type="button"
                onClick={() => setCompactMegaMenuOpen(!compactMegaMenuOpen)}
                className="h-[40px] bg-[#14532d] hover:bg-[#0f3e21] active:scale-98 text-white px-4 rounded-[10px] flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer"
              >
                <span>TOUTES LES CATÉGORIES</span>
                <Menu className="w-4 h-4" />
              </button>

              {/* Compact Mega Menu Dropdown */}
              {compactMegaMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-scale-up">
                  <div className="px-4 py-2 text-[11px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 flex items-center justify-between">
                    <span>Rayons & Produits</span>
                    <button 
                      type="button" 
                      onClick={() => setCompactMegaMenuOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="max-h-96 overflow-y-auto py-1">
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectCategory(null);
                        setCompactMegaMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-colors ${
                        selectedCategory === null
                          ? 'bg-emerald-50 text-emerald-800 font-extrabold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-emerald-700" />
                        <span>Tous les Produits</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {validSearchCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          handleSelectCategory(cat.id);
                          setCompactMegaMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-colors ${
                          selectedCategory === cat.id
                            ? 'bg-emerald-50 text-emerald-800 font-extrabold'
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
              )}
            </div>
          </div>

          {/* Center Navigation Links (Single horizontal line, no wrapping) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-[13px] font-semibold whitespace-nowrap flex-nowrap">
            <Link
              href="/"
              onClick={() => handleSelectCategory(null)}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
                activePage === 'home'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-bold shadow-xs'
                  : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-50'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-emerald-700" />
              <span>Accueil</span>
            </Link>

            <Link
              href="/products"
              onClick={() => handleSelectCategory(null)}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
                activePage === 'products'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-bold shadow-xs'
                  : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-50'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-slate-400" />
              <span>Boutique</span>
            </Link>

            <a
              href="/#marques"
              className="px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-emerald-800 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Nos Marques</span>
            </a>

            <Link
              href="/about"
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
                activePage === 'about'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-bold shadow-xs'
                  : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-50'
              }`}
            >
              <Info className="w-3.5 h-3.5 text-emerald-700" />
              <span>À Propos</span>
            </Link>

            <Link
              href="/blog"
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
                activePage === 'blog'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-bold shadow-xs'
                  : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Blog</span>
            </Link>

            <Link
              href="/contact"
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
                activePage === 'contact'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-bold shadow-xs'
                  : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-50'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Contact</span>
            </Link>

            <a
              href="/#faqs"
              className="px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-emerald-800 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>FAQ</span>
            </a>

            <Link
              href="/track"
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${
                activePage === 'track'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-bold shadow-xs'
                  : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-50'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              <span>Suivi</span>
            </Link>
          </nav>

          {/* Right Group: Action Icons (Wishlist + Cart) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <Link
              href="/wishlist"
              title="Mes Favoris"
              className="relative p-2 rounded-xl text-slate-700 hover:text-emerald-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Heart className="w-5 h-5" />
              <span className="absolute top-0.5 -right-0.5 bg-[#14532d] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {mounted && isHydrated ? totalWishlist : 0}
              </span>
            </Link>

            <button
              type="button"
              title="Mon Panier"
              onClick={openDrawer}
              className="relative p-2 rounded-xl text-slate-700 hover:text-emerald-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute top-0.5 -right-0.5 bg-[#14532d] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {mounted && isHydrated ? totalItems : 0}
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden overscroll-none">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity overscroll-none touch-none"
            onClick={() => setMobileMenuOpen(false)}
            onTouchMove={(e) => e.preventDefault()}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl z-10 flex flex-col justify-between animate-slide-in-right overscroll-contain mobile-drawer-scrollable overflow-y-auto">
            <div>
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                  {mounted && logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={storeName}
                      className="h-10 w-auto max-h-12 object-contain"
                    />
                  ) : (
                    <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse" />
                  )}
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links inside Mobile Drawer */}
              <div className="p-3 space-y-1 text-xs font-bold text-slate-700">
                <Link
                  href="/"
                  onClick={() => {
                    handleSelectCategory(null);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-800"
                >
                  <Home className="w-4 h-4 text-emerald-700" />
                  <span>Accueil</span>
                </Link>

                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                    activePage === 'products'
                      ? 'bg-emerald-50 text-emerald-800 font-extrabold'
                      : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                  }`}
                >
                  <Store className="w-4 h-4 text-emerald-700" />
                  <span>Boutique</span>
                </Link>

                <a
                  href="/#marques"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-800 text-slate-700"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>Nos Marques</span>
                </a>

                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                    activePage === 'about'
                      ? 'bg-emerald-50 text-emerald-800 font-extrabold'
                      : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                  }`}
                >
                  <Info className="w-4 h-4 text-emerald-700" />
                  <span>À Propos</span>
                </Link>

                <Link
                  href="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                    activePage === 'blog'
                      ? 'bg-emerald-50 text-emerald-800 font-extrabold'
                      : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                  <span>Blog</span>
                </Link>

                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                    activePage === 'contact'
                      ? 'bg-emerald-50 text-emerald-800 font-extrabold'
                      : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                  }`}
                >
                  <Mail className="w-4 h-4 text-emerald-700" />
                  <span>Contact</span>
                </Link>

                <Link
                  href="/track"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                    activePage === 'track'
                      ? 'bg-emerald-50 text-emerald-800 font-extrabold'
                      : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                  }`}
                >
                  <Truck className="w-4 h-4 text-emerald-700" />
                  <span>Suivi de commande</span>
                </Link>

                <Link
                  href="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                    <span>Mes Favoris</span>
                  </div>
                  {totalWishlist > 0 && (
                    <span className="text-[10px] font-black text-white bg-[#14532d] px-2 py-0.5 rounded-full">
                      {totalWishlist}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
              <a
                href={storePhone ? `https://wa.me/${storePhone.replace(/[^0-9]/g, '')}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#14532d] hover:bg-[#0f3e21] text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp Express</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* SUIVI DE COMMANDE MODAL */}
      {isTrackingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsTrackingModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl z-10 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#14532d] flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">Suivi de votre commande</h3>
                  <p className="text-[11px] text-slate-400">Entrez votre numéro de commande</p>
                </div>
              </div>
              <button 
                onClick={() => setIsTrackingModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Numéro de Commande (ex: #1234)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 1042"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <a
                href={
                  storePhone
                    ? `https://wa.me/${storePhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Bonjour, je souhaite suivre l'état de ma commande ${trackingNumber ? `#${trackingNumber}` : ''}.`
                      )}`
                    : '#'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#14532d] hover:bg-[#0f3e21] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Vérifier le statut sur WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

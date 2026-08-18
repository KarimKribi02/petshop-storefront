'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import apiClient from '@/lib/axios';
import { Product, Category, Brand, StoreSettings } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductModal from '@/components/ProductModal';
import ProductsPageCard from '@/components/products/ProductsPageCard';
import FilterSidebar from '@/components/products/FilterSidebar';
import FilterDrawer from '@/components/products/FilterDrawer';
import ProductSkeleton from '@/components/products/ProductSkeleton';
import {
  LayoutGrid, List, SlidersHorizontal, X, ChevronRight, ChevronLeft,
  Package, Loader2, Truck, Leaf, ShieldCheck, RefreshCw,
  Phone, Star, Award, RotateCcw,
} from 'lucide-react';

const PRICE_ABS_MAX = 2000;
const PER_PAGE = 12;

const SORT_OPTIONS = [
  { value: 'latest',     label: 'En vedette' },
  { value: 'price_asc',  label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
];

// ─── Trust bar items ────────────────────────────────────────────────────────
const TRUST_ITEMS = [
  { icon: <Truck style={{ width: 28, height: 28, color: '#1a4731' }} />, title: 'Livraison gratuite', sub: 'Dès 499 DH de commande' },
  { icon: <Leaf style={{ width: 28, height: 28, color: '#1a4731' }} />, title: '100 % Naturel', sub: 'Vrais ingrédients, sans additifs' },
  { icon: <ShieldCheck style={{ width: 28, height: 28, color: '#1a4731' }} />, title: 'Approuvé par les vétérinaires', sub: 'Fait confiance aux professionnels' },
  { icon: <RefreshCw style={{ width: 28, height: 28, color: '#1a4731' }} />, title: 'Garantie satisfaction', sub: 'Garantie remboursement 30 jours' },
];

function ProductsContent() {
  const searchParams = useSearchParams();

  // Read initial query params from URL
  const paramCategory = searchParams.get('categoryId') || searchParams.get('category_id') || searchParams.get('category');
  const paramBrand = searchParams.get('brandId') || searchParams.get('brand_id') || searchParams.get('brand');
  const paramSort = searchParams.get('sortBy') || searchParams.get('sort_by');
  const paramPriceMin = searchParams.get('priceMin') || searchParams.get('price_min');
  const paramPriceMax = searchParams.get('priceMax') || searchParams.get('price_max');
  const paramSearch = searchParams.get('search');
  const paramPage = searchParams.get('page');

  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands]         = useState<Brand[]>([]);
  const [settings, setSettings]     = useState<StoreSettings | null>(null);

  const [isLoading, setIsLoading]   = useState(true);
  const [page, setPage]             = useState(paramPage ? Math.max(1, Number(paramPage)) : 1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters initialized from URL
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    paramCategory ? Number(paramCategory) : null
  );
  const [selectedBrand, setSelectedBrand]       = useState<number | null>(
    paramBrand ? Number(paramBrand) : null
  );
  const [searchTerm, setSearchTerm]             = useState<string>(
    paramSearch || ''
  );
  const [priceMin, setPriceMin] = useState(
    paramPriceMin ? Number(paramPriceMin) : 0
  );
  const [priceMax, setPriceMax] = useState(
    paramPriceMax ? Number(paramPriceMax) : PRICE_ABS_MAX
  );
  const [sortBy, setSortBy]     = useState<string>(
    paramSort || 'latest'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Quick view
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // ── Sync with browser URL navigation (e.g. back/forward or external links) ──
  useEffect(() => {
    const cat = searchParams.get('categoryId') || searchParams.get('category_id') || searchParams.get('category');
    const br = searchParams.get('brandId') || searchParams.get('brand_id') || searchParams.get('brand');
    const s = searchParams.get('search');
    const pMin = searchParams.get('priceMin') || searchParams.get('price_min');
    const pMax = searchParams.get('priceMax') || searchParams.get('price_max');
    const sBy = searchParams.get('sortBy') || searchParams.get('sort_by');
    const pPage = searchParams.get('page');

    if (cat !== null && cat !== undefined) setSelectedCategory(cat ? Number(cat) : null);
    if (br !== null && br !== undefined) setSelectedBrand(br ? Number(br) : null);
    if (s !== null && s !== undefined) setSearchTerm(s);
    if (pMin) setPriceMin(Number(pMin));
    if (pMax) setPriceMax(Number(pMax));
    if (sBy) setSortBy(sBy);
    if (pPage) setPage(Math.max(1, Number(pPage)));
  }, [searchParams]);

  // ── Sync active filters state to URL ────────────────────────────────────────
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (selectedCategory !== null) params.set('categoryId', String(selectedCategory));
    if (selectedBrand !== null) params.set('brandId', String(selectedBrand));
    if (searchTerm) params.set('search', searchTerm);
    if (priceMin > 0) params.set('priceMin', String(priceMin));
    if (priceMax < PRICE_ABS_MAX) params.set('priceMax', String(priceMax));
    if (sortBy && sortBy !== 'latest') params.set('sortBy', sortBy);
    if (page > 1) params.set('page', String(page));

    const queryString = params.toString();
    const newUrl = queryString ? `/products?${queryString}` : '/products';
    window.history.replaceState(null, '', newUrl);
  }, [selectedCategory, selectedBrand, searchTerm, priceMin, priceMax, sortBy, page]);

  // ── Fetch products ──────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async (currentPage = page) => {
    setIsLoading(true);

    try {
      const params: Record<string, any> = {
        sort_by: sortBy,
        per_page: PER_PAGE,
        page: currentPage,
      };
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedBrand)    params.brand_id    = selectedBrand;
      if (searchTerm)       params.search      = searchTerm;
      if (priceMin > 0) {
        params.price_min = priceMin;
        params.min_price = priceMin;
      }
      if (priceMax < PRICE_ABS_MAX) {
        params.price_max = priceMax;
        params.max_price = priceMax;
      }

      const res = await apiClient.get('/shop/products', { params });
      const raw = res.data?.data;
      let items: Product[] = raw?.data || raw || [];

      // Strict price filtering to guarantee products comply with price range
      if (priceMin > 0 || priceMax < PRICE_ABS_MAX) {
        items = items.filter((p) => {
          const price = parseFloat(String(p.price_sell)) || 0;
          if (priceMin > 0 && price < priceMin) return false;
          if (priceMax < PRICE_ABS_MAX && price > priceMax) return false;
          return true;
        });
      }

      const total: number = raw?.total ?? items.length;
      setProducts(items);
      setTotalCount(priceMin > 0 || priceMax < PRICE_ABS_MAX ? items.length : total);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedBrand, searchTerm, priceMin, priceMax, sortBy]);

  // ── Initial data fetch ──────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const [catRes, brandRes, settingsRes] = await Promise.allSettled([
          apiClient.get('/shop/categories'),
          apiClient.get('/shop/brands'),
          apiClient.get('/settings'),
        ]);
        if (catRes.status === 'fulfilled')      setCategories(catRes.value.data?.data || []);
        if (brandRes.status === 'fulfilled')    setBrands(brandRes.value.data?.data || []);
        if (settingsRes.status === 'fulfilled') setSettings(settingsRes.value.data?.data || null);
      } catch (e) { /* silently fail */ }
    };
    init();
  }, []);

  // ── Re-fetch when filters / sort change ────────────────────────────────────
  useEffect(() => {
    setPage(1);
    fetchProducts(1);
  }, [selectedCategory, selectedBrand, searchTerm, priceMin, priceMax, sortBy]);

  // ── Page Navigation ────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
    fetchProducts(newPage);
    window.scrollTo({ top: 220, behavior: 'smooth' });
  };

  const getPaginationPages = () => {
    const pages: (number | string)[] = [];
    const delta = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  // ── Clear all filters ───────────────────────────────────────────────────────
  const clearAll = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSearchTerm('');
    setPriceMin(0);
    setPriceMax(PRICE_ABS_MAX);
    setSortBy('latest');
    setPage(1);
    window.history.replaceState(null, '', '/products');
  };

  // ── Active filter chips ─────────────────────────────────────────────────────
  const activeChips: { label: string; onRemove: () => void }[] = [];
  if (selectedCategory !== null) {
    const cat = categories.find((c) => c.id === selectedCategory);
    if (cat) activeChips.push({ label: `Catégorie: ${cat.name}`, onRemove: () => setSelectedCategory(null) });
  }
  if (selectedBrand !== null) {
    const brand = brands.find((b) => b.id === selectedBrand);
    if (brand) activeChips.push({ label: `Marque: ${brand.name}`, onRemove: () => setSelectedBrand(null) });
  }
  if (searchTerm) {
    activeChips.push({ label: `Recherche: "${searchTerm}"`, onRemove: () => setSearchTerm('') });
  }
  if (priceMin > 0 || priceMax < PRICE_ABS_MAX) {
    activeChips.push({ label: `${priceMin} – ${priceMax} DH`, onRemove: () => { setPriceMin(0); setPriceMax(PRICE_ABS_MAX); } });
  }

  // Filter categories and brands with at least 1 product
  const validCategories = React.useMemo(() => {
    return categories.filter((c) => (c.products_count ?? 0) > 0);
  }, [categories]);

  const validBrands = React.useMemo(() => {
    return brands.filter((b) => (b.products_count ?? 0) > 0);
  }, [brands]);

  // ── Responsive grid columns (via CSS variable trick) ───────────────────────
  const gridStyle: React.CSSProperties = viewMode === 'grid'
    ? {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
        gap: '18px',
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      };

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <Header
        categories={validCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={(id) => setSelectedCategory(id)}
        settings={settings}
        activePage="products"
      />

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 20px 60px' }}>

          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
            <Link href="/" style={{ fontSize: '13px', color: '#78716c', textDecoration: 'none', fontWeight: 500 }}>
              Accueil
            </Link>
            <ChevronRight style={{ width: 14, height: 14, color: '#a8a29e' }} />
            <span style={{ fontSize: '13px', color: '#1a4731', fontWeight: 700 }}>Produits</span>
          </nav>

          {/* Page heading */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#1c1917', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              Tous les produits
            </h1>
            <p style={{ fontSize: '15px', color: '#78716c', margin: 0, lineHeight: 1.6 }}>
              Nutrition premium pour vos animaux. Découvrez notre large gamme de produits naturels et sains.
            </p>
          </div>

          {/* Layout: sidebar + main */}
          <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>

            {/* ── Desktop Sidebar (Sticky on scroll) ───────────────────────── */}
            {/* ── Sidebar (desktop) ─────────────────────────────────────── */}
            <div
              className="hidden lg:block shrink-0"
              style={{
                width: '270px',
                position: 'sticky',
                top: '75px',
                maxHeight: 'calc(100vh - 90px)',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
              }}
            >
              <FilterSidebar
                categories={validCategories}
                brands={validBrands}
                selectedCategory={selectedCategory}
                selectedBrand={selectedBrand}
                priceMin={priceMin}
                priceMax={priceMax}
                priceAbsMax={PRICE_ABS_MAX}
                onSelectCategory={setSelectedCategory}
                onSelectBrand={setSelectedBrand}
                onPriceChange={(min, max) => { setPriceMin(min); setPriceMax(max); }}
                onClearAll={clearAll}
                totalProducts={totalCount}
              />
            </div>

            {/* ── Right panel ───────────────────────────────────────────── */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Toolbar */}
              <div style={{
                background: '#fff', borderRadius: '14px', border: '1px solid #f0ece7',
                padding: '14px 18px', marginBottom: '18px',
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px',
              }}>
                {/* Mobile filter button */}
                <button
                  type="button"
                  onClick={() => setFilterDrawerOpen(true)}
                  className="flex lg:hidden items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 cursor-pointer shadow-2xs hover:bg-slate-50 transition"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Filtres</span>
                  {activeChips.length > 0 && (
                    <span className="bg-[#14532d] text-white rounded-full px-2 py-0.5 text-[10px] font-black">
                      {activeChips.length}
                    </span>
                  )}
                </button>

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Sort */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#78716c', whiteSpace: 'nowrap' }}>Trier par :</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #e5e7eb',
                      fontSize: '13px', fontWeight: 700, color: '#1c1917',
                      background: '#fff', cursor: 'pointer', outline: 'none',
                    }}
                  >
                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                {/* View toggle */}
                <div style={{ display: 'flex', borderRadius: '10px', border: '1.5px solid #e5e7eb', overflow: 'hidden' }}>
                  {(['grid', 'list'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      style={{
                        padding: '7px 10px', border: 'none', cursor: 'pointer',
                        background: viewMode === mode ? '#1a4731' : '#fff',
                        color: viewMode === mode ? '#fff' : '#78716c',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {mode === 'grid'
                        ? <LayoutGrid style={{ width: 16, height: 16 }} />
                        : <List style={{ width: 16, height: 16 }} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active filter chips */}
              {activeChips.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  {activeChips.map((chip, i) => (
                    <span
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '5px 12px', borderRadius: '20px',
                        background: '#f0fdf4', border: '1px solid #a7f3d0',
                        fontSize: '12px', fontWeight: 700, color: '#1a4731',
                      }}
                    >
                      {chip.label}
                      <button
                        onClick={chip.onRemove}
                        style={{ display: 'flex', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#1a4731' }}
                      >
                        <X style={{ width: 12, height: 12 }} />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={clearAll}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '5px 12px', borderRadius: '20px',
                      background: '#fff', border: '1px solid #e5e7eb',
                      fontSize: '12px', fontWeight: 700, color: '#78716c',
                      cursor: 'pointer',
                    }}
                  >
                    <RotateCcw style={{ width: 11, height: 11 }} /> Tout effacer
                  </button>
                </div>
              )}

              {/* ── Products grid / list ───────────────────────────────── */}
              {isLoading ? (
                <div style={gridStyle}>
                  {Array.from({ length: PER_PAGE }).map((_, i) => (
                    <ProductSkeleton key={i} viewMode={viewMode} />
                  ))}
                </div>
              ) : products.length === 0 ? (
                /* ── Empty state ─────────────────────────────────────── */
                <div style={{
                  background: '#fff', borderRadius: '20px', border: '1px solid #f0ece7',
                  padding: '60px 32px', textAlign: 'center', maxWidth: '440px', margin: '0 auto',
                }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: '#f0fdf4',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <Package style={{ width: 36, height: 36, color: '#1a4731' }} />
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1c1917', margin: '0 0 8px' }}>
                    Aucun produit trouvé
                  </h2>
                  <p style={{ fontSize: '14px', color: '#78716c', margin: '0 0 24px', lineHeight: 1.6 }}>
                    Aucun produit ne correspond à vos critères de recherche. Essayez de modifier ou supprimer vos filtres.
                  </p>
                  <button
                    onClick={clearAll}
                    style={{
                      padding: '11px 28px', borderRadius: '12px',
                      background: '#1a4731', border: 'none', color: '#fff',
                      fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    Voir tous les produits
                  </button>
                </div>
              ) : (
                <>
                  <div style={gridStyle}>
                    {products.map((product) => (
                      <ProductsPageCard
                        key={product.id}
                        product={product}
                        viewMode={viewMode}
                        onQuickView={setQuickViewProduct}
                      />
                    ))}
                  </div>

                  {/* ── Pagination Navigation ─────────────────────────────────── */}
                  {totalPages > 1 && (
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                      marginTop: '44px', padding: '24px 0 10px',
                      borderTop: '1px solid #f0ece7',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {/* Prev button */}
                        <button
                          type="button"
                          onClick={() => handlePageChange(page - 1)}
                          disabled={page <= 1}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            padding: '9px 14px', borderRadius: '12px',
                            border: '1.5px solid #e5e7eb', background: '#fff',
                            fontSize: '13px', fontWeight: 700, color: page <= 1 ? '#d6d3d1' : '#1c1917',
                            cursor: page <= 1 ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <ChevronLeft style={{ width: 16, height: 16 }} />
                          <span>Précédent</span>
                        </button>

                        {/* Page numbers */}
                        {getPaginationPages().map((p, idx) => {
                          if (p === '...') {
                            return (
                              <span key={`dots-${idx}`} style={{ padding: '0 6px', color: '#a8a29e', fontWeight: 800 }}>
                                …
                              </span>
                            );
                          }
                          const pageNum = Number(p);
                          const isActive = pageNum === page;
                          return (
                            <button
                              key={`page-${pageNum}`}
                              type="button"
                              onClick={() => handlePageChange(pageNum)}
                              style={{
                                width: '38px', height: '38px', borderRadius: '12px',
                                border: isActive ? 'none' : '1.5px solid #e5e7eb',
                                background: isActive ? '#14532d' : '#fff',
                                color: isActive ? '#fff' : '#44403c',
                                fontSize: '13px', fontWeight: 800,
                                cursor: 'pointer', transition: 'all 0.15s ease',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: isActive ? '0 4px 12px rgba(20,83,45,0.2)' : 'none',
                              }}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                        {/* Next button */}
                        <button
                          type="button"
                          onClick={() => handlePageChange(page + 1)}
                          disabled={page >= totalPages}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            padding: '9px 14px', borderRadius: '12px',
                            border: '1.5px solid #e5e7eb', background: '#fff',
                            fontSize: '13px', fontWeight: 700, color: page >= totalPages ? '#d6d3d1' : '#1c1917',
                            cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span>Suivant</span>
                          <ChevronRight style={{ width: 16, height: 16 }} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Trust Section ────────────────────────────────────────────────── */}
        <div style={{ background: '#fff', borderTop: '1px solid #f0ece7', padding: '40px 20px' }}>
          <div style={{
            maxWidth: '1100px', margin: '0 auto',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px',
          }}>
            {TRUST_ITEMS.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1c1917', marginBottom: '3px' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#78716c', lineHeight: 1.5 }}>
                    {item.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer settings={settings} />

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        categories={categories}
        brands={brands}
        selectedCategory={selectedCategory}
        selectedBrand={selectedBrand}
        priceMin={priceMin}
        priceMax={priceMax}
        priceAbsMax={PRICE_ABS_MAX}
        onSelectCategory={setSelectedCategory}
        onSelectBrand={setSelectedBrand}
        onPriceChange={(min, max) => { setPriceMin(min); setPriceMax(max); }}
        onClearAll={clearAll}
        totalProducts={totalCount}
      />

      {/* Quick View Modal */}
      <ProductModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* Responsive styles */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* Show sidebar on md+ screens */
        .products-sidebar-desktop { display: block; }
        .mobile-filter-btn { display: none !important; }

        @media (max-width: 768px) {
          .products-sidebar-desktop { display: none !important; }
          .mobile-filter-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', background: '#fafaf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 style={{ width: 36, height: 36, color: '#1a4731', animation: 'spin 1s linear infinite' }} />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}

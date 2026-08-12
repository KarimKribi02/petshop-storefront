'use client';

import React, { useState, useEffect, useRef } from 'react';
import apiClient from '@/lib/axios';
import { Product, Category, Faq, StoreSettings, Brand } from '@/types';
import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import CategoryPills from '@/components/CategoryPills';
import ProductCard from '@/components/ProductCard';
import ProductModal from '@/components/ProductModal';
import FaqSection from '@/components/FaqSection';
import Footer from '@/components/Footer';
import { 
  Sparkles, 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Package, 
  Loader2, 
  X, 
  MessageCircle, 
  Check, 
  ShoppingBag,
  Award,
  Truck,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getMediaUrl } from '@/lib/axios';

export default function HomePage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'price_asc' | 'price_desc'>('latest');
  
  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const productsSectionRef = useRef<HTMLDivElement>(null);

  // Fetch initial data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [catRes, prodRes, brandRes, faqRes, settingsRes] = await Promise.allSettled([
        apiClient.get('/shop/categories'),
        apiClient.get('/shop/products', {
          params: {
            category_id: selectedCategory || undefined,
            brand_id: selectedBrand || undefined,
            search: searchTerm || undefined,
            sort_by: sortBy,
            per_page: 24,
          },
        }),
        apiClient.get('/shop/brands'),
        apiClient.get('/shop/faqs'),
        apiClient.get('/settings'),
      ]);

      if (catRes.status === 'fulfilled' && catRes.value.data?.data) {
        setCategories(catRes.value.data.data);
      }

      if (prodRes.status === 'fulfilled') {
        const pData = prodRes.value.data?.data?.data || prodRes.value.data?.data || [];
        setProducts(pData);
      }

      if (brandRes.status === 'fulfilled' && brandRes.value.data?.data) {
        setBrands(brandRes.value.data.data);
      }

      if (faqRes.status === 'fulfilled' && faqRes.value.data?.data) {
        setFaqs(faqRes.value.data.data);
      }

      if (settingsRes.status === 'fulfilled' && settingsRes.value.data?.data) {
        setSettings(settingsRes.value.data.data);
      }
    } catch (error) {
      console.error('Error fetching storefront data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refetch when filters change
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        const res = await apiClient.get('/shop/products', {
          params: {
            category_id: selectedCategory || undefined,
            brand_id: selectedBrand || undefined,
            search: searchTerm || undefined,
            sort_by: sortBy,
            per_page: 24,
          },
        });
        const pData = res.data?.data?.data || res.data?.data || [];
        setProducts(pData);
      } catch (err) {
        console.error('Error fetching filtered products:', err);
      }
    };

    fetchFilteredProducts();
  }, [selectedCategory, selectedBrand, searchTerm, sortBy]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, []);

  const scrollToProducts = () => {
    if (productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCategorySelect = (catId: number | null) => {
    setSelectedCategory(catId);
    scrollToProducts();
  };

  const handleSearchSubmit = (term: string) => {
    setSearchTerm(term);
    scrollToProducts();
  };

  const selectedCategoryName = categories.find((c) => c.id === selectedCategory)?.name;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* Global Header */}
      <Header
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Main Content */}
      <main className="flex-1">
        
        {/* Hero Section */}
        <HeroBanner onExploreClick={scrollToProducts} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Category Pills Grid */}
          <CategoryPills
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />

          {/* Products Catalogue Section */}
          <section ref={productsSectionRef} className="py-8">
            
            {/* Catalogue Controls Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 animate-pulse"></span>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                    Catalogue & Stock en Direct
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  {searchTerm
                    ? `Résultats pour "${searchTerm}"`
                    : selectedCategoryName
                    ? `Rayon : ${selectedCategoryName}`
                    : 'Produits Vedettes / Top Ventes'}
                </h2>
              </div>

              {/* Filters & Sorting */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                
                {/* Reset Active Filters badge */}
                {(selectedCategory !== null || selectedBrand !== null || searchTerm) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedBrand(null);
                      setSearchTerm('');
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Effacer filtres</span>
                  </button>
                )}

                {/* Brands filter if brands exist */}
                {brands.length > 0 && (
                  <select
                    value={selectedBrand || ''}
                    onChange={(e) =>
                      setSelectedBrand(e.target.value ? Number(e.target.value) : null)
                    }
                    className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="">Toutes les marques</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                )}

                {/* Sort Order Selector */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="latest">Nouveautés & Top Ventes</option>
                    <option value="price_asc">Prix croissant (DH)</option>
                    <option value="price_desc">Prix décroissant (DH)</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-10 h-10 text-emerald-800 animate-spin mb-3" />
                <span className="text-sm font-bold text-slate-600">
                  Chargement des produits en cours...
                </span>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-1">
                  Aucun produit ne correspond à vos critères
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Essayez de modifier votre recherche ou de réinitialiser les filtres de catégorie.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedBrand(null);
                    setSearchTerm('');
                  }}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-colors shadow-xs"
                >
                  Afficher tous les articles
                </button>
              </div>
            )}

          </section>

          {/* Value Proposition Highlights Banner */}
          <section className="my-14 bg-gradient-to-br from-emerald-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl shadow-emerald-950/15">
            <div className="relative z-10 max-w-3xl space-y-4">
              <span className="px-3 py-1 bg-emerald-800 text-amber-300 text-xs font-black rounded-full border border-emerald-700">
                Pourquoi choisir Animal Market Only ?
              </span>
              <h2 className="text-2xl sm:text-3xl font-black leading-tight">
                La référence de l&apos;alimentation et du bien-être animal à Marrakech
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                Nous sélectionnons rigoureusement les meilleures marques internationales et locales. Profitez de la flexibilité d&apos;acheter au kilo ou en sacs fermés, et faites-vous livrer chez vous avec le confort du paiement en espèces à la livraison.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-emerald-200">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-400" />
                  Livraison 24h Marrakech
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Paiement à la livraison
                </span>
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  Garantie fraîcheur & authenticité
                </span>
              </div>
            </div>
          </section>

          {/* FAQs Section */}
          <FaqSection faqs={faqs} />

        </div>
      </main>

      {/* Global Footer */}
      <Footer settings={settings} />

      {/* Floating WhatsApp CTA Button */}
      <a
        href={`https://wa.me/${(settings?.phone_number || '+212600000000').replace(/[^0-9]/g, '')}?text=Bonjour%20Animal%20Market%20Only,%20je%20souhaite%20commander%20pour%20mon%20animal`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-3 rounded-full shadow-xl shadow-emerald-950/20 active:scale-95 transition-all duration-200 cursor-pointer"
        aria-label="Contacter sur WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
        <span className="text-xs font-black hidden sm:inline">Besoin d&apos;aide ? WhatsApp</span>
      </a>

      {/* Product Detail & Store Selector Modal */}
      <ProductModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}

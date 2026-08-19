'use client';

import React, { useState, useEffect, useMemo, use } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import apiClient, { getMediaUrl } from '@/lib/axios';
import { Product, Category, StoreSettings, StoreStock } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ProductModal from '@/components/ProductModal';
import {
  ChevronRight,
  Star,
  ShoppingBag,
  Heart,
  Plus,
  Minus,
  Check,
  Truck,
  ShieldCheck,
  CreditCard,
  Award,
  Leaf,
  Sparkles,
  CheckCircle2,
  Package,
  ArrowRight,
  Camera,
  MessageSquare,
  ThumbsUp,
  HelpCircle,
  Clock,
  WheatOff,
  Stethoscope,
  Info,
  Layers,
  MapPin,
  Building2,
  ChevronDown,
  AlertCircle,
  Store,
  Scale
} from 'lucide-react';

interface ReviewItem {
  id: string | number;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  verified: boolean;
  comment: string;
  likes: number;
}

const DEFAULT_STORES_STOCK: StoreStock[] = [
  { store_id: 1, store_name: 'Store A - Gueliz', quantity: 20 },
  { store_id: 2, store_name: 'Store B - Agdal', quantity: 15 },
];

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productIdOrSlug = resolvedParams.id;
  const router = useRouter();

  const { addItem, openDrawer } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Core Data States
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  // Purchasing States
  const [quantity, setQuantity] = useState<number>(1);
  const [weightInGrams, setWeightInGrams] = useState<number>(1000); // 100g, 250g, 500g, 1000g...
  const [selectedStore, setSelectedStore] = useState<StoreStock | null>(null);
  const [storeValidationError, setStoreValidationError] = useState<string | null>(null);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState<boolean>(false);
  const [isAddedRecently, setIsAddedRecently] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'description' | 'composition' | 'avis' | 'questions'>('description');

  // Quickview modal state for related products
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Reviews States
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewSort, setReviewSort] = useState<'recent' | 'highest' | 'lowest'>('recent');
  const [likedReviews, setLikedReviews] = useState<Record<string | number, boolean>>({});

  // 1 Review per user restriction state
  const [userExistingReview, setUserExistingReview] = useState<ReviewItem | null>(null);
  const [isEditingReview, setIsEditingReview] = useState<boolean>(false);

  // Review Form States
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewAuthor, setReviewAuthor] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewPhotoUrl, setReviewPhotoUrl] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState<string>('');
  const [reviewErrorMessage, setReviewErrorMessage] = useState<string>('');

  // 1. Fetch Product, Categories, Settings & Related Items
  useEffect(() => {
    let isMounted = true;

    const fetchProductData = async () => {
      setIsLoading(true);
      setIsNotFound(false);

      try {
        // 1. Fetch Categories & Settings in parallel with Targeted Product
        const rawParam = decodeURIComponent(productIdOrSlug || '');

        const [catRes, settingsRes, singleProdRes] = await Promise.allSettled([
          apiClient.get('/shop/categories'),
          apiClient.get('/settings'),
          apiClient.get(`/shop/products/${rawParam}`),
        ]);

        if (catRes.status === 'fulfilled' && catRes.value.data?.data) {
          if (isMounted) setCategories(catRes.value.data.data);
        }
        if (settingsRes.status === 'fulfilled' && settingsRes.value.data?.data) {
          if (isMounted) setSettings(settingsRes.value.data.data);
        }

        let targetProduct: Product | null = null;

        if (singleProdRes.status === 'fulfilled' && singleProdRes.value.data?.data) {
          targetProduct = singleProdRes.value.data.data;
        }

        // Fallback: If not found by direct ID/slug endpoint, query search with limit
        if (!targetProduct) {
          try {
            const searchRes = await apiClient.get('/shop/products', {
              params: { search: rawParam, per_page: 8 },
            });
            const searchList: Product[] = searchRes.data?.data?.data || searchRes.data?.data || [];
            targetProduct = searchList.find((p) => String(p.id) === rawParam || p.barcode === rawParam) || searchList[0] || null;
          } catch (e) {
            console.warn('Fallback search query error:', e);
          }
        }

        if (!targetProduct) {
          if (isMounted) {
            setIsNotFound(true);
            setIsLoading(false);
          }
          return;
        }

        if (isMounted) {
          setProduct(targetProduct);

          // Fetch only 4 related products (lightweight query)
          try {
            const relRes = await apiClient.get('/shop/products', {
              params: {
                category_id: targetProduct.category_id || undefined,
                per_page: 4,
              },
            });
            const relList: Product[] = (relRes.data?.data?.data || relRes.data?.data || []).filter(
              (p: Product) => p.id !== targetProduct?.id
            );
            setRelatedProducts(relList);
          } catch (e) {
            setRelatedProducts([]);
          }

          // Set default store
          const availableStores =
            targetProduct.stores_stock && targetProduct.stores_stock.length > 0
              ? targetProduct.stores_stock
              : DEFAULT_STORES_STOCK;
          const initialStore = availableStores.find((s) => s.quantity > 0) || availableStores[0];
          setSelectedStore(initialStore);

          // Initialize seed reviews + local storage user reviews
          loadReviewsForProduct(targetProduct.id);
        }
      } catch (err) {
        console.error('Error loading product detail:', err);
        if (isMounted) setIsNotFound(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProductData();

    return () => {
      isMounted = false;
    };
  }, [productIdOrSlug]);

  // Load reviews from seed + localStorage + persist likes
  const loadReviewsForProduct = (prodId: number) => {
    const defaultSeedReviews: ReviewItem[] = [
      {
        id: `seed-1-${prodId}`,
        author: 'Youssef M.',
        rating: 5,
        date: 'Il y a 2 jours',
        verified: true,
        comment: 'Excellente qualité ! Mon chien adore ces croquettes et son pelage est devenu beaucoup plus brillant et doux après seulement 2 semaines.',
        likes: 12,
      },
      {
        id: `seed-2-${prodId}`,
        author: 'Sara B.',
        rating: 5,
        date: 'Il y a 1 semaine',
        verified: true,
        comment: 'Très bonne digestibilité, fini les soucis d’estomac. Emballage hermétique solide et livraison très rapide à Marrakech.',
        likes: 7,
      },
      {
        id: `seed-3-${prodId}`,
        author: 'Mehdi A.',
        rating: 4,
        date: 'Il y a 2 semaines',
        verified: true,
        comment: 'Produit de qualité supérieure certifiée. Le service client est très réactif sur WhatsApp pour conseiller sur les rations.',
        likes: 4,
      },
      {
        id: `seed-4-${prodId}`,
        author: 'Kawtar L.',
        rating: 5,
        date: 'Il y a 1 mois',
        verified: true,
        comment: 'Mes animaux en raffolent. Ingrédients nobles et naturels sans sous-produits. Je recommande les yeux fermés !',
        likes: 9,
      }
    ];

    let combinedReviews = [...defaultSeedReviews];

    // Load custom user reviews for this product
    try {
      const stored = localStorage.getItem(`animalmarket_reviews_${prodId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          combinedReviews = [...parsed, ...defaultSeedReviews];
        }
      }
    } catch (e) {
      console.warn('Failed to load local reviews', e);
    }

    // Restore like state & counts from localStorage
    try {
      const savedLikedMap = localStorage.getItem('animalmarket_user_liked_reviews');
      if (savedLikedMap) {
        setLikedReviews(JSON.parse(savedLikedMap));
      }

      const savedLikesCounts = localStorage.getItem(`animalmarket_reviews_likes_${prodId}`);
      if (savedLikesCounts) {
        const countsMap: Record<string | number, number> = JSON.parse(savedLikesCounts);
        combinedReviews = combinedReviews.map((r) => {
          if (countsMap[r.id] !== undefined) {
            return { ...r, likes: countsMap[r.id] };
          }
          return r;
        });
      }
    } catch (e) {
      console.warn('Failed to restore likes', e);
    }

    // Check if current user already submitted a review for this product
    try {
      const existingUserRev = localStorage.getItem(`animalmarket_user_review_${prodId}`);
      if (existingUserRev) {
        const parsedUserRev = JSON.parse(existingUserRev);
        setUserExistingReview(parsedUserRev);
      } else {
        setUserExistingReview(null);
      }
    } catch (e) {
      console.warn('Failed to load existing user review', e);
    }

    setReviews(combinedReviews);
  };

  // Submit New Review (or Update Existing Review - 1 review limit per user)
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (!reviewAuthor.trim()) {
      setReviewErrorMessage('Veuillez entrer votre nom.');
      return;
    }
    if (!reviewComment.trim() || reviewComment.trim().length < 5) {
      setReviewErrorMessage('Votre avis doit comporter au moins 5 caractères.');
      return;
    }

    setIsSubmittingReview(true);
    setReviewErrorMessage('');

    setTimeout(() => {
      const isEditing = !!userExistingReview;
      const reviewId = isEditing ? userExistingReview.id : Date.now();

      const newOrUpdatedReview: ReviewItem = {
        id: reviewId,
        author: reviewAuthor.trim(),
        rating: reviewRating,
        date: "Aujourd'hui",
        verified: true,
        comment: reviewComment.trim(),
        likes: isEditing ? userExistingReview.likes : 0,
      };

      let localReviews: ReviewItem[] = [];
      try {
        const stored = localStorage.getItem(`animalmarket_reviews_${product.id}`);
        localReviews = stored ? JSON.parse(stored) : [];
      } catch (e) {}

      let updatedFullList: ReviewItem[] = [];
      if (isEditing) {
        updatedFullList = reviews.map((r) => (r.id === reviewId ? newOrUpdatedReview : r));
        localReviews = localReviews.map((r) => (r.id === reviewId ? newOrUpdatedReview : r));
      } else {
        updatedFullList = [newOrUpdatedReview, ...reviews.filter((r) => r.id !== reviewId)];
        localReviews = [newOrUpdatedReview, ...localReviews.filter((r) => r.id !== reviewId)];
      }

      setReviews(updatedFullList);
      setUserExistingReview(newOrUpdatedReview);
      setIsEditingReview(false);

      try {
        localStorage.setItem(`animalmarket_reviews_${product.id}`, JSON.stringify(localReviews));
        localStorage.setItem(`animalmarket_user_review_${product.id}`, JSON.stringify(newOrUpdatedReview));
      } catch (e) {
        console.warn('Failed to save review to storage', e);
      }

      setIsSubmittingReview(false);
      setReviewAuthor('');
      setReviewComment('');
      setReviewRating(5);
      setReviewPhotoUrl('');
      setReviewSuccessMessage(
        isEditing
          ? 'Votre avis a été modifié avec succès !'
          : 'Votre avis a été publié avec succès. Merci pour votre retour !'
      );

      setTimeout(() => {
        setReviewSuccessMessage('');
      }, 5000);
    }, 500);
  };

  // Start editing existing review
  const handleStartEditReview = () => {
    if (!userExistingReview) return;
    setReviewAuthor(userExistingReview.author);
    setReviewRating(userExistingReview.rating);
    setReviewComment(userExistingReview.comment);
    setIsEditingReview(true);
    setReviewErrorMessage('');
  };

  // Cancel editing
  const handleCancelEditReview = () => {
    setIsEditingReview(false);
    setReviewAuthor('');
    setReviewComment('');
    setReviewRating(5);
    setReviewErrorMessage('');
  };

  // Delete user review
  const handleDeleteUserReview = () => {
    if (!product || !userExistingReview) return;
    const revId = userExistingReview.id;
    const updated = reviews.filter((r) => r.id !== revId);
    setReviews(updated);
    setUserExistingReview(null);
    setIsEditingReview(false);

    try {
      const stored = localStorage.getItem(`animalmarket_reviews_${product.id}`);
      if (stored) {
        const localList: ReviewItem[] = JSON.parse(stored);
        localStorage.setItem(
          `animalmarket_reviews_${product.id}`,
          JSON.stringify(localList.filter((r) => r.id !== revId))
        );
      }
      localStorage.removeItem(`animalmarket_user_review_${product.id}`);
    } catch (e) {}

    setReviewSuccessMessage('Votre avis a été supprimé.');
    setTimeout(() => setReviewSuccessMessage(''), 3000);
  };

  // Toggle Like on Review with real localStorage persistence
  const handleToggleLikeReview = (reviewId: string | number) => {
    if (!product) return;

    const isCurrentlyLiked = !!likedReviews[reviewId];
    const willBeLiked = !isCurrentlyLiked;

    // 1. Update liked state map
    const nextLikedState = { ...likedReviews, [reviewId]: willBeLiked };
    setLikedReviews(nextLikedState);
    try {
      localStorage.setItem('animalmarket_user_liked_reviews', JSON.stringify(nextLikedState));
    } catch (e) {}

    // 2. Update reviews list with exact +1 or -1
    setReviews((currentList) => {
      const updatedList = currentList.map((r) => {
        if (r.id === reviewId) {
          const newLikes = willBeLiked ? r.likes + 1 : Math.max(0, r.likes - 1);
          return { ...r, likes: newLikes };
        }
        return r;
      });

      // Save updated likes counts to localStorage
      try {
        const countsMap: Record<string | number, number> = {};
        updatedList.forEach((r) => {
          countsMap[r.id] = r.likes;
        });
        localStorage.setItem(`animalmarket_reviews_likes_${product.id}`, JSON.stringify(countsMap));
      } catch (e) {}

      return updatedList;
    });
  };

  // Smooth scroll to reviews
  const scrollToReviews = () => {
    setActiveTab('avis');
    const el = document.getElementById('product-tabs-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Price Calculation
  const isOutOfStock = (product?.stock_quantity ?? 0) <= 0;
  const isWeightProduct = product?.unit_type === 'WEIGHT' || product?.unit_type === 'kg' || product?.unit_type === 'g';
  const basePrice = parseFloat(String(product?.price_sell || 0)) || 0;
  const oldPrice = product?.price_buy && parseFloat(String(product.price_buy)) > basePrice 
    ? parseFloat(String(product.price_buy)) 
    : (basePrice > 0 ? parseFloat((basePrice * 1.15).toFixed(2)) : 0);

  // Live Weight & Price Calculations: 1kg = basePrice, 100g = basePrice / 10
  const currentWeightGrams = Math.max(10, weightInGrams || 1000);
  const weightInKg = currentWeightGrams / 1000;
  const totalPrice = isWeightProduct
    ? (basePrice * currentWeightGrams) / 1000
    : basePrice * quantity;
  const pricePerKg = basePrice.toFixed(2);
  const pricePer100g = (basePrice / 10).toFixed(2);

  // Store handling
  const availableStoresStock: StoreStock[] = useMemo(() => {
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

  // Add to cart handler with Point de vente & Disponibilité & Weight validation
  const handleAddToCart = (overrideStore?: StoreStock) => {
    if (!product || isOutOfStock) return;

    const storeToUse = overrideStore || selectedStore || availableStoresStock[0];

    // 1. Validation: Ensure a store is selected
    if (!storeToUse) {
      setStoreValidationError('Veuillez sélectionner un point de vente pour vérifier la disponibilité.');
      const el = document.getElementById('store-selector-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // 2. Validation: Ensure the store has stock available
    if (storeToUse.quantity <= 0) {
      setStoreValidationError(`Le produit est actuellement en rupture de stock au magasin "${storeToUse.store_name}". Veuillez sélectionner un autre point de vente.`);
      const el = document.getElementById('store-selector-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // 3. Validation: Ensure requested quantity/weight does not exceed store stock
    const requestedQty = isWeightProduct ? (Math.max(10, weightInGrams) / 1000) : quantity;
    if (requestedQty > storeToUse.quantity) {
      setStoreValidationError(
        isWeightProduct
          ? `Stock insuffisant : seulement ${storeToUse.quantity} Kg disponible(s) au magasin "${storeToUse.store_name}".`
          : `Stock insuffisant : seulement ${storeToUse.quantity} unité(s) disponible(s) au magasin "${storeToUse.store_name}".`
      );
      return;
    }

    // Clear any validation errors
    setStoreValidationError(null);

    const payload: Product = {
      ...product,
      selected_store_id: storeToUse.store_id,
    };

    addItem(
      payload,
      requestedQty,
      { store_id: storeToUse.store_id, store_name: storeToUse.store_name }
    );

    setIsAddedRecently(true);
    setIsStoreModalOpen(false);
    openDrawer();

    setTimeout(() => {
      setIsAddedRecently(false);
    }, 2000);
  };

  // Average Rating
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 4.8;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return parseFloat((sum / reviews.length).toFixed(1));
  }, [reviews]);

  // Rating distribution
  const ratingDistribution = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating)));
      counts[rounded] = (counts[rounded] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  // Sorted Reviews
  const sortedReviews = useMemo(() => {
    const list = [...reviews];
    if (reviewSort === 'highest') return list.sort((a, b) => b.rating - a.rating);
    if (reviewSort === 'lowest') return list.sort((a, b) => a.rating - b.rating);
    return list;
  }, [reviews, reviewSort]);

  // ── SKELETON LOADING STATE ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafaf8] text-slate-900 font-sans">
        <Header categories={categories} settings={settings} />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full animate-pulse">
          {/* Breadcrumb Skeleton */}
          <div className="h-4 bg-slate-200 rounded-full w-64 mb-8" />

          {/* Main 2-Col Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            <div className="lg:col-span-6 aspect-square bg-slate-200 rounded-3xl" />
            <div className="lg:col-span-6 space-y-4">
              <div className="h-6 bg-slate-200 rounded-full w-28" />
              <div className="h-10 bg-slate-200 rounded-2xl w-4/5" />
              <div className="h-5 bg-slate-200 rounded-full w-48" />
              <div className="h-20 bg-slate-100 rounded-2xl w-full" />
              <div className="h-12 bg-slate-200 rounded-2xl w-full" />
              <div className="h-14 bg-slate-200 rounded-2xl w-full" />
            </div>
          </div>
        </main>
        <Footer settings={settings} />
      </div>
    );
  }

  // ── NOT FOUND ERROR STATE ───────────────────────────────────────────────────
  if (isNotFound || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafaf8] text-slate-900 font-sans">
        <Header categories={categories} settings={settings} />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-[#14532d] flex items-center justify-center mb-6 shadow-sm border border-emerald-200">
            <Package className="w-10 h-10" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-3">
            Produit Introuvable
          </h1>
          <p className="text-slate-600 max-w-md mx-auto mb-8 text-sm sm:text-base leading-relaxed">
            Le produit que vous recherchez n&apos;est plus disponible ou a été déplacé dans notre catalogue.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products"
              className="px-8 py-3.5 rounded-2xl bg-[#14532d] hover:bg-[#0f3e21] text-white text-sm font-bold shadow-md transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Retour à la boutique</span>
            </Link>
            <Link
              href="/"
              className="px-8 py-3.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-sm font-bold shadow-2xs transition-colors"
            >
              <span>Page d&apos;accueil</span>
            </Link>
          </div>
        </main>
        <Footer settings={settings} />
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const imageUrl = getMediaUrl(product.image || product.image_url);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf8] text-slate-900 selection:bg-emerald-200 selection:text-emerald-950 font-sans">
      
      {/* ── 1. HEADER (Official Component) ─────────────────────────────────── */}
      <Header categories={categories} settings={settings} />

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <main className="flex-1">
        
        {/* ── 2. BREADCRUMB ────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3">
          <nav className="flex items-center flex-wrap gap-2 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-emerald-800 transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

            <Link href="/products" className="hover:text-emerald-800 transition-colors">
              Boutique
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

            {product.category?.name && (
              <>
                <Link
                  href={`/products?category=${encodeURIComponent(product.category.name)}`}
                  className="hover:text-emerald-800 transition-colors"
                >
                  {product.category.name}
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </>
            )}

            <span className="text-[#14532d] font-bold truncate max-w-[240px] sm:max-w-md">
              {product.title}
            </span>
          </nav>
        </div>

        {/* ── 3. MAIN PRODUCT DETAIL (2 COLUMNS) ───────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* ── LEFT COLUMN: EXACTLY ONE LARGE PRODUCT IMAGE (FULL CADRE) ── */}
            <div className="lg:col-span-6">
              <div className="relative bg-white rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-center aspect-[4/3] sm:aspect-square w-full overflow-hidden group">
                
                {/* Out of Stock Badge (only shown when out of stock) */}
                {isOutOfStock && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 text-xs font-black uppercase tracking-wider border border-rose-200 shadow-2xs">
                      Rupture de Stock
                    </span>
                  </div>
                )}

                {/* Wishlist Floating Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className="absolute top-4 right-4 z-10 w-11 h-11 rounded-2xl bg-white/95 border border-slate-200 shadow-sm flex items-center justify-center transition-all hover:scale-108 active:scale-95 cursor-pointer"
                  title={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      isWishlisted ? 'fill-rose-600 text-rose-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  />
                </button>

                {/* Product Image: Full frame (full cadre), sharp and responsive */}
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      const parent = (e.target as HTMLElement).parentElement;
                      if (parent) {
                        const fallback = parent.querySelector('.fallback-placeholder-large');
                        if (fallback) (fallback as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : null}

                {/* Fallback Placeholder */}
                <div
                  className={`fallback-placeholder-large flex-col items-center justify-center gap-3 text-emerald-800 ${
                    imageUrl ? 'hidden' : 'flex'
                  }`}
                >
                  <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center">
                    <Package className="w-10 h-10 text-[#14532d]" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Image Produit Non Disponible
                  </span>
                </div>

              </div>
            </div>

            {/* ── RIGHT COLUMN: PRODUCT INFORMATION & PURCHASING ─────────── */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Brand & Category Pill */}
              <div className="flex items-center flex-wrap gap-2">
                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-[#14532d] text-xs font-black uppercase tracking-wider border border-emerald-200/60">
                  {product.brand?.name || 'Animal Market Only'}
                </span>

                {product.category?.name && (
                  <span className="text-xs font-semibold text-slate-400">
                    • {product.category.name}
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl xl:text-4xl font-black text-slate-950 tracking-tight leading-[1.15]">
                {product.title}
              </h1>

              {/* Rating & Stock Row */}
              <div className="flex items-center flex-wrap gap-4 pb-2 border-b border-slate-200/80">
                {/* Rating Clickable Link */}
                <button
                  type="button"
                  onClick={scrollToReviews}
                  className="flex items-center gap-2 group cursor-pointer"
                  title="Voir les avis clients"
                >
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {averageRating}
                  </span>
                  <span className="text-xs font-medium text-slate-500 underline underline-offset-2 group-hover:text-emerald-700 transition-colors">
                    ({reviews.length} avis)
                  </span>
                </button>

                <span className="text-slate-300">•</span>

                {/* Stock Status Badge */}
                {isOutOfStock ? (
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Rupture de stock</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>En stock</span>
                  </div>
                )}
              </div>

              {/* Short Product Description */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {product.description ||
                  'Alimentation complète et naturelle de haute qualité élaborée avec des ingrédients nobles pour soutenir la vitalité, le pelage et la santé globale de votre animal de compagnie.'}
              </p>

              {/* 3 Key Benefits with Icons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-[#14532d] flex items-center justify-center shrink-0">
                    <WheatOff className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Sans céréales</span>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-[#14532d] flex items-center justify-center shrink-0">
                    <Leaf className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">100% Naturel</span>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-[#14532d] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Haute digestibilité</span>
                </div>
              </div>

              {/* ── TYPE DE VENTE & CONDITIONNEMENT (POIDS OU PIÈCE) ──────── */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#14532d] flex items-center justify-center">
                      {isWeightProduct ? <Scale className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Type de Vente *
                      </span>
                      <span className="text-xs font-black text-slate-900">
                        {isWeightProduct ? 'Vente au Poids (Kg / Gramme)' : 'Vente par Pièce (Unité)'}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-black text-[#14532d] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {isWeightProduct ? `${basePrice.toFixed(2)} DH / 1 Kg` : `${basePrice.toFixed(2)} DH / Unité`}
                  </span>
                </div>

                {/* If Vente au Poids: display weight in grams input + quick presets + live formula */}
                {isWeightProduct ? (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label htmlFor="weight-input-grams" className="text-xs font-bold text-slate-700">
                        Saisir le poids désiré (en grammes) :
                      </label>
                      <span className="text-[11px] font-mono text-emerald-800 font-bold">
                        1 Kg = {basePrice.toFixed(2)} DH • 100g = {pricePer100g} DH
                      </span>
                    </div>

                    {/* Numeric Input for Grams */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          id="weight-input-grams"
                          type="number"
                          min="10"
                          step="10"
                          value={weightInGrams}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setWeightInGrams(val);
                            setStoreValidationError(null);
                          }}
                          className="w-full pl-4 pr-16 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14532d]/20 focus:border-[#14532d]"
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

                    {/* Quick Presets Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-500 mr-1">Raccourcis :</span>
                      {[100, 250, 500, 1000, 2000, 5000].map((grams) => {
                        const isSelected = weightInGrams === grams;
                        return (
                          <button
                            key={grams}
                            type="button"
                            onClick={() => {
                              setWeightInGrams(grams);
                              setStoreValidationError(null);
                            }}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-[#14532d] text-white border-[#14532d] shadow-xs'
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                          >
                            {grams >= 1000 ? `${grams / 1000} Kg` : `${grams}g`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* ── POINT DE VENTE & DISPONIBILITÉ VALIDATION BLOCK ────────── */}
              <div id="store-selector-section" className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100/80 text-[#14532d] flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        Point de vente & Disponibilité
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Sélectionnez votre magasin pour vérifier le stock
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsStoreModalOpen(true)}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1 cursor-pointer"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Détails magasins</span>
                  </button>
                </div>

                {/* Validation Error Alert */}
                {storeValidationError && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{storeValidationError}</span>
                  </div>
                )}

                {/* Store Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {availableStoresStock.map((s) => {
                    const isSelected = selectedStore?.store_id === s.store_id;
                    const hasStock = s.quantity > 0;
                    const isLowStock = s.quantity > 0 && s.quantity <= 5;

                    return (
                      <button
                        key={s.store_id}
                        type="button"
                        onClick={() => {
                          setSelectedStore(s);
                          setStoreValidationError(null);
                        }}
                        className={`p-3.5 rounded-2xl text-left border transition-all relative cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/80 border-[#14532d] text-[#14532d] ring-2 ring-[#14532d]/20 shadow-xs'
                            : hasStock
                            ? 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50/50'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5 font-black text-xs text-slate-900">
                            <Store className="w-3.5 h-3.5 text-slate-500" />
                            <span>{s.store_name}</span>
                          </div>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-[#14532d] text-white flex items-center justify-center text-[10px]">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          {hasStock ? (
                            <span
                              className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full ${
                                isLowStock
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isLowStock ? 'bg-amber-500 animate-pulse' : 'bg-emerald-600'
                                }`}
                              />
                              {isLowStock
                                ? `Stock limité : ${s.quantity} restant(s)`
                                : `En stock : ${s.quantity} dispo`}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Rupture de stock
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedStore && (
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Retrait & expédition validés depuis :{' '}
                      <strong className="text-slate-900">{selectedStore.store_name}</strong> (
                      {selectedStore.quantity} unités disponibles)
                    </span>
                  </div>
                )}
              </div>

              {/* ── PRICE SECTION ─────────────────────────────────────────── */}
              <div className="pt-2">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl sm:text-4xl font-black text-[#14532d] tracking-tight">
                    {totalPrice.toFixed(2)} DH
                  </span>

                  {oldPrice > totalPrice && (
                    <span className="text-sm sm:text-base font-semibold text-slate-400 line-through">
                      {(oldPrice * (isWeightProduct ? weightInKg : quantity)).toFixed(2)} DH
                    </span>
                  )}

                  {isWeightProduct && (
                    <span className="text-xs font-semibold text-slate-500 ml-auto">
                      Tarif : {pricePerKg} DH / Kg ({pricePer100g} DH / 100g)
                    </span>
                  )}
                </div>
              </div>

              {/* ── QUANTITY SELECTOR & ADD TO CART CTA ───────────────────── */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch gap-3">
                
                {/* Quantity Controls (Only for Vente par Pièce) */}
                {!isWeightProduct && (
                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-1.5 shadow-2xs shrink-0 w-full sm:w-36">
                    <button
                      type="button"
                      onClick={() => {
                        setQuantity((q) => Math.max(1, q - 1));
                        setStoreValidationError(null);
                      }}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 disabled:opacity-40 text-slate-800 flex items-center justify-center font-bold transition-colors cursor-pointer"
                      aria-label="Diminuer la quantité"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="font-black text-sm text-slate-900 w-8 text-center">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        const maxStock = selectedStore ? selectedStore.quantity : (product.stock_quantity ?? 99);
                        if (quantity >= maxStock) {
                          setStoreValidationError(`Stock maximum atteint (${maxStock} disponible(s) au magasin sélectionné).`);
                          return;
                        }
                        setQuantity((q) => q + 1);
                        setStoreValidationError(null);
                      }}
                      disabled={isOutOfStock || (selectedStore ? quantity >= selectedStore.quantity : false)}
                      className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 disabled:opacity-40 text-slate-800 flex items-center justify-center font-bold transition-colors cursor-pointer"
                      aria-label="Augmenter la quantité"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Primary Add To Cart Button */}
                <button
                  type="button"
                  onClick={() => handleAddToCart()}
                  disabled={Boolean(isOutOfStock || (selectedStore ? selectedStore.quantity <= 0 : false))}
                  className={`flex-1 py-4 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg shadow-emerald-950/15 ${
                    isOutOfStock || (selectedStore ? selectedStore.quantity <= 0 : false)
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : isAddedRecently
                      ? 'bg-[#14532d] text-white ring-2 ring-emerald-400'
                      : 'bg-[#14532d] hover:bg-[#0f3e21] active:scale-98 text-white'
                  }`}
                >
                  {isAddedRecently ? (
                    <>
                      <Check className="w-5 h-5 stroke-[3] text-emerald-300" />
                      <span>Ajouté au panier !</span>
                    </>
                  ) : selectedStore && selectedStore.quantity <= 0 ? (
                    <span>Épuisé à {selectedStore.store_name}</span>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>
                        Ajouter au panier • {totalPrice.toFixed(2)} DH
                        {isWeightProduct ? ` (${weightInGrams >= 1000 ? `${(weightInGrams / 1000).toFixed(2)} Kg` : `${weightInGrams}g`})` : ''}
                        {selectedStore ? ` • ${selectedStore.store_name}` : ''}
                      </span>
                    </>
                  )}
                </button>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className="w-14 h-14 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xs shrink-0 cursor-pointer"
                  title={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isWishlisted ? 'fill-rose-600 text-rose-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  />
                </button>

              </div>

              {/* ── TRUST & DELIVERY INFORMATION CARDS ─────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-200/80">
                
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#14532d] flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">Livraison 24h à Marrakech</div>
                    <div className="text-[11px] text-slate-500">24–48h dans tout le Maroc</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#14532d] flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">Paiement à la livraison</div>
                    <div className="text-[11px] text-slate-500">Espèces ou carte à la réception</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#14532d] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">Produit 100% authentique</div>
                    <div className="text-[11px] text-slate-500">Qualité certifiée & scellée</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">Gagnez des points fidélité</div>
                    <div className="text-[11px] text-slate-500">Cumulez des remises sur chaque achat</div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* ── 4. PRODUCT CONTENT TABS SECTION ──────────────────────────────── */}
        <section id="product-tabs-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 scroll-mt-24">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            
            {/* Tab Navigation Header */}
            <div className="flex items-center gap-2 px-4 sm:px-8 pt-4 border-b border-slate-200 overflow-x-auto scrollbar-none">
              {[
                { id: 'description', label: 'Description' },
                { id: 'composition', label: 'Composition & Analyse' },
                { id: 'avis', label: `Avis Clients (${reviews.length})` },
                { id: 'questions', label: 'Questions Fréquentes' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-4 px-4 text-xs sm:text-sm font-black transition-all whitespace-nowrap cursor-pointer relative ${
                      isActive
                        ? 'text-[#14532d]'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#14532d] rounded-t-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Body Content */}
            <div className="p-6 sm:p-10">
              
              {/* TAB 1: DESCRIPTION */}
              {activeTab === 'description' && (
                <div className="space-y-6 max-w-4xl text-slate-600 leading-relaxed text-sm sm:text-base">
                  <div>
                    <h3 className="text-xl font-black text-slate-950 mb-3">
                      À Propos de {product.title}
                    </h3>
                    <p>
                      {product.description ||
                        "Cette recette a été soigneusement formulée par des nutritionnistes animaliers pour apporter tous les nutriments indispensables à la santé, la vitalité et l'épanouissement de votre animal. Riches en protéines nobles et formulées sans colorants artificiels, nos recettes garantissent une digestion optimale et une grande appétence."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-5 rounded-2xl bg-[#fafaf8] border border-slate-200/80 space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#14532d] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Les points forts</span>
                      </h4>
                      <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-700 font-bold">•</span>
                          <span>Teneur élevée en protéines hautement digestibles</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-700 font-bold">•</span>
                          <span>Soutien du système immunitaire et des articulations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-700 font-bold">•</span>
                          <span>Enrichi en Oméga 3 & 6 pour une peau saine et un pelage soyeux</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-700 font-bold">•</span>
                          <span>Convient aux animaux sensibles ou prédisposés aux intolérances</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#fafaf8] border border-slate-200/80 space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#14532d] flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Engagements qualité</span>
                      </h4>
                      <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-700 font-bold">•</span>
                          <span>0% d&apos;arômes artificiels ou conservateurs chimiques</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-700 font-bold">•</span>
                          <span>Ingrédients rigoureusement contrôlés et traçables</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-700 font-bold">•</span>
                          <span>Conditionnement hermétique pour une fraîcheur garantie</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: COMPOSITION & ANALYSE */}
              {activeTab === 'composition' && (
                <div className="space-y-8 max-w-4xl">
                  <div>
                    <h3 className="text-xl font-black text-slate-950 mb-3">
                      Ingrédients & Composition
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                      Viandes et sous-produits animaux nobles de première qualité (poulet frais, dinde, saumon), légumes déshydratés (patates douces, petits pois, carottes), huiles végétales et de poisson (source naturelle d&apos;EPA et DHA), pulpe de betterave, levure de bière, herbes botaniques sélectionnées (romarin, thym, sauge), minéraux et vitamines chélatées.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-3">
                      Constituants Analytiques Moyens
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Protéines brutes', value: '32.0%' },
                        { label: 'Matières grasses', value: '16.0%' },
                        { label: 'Fibres brutes', value: '3.2%' },
                        { label: 'Cendres brutes', value: '7.5%' },
                        { label: 'Calcium', value: '1.4%' },
                        { label: 'Phosphore', value: '1.0%' },
                        { label: 'Oméga 3', value: '0.8%' },
                        { label: 'Oméga 6', value: '2.6%' },
                      ].map((item, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-[#fafaf8] border border-slate-200/80 text-center">
                          <div className="text-xs font-bold text-slate-500">{item.label}</div>
                          <div className="text-lg font-black text-[#14532d] mt-1">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: AVIS CLIENTS */}
              {activeTab === 'avis' && (
                <div className="space-y-10">
                  
                  {/* Reviews Summary Header */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#fafaf8] p-6 sm:p-8 rounded-3xl border border-slate-200/80">
                    
                    {/* Score column */}
                    <div className="lg:col-span-4 text-center lg:text-left space-y-2">
                      <div className="text-5xl font-black text-slate-950">
                        {averageRating} <span className="text-xl text-slate-400 font-bold">/ 5</span>
                      </div>
                      <div className="flex items-center justify-center lg:justify-start gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-xs font-semibold text-slate-500">
                        Basé sur <strong className="text-slate-900">{reviews.length} avis clients</strong> vérifiés
                      </div>
                    </div>

                    {/* Progress bars column */}
                    <div className="lg:col-span-8 space-y-1.5">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = ratingDistribution[star] || 0;
                        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                            <span className="w-8 flex items-center gap-1 shrink-0 font-bold text-slate-800">
                              {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            </span>
                            <div className="flex-1 h-2.5 rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#14532d] transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="w-8 text-right font-mono text-slate-500 text-[11px] shrink-0">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                  </div>

                  {/* 2-Column: Reviews List + Add Review Form */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT: Reviews List (7 cols) */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <h4 className="text-sm font-black text-slate-900">
                          Commentaires récents ({reviews.length})
                        </h4>

                        {/* Sort Selector */}
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-slate-400">Trier par:</span>
                          <select
                            value={reviewSort}
                            onChange={(e) => setReviewSort(e.target.value as any)}
                            className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
                          >
                            <option value="recent">Les plus récents</option>
                            <option value="highest">Meilleures notes</option>
                            <option value="lowest">Notes les plus basses</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {sortedReviews.map((rev) => {
                          const isLiked = !!likedReviews[rev.id];
                          return (
                            <div
                              key={rev.id}
                              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-emerald-100/90 text-[#14532d] font-black flex items-center justify-center text-sm uppercase shadow-2xs border border-emerald-200/70 shrink-0 select-none">
                                    {rev.author ? rev.author.trim().charAt(0).toUpperCase() : 'U'}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs sm:text-sm font-black text-slate-900">
                                        {rev.author}
                                      </span>
                                      {rev.verified && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                          <Check className="w-3 h-3 stroke-[3]" />
                                          <span>Achat vérifié</span>
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <div className="flex items-center gap-0.5 text-amber-400">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                          <Star
                                            key={s}
                                            className={`w-3 h-3 ${
                                              s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-[11px] text-slate-400">• {rev.date}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Helpful Button */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleLikeReview(rev.id)}
                                  className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                                    isLiked
                                      ? 'bg-emerald-50 border-emerald-300 text-[#14532d]'
                                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                  }`}
                                  title="Avis utile"
                                >
                                  <ThumbsUp className={`w-3 h-3 ${isLiked ? 'fill-[#14532d]' : ''}`} />
                                  <span className="text-[11px] font-bold">{rev.likes}</span>
                                </button>
                              </div>

                              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                                {rev.comment}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* RIGHT: Add / Manage Review Form (5 cols) */}
                    <div className="lg:col-span-5 bg-[#fafaf8] p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm sticky top-28">
                      {reviewSuccessMessage && (
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-start gap-2.5 mb-4 animate-fade-in">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                          <span>{reviewSuccessMessage}</span>
                        </div>
                      )}

                      {reviewErrorMessage && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold mb-4">
                          {reviewErrorMessage}
                        </div>
                      )}

                      {/* STATE A: User already submitted a review & is not currently editing it */}
                      {userExistingReview && !isEditingReview ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-[#14532d] text-xs font-black rounded-full border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Votre avis sur ce produit</span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-semibold">1 avis / produit</span>
                          </div>

                          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100/90 text-[#14532d] font-black flex items-center justify-center text-sm uppercase shadow-2xs border border-emerald-200/70 shrink-0 select-none">
                                  {userExistingReview.author ? userExistingReview.author.trim().charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                  <div className="text-sm font-black text-slate-900">{userExistingReview.author}</div>
                                  <div className="flex items-center gap-1 text-amber-400 mt-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <Star
                                        key={s}
                                        className={`w-3.5 h-3.5 ${
                                          s <= userExistingReview.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                        }`}
                                      />
                                    ))}
                                    <span className="text-xs font-bold text-slate-700 ml-1.5">
                                      {userExistingReview.rating} / 5
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <span className="text-[11px] text-slate-400 font-medium">{userExistingReview.date}</span>
                            </div>

                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                              &ldquo;{userExistingReview.comment}&rdquo;
                            </p>

                            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={handleStartEditReview}
                                className="flex-1 py-2.5 px-3 bg-[#14532d] hover:bg-[#0f3e21] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
                              >
                                Modifier mon avis
                              </button>
                              <button
                                type="button"
                                onClick={handleDeleteUserReview}
                                className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                            Vous avez déjà donné votre avis sur ce produit. Vous pouvez le modifier ou le supprimer à tout moment.
                          </p>
                        </div>
                      ) : (
                        /* STATE B: User writing a new review OR editing their existing review */
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-base font-black text-slate-950">
                              {isEditingReview ? 'Modifier votre avis' : 'Ajouter un avis'}
                            </h4>
                            {isEditingReview && (
                              <button
                                type="button"
                                onClick={handleCancelEditReview}
                                className="text-xs font-bold text-slate-400 hover:text-slate-700 underline cursor-pointer"
                              >
                                Annuler
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mb-5">
                            {isEditingReview
                              ? 'Modifiez votre note ou votre commentaire ci-dessous.'
                              : 'Partagez votre expérience pour aider les autres propriétaires d\'animaux (1 avis par produit).'}
                          </p>

                          <form onSubmit={handleSubmitReview} className="space-y-4">
                            
                            {/* Interactive Star Selection */}
                            <div>
                              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                                Votre Note
                              </label>
                              <div className="flex items-center gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => {
                                  const active = hoverRating ? star <= hoverRating : star <= reviewRating;
                                  return (
                                    <button
                                      key={star}
                                      type="button"
                                      onMouseEnter={() => setHoverRating(star)}
                                      onMouseLeave={() => setHoverRating(0)}
                                      onClick={() => setReviewRating(star)}
                                      className="p-1 transition-transform hover:scale-125 cursor-pointer"
                                      aria-label={`${star} étoiles`}
                                    >
                                      <Star
                                        className={`w-6 h-6 transition-colors ${
                                          active ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                                        }`}
                                      />
                                    </button>
                                  );
                                })}
                                <span className="text-xs font-bold text-slate-700 ml-2">
                                  {hoverRating || reviewRating} / 5
                                </span>
                              </div>
                            </div>

                            {/* Author Name */}
                            <div>
                              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                Votre Nom
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="Ex: Youssef M."
                                value={reviewAuthor}
                                onChange={(e) => setReviewAuthor(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#14532d] focus:ring-2 focus:ring-emerald-700/20 outline-none transition-all"
                              />
                            </div>

                            {/* Review Content */}
                            <div>
                              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                Votre Avis
                              </label>
                              <textarea
                                required
                                rows={4}
                                maxLength={1000}
                                placeholder="Partagez votre expérience avec ce produit..."
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#14532d] focus:ring-2 focus:ring-emerald-700/20 outline-none transition-all resize-none"
                              />
                              <div className="text-[10px] text-right text-slate-400 mt-1">
                                {reviewComment.length} / 1000 caractères
                              </div>
                            </div>

                            {/* Optional Photo Attachment */}
                            <div>
                              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                Ajouter des photos (optionnel)
                              </label>
                              <label className="w-full py-3 px-4 rounded-2xl bg-white border border-dashed border-slate-300 hover:border-emerald-600 hover:bg-emerald-50/40 text-slate-600 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                                <Camera className="w-4 h-4 text-emerald-700" />
                                <span>Cliquez pour ajouter une photo</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      setReviewPhotoUrl(e.target.files[0].name);
                                    }
                                  }}
                                />
                              </label>
                              {reviewPhotoUrl && (
                                <div className="text-[11px] font-bold text-emerald-800 mt-1 flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Photo sélectionnée: {reviewPhotoUrl}</span>
                                </div>
                              )}
                            </div>

                            {/* Submit Button */}
                            <button
                              type="submit"
                              disabled={isSubmittingReview}
                              className="w-full py-3.5 px-6 rounded-2xl bg-[#14532d] hover:bg-[#0f3e21] active:scale-98 text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-md shadow-emerald-950/15 transition-all cursor-pointer disabled:opacity-60"
                            >
                              {isSubmittingReview
                                ? 'Enregistrement...'
                                : isEditingReview
                                ? 'Enregistrer les modifications'
                                : 'Publier mon avis'}
                            </button>

                            <span className="text-[10px] text-slate-400 block text-center">
                              En publiant un avis, vous acceptez nos conditions d&apos;utilisation et directives de modération.
                            </span>
                          </form>
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 5: FAQ & QUESTIONS */}
              {activeTab === 'questions' && (
                <div className="space-y-4 max-w-4xl">
                  <h3 className="text-xl font-black text-slate-950 mb-4">
                    Questions Fréquentes sur ce Produit
                  </h3>

                  {[
                    {
                      q: 'Comment conserver ce produit une fois ouvert ?',
                      a: 'Conservez le paquet dans un endroit sec, frais et à l’abri de la lumière directe du soleil. Refermez soigneusement le zip hermétique après chaque utilisation pour préserver toutes les saveurs et les qualités nutritives.',
                    },
                    {
                      q: 'Comment effectuer une transition alimentaire en douceur ?',
                      a: 'Pour éviter tout trouble digestif, nous recommandons une transition progressive sur 7 à 10 jours en mélangeant graduellement les nouvelles croquettes avec l’ancienne alimentation (25% jour 1-3, 50% jour 4-6, 75% jour 7-9, 100% jour 10).',
                    },
                    {
                      q: 'Quels sont les délais de livraison à Marrakech et au Maroc ?',
                      a: 'Toutes les commandes passées avant 14h sont livrées sous 24h à Marrakech. Pour les autres villes du Maroc (Casablanca, Rabat, Tanger, Agadir...), le délai standard est de 24h à 48h.',
                    },
                  ].map((faq, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-[#fafaf8] border border-slate-200/80 space-y-2">
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-[#14532d]" />
                        <span>{faq.q}</span>
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>
        </section>

        {/* ── 5. RELATED PRODUCTS SECTION ──────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 border-t border-slate-200/80">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#14532d]">
                  RECOMMANDATIONS
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1">
                  Produits fréquemment achetés ensemble
                </h2>
              </div>

              <Link
                href="/products"
                className="hidden sm:flex items-center gap-2 text-xs font-black text-[#14532d] hover:text-[#0f3e21] uppercase tracking-wider transition-colors"
              >
                <span>Voir toute la boutique</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {relatedProducts.map((relProd) => (
                <div key={relProd.id} className="h-full">
                  <ProductCard
                    product={relProd}
                    onQuickView={(p) => router.push(`/products/${p.id}`)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* ── 6. FOOTER ──────────────────────────────────────────────────────── */}
      <Footer settings={settings} />

      {/* Quick View Modal for related items */}
      <ProductModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* ── MODAL VALIDATION POINT DE VENTE & DISPONIBILITÉ ──────────────── */}
      {isStoreModalOpen && product && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsStoreModalOpen(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all w-full max-w-lg border border-slate-100 p-6 sm:p-7">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-[#14532d] flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Valider Point de Vente & Disponibilité
                    </h3>
                    <p className="text-xs text-slate-500">
                      Vérifiez les stocks disponibles en temps réel dans nos magasins
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStoreModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="py-4 space-y-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block">Produit :</span>
                    <strong className="text-slate-900 font-black">{product.title}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">Prix :</span>
                    <strong className="text-[#14532d] font-black text-sm">{totalPrice.toFixed(2)} DH</strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    Choisissez votre magasin de référence :
                  </span>
                  {availableStoresStock.map((st) => {
                    const isSelected = selectedStore?.store_id === st.store_id;
                    const hasStock = st.quantity > 0;
                    const isLowStock = st.quantity > 0 && st.quantity <= 5;

                    return (
                      <div
                        key={st.store_id}
                        onClick={() => {
                          if (hasStock) {
                            setSelectedStore(st);
                            setStoreValidationError(null);
                          }
                        }}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-[#14532d] ring-2 ring-[#14532d]/20 text-[#14532d]'
                            : hasStock
                            ? 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                            : 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? 'border-[#14532d] bg-[#14532d] text-white'
                                : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{st.store_name}</div>
                            <div className="text-[11px] text-slate-500">
                              {hasStock
                                ? 'Retrait en magasin sous 2h ou livraison express'
                                : 'Actuellement indisponible dans ce magasin'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {hasStock ? (
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                                isLowStock
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {st.quantity} en stock
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                              Épuisé
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsStoreModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={!selectedStore || selectedStore.quantity <= 0}
                  onClick={() => handleAddToCart(selectedStore || undefined)}
                  className="flex-2 py-3 px-4 rounded-2xl bg-[#14532d] hover:bg-[#0f3e21] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-md"
                >
                  Valider & Ajouter au panier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

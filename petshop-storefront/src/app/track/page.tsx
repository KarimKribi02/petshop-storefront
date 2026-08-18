'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/axios';
import { Category, StoreSettings } from '@/types';
import Header from '@/components/Header';
import {
  Sparkles,
  Heart,
  ShieldCheck,
  Award,
  Truck,
  Leaf,
  Phone,
  ArrowRight,
  ChevronRight,
  RefreshCw,
  Clock,
  Star,
  Check,
  Package,
  Lock,
  Headphones,
  Stethoscope,
  Mail,
  MapPin,
  MessageCircle,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Navigation,
  Loader2,
  Box,
  CircleDot,
  FileText
} from 'lucide-react';

interface OrderTimelineStep {
  title: string;
  date: string;
  time: string;
  status: 'completed' | 'current' | 'upcoming';
  icon: 'check' | 'box' | 'truck' | 'pin' | 'delivered';
}

interface MockOrder {
  id: string;
  numericId?: number;
  orderDate: string;
  customerName?: string;
  customerPhone?: string;
  statusText: string;
  statusType: 'in_transit' | 'delivered' | 'processing';
  etaMessage: string;
  timeline: OrderTimelineStep[];
  products: {
    title: string;
    variant: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  shippingMethod: string;
  shippingAddress: string;
  paymentMethod: string;
  total: number;
}

const SAMPLE_ORDER: MockOrder = {
  id: 'PF123456789',
  orderDate: '12 Mai 2024 à 14:32',
  statusText: 'En cours de livraison',
  statusType: 'in_transit',
  etaMessage: 'Votre commande est en cours de livraison. Elle devrait arriver aujourd’hui avant 18:00.',
  timeline: [
    {
      title: 'Commande confirmée',
      date: '12 Mai 2024',
      time: '14:32',
      status: 'completed',
      icon: 'check'
    },
    {
      title: 'Préparée',
      date: '12 Mai 2024',
      time: '16:10',
      status: 'completed',
      icon: 'box'
    },
    {
      title: 'En cours de livraison',
      date: '13 Mai 2024',
      time: '09:15',
      status: 'current',
      icon: 'truck'
    },
    {
      title: 'En route',
      date: '13 Mai 2024',
      time: '10:45',
      status: 'upcoming',
      icon: 'pin'
    },
    {
      title: 'Livrée',
      date: 'En attente',
      time: '',
      status: 'upcoming',
      icon: 'delivered'
    }
  ],
  products: [
    {
      title: 'Animal Market Only – Croquettes Sans Céréales',
      variant: 'Recette Poulet pour Chiens · 2kg',
      quantity: 1,
      price: 210,
      image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=300&q=80'
    },
    {
      title: 'Animal Market Only – Friandises Naturelles au Poulet',
      variant: 'Friandises croustillantes · 200g',
      quantity: 1,
      price: 85,
      image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80'
    }
  ],
  shippingMethod: 'Livraison Standard Express',
  shippingAddress: '123 Rue Al Massira, Gueliz, Marrakech 40000, Maroc',
  paymentMethod: 'Paiement à la livraison (COD)',
  total: 295
};

export default function TrackOrderPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOrder, setActiveOrder] = useState<MockOrder | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<MockOrder[]>([]);

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Load placed orders from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('animalmarket_placed_orders') || localStorage.getItem('pawfuel_placed_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentOrders(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load recent orders from storage:', e);
    }
  }, []);

  useEffect(() => {
    // Check URL params on client side
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlOrder = params.get('order') || params.get('order_id') || params.get('order_number') || params.get('id');
      if (urlOrder) {
        setSearchQuery(urlOrder);
        performSearch(urlOrder);
      }
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, settingsRes] = await Promise.allSettled([
          apiClient.get('/shop/categories'),
          apiClient.get('/settings'),
        ]);
        if (catRes.status === 'fulfilled' && catRes.value.data?.data) {
          setCategories(catRes.value.data.data);
        }
        if (settingsRes.status === 'fulfilled' && settingsRes.value.data?.data) {
          setSettings(settingsRes.value.data.data);
        }
      } catch (err) {
        console.error('Error fetching track page data:', err);
      }
    };
    loadData();
  }, []);

function formatOrderForTracking(rawOrder: any): MockOrder {
  const isPickup =
    rawOrder.delivery_type === 'PICKUP_STORE' ||
    (rawOrder.shipping_method || '').includes('Retrait') ||
    (rawOrder.shippingMethod || '').includes('Retrait') ||
    (rawOrder.shippingAddress || '').includes('Retrait');

  const statusRaw = String(
    rawOrder.status || rawOrder.order_status || rawOrder.statusText || 'pending'
  ).toLowerCase();

  let statusText = 'En attente de confirmation';
  let statusType: 'processing' | 'in_transit' | 'delivered' = 'processing';
  let etaMessage = isPickup
    ? 'Votre commande a été reçue et est en cours de validation avant préparation en boutique.'
    : 'Votre commande a été transmise à notre équipe. Livraison prévue sous 24h à 48h.';

  // 0: Pending, 1: Confirmed & Prep, 2: In Transit / Ready for pickup, 3: Delivered / Picked up, -1: Cancelled
  let currentStepIdx = 0;

  if (statusRaw.includes('cancel') || statusRaw.includes('annul')) {
    statusText = 'Commande annulée';
    statusType = 'processing';
    etaMessage = 'Cette commande a été annulée. N\'hésitez pas à nous contacter sur WhatsApp pour plus de détails.';
    currentStepIdx = -1;
  } else if (
    statusRaw.includes('deliver') ||
    statusRaw.includes('livr') ||
    statusRaw.includes('retir') ||
    statusRaw.includes('complete')
  ) {
    statusText = isPickup ? 'Commande retirée avec succès' : 'Commande livrée avec succès';
    statusType = 'delivered';
    etaMessage = isPickup
      ? 'Votre commande a bien été retirée en magasin. Merci pour votre fidélité !'
      : 'Votre commande a bien été livrée à votre domicile. Merci pour votre fidélité !';
    currentStepIdx = 3;
  } else if (
    statusRaw.includes('transit') ||
    statusRaw.includes('cours') ||
    statusRaw.includes('ship') ||
    statusRaw.includes('exped') ||
    statusRaw.includes('pret') ||
    statusRaw.includes('ready')
  ) {
    statusText = isPickup ? 'Prête au retrait en magasin' : 'En cours de livraison';
    statusType = 'in_transit';
    etaMessage = isPickup
      ? 'Votre commande est prête ! Vous pouvez vous présenter en magasin pour la retirer.'
      : 'Votre colis est en cours d’acheminement par notre livreur. Arrivée imminente.';
    currentStepIdx = 2;
  } else if (
    statusRaw.includes('confirm') ||
    statusRaw.includes('prep') ||
    statusRaw.includes('process')
  ) {
    statusText = isPickup ? 'Commande confirmée (En préparation)' : 'Commande confirmée (En préparation)';
    statusType = 'processing';
    etaMessage = isPickup
      ? 'Votre commande est confirmée. Nos équipes préparent vos articles en boutique.'
      : 'Votre commande est validée et en cours d’emballage par nos préparateurs.';
    currentStepIdx = 1;
  } else {
    // Pending
    statusText = 'En attente de confirmation';
    statusType = 'processing';
    currentStepIdx = 0;
  }

  const formattedDate = rawOrder.created_at
    ? new Date(rawOrder.created_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : rawOrder.orderDate || rawOrder.order_date || 'Aujourd’hui';

  const steps: OrderTimelineStep[] = [
    {
      title: 'Commande reçue',
      date: formattedDate,
      time: rawOrder.orderTime || '',
      status: currentStepIdx >= 0 ? (currentStepIdx > 0 ? 'completed' : 'current') : 'upcoming',
      icon: 'check',
    },
    {
      title: 'Confirmée & Préparation',
      date: currentStepIdx >= 1 ? formattedDate : 'En attente',
      time: '',
      status: currentStepIdx >= 1 ? (currentStepIdx > 1 ? 'completed' : 'current') : 'upcoming',
      icon: 'box',
    },
    {
      title: isPickup ? 'Prête au retrait' : 'En cours de livraison',
      date: currentStepIdx >= 2 ? formattedDate : 'En attente',
      time: '',
      status: currentStepIdx >= 2 ? (currentStepIdx > 2 ? 'completed' : 'current') : 'upcoming',
      icon: isPickup ? 'pin' : 'truck',
    },
    {
      title: isPickup ? 'Retirée' : 'Livrée',
      date: currentStepIdx >= 3 ? formattedDate : 'En attente',
      time: '',
      status: currentStepIdx >= 3 ? 'completed' : 'upcoming',
      icon: 'delivered',
    },
  ];

  const rawId = rawOrder.order_number || rawOrder.id;
  const displayId = rawId
    ? String(rawId).startsWith('OR')
      ? String(rawId).replace('#', '')
      : `OR${1872980 + Number(rawId)}`
    : 'OR1872981';

  const orderItemsList =
    rawOrder.order_items ||
    rawOrder.orderItems ||
    rawOrder.items ||
    rawOrder.products ||
    [];

  const mappedProducts = orderItemsList.map((it: any) => ({
    title: it.product?.title || it.product_title || it.title || 'Produit Animal Market Only',
    variant:
      it.variant ||
      `${it.product?.category?.name || 'Nutrition'} · Qté: ${it.quantity || 1}`,
    quantity: it.quantity || 1,
    price: parseFloat(
      String(
        it.total ||
          (it.quantity || 1) *
            parseFloat(String(it.unit_price || it.price || it.product?.price_sell || 0))
      )
    ),
    image:
      it.product?.image ||
      it.product?.image_url ||
      it.image ||
      'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=300&q=80',
  }));

  return {
    id: displayId,
    numericId: rawOrder.id || rawOrder.numericId,
    orderDate: formattedDate,
    customerName: rawOrder.customer_name || rawOrder.customerName,
    customerPhone: rawOrder.phone || rawOrder.customer_phone || rawOrder.customerPhone,
    statusText,
    statusType,
    etaMessage,
    timeline: steps,
    products: mappedProducts,
    shippingMethod:
      rawOrder.shippingMethod ||
      rawOrder.shipping_method ||
      (isPickup ? 'Retrait Click & Collect en magasin' : 'Livraison Express à Domicile'),
    shippingAddress:
      rawOrder.shippingAddress ||
      rawOrder.address ||
      (isPickup ? 'Point de vente sélectionné' : 'Adresse de livraison'),
    paymentMethod: rawOrder.paymentMethod || rawOrder.payment_method || 'Paiement à la livraison (COD)',
    total: parseFloat(String(rawOrder.total || rawOrder.total_amount || 0)),
  };
}

  const performSearch = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsSearching(true);
    setHasSearched(true);
    setSearchError(null);

    const normalized = trimmed.toUpperCase().replace('#', '').trim();

    // Auto-scroll to results section
    scrollToTrackingResults();

    // 1. Try to fetch live order from API
    try {
      const liveRes = await apiClient.get(`/shop/orders/${encodeURIComponent(normalized)}`);
      if (liveRes.data?.status === 'success' && liveRes.data.data) {
        const liveOrder = formatOrderForTracking(liveRes.data.data);
        setActiveOrder(liveOrder);
        setIsSearching(false);
        setSearchError(null);
        scrollToTrackingResults();
        return;
      }
    } catch (e) {
      // Continue to search local / cache if direct API call doesn't return
    }

    // 2. Fetch real placed orders from localStorage
    let realOrders: any[] = [];
    try {
      const saved =
        localStorage.getItem('animalmarket_placed_orders') ||
        localStorage.getItem('pawfuel_placed_orders');
      if (saved) {
        realOrders = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse placed orders', e);
    }

    // Find real matching order
    const matched = realOrders.find((o: any) => {
      const cleanId = (o.id || o.order_number || '').toUpperCase().replace('#', '').trim();
      const oNumeric = String(o.numericId || o.id || '');
      const cleanPhone = (o.customerPhone || o.phone || '').replace(/\D/g, '');
      const queryPhone = normalized.replace(/\D/g, '');

      return (
        cleanId === normalized ||
        oNumeric === normalized ||
        cleanId.includes(normalized) ||
        (queryPhone.length >= 8 && cleanPhone === queryPhone)
      );
    });

    if (matched) {
      const formatted = formatOrderForTracking(matched);
      setActiveOrder(formatted);
      setSearchError(null);
    } else if (normalized === 'PF123456789' || normalized === 'DEMO') {
      setActiveOrder(SAMPLE_ORDER);
      setSearchError(null);
    } else {
      setActiveOrder(null);
      setSearchError(
        `Aucune commande réelle trouvée pour le numéro "${trimmed}". Veuillez vérifier votre référence de commande ou le numéro de téléphone utilisé lors de l'achat.`
      );
    }

    setIsSearching(false);
    scrollToTrackingResults();
  };

  const scrollToTrackingResults = () => {
    setTimeout(() => {
      const section = document.getElementById('tracking-result-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSubscribed(false), 4000);
  };

  const storePhone = settings?.phone_number || '+212 6 12 34 56 78';
  const cleanPhone = storePhone.replace(/[^0-9]/g, '');
  const storeEmail = settings?.support_email || 'support@animalmarketonly.ma';

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf8] text-slate-900 selection:bg-emerald-200 selection:text-emerald-950 font-sans">

      {/* ── 2. STICKY HEADER ──────────────────────────────────────────────── */}
      <Header
        categories={categories}
        settings={settings}
        activePage="track"
      />

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <main className="flex-1">

        {/* ── 3. BREADCRUMB ───────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-emerald-800 transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-emerald-800 font-bold">Suivi de commande</span>
          </nav>
        </div>

        {/* ── 4. HERO SECTION WITH SEARCH ─────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

            {/* Left Column (Search Form) */}
            <div className="lg:col-span-6 space-y-6">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#14532d] text-xs font-black uppercase tracking-wider shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>SUIVI DE COMMANDE</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-950 leading-[1.1]">
                Suivi de <br />
                <span className="text-[#14532d]">Commande</span>
              </h1>

              {/* Description */}
              <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                Entrez votre numéro de commande pour suivre l&apos;état de votre livraison en temps réel.
              </p>

              {/* Tracking Search Input Form */}
              <form onSubmit={handleSearch} className="space-y-3 pt-1 max-w-lg">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      required
                      placeholder="Ex: PF123456789"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 focus:border-[#14532d] focus:ring-2 focus:ring-emerald-700/20 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 transition-all outline-none shadow-xs"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>

                  <button
                    type="submit"
                    disabled={isSearching}
                    className="px-7 py-3.5 rounded-2xl bg-[#14532d] hover:bg-[#0f3e21] active:scale-98 text-white text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-950/15 transition-all cursor-pointer disabled:opacity-60 shrink-0"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Recherche...</span>
                      </>
                    ) : (
                      <>
                        <span>Suivre</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Vous trouverez votre numéro de commande dans l&apos;email ou SMS de confirmation.</span>
                </div>
              </form>

            </div>

            {/* Right Column (Hero Lifestyle Photo) */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-emerald-900/10 via-amber-500/5 to-emerald-50 p-2 sm:p-3 border border-slate-200/70 shadow-xl shadow-slate-200/50">
                <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=85"
                    alt="Animal attendant avec enthousiasme sa commande et son colis de friandises"
                    className="w-full h-full object-cover object-center transform hover:scale-103 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

                  {/* Floating Express Badge */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/80 shadow-lg flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                        <Truck className="w-5 h-5 text-[#14532d]" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">Livraison Express 24h</div>
                        <div className="text-[11px] text-slate-500">Marrakech & partout au Maroc</div>
                      </div>
                    </div>

                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-full shrink-0">
                      En Direct
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── 5. SEARCH RESULTS & TRACKING SECTION ─────────────────────────── */}
        <section id="tracking-result-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 scroll-mt-24">

          {/* Case 1: Searching state skeleton */}
          {isSearching && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-lg animate-pulse space-y-6">
              <div className="h-6 bg-slate-200 rounded-full w-48" />
              <div className="h-20 bg-slate-100 rounded-2xl w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-48 bg-slate-100 rounded-2xl" />
                <div className="h-48 bg-slate-100 rounded-2xl" />
              </div>
            </div>
          )}

          {/* Case 2: Error / Order Not Found State */}
          {!isSearching && searchError && (
            <div className="bg-white rounded-3xl border border-rose-200/80 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-950">Commande introuvable</h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                {searchError}
              </p>

              <div className="pt-3 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('PF123456789');
                    setActiveOrder(SAMPLE_ORDER);
                    setSearchError(null);
                  }}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                >
                  Charger la commande de démonstration
                </button>

                <a
                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Bonjour Animal Market Only, je n’arrive pas à retrouver ma commande.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-[#14532d] hover:bg-[#0f3e21] text-white rounded-xl text-xs font-black transition-colors"
                >
                  Aide sur WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* Case 3: Initial State (No order searched yet) */}
          {!isSearching && !searchError && !activeOrder && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: How Tracking Works (8 cols on lg) */}
              <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-lg shadow-slate-200/30 space-y-8">
                <div>
                  <div className="w-10 h-1 bg-[#14532d] rounded-full mb-3" />
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                    Comment fonctionne le suivi de commande ?
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1">
                    Suivez chaque étape de l&apos;acheminement de vos colis Animal Market Only en toute sérénité.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                  <div className="p-5 rounded-2xl bg-[#fafaf8] border border-slate-200/70 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-[#14532d] font-black flex items-center justify-center text-sm">
                      1
                    </div>
                    <h3 className="text-sm font-black text-slate-900">Numéro de Commande</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Munissez-vous du code reçu dans votre SMS ou email de confirmation (ex: <span className="font-mono font-bold text-slate-700">#PF123456789</span>).
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#fafaf8] border border-slate-200/70 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-[#14532d] font-black flex items-center justify-center text-sm">
                      2
                    </div>
                    <h3 className="text-sm font-black text-slate-900">Suivi en Temps Réel</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Tapez votre numéro dans la barre de recherche ci-dessus et cliquez sur <span className="font-bold text-slate-700">« Suivre »</span>.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#fafaf8] border border-slate-200/70 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-[#14532d] font-black flex items-center justify-center text-sm">
                      3
                    </div>
                    <h3 className="text-sm font-black text-slate-900">Livraison Express</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Visualisez l&apos;heure d&apos;arrivée estimée et recevez votre colis à domicile ou au point de retrait.
                    </p>
                  </div>
                </div>

                {/* Recent Placed Orders (if any exist on this browser) */}
                {recentOrders.length > 0 && (
                  <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#14532d]" />
                        <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Vos Commandes Récentes ({recentOrders.length})
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-800 font-bold">1-Clic pour suivre</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {recentOrders.slice(0, 4).map((recOrder) => (
                        <button
                          key={recOrder.id}
                          type="button"
                          onClick={() => {
                            setSearchQuery(recOrder.id);
                            performSearch(recOrder.id);
                          }}
                          className="p-3 bg-white hover:bg-emerald-50 rounded-xl border border-slate-200/80 hover:border-[#14532d] text-left transition-all group shadow-2xs cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <div className="font-mono font-black text-xs text-slate-900 group-hover:text-[#14532d]">
                              #{recOrder.id}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {recOrder.customerName ? `${recOrder.customerName} · ` : ''}{recOrder.orderDate}
                            </div>
                            <div className="text-[11px] font-extrabold text-[#14532d] mt-1">
                              {recOrder.total} DH ({recOrder.products?.length || 1} article{recOrder.products?.length > 1 ? 's' : ''})
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#14532d] group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-[#14532d] shrink-0" />
                    <span className="text-xs font-bold text-emerald-950">
                      Vous souhaitez tester avec une commande de démonstration ?
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('PF123456789');
                      performSearch('PF123456789');
                    }}
                    className="px-4 py-2 bg-[#14532d] hover:bg-[#0f3e21] text-white rounded-xl text-xs font-black transition-colors shrink-0 cursor-pointer"
                  >
                    Tester la démo
                  </button>
                </div>
              </div>

              {/* Right Companion Column (4 cols on lg) */}
              <div className="lg:col-span-4 space-y-6">
                {/* 1. Support Card */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-lg shadow-slate-200/30 space-y-5">
                  <div>
                    <h3 className="text-xl font-black text-slate-950">
                      Besoin d&apos;aide ?
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Notre équipe est là pour vous aider à tout moment.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Bonjour Animal Market Only, j’ai une question sur ma livraison.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0">
                        <MessageCircle className="w-4 h-4 fill-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-slate-900">WhatsApp Direct</div>
                        <div className="text-[11px] text-emerald-800 font-semibold">{storePhone}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#25D366] group-hover:translate-x-0.5 transition-transform" />
                    </a>

                    <a
                      href={`tel:${cleanPhone}`}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#14532d] flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900">Téléphone</div>
                        <div className="text-[11px] text-slate-500">Lun – Ven : 9h00 – 18h00</div>
                      </div>
                    </a>

                    <a
                      href={`mailto:${storeEmail}`}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#14532d] flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900">Email</div>
                        <div className="text-[11px] text-slate-500">{storeEmail}</div>
                      </div>
                    </a>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/contact"
                      className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Contactez-nous</span>
                    </Link>
                  </div>
                </div>

                {/* 2. Fast Delivery Promise Card */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
                    <Package className="w-5 h-5 text-amber-800" />
                  </div>

                  <h4 className="text-base font-black text-slate-950">
                    Livraison Rapide & Fiable
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Nous faisons tout notre possible pour expédier et livrer vos produits en toute sécurité dans les meilleures conditions de fraîcheur.
                  </p>

                  <div className="pt-1">
                    <Link
                      href="/about"
                      className="inline-flex items-center gap-1 text-xs font-black text-amber-950 hover:underline"
                    >
                      <span>En savoir plus</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Case 4: Active Order Found State */}
          {!isSearching && activeOrder && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Left Main Tracking Card (8 cols on lg) */}
              <div className="lg:col-span-8 space-y-8">

                {/* 5.1 Main Order Status & Timeline Card */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-lg shadow-slate-200/30 space-y-6">

                  {/* Order ID & Date Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                          Numéro de suivi
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-950 mt-0.5">
                        Commande #{activeOrder.id}
                      </h2>
                      <div className="text-xs text-slate-500 mt-0.5 font-medium">
                        Passée le {activeOrder.orderDate}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="self-start sm:self-center inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#14532d] text-xs font-black">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      <span>{activeOrder.statusText}</span>
                    </div>
                  </div>

                  {/* Horizontal Timeline (Desktop) */}
                  <div className="hidden md:block py-4">
                    <div className="relative flex items-center justify-between">

                      {/* Background connecting track line */}
                      <div className="absolute top-6 left-8 right-8 h-1 bg-slate-100 z-0" />

                      {/* Active green progress fill line */}
                      {(() => {
                        const lastActiveIdx = activeOrder.timeline.reduce(
                          (acc, step, i) => (step.status === 'completed' || step.status === 'current' ? i : acc),
                          0
                        );
                        const progressPct =
                          activeOrder.timeline.length > 1
                            ? (lastActiveIdx / (activeOrder.timeline.length - 1)) * 100
                            : 0;
                        return (
                          <div
                            className="absolute top-6 left-8 h-1 bg-[#14532d] z-0 transition-all duration-700"
                            style={{ width: `calc(${progressPct}% - 40px)` }}
                          />
                        );
                      })()}

                      {activeOrder.timeline.map((step, index) => {
                        const isDone = step.status === 'completed';
                        const isCurrent = step.status === 'current';

                        return (
                          <div key={index} className="relative z-10 flex flex-col items-center text-center max-w-[120px]">

                            {/* Circle Node Icon */}
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all shadow-xs ${isDone
                                  ? 'bg-[#14532d] border-[#14532d] text-white shadow-emerald-900/20'
                                  : isCurrent
                                    ? 'bg-emerald-50 border-[#14532d] text-[#14532d] ring-4 ring-emerald-100 font-bold scale-110'
                                    : 'bg-white border-slate-200 text-slate-300'
                                }`}
                            >
                              {step.icon === 'check' && <Check className="w-5 h-5 stroke-[2.5]" />}
                              {step.icon === 'box' && <Box className="w-5 h-5" />}
                              {step.icon === 'truck' && <Truck className="w-5 h-5 animate-pulse" />}
                              {step.icon === 'pin' && <MapPin className="w-5 h-5" />}
                              {step.icon === 'delivered' && <CheckCircle2 className="w-5 h-5" />}
                            </div>

                            {/* Step Title */}
                            <div className="mt-3">
                              <span className={`text-xs font-black block leading-tight ${isCurrent ? 'text-slate-950 font-extrabold' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                                {step.title}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                                {step.date}
                              </span>
                              {step.time && (
                                <span className="text-[10px] text-slate-400 font-mono block">
                                  {step.time}
                                </span>
                              )}
                            </div>

                          </div>
                        );
                      })}

                    </div>
                  </div>

                  {/* Vertical Timeline (Mobile) */}
                  <div className="md:hidden space-y-4 py-2">
                    {activeOrder.timeline.map((step, index) => {
                      const isDone = step.status === 'completed';
                      const isCurrent = step.status === 'current';

                      return (
                        <div key={index} className="flex items-start gap-3.5 relative">
                          {/* Vertical Connecting Line */}
                          {index < activeOrder.timeline.length - 1 && (
                            <div className={`absolute left-5 top-10 bottom-0 w-0.5 ${isDone ? 'bg-[#14532d]' : 'bg-slate-200'}`} />
                          )}

                          {/* Node Icon */}
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 z-10 ${isDone
                                ? 'bg-[#14532d] border-[#14532d] text-white'
                                : isCurrent
                                  ? 'bg-emerald-50 border-[#14532d] text-[#14532d] ring-2 ring-emerald-100'
                                  : 'bg-white border-slate-200 text-slate-300'
                              }`}
                          >
                            {step.icon === 'check' && <Check className="w-4 h-4 stroke-[2.5]" />}
                            {step.icon === 'box' && <Box className="w-4 h-4" />}
                            {step.icon === 'truck' && <Truck className="w-4 h-4" />}
                            {step.icon === 'pin' && <MapPin className="w-4 h-4" />}
                            {step.icon === 'delivered' && <CheckCircle2 className="w-4 h-4" />}
                          </div>

                          <div className="pt-0.5">
                            <div className={`text-xs font-black ${isCurrent ? 'text-slate-950 font-extrabold' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                              {step.title}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {step.date} {step.time ? `• ${step.time}` : ''}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Current ETA Banner Alert */}
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white text-[#14532d] flex items-center justify-center shrink-0 shadow-2xs">
                      <Truck className="w-4 h-4" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold leading-relaxed">
                      {activeOrder.etaMessage}
                    </p>
                  </div>

                </div>

                {/* 5.2 Order Details & Products Two-Column Card */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-lg shadow-slate-200/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Left: Products in this Order */}
                    <div className="space-y-4">
                      <h3 className="text-base font-black text-slate-950 pb-2 border-b border-slate-100">
                        Détails de la commande
                      </h3>

                      <div className="space-y-3">
                        {activeOrder.products.map((item, i) => (
                          <div key={i} className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                            <div className="w-14 h-14 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-slate-200/60 overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-black text-slate-900 leading-snug truncate">
                                {item.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 truncate">
                                {item.variant}
                              </p>
                              <div className="text-[11px] font-bold text-slate-400 mt-0.5">
                                Qté: {item.quantity}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs sm:text-sm font-black text-[#14532d]">
                                {item.price} DH
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2">
                        <Link
                          href="/products"
                          className="inline-flex items-center gap-1.5 text-xs font-black text-[#14532d] hover:text-[#0f3e21] transition-colors"
                        >
                          <span>Voir la boutique complète</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Right: Shipping & Payment Summary */}
                    <div className="space-y-3.5 border-t md:border-t-0 md:border-l md:pl-8 border-slate-100">
                      <h3 className="text-base font-black text-slate-950 pb-2 border-b border-slate-100">
                        Informations de livraison
                      </h3>

                      <div className="space-y-3 text-xs">

                        <div>
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                            Numéro de commande
                          </span>
                          <span className="font-mono font-bold text-slate-900">{activeOrder.id}</span>
                        </div>

                        {activeOrder.customerName && (
                          <div>
                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                              Client / Destinataire
                            </span>
                            <span className="font-bold text-slate-900">{activeOrder.customerName}</span>
                            {activeOrder.customerPhone && (
                              <span className="text-[11px] text-slate-500 font-mono block">{activeOrder.customerPhone}</span>
                            )}
                          </div>
                        )}

                        <div>
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                            Méthode de livraison
                          </span>
                          <span className="font-bold text-slate-900">{activeOrder.shippingMethod}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                            Adresse de livraison
                          </span>
                          <span className="font-medium text-slate-700 leading-relaxed block">
                            {activeOrder.shippingAddress}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                            Mode de paiement
                          </span>
                          <span className="font-bold text-slate-900">{activeOrder.paymentMethod}</span>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                          <span className="text-sm font-black text-slate-900">Total payé / dû :</span>
                          <span className="text-2xl font-black text-[#14532d]">
                            {activeOrder.total} <span className="text-sm">DH</span>
                          </span>
                        </div>

                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Right Companion Column (4 cols on lg) */}
              <div className="lg:col-span-4 space-y-6">

                {/* 1. Support Card */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-lg shadow-slate-200/30 space-y-5">
                  <div>
                    <h3 className="text-xl font-black text-slate-950">
                      Besoin d&apos;aide ?
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Notre équipe est là pour vous aider à tout moment.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">

                    {/* WhatsApp */}
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Bonjour Animal Market Only, je souhaite des infos sur ma commande #${activeOrder.id}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0">
                        <MessageCircle className="w-4 h-4 fill-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-slate-900">WhatsApp Direct</div>
                        <div className="text-[11px] text-emerald-800 font-semibold">{storePhone}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#25D366] group-hover:translate-x-0.5 transition-transform" />
                    </a>

                    {/* Phone */}
                    <a
                      href={`tel:${cleanPhone}`}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#14532d] flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900">Téléphone</div>
                        <div className="text-[11px] text-slate-500">Lun – Ven : 9h00 – 18h00</div>
                      </div>
                    </a>

                    {/* Email */}
                    <a
                      href={`mailto:${storeEmail}`}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#14532d] flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900">Email</div>
                        <div className="text-[11px] text-slate-500">{storeEmail}</div>
                      </div>
                    </a>

                  </div>

                  <div className="pt-2">
                    <Link
                      href="/contact"
                      className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Contactez-nous</span>
                    </Link>
                  </div>
                </div>

                {/* 2. Fast Delivery Promise Card */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
                    <Package className="w-5 h-5 text-amber-800" />
                  </div>

                  <h4 className="text-base font-black text-slate-950">
                    Livraison Rapide & Fiable
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Nous faisons tout notre possible pour expédier et livrer vos produits en toute sécurité dans les meilleures conditions de fraîcheur.
                  </p>

                  <div className="pt-1">
                    <Link
                      href="/about"
                      className="inline-flex items-center gap-1 text-xs font-black text-amber-950 hover:underline"
                    >
                      <span>En savoir plus</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

              </div>

            </div>
          )}

        </section>

        {/* ── 6. SERVICE BENEFITS BAR ───────────────────────────────────────── */}
        <section className="bg-white py-12 sm:py-14 border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#14532d] flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">Livraison Offerte</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">À partir de 499 DH</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#14532d] flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">Paiement Sécurisé</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">100% sécurisé & COD</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#14532d] flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">Retours Faciles</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">30 jours pour changer d&apos;avis</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#14532d] flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
                  <Headphones className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">Support Dédié</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Nous sommes à votre écoute</p>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* ── 7. FOOTER ────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-300 pt-16 pb-10 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-slate-900">

            {/* Col 1: Brand & Bio */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-900/60 text-emerald-400 flex items-center justify-center font-black text-xl border border-emerald-800/60">
                  🐾
                </div>
                <span className="text-xl font-black text-white tracking-tight">
                  Animal Market Only
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Des ingrédients naturels de haute qualité pour des animaux plus heureux et en meilleure santé.
              </p>

              {/* Social Media Links */}
              <div className="flex items-center gap-2.5 pt-2">
                <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-emerald-900/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                </a>
                <a href="#" aria-label="Facebook" className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-emerald-900/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
                <a href="#" aria-label="Twitter" className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-emerald-900/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                <a href="#" aria-label="YouTube" className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-emerald-900/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                </a>
              </div>
            </div>

            {/* Col 2: Shop Links */}
            <div className="lg:col-span-2 space-y-3">
              <div className="text-xs font-black uppercase tracking-widest text-white">Boutique</div>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link href="/products" className="hover:text-emerald-400 transition-colors">Nourriture pour Chiens</Link></li>
                <li><Link href="/products" className="hover:text-emerald-400 transition-colors">Nourriture pour Chats</Link></li>
                <li><Link href="/products" className="hover:text-emerald-400 transition-colors">Friandises</Link></li>
                <li><Link href="/products" className="hover:text-emerald-400 transition-colors">Suppléments</Link></li>
                <li><Link href="/products" className="hover:text-emerald-400 transition-colors">Accessoires</Link></li>
              </ul>
            </div>

            {/* Col 3: Company Links */}
            <div className="lg:col-span-2 space-y-3">
              <div className="text-xs font-black uppercase tracking-widest text-white">Entreprise</div>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link href="/about" className="hover:text-emerald-400 transition-colors">À Propos</Link></li>
                <li><Link href="/about#our-story" className="hover:text-emerald-400 transition-colors">Notre Histoire</Link></li>
                <li><Link href="/#faqs" className="hover:text-emerald-400 transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">Carrières</Link></li>
                <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">Nous Contacter</Link></li>
              </ul>
            </div>

            {/* Col 4: Newsletter */}
            <div className="lg:col-span-4 space-y-3.5">
              <div className="text-xs font-black uppercase tracking-widest text-white">Newsletter</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Recevez nos offres spéciales, conseils et nouveautés.
              </p>

              {newsletterSubscribed ? (
                <div className="p-3 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Merci pour votre inscription !</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="Votre email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#14532d] hover:bg-[#0f3e21] text-white text-xs font-black uppercase rounded-xl transition-colors shrink-0"
                    >
                      S&apos;abonner
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 block">Désabonnement possible à tout moment.</span>
                </form>
              )}
            </div>

          </div>

          {/* Bottom Footer Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © {new Date().getFullYear()} Animal Market Only. Tous droits réservés.
            </div>

            <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-500" />
                Paiements Sécurisés
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">VISA</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">MASTERCARD</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">CMI</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">COD</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}

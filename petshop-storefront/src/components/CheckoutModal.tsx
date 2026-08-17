'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import apiClient from '@/lib/axios';
import { Store } from '@/types';
import {
  X,
  CheckCircle2,
  Truck,
  Phone,
  User,
  MapPin,
  FileText,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Sparkles,
  MessageSquare,
  Building2,
  Store as StoreIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';

const POPULAR_CITIES = [
  'Marrakech',
  'Casablanca',
  'Rabat',
  'Agadir',
  'Tanger',
  'Fès',
  'Meknès',
  'Autre ville',
];

const DEFAULT_STORES: Store[] = [
  {
    id: 1,
    name: 'sidi yousef ben ali',
    code: 'SIDI_YOUSEF_BEN_ALI',
    address: 'Douwar Jdid, Marrakech',
    phone: '0600000000',
    is_active: true,
  },
  {
    id: 2,
    name: 'daoudiyat',
    code: 'DAOUDIYAT',
    address: 'Douwar Jdid, Marrakech',
    phone: '0600000000',
    is_active: true,
  },
];

export default function CheckoutModal() {
  const {
    items,
    totalPrice,
    shippingFee,
    clearCart,
    isCheckoutOpen,
    closeCheckout,
    currentStore,
    updateCartStore,
  } = useCart();

  const [stores, setStores] = useState<Store[]>(DEFAULT_STORES);
  const [selectedStoreId, setSelectedStoreId] = useState<number>(1);
  const [deliveryType, setDeliveryType] = useState<'LIVRAISON' | 'PICKUP_STORE'>('LIVRAISON');

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: 'Marrakech',
    address: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  // Lock body scroll when checkout popup is open
  useEffect(() => {
    if (isCheckoutOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCheckoutOpen]);

  // Fetch active stores from API
  useEffect(() => {
    let isMounted = true;
    apiClient
      .get('/shop/stores')
      .then((res) => {
        if (isMounted && res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setStores(res.data.data);
        }
      })
      .catch((err) => {
        console.warn('Using default fallback stores list:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter to show ONLY the store that was selected when adding to cart
  const displayedStores = useMemo(() => {
    const cartStoreId =
      currentStore?.store_id ||
      items.find((i) => i.store_id)?.store_id ||
      items.find((i) => i.product?.selected_store_id)?.product?.selected_store_id ||
      items[0]?.store_id ||
      items[0]?.product?.selected_store_id;

    if (cartStoreId) {
      const matched = stores.filter((s) => s.id === cartStoreId);
      if (matched.length > 0) {
        return matched;
      }
    }
    return stores;
  }, [stores, currentStore, items]);

  // Sync initial selected store when opening modal
  useEffect(() => {
    if (isCheckoutOpen) {
      if (displayedStores.length > 0) {
        setSelectedStoreId(displayedStores[0].id);
      }
      setErrorMessage(null);
    }
  }, [isCheckoutOpen, displayedStores]);

  const handleSelectStore = (store: Store) => {
    setSelectedStoreId(store.id);
    if (updateCartStore) {
      updateCartStore(store.id, store.name);
    }
    setErrorMessage(null);
  };

  const getStoreStockStatus = (storeId: number) => {
    if (!items || items.length === 0) return { available: true, text: '' };
    for (const item of items) {
      const stocks = item.product?.stores_stock;
      if (stocks && stocks.length > 0) {
        const matching = stocks.find((s) => s.store_id === storeId);
        if (!matching || matching.quantity < item.quantity) {
          return {
            available: false,
            text: matching && matching.quantity > 0 ? `Stock limité (${matching.quantity} dispo)` : 'Rupture de stock',
          };
        }
      }
    }
    return { available: true, text: 'Stock disponible' };
  };

  if (!isCheckoutOpen) return null;

  const selectedStore = displayedStores.find((s) => s.id === selectedStoreId) || displayedStores[0] || stores[0];
  const effectiveShippingFee = deliveryType === 'PICKUP_STORE' ? 0 : shippingFee;
  const currentTotal = totalPrice + effectiveShippingFee;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#065f46', '#10b981', '#f59e0b', '#3b82f6'],
      });
    } catch (e) {
      console.log('Confetti effect ignored:', e);
    }
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!formData.fullName.trim()) {
      setErrorMessage('Veuillez renseigner votre nom complet.');
      return;
    }

    const cleanPhone = formData.phone.replace(/[\s\-\.]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMessage('Veuillez renseigner un numéro de téléphone valide (06... / 07...).');
      return;
    }

    if (deliveryType === 'LIVRAISON' && !formData.address.trim()) {
      setErrorMessage('Veuillez renseigner votre adresse de livraison complète.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Votre panier est vide.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        customer_name: formData.fullName.trim(),
        phone: cleanPhone,
        city: deliveryType === 'PICKUP_STORE' ? (formData.city || selectedStore?.name || 'Marrakech') : formData.city,
        address: deliveryType === 'PICKUP_STORE'
          ? `Retrait Magasin: ${selectedStore?.name || 'Point de vente'} (${selectedStore?.address || ''})`
          : formData.address.trim(),
        store_id: selectedStoreId,
        delivery_type: deliveryType,
        shipping_fee: effectiveShippingFee,
        notes: formData.notes?.trim() || undefined,
        payment_method: 'COD',
        items: items.map((item) => ({
          product_id: item.product.id,
          barcode: item.product.barcode,
          quantity: item.quantity,
        })),
      };

      const res = await apiClient.post('/shop/orders', payload);

      if (res.data?.status === 'success') {
        const createdOrder = res.data.data;
        const generatedRef = formatOrderNumber(createdOrder);
        const now = new Date();
        const formattedDate = now.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }) + ' à ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        const savedOrderData = {
          id: generatedRef,
          numericId: createdOrder.id,
          orderDate: formattedDate,
          customerName: formData.fullName.trim(),
          customerPhone: cleanPhone,
          statusText: 'Commande confirmée',
          statusType: 'processing',
          etaMessage: deliveryType === 'PICKUP_STORE'
            ? `Votre commande est en cours de préparation pour le retrait au magasin ${selectedStore?.name || 'sélectionné'}.`
            : `Votre commande a été transmise à notre équipe. Livraison prévue sous 24h à 48h.`,
          timeline: [
            {
              title: 'Commande confirmée',
              date: formattedDate.split(' à ')[0],
              time: formattedDate.split(' à ')[1] || '',
              status: 'completed',
              icon: 'check',
            },
            {
              title: 'Préparation en cours',
              date: 'En cours',
              time: '',
              status: 'current',
              icon: 'box',
            },
            {
              title: deliveryType === 'PICKUP_STORE' ? 'Prête au retrait' : 'En cours de livraison',
              date: 'En attente',
              time: '',
              status: 'upcoming',
              icon: deliveryType === 'PICKUP_STORE' ? 'pin' : 'truck',
            },
            {
              title: deliveryType === 'PICKUP_STORE' ? 'Retirée' : 'Livrée',
              date: 'En attente',
              time: '',
              status: 'upcoming',
              icon: 'delivered',
            },
          ],
          products: items.map((item) => ({
            title: item.product.title || (item.product as any).name || 'Produit Animal Market Only',
            variant: `${item.product.category?.name || 'Nutrition'} · ${item.product.unit_type === 'kg' ? item.quantity + 'kg' : 'Qté: ' + item.quantity}`,
            quantity: item.quantity,
            price: (parseFloat(String(item.product.price_sell)) || 0) * item.quantity,
            image: item.product.image || item.product.image_url || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=300&q=80',
          })),
          shippingMethod: deliveryType === 'PICKUP_STORE' ? `Retrait Click & Collect (${selectedStore?.name})` : 'Livraison Express à Domicile',
          shippingAddress: deliveryType === 'PICKUP_STORE'
            ? `${selectedStore?.name} (${selectedStore?.address || 'Point de vente'})`
            : `${formData.address.trim()}, ${formData.city}`,
          paymentMethod: 'Paiement à la livraison (COD)',
          total: currentTotal,
        };

        try {
          const existingOrders = JSON.parse(localStorage.getItem('animalmarket_placed_orders') || localStorage.getItem('pawfuel_placed_orders') || '[]');
          const updatedOrders = [savedOrderData, ...existingOrders.filter((o: any) => o.id !== generatedRef && o.numericId !== createdOrder.id)];
          localStorage.setItem('animalmarket_placed_orders', JSON.stringify(updatedOrders));
          localStorage.setItem('pawfuel_placed_orders', JSON.stringify(updatedOrders));
        } catch (e) {
          console.warn('Failed to save order to localStorage:', e);
        }

        setConfirmedOrder(createdOrder);
        clearCart();
        triggerConfetti();
      } else {
        setErrorMessage(
          res.data?.message || 'Impossible d’enregistrer la commande.'
        );
      }
    } catch (err: any) {
      console.error('Order submission error:', err);
      setErrorMessage(
        err.response?.data?.message ||
        err.message ||
        'Une erreur est survenue lors de la validation de votre commande. Veuillez réessayer ou nous contacter sur WhatsApp.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (confirmedOrder) {
      setConfirmedOrder(null);
      setFormData({
        fullName: '',
        phone: '',
        city: 'Marrakech',
        address: '',
        notes: '',
      });
      setDeliveryType('LIVRAISON');
    }
    closeCheckout();
  };

  const formatOrderNumber = (order: any): string => {
    if (!order) return 'OR1872981';
    if (order.order_number && typeof order.order_number === 'string' && order.order_number.length > 3) {
      return order.order_number;
    }
    const idNum = Number(order.id || order.order_id || 1);
    if (!isNaN(idNum)) {
      return `OR${1872980 + idNum}`;
    }
    return String(order.id || 'OR1872981');
  };

  const orderRef = formatOrderNumber(confirmedOrder);
  const backendTotal = confirmedOrder?.total_amount
    ? parseFloat(String(confirmedOrder.total_amount)).toFixed(2)
    : currentTotal.toFixed(2);

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={handleClose}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        <div className="relative transform rounded-3xl bg-white text-left shadow-2xl transition-all my-6 w-full max-w-xl border border-slate-200/80 animate-fade-in max-h-[92vh] flex flex-col overflow-hidden">

          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {confirmedOrder ? (
            /* Order Success State */
            <div className="p-8 sm:p-10 text-center overflow-y-auto flex-1">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-5 shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-emerald-700" />
              </div>

              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-black rounded-full border border-emerald-200 mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Commande Confirmée avec succès
              </span>

              <h3 className="text-2xl font-black text-slate-900 mb-2">
                Merci {formData.fullName || confirmedOrder.customer_name || 'cher client'} !
              </h3>

              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                Votre commande <strong className="text-slate-900 font-mono">#{orderRef}</strong> a bien été enregistrée. Notre équipe vous contactera au <strong>{formData.phone || confirmedOrder.phone || confirmedOrder.customer_phone}</strong> {deliveryType === 'PICKUP_STORE' ? 'dès que votre commande sera prête au retrait.' : 'avant la livraison.'}
              </p>

              {/* Order Info Summary Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left space-y-3 mb-6 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Numéro de commande :</span>
                  <span className="font-mono font-bold text-slate-900 text-xs">#{orderRef}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Magasin sélectionné :</span>
                  <span className="font-bold text-slate-900">{selectedStore?.name}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Mode de réception :</span>
                  <span className="font-bold text-emerald-800">
                    {deliveryType === 'PICKUP_STORE' ? '🏪 Click & Collect (Retrait en magasin)' : '🚚 Livraison à Domicile'}
                  </span>
                </div>
                {deliveryType === 'LIVRAISON' && (
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Ville de livraison :</span>
                    <span className="font-bold text-slate-900">{formData.city || confirmedOrder.city}</span>
                  </div>
                )}
                {deliveryType === 'PICKUP_STORE' && (
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Adresse de retrait :</span>
                    <span className="font-bold text-slate-900">{selectedStore?.address || 'Magasin'}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Mode de paiement :</span>
                  <span className="font-bold text-emerald-800">
                    {deliveryType === 'PICKUP_STORE' ? 'Paiement au retrait (Espèces / TPE)' : 'Paiement en espèces à la livraison (COD)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm font-black text-slate-900 pt-1">
                  <span>Montant Total à payer :</span>
                  <span className="text-emerald-950 font-black text-base price-tag">
                    {backendTotal} DH
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <a
                  href={`/track?order=${orderRef}`}
                  onClick={handleClose}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-800 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs transition-colors shadow-sm cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Suivre ma commande en temps réel</span>
                </a>

                <a
                  href={`https://wa.me/212600000000?text=${encodeURIComponent(
                    `Bonjour Animal Market Only, j'ai passé la commande #${orderRef} (${deliveryType === 'PICKUP_STORE' ? 'Click & Collect' : 'Livraison'}) pour ${formData.fullName || confirmedOrder.customer_name} au magasin ${selectedStore?.name}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-emerald-900 border border-[#25D366]/30 rounded-2xl font-bold text-xs transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-[#25D366]" />
                  <span>Assistance sur WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Retourner à la boutique
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleConfirmOrder} className="p-6 sm:p-8 overflow-y-auto flex-1">
              {/* Modal Title */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-black uppercase tracking-wider mb-1">
                  <Truck className="w-4 h-4" />
                  <span>Commande Express Maroc (COD)</span>
                </div>
                <h2 className="text-xl font-black text-slate-900">
                  Finaliser votre commande
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Paiement à la livraison ou au retrait. Aucune carte bancaire requise en ligne.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* 📍 1. Magasin sélectionné */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase text-slate-600">
                    {displayedStores.length === 1 ? 'Magasin sélectionné pour cette commande' : 'Choisissez le Magasin le plus proche de vous *'}
                  </label>
                  <div className={`grid ${displayedStores.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                    {displayedStores.map((store) => {
                      const isSelected = selectedStoreId === store.id;
                      const stockStatus = getStoreStockStatus(store.id);

                      return (
                        <button
                          key={store.id}
                          type="button"
                          onClick={() => handleSelectStore(store)}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${isSelected
                            ? 'bg-emerald-50 border-emerald-800 text-emerald-900 shadow-sm ring-1 ring-emerald-800'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs block text-slate-900">{store.name}</span>
                            {isSelected && (
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700"></span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block truncate mt-0.5">{store.address || 'Point de vente'}</span>
                          {stockStatus.text && (
                            <span className={`text-[10px] font-bold block mt-1 ${stockStatus.available ? 'text-emerald-700' : 'text-rose-600'}`}>
                              {stockStatus.text}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 🚚 2. Delivery Type Option */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold uppercase text-slate-600">
                    Mode de Réception *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('LIVRAISON')}
                      className={`py-3 px-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 border transition ${deliveryType === 'LIVRAISON'
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-md ring-2 ring-emerald-800/20'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                    >
                      <span>🚚 Livraison à Domicile (+25 DH)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('PICKUP_STORE')}
                      className={`py-3 px-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 border transition ${deliveryType === 'PICKUP_STORE'
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-md ring-2 ring-emerald-800/20'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                    >
                      <span>🏪 Click & Collect (Retrait gratuit en magasin)</span>
                    </button>
                  </div>
                </div>

                {/* Click & Collect Info Banner */}
                {deliveryType === 'PICKUP_STORE' && (
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900 animate-fade-in">
                    <StoreIcon className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold">Point de retrait sélectionné : {selectedStore?.name}</p>
                      <p className="text-slate-600 text-[11px] mt-0.5">{selectedStore?.address || 'Adresse du magasin'}</p>
                    </div>
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nom et Prénom *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mohamed Kribi"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-700 rounded-2xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-emerald-700/10 transition-all"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Numéro de Téléphone (Pour confirmation) *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: 06 12 34 56 78"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-700 rounded-2xl text-xs text-slate-900 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-emerald-700/10 transition-all"
                  />
                </div>

                {/* Conditional Fields for Delivery */}
                {deliveryType === 'LIVRAISON' && (
                  <>
                    {/* City Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Ville de livraison *</span>
                      </label>

                      {/* Quick City Pills */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {POPULAR_CITIES.map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, city: city === 'Autre ville' ? '' : city })
                            }
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${formData.city === city
                              ? 'bg-emerald-800 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        required
                        placeholder="Saisissez votre ville si autre"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-700 rounded-2xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-emerald-700/10 transition-all"
                      />
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Adresse Complète (Quartier, Résidence, N°...) *</span>
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="Ex: Gueliz, Rue de la Liberté, Résidence Atlas Appt 4"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-700 rounded-2xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-emerald-700/10 transition-all resize-none"
                      />
                    </div>
                  </>
                )}

                {/* Optional Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Instructions {deliveryType === 'PICKUP_STORE' ? 'pour le retrait' : 'de livraison'} (Facultatif)</span>
                  </label>
                  <input
                    type="text"
                    placeholder={deliveryType === 'PICKUP_STORE' ? 'Ex: Retrait vers 17h...' : "Ex: Appeler avant d'arriver..."}
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-700 rounded-2xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-emerald-700/10 transition-all"
                  />
                </div>
              </div>

              {/* Order Total Overview in Checkout */}
              <div className="mt-5 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Total Articles ({items.length}) :</span>
                  <span className="font-bold text-slate-900 price-tag">
                    {totalPrice.toFixed(2)} DH
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Mode sélectionné :</span>
                  <span className="font-bold text-emerald-900">
                    {deliveryType === 'PICKUP_STORE' ? `Click & Collect (${selectedStore?.name})` : 'Livraison à Domicile'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Frais de livraison :</span>
                  <span className="font-bold text-emerald-800">
                    {deliveryType === 'PICKUP_STORE' ? '0.00 DH (Gratuit)' : (shippingFee === 0 ? 'Gratuite' : `${shippingFee.toFixed(2)} DH`)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-emerald-200/60">
                  <span>Total à payer à la réception :</span>
                  <span className="text-base font-black text-emerald-950 price-tag">
                    {currentTotal.toFixed(2)} DH
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="mt-6 space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-700 active:scale-98 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/15 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enregistrement de votre commande...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirmer la commande ({currentTotal.toFixed(2)} DH)</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>

                <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <span>🔒 Vos coordonnées sont protégées et utilisées uniquement pour traiter votre commande.</span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

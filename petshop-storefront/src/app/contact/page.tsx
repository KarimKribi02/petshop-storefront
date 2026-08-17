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
  ChevronDown,
  ChevronUp,
  Send,
  User,
  CheckCircle2,
  Navigation,
  Globe2,
  ExternalLink,
  Globe
} from 'lucide-react';

const FAQS = [
  {
    q: 'Quels sont vos délais de livraison ?',
    a: 'Nous livrons en 24h ouvrées à Marrakech et sous 48h à 72h dans toutes les autres villes du Maroc. Vous recevrez un numéro de suivi dès l’expédition.'
  },
  {
    q: 'Livrez-vous en dehors de Marrakech ?',
    a: 'Oui ! Nous livrons partout au Maroc via nos partenaires de messagerie express avec option de paiement à la livraison (COD).'
  },
  {
    q: 'Puis-je retourner un produit si mon animal ne l’aime pas ?',
    a: 'Absolument. Nous offrons une garantie satisfaction 30 jours. Les sacs fermés et accessoires non utilisés sont retournés ou échangés sans tracas.'
  },
  {
    q: 'Comment choisir l’alimentation idéale pour mon animal ?',
    a: 'Nos conseillers et nutritionnistes sont à votre disposition par WhatsApp ou téléphone pour vous recommander la recette la plus adaptée selon l’âge, la race et les sensibilités.'
  },
  {
    q: 'Proposez-vous des conseils nutritionnels personnalisés ?',
    a: 'Oui, ce service est 100% gratuit ! Envoyez-nous les détails sur votre animal (poids, niveau d’activité, allergies) et nous vous établirons un plan personnalisé.'
  },
  {
    q: 'Comment suivre ma commande en temps réel ?',
    a: 'Cliquez sur l’onglet "Suivi" dans le menu ou envoyez-nous simplement votre numéro de commande par WhatsApp pour une mise à jour instantanée.'
  }
];

export default function ContactPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

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
        console.error('Error fetching contact page data:', err);
      }
    };
    loadData();
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    // Simulate submission delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    }, 800);
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
  const storeAddress = settings?.address || '123 Pet Care Street, Gueliz, Marrakech, Maroc';

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf8] text-slate-900 selection:bg-emerald-200 selection:text-emerald-950 font-sans">

      {/* ── 1. TOP ANNOUNCEMENT BAR ────────────────────────────────────────── */}
      <div className="bg-[#14532d] text-white py-2 px-4 text-xs font-semibold">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-6 mx-auto md:mx-0 flex-wrap justify-center text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Livraison gratuite dès 499 DH</span>
            </span>
            <span className="hidden sm:inline text-emerald-700/60">•</span>
            <span className="flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-emerald-300" />
              <span>100% Ingrédients Naturels</span>
            </span>
            <span className="hidden sm:inline text-emerald-700/60">•</span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Adopté par 50 000+ Animaux</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-[11px]">
            <a
              href={`tel:${cleanPhone}`}
              className="flex items-center gap-1.5 hover:text-emerald-200 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-300" />
              <span>{storePhone}</span>
            </a>
            <span className="text-emerald-700/60">|</span>
            <span className="font-bold text-emerald-200">FR</span>
          </div>
        </div>
      </div>

      {/* ── 2. STICKY HEADER ──────────────────────────────────────────────── */}
      <Header
        categories={categories}
        settings={settings}
        activePage="contact"
      />

      {/* ── MAIN CONTENT CONTAINER ────────────────────────────────────────── */}
      <main className="flex-1">

        {/* ── 3. BREADCRUMB ───────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-emerald-800 transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-emerald-800 font-bold">Contact</span>
          </nav>
        </div>

        {/* ── 4. HERO SECTION ─────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

            {/* Left Column */}
            <div className="lg:col-span-6 space-y-6">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#14532d] text-xs font-black uppercase tracking-wider shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>CONTACTEZ-NOUS</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight text-slate-950 leading-[1.08]">
                We&apos;re Here <br />
                For You & <br />
                <span className="text-[#14532d]">Your Pet</span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Une question sur nos croquettes, besoin de conseils nutritionnels ou d&apos;assistance pour votre commande ? Notre équipe dévouée est toujours ravie de vous accompagner, vous et vos précieux compagnons.
              </p>

              {/* Trust Indicators Row */}
              <div className="pt-4 border-t border-slate-200/70 flex flex-wrap items-center gap-6 sm:gap-8 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100/80 text-[#14532d] flex items-center justify-center shrink-0">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-black text-slate-900">Support Réactif</span>
                    <span className="text-[11px] text-slate-500 font-normal">Réponse sous 24h</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100/80 text-[#14532d] flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-black text-slate-900">Conseils d&apos;Experts</span>
                    <span className="text-[11px] text-slate-500 font-normal">Nutrition animale</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100/80 text-[#14532d] flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 fill-[#14532d]" />
                  </div>
                  <div>
                    <span className="block font-black text-slate-900">Toujours Disponibles</span>
                    <span className="text-[11px] text-slate-500 font-normal">Service chaleureux</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column (Hero Pet Commercial Image) */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-emerald-900/10 via-amber-500/5 to-emerald-50 p-2 sm:p-3 border border-slate-200/70 shadow-xl shadow-slate-200/50">
                <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1200&q=85"
                    alt="Service client et conseil vétérinaire dévoué pour le bien-être de vos animaux"
                    className="w-full h-full object-cover object-center transform hover:scale-103 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

                  {/* Floating Status Pill */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/80 shadow-lg flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                        <Headphones className="w-5 h-5 text-[#14532d]" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">Conseillers en Direct</div>
                        <div className="text-[11px] text-slate-500">Du Lundi au Samedi</div>
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Bonjour Animal Market Only, j’aimerais un conseil pour mon animal.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-black px-3.5 py-1.5 bg-[#14532d] hover:bg-[#0f3e21] text-white rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── 5. MAIN CONTACT SECTION (FORM + INFO + PET CARD) ─────────────── */}
        <section id="contact-form" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 scroll-mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

            {/* LEFT — CONTACT FORM (7 cols on lg) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-lg shadow-slate-200/30">

              <div className="mb-8">
                <div className="w-10 h-1 bg-[#14532d] rounded-full mb-3" />
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  Envoyez-nous un Message
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Une question particulière ? Remplissez ce formulaire et recevez une réponse détaillée sous 24h.
                </p>
              </div>

              {isSuccess && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div className="text-xs font-bold">
                    Merci pour votre message ! Notre équipe vous répondra dans les plus brefs délais.
                  </div>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-5">

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Votre Nom & Prénom <span className="text-emerald-700">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Ex: Karim Alaoui"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#14532d] focus:ring-2 focus:ring-emerald-700/20 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 transition-all outline-none"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Adresse Email <span className="text-emerald-700">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#14532d] focus:ring-2 focus:ring-emerald-700/20 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 transition-all outline-none"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                {/* Phone & Subject Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Numéro de Téléphone
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        placeholder="+212 6..."
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#14532d] focus:ring-2 focus:ring-emerald-700/20 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 transition-all outline-none"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Sujet de votre demande <span className="text-emerald-700">*</span>
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#14532d] focus:ring-2 focus:ring-emerald-700/20 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 transition-all outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Sélectionnez un sujet</option>
                        <option value="Suivi de Commande">Suivi de Commande & Livraison</option>
                        <option value="Information Produit">Information sur un Produit</option>
                        <option value="Conseil Nutrition">Conseil Nutritionnel Personnalisé</option>
                        <option value="Retour & Remboursement">Retour & Échange 30j</option>
                        <option value="Partenariat / Grossiste">Partenariat & Professionnels</option>
                        <option value="Autre Demande">Autre Question</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Message Field */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Votre Message <span className="text-emerald-700">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Comment pouvons-nous vous aider ? Précisez le profil de votre animal ou votre numéro de commande..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-4 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#14532d] focus:ring-2 focus:ring-emerald-700/20 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 transition-all outline-none resize-y"
                  />
                </div>

                {/* Submit CTA & Privacy Note */}
                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#14532d] hover:bg-[#0f3e21] active:scale-98 text-white text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md shadow-emerald-950/15 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Envoi en cours...' : 'Envoyer le Message'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Lock className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Vos informations sont 100% sécurisées et ne seront jamais partagées.</span>
                  </div>
                </div>

              </form>

            </div>

            {/* RIGHT — CONTACT INFO (5 cols on lg) */}
            <div className="lg:col-span-5 space-y-6">

              {/* Contact Information Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-lg shadow-slate-200/30 space-y-6">
                <div>
                  <div className="w-10 h-1 bg-[#14532d] rounded-full mb-3" />
                  <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                    Nos Coordonnées
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Contactez-nous directement par le canal de votre choix.
                  </p>
                </div>

                <div className="space-y-4">

                  {/* Phone */}
                  <a
                    href={`tel:${cleanPhone}`}
                    className="flex items-start gap-4 p-3.5 rounded-2xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#14532d] group-hover:bg-[#14532d] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Téléphone Direct</div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">{storePhone}</div>
                      <div className="text-[11px] text-slate-500">Lun – Ven : 9h00 – 18h00</div>
                    </div>
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:${storeEmail}`}
                    className="flex items-start gap-4 p-3.5 rounded-2xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#14532d] group-hover:bg-[#14532d] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Email Support</div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">{storeEmail}</div>
                      <div className="text-[11px] text-slate-500">Réponse sous 24h ouvrées</div>
                    </div>
                  </a>

                  {/* Address */}
                  <div className="flex items-start gap-4 p-3.5 rounded-2xl">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#14532d] flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Boutique & Magasin</div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">{storeAddress}</div>
                      <div className="text-[11px] text-slate-500">Gueliz, Marrakech, Maroc</div>
                    </div>
                  </div>

                  {/* WhatsApp Quick Action */}
                  <a
                    href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Bonjour Animal Market Only, je souhaite des renseignements.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <MessageCircle className="w-5 h-5 fill-white" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-emerald-950">WhatsApp Express</div>
                        <div className="text-[11px] text-emerald-900/80 font-medium">Discutez instantanément avec un conseiller</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#25D366] group-hover:translate-x-1 transition-transform" />
                  </a>

                </div>
              </div>

              {/* Pet Support Card */}
              <div className="bg-gradient-to-br from-[#14532d] to-[#0f3e21] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/20 relative overflow-hidden flex flex-col justify-between">

                <div className="relative z-10 space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-emerald-300">
                    <Heart className="w-5 h-5 fill-emerald-300" />
                  </div>

                  <h3 className="text-xl font-black leading-snug">
                    Let&apos;s Keep Your <br />
                    Pets Happy & Healthy
                  </h3>

                  <p className="text-xs text-emerald-100/90 leading-relaxed">
                    Nous vous guidons pour choisir la formule idéale selon la race, le poids et l&apos;âge de votre compagnon.
                  </p>

                  <div className="pt-2">
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Bonjour, je souhaite parler à un expert Animal Market Only pour mon animal.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider transition-colors shadow-xs"
                    >
                      <span>Parler à un Expert</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Friendly Dog Portrait at the bottom right */}
                <div className="relative mt-6 -mb-6 -mr-6 flex justify-end">
                  <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                    <img
                      src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80"
                      alt="Chien heureux et attentif"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* ── 6. SERVICE BENEFITS BAR (4 COLUMNS / 2x2 MOBILE) ─────────────── */}
        <section className="bg-white py-12 sm:py-14 border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#14532d] flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">Réponse Rapide</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Sous 24h ouvrées</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#14532d] flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">Support Expert</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Nutritionnistes animaliers</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#14532d] flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">Retours 30 Jours</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Garantie satisfaction totale</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#14532d] flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">Sécurité & Confiance</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Données 100% protégées</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 7. THREE-COLUMN INFO GRID (FAQ + HOURS + MAP) ────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-start">

            {/* COLUMN 1: FAQS ACCORDION (5 cols on lg) */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-lg shadow-slate-200/30 flex flex-col justify-between">
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-black text-slate-950 tracking-tight">
                    Questions Fréquentes
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Réponses instantanées aux interrogations courantes.
                  </p>
                </div>

                <div className="space-y-3">
                  {FAQS.map((faq, index) => {
                    const isOpen = openFaqIndex === index;
                    return (
                      <div
                        key={index}
                        className="rounded-2xl border border-slate-200/70 overflow-hidden transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                          className="w-full p-3.5 text-left flex items-center justify-between gap-3 bg-slate-50/60 hover:bg-slate-100/70 transition-colors cursor-pointer"
                        >
                          <span className="text-xs font-black text-slate-800">
                            {faq.q}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-emerald-800 shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                        </button>

                        {isOpen && (
                          <div className="p-3.5 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100 animate-fade-in">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100">
                <a
                  href="/#faqs"
                  className="inline-flex items-center gap-1.5 text-xs font-black text-[#14532d] hover:text-[#0f3e21] transition-colors"
                >
                  <span>Voir toutes les FAQ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* COLUMN 2: BUSINESS HOURS (3 cols on lg) */}
            <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-lg shadow-slate-200/30 flex flex-col justify-between">
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-black text-slate-950 tracking-tight">
                    Horaires d&apos;Ouverture
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Notre équipe est à votre disposition 6j/7.
                  </p>
                </div>

                <div className="space-y-4 text-xs">

                  <div className="flex items-start justify-between py-2 border-b border-slate-100">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-700" />
                      Lundi – Vendredi
                    </span>
                    <span className="font-mono font-bold text-slate-900">9h00 – 18h00</span>
                  </div>

                  <div className="flex items-start justify-between py-2 border-b border-slate-100">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-700" />
                      Samedi
                    </span>
                    <span className="font-mono font-bold text-slate-900">10h00 – 16h00</span>
                  </div>

                  <div className="flex items-start justify-between py-2">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Dimanche
                    </span>
                    <span className="font-bold text-rose-600 uppercase text-[10px] bg-rose-50 px-2 py-0.5 rounded-full">Fermé</span>
                  </div>

                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <a
                  href={`tel:${cleanPhone}`}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-[#14532d] text-xs font-black flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Appelez-nous</span>
                </a>
              </div>
            </div>

            {/* COLUMN 3: MAP / LOCATION (4 cols on lg) */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-lg shadow-slate-200/30 flex flex-col justify-between">
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-black text-slate-950 tracking-tight">
                    Où Nous Trouver
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Gueliz, Marrakech, Maroc
                  </p>
                </div>

                {/* Stylized Map Box */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 mb-4">
                  {/* Styled Map Image Background */}
                  <img
                    src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80"
                    alt="Plan de localisation Marrakech Gueliz"
                    className="w-full h-full object-cover filter saturate-50 contrast-125 opacity-75"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-emerald-950/15 pointer-events-none" />

                  {/* Animal Market Only Custom Pin in the center */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce">
                    <div className="w-10 h-10 rounded-full bg-[#14532d] text-white flex items-center justify-center shadow-2xl border-2 border-white">
                      <Heart className="w-5 h-5 fill-white" />
                    </div>
                    <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md text-[10px] font-black text-slate-900 border border-slate-200 mt-1 whitespace-nowrap">
                      Animal Market Only Gueliz
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://maps.google.com/?q=Gueliz,Marrakech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Itinéraire Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* ── 8. FINAL CTA BANNER ─────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
          <div className="bg-gradient-to-r from-emerald-50 via-[#f0fdf4] to-emerald-100/70 rounded-3xl p-8 sm:p-12 border border-emerald-200/80 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">

            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-14 h-14 rounded-2xl bg-[#14532d] text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-950/10 mx-auto md:mx-0">
                <Heart className="w-7 h-7 fill-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-950">
                  Vous avez encore une question ?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Notre équipe bienveillante est toujours là pour vous et votre animal.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Bonjour Animal Market Only, j’ai une question.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-2xl bg-[#14532d] hover:bg-[#0f3e21] active:scale-98 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-emerald-950/15"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat sur WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('contact-form');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold transition-colors shadow-2xs cursor-pointer"
              >
                <span>Envoyer un Message</span>
              </button>
            </div>

          </div>
        </section>

      </main>

      {/* ── 9. PRODUCTION FOOTER WITH NEWSLETTER ───────────────────────────── */}
      <footer className="bg-slate-950 text-slate-300 pt-16 pb-10 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-slate-900">

            {/* Col 1: Brand & Bio (4 cols) */}
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
                Nutrition animale premium élaborée avec de vrais ingrédients naturels pour des compagnons plus sains et plus heureux.
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

            {/* Col 2: Shop Links (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <div className="text-xs font-black uppercase tracking-widest text-white">Boutique</div>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link href="/products" className="hover:text-emerald-400 transition-colors">Alimentation Chien</Link></li>
                <li><Link href="/products" className="hover:text-emerald-400 transition-colors">Alimentation Chat</Link></li>
                <li><Link href="/products" className="hover:text-emerald-400 transition-colors">Friandises Saines</Link></li>
                <li><Link href="/products" className="hover:text-emerald-400 transition-colors">Compléments & Soins</Link></li>
                <li><Link href="/products" className="hover:text-emerald-400 transition-colors">Accessoires & Gamelles</Link></li>
              </ul>
            </div>

            {/* Col 3: Company Links (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <div className="text-xs font-black uppercase tracking-widest text-white">Entreprise</div>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link href="/about" className="hover:text-emerald-400 transition-colors">À Propos</Link></li>
                <li><Link href="/about#our-story" className="hover:text-emerald-400 transition-colors">Notre Histoire</Link></li>
                <li><Link href="/#faqs" className="hover:text-emerald-400 transition-colors">Blog & Conseils</Link></li>
                <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">Nous Contacter</Link></li>
                <li><a href="/#marques" className="hover:text-emerald-400 transition-colors">Nos Marques</a></li>
              </ul>
            </div>

            {/* Col 4: Newsletter Subscription (4 cols) */}
            <div className="lg:col-span-4 space-y-3.5">
              <div className="text-xs font-black uppercase tracking-widest text-white">Newsletter</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Recevez nos offres exclusives, conseils vétérinaires et actualités nutritionnelles.
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
                      placeholder="Votre adresse email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#14532d] hover:bg-[#0f3e21] text-white text-xs font-black uppercase rounded-xl transition-colors shrink-0"
                    >
                      S&apos;inscrire
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 block">Désabonnement en un clic à tout moment.</span>
                </form>
              )}
            </div>

          </div>

          {/* Bottom Footer Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © {new Date().getFullYear()} Animal Market Only. Tous droits réservés.
            </div>

            {/* Payment & Security Badges */}
            <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-500" />
                Paiement Sécurisé
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

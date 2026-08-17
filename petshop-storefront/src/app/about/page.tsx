'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/axios';
import { Category, StoreSettings } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Sparkles,
  Heart,
  ShieldCheck,
  Award,
  Truck,
  Leaf,
  CheckCircle2,
  Phone,
  ArrowRight,
  ChevronRight,
  RefreshCw,
  Clock,
  Star,
  Check,
  Package,
  Layers,
  Lock,
  Headphones,
  Stethoscope,
  WheatOff,
  Flame,
  Globe2,
  CheckCheck
} from 'lucide-react';

export default function AboutPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

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
        console.error('Error fetching about page data:', err);
      }
    };
    loadData();
  }, []);

  const scrollToStory = () => {
    const el = document.getElementById('our-story');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

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
            {settings?.phone_number && (
              <a
                href={`tel:${settings.phone_number.replace(/\s+/g, '')}`}
                className="flex items-center gap-1.5 hover:text-emerald-200 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-300" />
                <span>{settings.phone_number}</span>
              </a>
            )}
            <span className="text-emerald-700/60">|</span>
            <span className="font-bold text-emerald-200">FR</span>
          </div>
        </div>
      </div>

      {/* ── 2. MAIN STICKY HEADER ─────────────────────────────────────────── */}
      <Header
        categories={categories}
        settings={settings}
        activePage="about"
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
            <span className="text-emerald-800 font-bold">À Propos</span>
          </nav>
        </div>

        {/* ── 4. HERO SECTION ─────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Content Column (7 cols on lg) */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#14532d] text-xs font-black uppercase tracking-wider shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>À PROPOS DE ANIMAL MARKET ONLY</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight text-slate-950 leading-[1.08]">
                Better Food, <br />
                Better <span className="text-[#14532d]">Life.</span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Chez <strong className="text-slate-900 font-bold">Animal Market Only</strong>, nous croyons fermement que des animaux en pleine santé font des familles heureuses. C&apos;est pourquoi nous concevons une alimentation animale premium et naturelle, élaborée à partir de vrais ingrédients nutritifs et de beaucoup d&apos;amour.
              </p>

              {/* CTA Action */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={scrollToStory}
                  className="px-7 py-3.5 rounded-2xl bg-[#14532d] hover:bg-[#0f3e21] active:scale-98 text-white text-sm font-black flex items-center gap-2.5 shadow-lg shadow-emerald-950/15 transition-all cursor-pointer"
                >
                  <span>Découvrir Notre Histoire</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  href="/products"
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold flex items-center gap-2 transition-colors shadow-2xs"
                >
                  <span>Explorer la Boutique</span>
                </Link>
              </div>

              {/* Trust Badges Row */}
              <div className="pt-6 border-t border-slate-200/70 flex flex-wrap items-center gap-6 sm:gap-8 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100/80 text-emerald-800 flex items-center justify-center">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <span>100% Naturel</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100/80 text-emerald-800 flex items-center justify-center">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <span>Approuvé Vétérinaire</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100/80 text-emerald-800 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <span>Vrais Ingrédients</span>
                </div>
              </div>

            </div>

            {/* Right Image Column (5 cols on lg) */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-emerald-900/10 via-amber-500/5 to-emerald-50 p-2 sm:p-3 border border-slate-200/70 shadow-xl shadow-slate-200/50">
                
                {/* Hero Image */}
                <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1200&q=85"
                    alt="Animaux heureux et famille épanouie avec les produits de nutrition naturelle"
                    className="w-full h-full object-cover object-center transform hover:scale-103 transition-transform duration-700 ease-out"
                  />
                  
                  {/* Overlay Gradient at the bottom for smooth readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

                  {/* Floating badge inside hero photo */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/80 shadow-lg flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                        <Heart className="w-5 h-5 fill-emerald-700 text-emerald-700" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">Formulé avec Passion</div>
                        <div className="text-[11px] text-slate-500">Pour chiens & chats de tout âge</div>
                      </div>
                    </div>

                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full shrink-0">
                      Premium
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ── 5. OUR STORY SECTION ────────────────────────────────────────── */}
        <section id="our-story" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 scroll-mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Narrative Column */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#14532d]">
                  NOTRE HISTOIRE
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-950 mt-1 leading-tight">
                  Fueling Their Health, <br />
                  Nourishing Their Happiness
                </h2>
              </div>

              <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
                <p>
                  <strong className="text-slate-900 font-bold">Animal Market Only</strong> est né d&apos;une mission simple mais essentielle : offrir à nos fidèles compagnons une alimentation irréprochable, conçue selon les plus hauts standards nutritionnels sans compromis sur la naturalité.
                </p>
                <p>
                  Nous collaborons étroitement avec des nutritionnistes vétérinaires pour élaborer des recettes complètes et équilibrées. Chaque ingrédient est sélectionné pour soutenir l&apos;énergie, la digestion, la vitalité et le bien-être de votre animal à chaque étape de sa vie.
                </p>
                <p>
                  Parce que chaque repas doit être une source de plaisir et de vitalité, nous privilégions les viandes nobles, les légumes frais et les herbes bienfaisantes, tout en bannissant les colorants et additifs nocifs.
                </p>
              </div>

              {/* 3 Values Indicator Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4">
                
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2.5">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-black text-slate-900 mb-1">Ingrédients Naturels</h3>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Uniquement des ingrédients nobles et traçables.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2.5">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-black text-slate-900 mb-1">Approuvé Vétérinaire</h3>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Recettes validées par des spécialistes animaliers.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2.5">
                    <Heart className="w-4 h-4 fill-emerald-800" />
                  </div>
                  <h3 className="text-xs font-black text-slate-900 mb-1">Fait Avec Amour</h3>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Chaque formule est élaborée avec passion et soin.
                  </p>
                </div>

              </div>
            </div>

            {/* Right 2x2 Image Collage */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 p-2 sm:p-3 bg-white rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-200/40">
                
                {/* 1. Fresh Ingredients */}
                <div className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80"
                    alt="Ingrédients frais et sains"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-white text-[11px] font-bold">Vrais Ingrédients</span>
                  </div>
                </div>

                {/* 2. Natural Landscape / Sourcing */}
                <div className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
                    alt="Paysage naturel et approvisionnement durable"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-white text-[11px] font-bold">Origine Responsable</span>
                  </div>
                </div>

                {/* 3. Vet with Friendly Dog */}
                <div className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80"
                    alt="Vétérinaire et chien heureux"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-white text-[11px] font-bold">Conseils Vétérinaires</span>
                  </div>
                </div>

                {/* 4. Healthy Pet Food Bowls */}
                <div className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80"
                    alt="Gamelles de nourriture saine pour animaux"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-white text-[11px] font-bold">Nutrition Supérieure</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ── 6. OUR PROMISE (5 CARDS) ────────────────────────────────────── */}
        <section className="bg-white py-16 sm:py-20 border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Section Heading */}
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-[#14532d] text-xs font-black uppercase tracking-widest mb-2 border border-emerald-200/60">
                NOTRE ENGAGEMENT
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                Our Promise
              </h2>
              <p className="text-slate-500 text-sm sm:text-base mt-2">
                Des ingrédients simples. Une meilleure nutrition. Des animaux plus épanouis.
              </p>
            </div>

            {/* 5 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              
              {/* Promise 1 */}
              <div className="p-6 rounded-2xl bg-[#fafaf8] border border-slate-200/70 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-[#14532d] flex items-center justify-center mb-4">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 mb-1.5">
                    Sans Colorants Artificiels
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Uniquement des ingrédients réels, 100% naturels et non transformés.
                  </p>
                </div>
              </div>

              {/* Promise 2 */}
              <div className="p-6 rounded-2xl bg-[#fafaf8] border border-slate-200/70 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-[#14532d] flex items-center justify-center mb-4">
                    <WheatOff className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 mb-1.5">
                    Zéro Remplissage Inutile
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Aucun ajout de maïs, blé de mauvaise qualité ou dérivés de soja.
                  </p>
                </div>
              </div>

              {/* Promise 3 */}
              <div className="p-6 rounded-2xl bg-[#fafaf8] border border-slate-200/70 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-[#14532d] flex items-center justify-center mb-4">
                    <Flame className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 mb-1.5">
                    Protéines Haute Qualité
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    La vraie viande fraîche est toujours le 1er ingrédient de nos recettes.
                  </p>
                </div>
              </div>

              {/* Promise 4 */}
              <div className="p-6 rounded-2xl bg-[#fafaf8] border border-slate-200/70 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-[#14532d] flex items-center justify-center mb-4">
                    <Globe2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 mb-1.5">
                    Durable & Responsable
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Des choix éthiques pour le bien-être animal et la préservation de la planète.
                  </p>
                </div>
              </div>

              {/* Promise 5 */}
              <div className="p-6 rounded-2xl bg-[#fafaf8] border border-slate-200/70 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-[#14532d] flex items-center justify-center mb-4">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 mb-1.5">
                    Sécurité Garantie
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Chaque lot fait l&apos;objet de contrôles stricts de qualité et de fraîcheur.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ── 7. STATISTICS BANNER (DARK FOREST GREEN) ────────────────────── */}
        <section className="bg-[#14532d] text-white py-14 sm:py-16 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              
              {/* Stat 1 */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
                  <Heart className="w-7 h-7 text-emerald-300 fill-emerald-300" />
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                    50 000+
                  </div>
                  <div className="text-xs text-emerald-100/80 font-semibold mt-0.5">
                    Animaux Heureux & Servis
                  </div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
                  <Package className="w-7 h-7 text-emerald-300" />
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                    120+
                  </div>
                  <div className="text-xs text-emerald-100/80 font-semibold mt-0.5">
                    Produits Premium Référencés
                  </div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
                  <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                    4.9 / 5
                  </div>
                  <div className="text-xs text-emerald-100/80 font-semibold mt-0.5">
                    Avis Clients Vérifiés
                  </div>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
                  <ShieldCheck className="w-7 h-7 text-emerald-300" />
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                    100%
                  </div>
                  <div className="text-xs text-emerald-100/80 font-semibold mt-0.5">
                    Garantie Fraîcheur & Authenticité
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 8. WHY ANIMAL MARKET ONLY (CHECKLIST + 4 CARDS) ─────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
            
            {/* Left: Headline & Checklist */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#14532d]">
                  POURQUOI ANIMAL MARKET ONLY ?
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-950 mt-1 leading-tight">
                  More Than Food, <br />
                  It&apos;s a <span className="text-[#14532d]">Better Life.</span>
                </h2>
              </div>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Animal Market Only n&apos;est pas seulement une marque de croquettes. C&apos;est un engagement quotidien pour permettre à vos animaux de vivre plus longtemps, plus vigoureux et en pleine harmonie.
              </p>

              {/* Key Checkpoints */}
              <div className="space-y-3 pt-2">
                {[
                  'Nutrition équilibrée pour chaque étape de la vie',
                  'Favorise une digestion saine & un système immunitaire robuste',
                  'Assure un pelage éclatant & une peau protégée',
                  'Procure une énergie constante sans baisse de forme',
                  'Ingrédients naturels sélectionnés selon des critères stricts'
                ].map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#14532d] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      {point}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#14532d] hover:bg-[#0f3e21] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md"
                >
                  <span>Découvrir la Gamme Nutrition</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right: 4 Visual Pet Benefit Cards */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Benefit Card 1 */}
                <div className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-lg hover:border-emerald-300 transition-all flex flex-col justify-between">
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100 relative">
                    <img
                      src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80"
                      alt="Chien dynamique et actif"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-emerald-800 flex items-center justify-center shadow-xs">
                      <Leaf className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm font-black text-slate-900 mb-1">
                      Santé & Vitalité Active
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Une vraie nutrition pour une vie plus longue, énergique et joyeuse.
                    </p>
                  </div>
                </div>

                {/* Benefit Card 2 */}
                <div className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-lg hover:border-emerald-300 transition-all flex flex-col justify-between">
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100 relative">
                    <img
                      src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80"
                      alt="Chat calme à la digestion apaisée"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-emerald-800 flex items-center justify-center shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm font-black text-slate-900 mb-1">
                      Digestion Facile & Confort
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Des formules douces et digestes adaptées aux estomacs les plus sensibles.
                    </p>
                  </div>
                </div>

                {/* Benefit Card 3 */}
                <div className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-lg hover:border-emerald-300 transition-all flex flex-col justify-between">
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100 relative">
                    <img
                      src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80"
                      alt="Chiens et chats au système immunitaire fort"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-emerald-800 flex items-center justify-center shadow-xs">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm font-black text-slate-900 mb-1">
                      Immunité Renforcée
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Riche en antioxydants naturels et vitamines qui stimulent les défenses.
                    </p>
                  </div>
                </div>

                {/* Benefit Card 4 */}
                <div className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-lg hover:border-emerald-300 transition-all flex flex-col justify-between">
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100 relative">
                    <img
                      src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80"
                      alt="Pelage soyeux et brillant"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-emerald-800 flex items-center justify-center shadow-xs">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm font-black text-slate-900 mb-1">
                      Pelage Brillant & Peau Saine
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Acides gras Oméga 3 & 6 pour un poil doux, dense et resplendissant.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ── 9. INGREDIENTS SECTION (5 INGREDIENT CARDS) ───────────────────── */}
        <section className="bg-white py-16 sm:py-24 border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header with CTA */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#14532d]">
                  NOS INGRÉDIENTS
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-950 mt-1">
                  Only the Best for Your Best Friend
                </h2>
                <p className="text-slate-500 text-sm sm:text-base mt-1.5 max-w-xl">
                  Nous sélectionnons rigoureusement chaque ingrédient pour garantir une valeur nutritive maximale et une digestibilité parfaite.
                </p>
              </div>

              <Link
                href="/products"
                className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-[#14532d] text-xs font-bold transition-colors shrink-0"
              >
                <span>En Savoir Plus</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 5 Ingredient Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              
              {/* Ingredient 1: Real Meat */}
              <div className="p-5 rounded-3xl bg-[#fafaf8] border border-slate-200/70 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-white shadow-2xs p-2 flex items-center justify-center overflow-hidden mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=300&q=80"
                    alt="Viandes fraîches de qualité"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1">
                  Vraie Viande Noble
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Protéines complètes pour une masse musculaire solide et durable.
                </p>
              </div>

              {/* Ingredient 2: Healthy Carbs */}
              <div className="p-5 rounded-3xl bg-[#fafaf8] border border-slate-200/70 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-white shadow-2xs p-2 flex items-center justify-center overflow-hidden mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=300&q=80"
                    alt="Patates douces et légumes sains"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1">
                  Glucides Sains
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Énergie diffuse issue de patates douces, carottes et petits pois.
                </p>
              </div>

              {/* Ingredient 3: Essential Oils */}
              <div className="p-5 rounded-3xl bg-[#fafaf8] border border-slate-200/70 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-white shadow-2xs p-2 flex items-center justify-center overflow-hidden mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80"
                    alt="Huiles végétales et oméga"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1">
                  Huiles Essentielles
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Oméga 3 & 6 pour nourrir la peau et renforcer la barrière cutanée.
                </p>
              </div>

              {/* Ingredient 4: Natural Herbs */}
              <div className="p-5 rounded-3xl bg-[#fafaf8] border border-slate-200/70 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-white shadow-2xs p-2 flex items-center justify-center overflow-hidden mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=300&q=80"
                    alt="Herbes naturelles bienfaisantes"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1">
                  Herbes Botaniques
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Romarin, thym et sauge pour le bien-être intestinal et digestif.
                </p>
              </div>

              {/* Ingredient 5: Antioxidants */}
              <div className="p-5 rounded-3xl bg-[#fafaf8] border border-slate-200/70 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-white shadow-2xs p-2 flex items-center justify-center overflow-hidden mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=300&q=80"
                    alt="Myrtilles et baies antioxydantes"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1">
                  Super-Antioxydants
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Myrtilles et canneberges protégeant les cellules contre le vieillissement.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ── 10. FINAL BENEFITS BAR ───────────────────────────────────────── */}
        <section className="bg-[#f0fdf4]/70 border-t border-emerald-100 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#14532d] shadow-2xs flex items-center justify-center shrink-0 border border-emerald-100">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Livraison Gratuite</h4>
                  <p className="text-[11px] text-slate-500">Dès 499 DH de commande</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#14532d] shadow-2xs flex items-center justify-center shrink-0 border border-emerald-100">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Retours Faciles</h4>
                  <p className="text-[11px] text-slate-500">Garantie remboursement 30 jours</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#14532d] shadow-2xs flex items-center justify-center shrink-0 border border-emerald-100">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Paiement Sécurisé</h4>
                  <p className="text-[11px] text-slate-500">À la livraison ou par carte</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#14532d] shadow-2xs flex items-center justify-center shrink-0 border border-emerald-100">
                  <Headphones className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Support Dédié</h4>
                  <p className="text-[11px] text-slate-500">Conseillers animaliers 7j/7</p>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* ── 11. FOOTER ────────────────────────────────────────────────────── */}
      <Footer settings={settings} />

    </div>
  );
}

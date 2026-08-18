'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Leaf, 
  ShieldCheck, 
  Sparkles, 
  Truck, 
  ArrowRight
} from 'lucide-react';
import { Category } from '@/types';

interface HeroBannerProps {
  onExploreClick?: () => void;
  categories?: Category[];
  onSelectCategory?: (catId: number | null) => void;
}

export default function HeroBanner({ 
  onExploreClick, 
  categories = [], 
  onSelectCategory 
}: HeroBannerProps) {
  return (
    <div className="my-3 mx-3 sm:mx-6 lg:mx-8 space-y-4 max-w-[1500px] xl:mx-auto">
      
      {/* ── 1. MAIN HERO BANNER CARD ────────────────────────────────────── */}
      <div 
        className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] border border-[#e5ded6] shadow-sm bg-[#f7f4ef]"
        style={{
          backgroundImage: `url('/heroanimal.png')`,
          backgroundPosition: 'right center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Soft light overlay on left side for text readability on smaller screens */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#f7f4ef]/95 via-[#f7f4ef]/85 to-transparent sm:via-[#f7f4ef]/80 lg:via-[#f7f4ef]/60 pointer-events-none" />

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-12 lg:px-16 py-10 sm:py-16 lg:py-20 min-h-[420px] sm:min-h-[520px] flex items-center">
          
          <div className="max-w-xl space-y-5 sm:space-y-6">
            
            {/* Top Leaf Badge */}
            <div className="inline-flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100/90 text-emerald-800 flex items-center justify-center shrink-0">
                <Leaf className="w-3 h-3 text-emerald-800" />
              </span>
              <span className="text-[10px] sm:text-xs font-black tracking-widest text-[#14532d] uppercase">
                PREMIUM NATURAL PET FOOD
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Better Food, <br />
              Better <span className="font-serif italic font-normal text-[#1e3a24]">Life.</span>
            </h1>

            {/* Subtitle / Description */}
            <p className="text-xs sm:text-base text-slate-700 leading-relaxed font-medium max-w-md">
              Premium nutrition made with real ingredients to support your pet&apos;s health, energy and happiness every single day.
            </p>

            {/* Single Main CTA Button */}
            <div className="pt-1 sm:pt-2">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 bg-[#14532d] hover:bg-[#0f3e21] active:scale-98 text-white font-bold text-xs sm:text-base rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <span>Découvrir nos produits</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>

          </div>

          {/* Stamp Badge: "MADE WITH REAL INGREDIENTS" */}
          <div className="hidden md:flex absolute top-8 right-8 lg:top-12 lg:right-1/2 lg:translate-x-32 z-10">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/95 backdrop-blur-xs border-2 border-dashed border-[#14532d]/40 shadow-md flex flex-col items-center justify-center p-2 text-center rotate-[-6deg] hover:rotate-0 transition-transform select-none">
              <span className="text-[8px] sm:text-[9px] font-black text-[#14532d] uppercase tracking-wider">
                MADE WITH
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 my-0.5" />
              <span className="text-[7.5px] sm:text-[8.5px] font-black text-slate-800 uppercase tracking-tight leading-none">
                REAL INGREDIENTS
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ── 2. TRUST BADGES ROW (Under Hero) ─────────────────────────────── */}
      <div className="grid grid-cols-1 min-[440px]:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 pt-1">
        
        {/* Badge 1: 100% Natural */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-3.5 sm:p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#14532d] flex items-center justify-center shrink-0 border border-emerald-100">
            <Leaf className="w-5 h-5 text-emerald-800" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
              100% Natural
            </h4>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Real ingredients
            </p>
          </div>
        </div>

        {/* Badge 2: Vet Approved */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-3.5 sm:p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#14532d] flex items-center justify-center shrink-0 border border-emerald-100">
            <ShieldCheck className="w-5 h-5 text-emerald-800" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
              Vet Approved
            </h4>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Trusted by experts
            </p>
          </div>
        </div>

        {/* Badge 3: Complete Nutrition */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-3.5 sm:p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#14532d] flex items-center justify-center shrink-0 border border-emerald-100">
            <Sparkles className="w-5 h-5 text-emerald-800" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
              Complete Nutrition
            </h4>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Balanced & healthy
            </p>
          </div>
        </div>

        {/* Badge 4: Free Delivery */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-3.5 sm:p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#14532d] flex items-center justify-center shrink-0 border border-emerald-100">
            <Truck className="w-5 h-5 text-emerald-800" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
              Free Delivery
            </h4>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              On orders over 499 DH
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}

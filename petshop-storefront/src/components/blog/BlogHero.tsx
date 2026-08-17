'use client';

import React from 'react';
import { Award, HeartPulse, GraduationCap, Sparkles } from 'lucide-react';

export default function BlogHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f8faf7] to-[#ffffff] border-b border-slate-100 py-10 sm:py-14 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline & Topic Tags */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            
            {/* Small Green Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-black uppercase tracking-wider shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>NOTRE BLOG</span>
            </div>

            {/* Main Hero Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.15] tracking-tight">
              Conseils, Astuces & Actualités <br className="hidden sm:inline" />
              pour le{' '}
              <span className="text-[#14532d] font-black">
                bien-être
              </span>{' '}
              de vos animaux
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
              Découvrez nos articles rédigés par des experts et vétérinaires pour prendre soin de vos compagnons au quotidien.
            </p>

            {/* 4 Topic Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3 text-xs font-bold text-slate-700">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <Award className="w-4 h-4 text-emerald-700" />
                <span>Conseils d&apos;experts</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <HeartPulse className="w-4 h-4 text-emerald-700" />
                <span>Santé & Nutrition</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <GraduationCap className="w-4 h-4 text-emerald-700" />
                <span>Éducation & Comportement</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Actualités & Tendances</span>
              </div>
            </div>

          </div>

          {/* Right Column: Dog & Cat Image */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-none aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden shadow-xl border border-slate-200/70 bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?auto=format&fit=crop&w=1000&q=80"
                alt="Chien et Chat complices - Animal Market Only Blog"
                className="w-full h-full object-cover object-center transform hover:scale-103 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

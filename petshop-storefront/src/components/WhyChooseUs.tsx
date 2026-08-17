'use client';

import React from 'react';
import { Truck, ShieldCheck, Award, Headphones, Sparkles } from 'lucide-react';

export default function WhyChooseUs() {
  const features = [
    {
      icon: <Truck className="w-6 h-6 text-emerald-800" />,
      title: 'Livraison rapide',
      description: 'Livraison express à domicile en 24h à 48h partout au Maroc.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-800" />,
      title: 'Paiement sécurisé',
      description: 'Paiement en espèces à la livraison en toute tranquillité.',
    },
    {
      icon: <Award className="w-6 h-6 text-emerald-800" />,
      title: 'Produits de qualité',
      description: 'Alimentation premium et marques 100% certifiées et authentiques.',
    },
    {
      icon: <Headphones className="w-6 h-6 text-emerald-800" />,
      title: 'Conseil personnalisé',
      description: "Une équipe d'experts passionnés à votre écoute 7j/7.",
    },
  ];

  return (
    <section id="apropos" className="my-16 scroll-mt-24">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-black uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>POURQUOI CHOISIR NOTRE BOUTIQUE ?</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          Une expérience pensée pour votre animal
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
          Qualité • Confiance • Service • Proximité
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {features.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-[18px] border border-[#E8EEF0] p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(20,83,45,0.08)] hover:border-emerald-300/80 transition-all duration-300 flex flex-col justify-between group h-full"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50/90 border border-emerald-100/80 flex items-center justify-center mb-5 group-hover:scale-105 group-hover:bg-emerald-100/90 transition-all duration-300">
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-emerald-900 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

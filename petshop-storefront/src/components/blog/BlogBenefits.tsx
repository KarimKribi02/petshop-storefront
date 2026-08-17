'use client';

import React from 'react';
import { Truck, ShieldCheck, Headphones, CheckCircle2 } from 'lucide-react';

export default function BlogBenefits() {
  const benefits = [
    {
      icon: <Truck className="w-5 h-5 text-emerald-800" />,
      title: 'Livraison 24h à Marrakech',
      subtitle: '24-48h dans tout le Maroc',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-800" />,
      title: 'Paiement à la livraison',
      subtitle: 'Espèces à la réception',
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-800" />,
      title: 'Produits 100% authentiques',
      subtitle: 'Qualité garantie',
    },
    {
      icon: <Headphones className="w-5 h-5 text-emerald-800" />,
      title: 'Service client 7j/7',
      subtitle: 'Nous sommes là pour vous',
    },
  ];

  return (
    <section className="bg-white border-t border-b border-slate-200/80 py-8 my-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {benefits.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
                {item.icon}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

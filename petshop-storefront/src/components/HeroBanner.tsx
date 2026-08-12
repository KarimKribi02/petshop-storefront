'use client';

import React from 'react';
import { 
  Truck, 
  ShieldCheck, 
  Award, 
  ArrowRight, 
  MessageCircle, 
  Sparkles, 
  HeartHandshake,
  Star
} from 'lucide-react';

interface HeroBannerProps {
  onExploreClick?: () => void;
}

export default function HeroBanner({ onExploreClick }: HeroBannerProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl sm:rounded-[2.5rem] my-4 mx-4 sm:mx-6 lg:mx-8 shadow-2xl shadow-emerald-950/20 border border-emerald-800/40">
      
      {/* Decorative Glows & Patterns */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-12 sm:py-16 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-10">
        
        {/* Left Column: Headline & Action */}
        <div className="max-w-2xl text-center lg:text-left space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-700/60 backdrop-blur-md shadow-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
            <span className="text-xs font-black tracking-wide text-emerald-100 uppercase">
              Petshop N°1 à Marrakech & au Maroc
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
            Tout le bonheur de vos animaux, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-amber-200 to-emerald-100">
              livré à votre porte.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-medium max-w-xl">
            Alimentation premium, croquettes au kilo, litières, friandises et accessoires de qualité pour chiens, chats, oiseaux et rongeurs. 
            <strong> Livraison express à Marrakech & partout au Maroc.</strong>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
            <button
              type="button"
              onClick={onExploreClick}
              className="w-full sm:w-auto px-7 py-3.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-emerald-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
            >
              <span>Découvrir nos Produits</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="https://wa.me/212600000000?text=Bonjour%20Animal%20Market%20Only,%20je%20souhaite%20commander%20pour%20mon%20animal"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-800/80 hover:bg-emerald-800 active:scale-95 text-white font-bold text-sm rounded-2xl border border-emerald-700/80 flex items-center justify-center gap-2 transition-all duration-200 backdrop-blur-xs"
            >
              <MessageCircle className="w-4 h-4 text-emerald-300" />
              <span>Conseil WhatsApp</span>
            </a>
          </div>

          {/* Customer Reviews Rating */}
          <div className="flex items-center justify-center lg:justify-start gap-4 pt-3 text-xs text-emerald-200/80 font-semibold">
            <div className="flex -space-x-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <span>+2,500 clients satisfaits à Marrakech</span>
          </div>
        </div>

        {/* Right Column: Key Benefits Cards */}
        <div className="w-full lg:max-w-md grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          <div className="bg-emerald-800/40 border border-emerald-700/40 rounded-2xl p-4.5 backdrop-blur-md flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700/60 text-amber-300 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Livraison Express</h4>
              <p className="text-[11px] text-emerald-200/80 mt-0.5">
                Livraison en 24h à Marrakech et 48h partout au Maroc.
              </p>
            </div>
          </div>

          <div className="bg-emerald-800/40 border border-emerald-700/40 rounded-2xl p-4.5 backdrop-blur-md flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700/60 text-amber-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Paiement à la Livraison</h4>
              <p className="text-[11px] text-emerald-200/80 mt-0.5">
                Réglez en espèces en toute sécurité à la réception (COD).
              </p>
            </div>
          </div>

          <div className="bg-emerald-800/40 border border-emerald-700/40 rounded-2xl p-4.5 backdrop-blur-md flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700/60 text-amber-300 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">100% Produits Authentiques</h4>
              <p className="text-[11px] text-emerald-200/80 mt-0.5">
                Grandes marques certifiées (Royal Canin, Pro Plan, etc.).
              </p>
            </div>
          </div>

          <div className="bg-emerald-800/40 border border-emerald-700/40 rounded-2xl p-4.5 backdrop-blur-md flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700/60 text-amber-300 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Vente au Kilo & Sac</h4>
              <p className="text-[11px] text-emerald-200/80 mt-0.5">
                Flexibilité totale selon vos besoins et budget.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

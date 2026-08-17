'use client';

import React, { useState } from 'react';
import { Faq } from '@/types';
import { ChevronDown, MessageCircle, ArrowRight, HelpCircle } from 'lucide-react';

interface FaqSectionProps {
  faqs?: Faq[];
  phone?: string;
}

const DEFAULT_FAQS: Faq[] = [
  {
    id: 1,
    question: 'Quels sont les délais et frais de livraison à Marrakech et au Maroc ?',
    answer:
      'Nous livrons en moins de 24h à Marrakech (livraison express) et en 24h à 48h dans toutes les autres villes du Maroc (Casablanca, Rabat, Tanger, Fès, Agadir...). La livraison est 100% offerte dès 300 DH d\'achats (sinon seulement 25 DH pour les commandes inférieures).',
  },
  {
    id: 2,
    question: 'Comment fonctionne le paiement à la livraison (Cash on Delivery) ?',
    answer:
      'Le paiement s\'effectue en espèces directement auprès du livreur au moment de la réception de votre commande. Aucune carte bancaire ni paiement en avance n\'est requis.',
  },
  {
    id: 3,
    question: 'Proposez-vous des croquettes au kilo (en vrac) ou seulement des sacs complets ?',
    answer:
      'Nous proposons les deux formats ! Vous pouvez commander des sacs fermés d\'origine scellés ou choisir des portions personnalisées au kilo selon vos besoins.',
  },
  {
    id: 4,
    question: 'Est-il possible de retirer ma commande directement en magasin (Click & Collect) ?',
    answer:
      'Oui, vous pouvez passer votre commande en ligne et choisir le retrait gratuit directement dans notre boutique à Marrakech.',
  },
  {
    id: 5,
    question: 'Puis-je obtenir un conseil personnalisé pour mon animal via WhatsApp ?',
    answer:
      'Absolument ! Notre équipe d\'experts passionnés est disponible 7j/7 sur WhatsApp pour vous orienter vers les croquettes, pâtées ou accessoires les plus adaptés à la race et à l\'âge de votre animal.',
  },
  {
    id: 6,
    question: 'Que faire si le produit reçu est endommagé ou non conforme ?',
    answer:
      'Nous garantissons un service après-vente réactif. Si un article présente un défaut, contactez-nous immédiatement et nous procéderons à un échange ou remboursement rapide.',
  },
];

export default function FaqSection({ faqs = [], phone = '+212600000000' }: FaqSectionProps) {
  const activeFaqs = faqs.filter((f) => f.is_active !== false);
  const displayFaqs = activeFaqs.length > 0 ? activeFaqs : (faqs.length === 0 ? DEFAULT_FAQS : []);
  const [openId, setOpenId] = useState<number | null>(displayFaqs[0]?.id || null);

  const toggleFaq = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  if (displayFaqs.length === 0) {
    return null;
  }

  const cleanPhone = (phone || '+212600000000').replace(/[^0-9]/g, '');

  return (
    <section className="py-16 scroll-mt-24" id="faqs">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-black uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>QUESTIONS FRÉQUENTES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Tout ce que vous devez savoir
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Des réponses simples et rapides à vos questions sur nos produits, la livraison et nos services.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5">
          {displayFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`bg-white rounded-[14px] border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-emerald-400/90 shadow-[0_4px_16px_rgba(20,83,45,0.06)]'
                    : 'border-[#E8EEF0] hover:border-emerald-300/80 hover:bg-slate-50/40 shadow-[0_2px_6px_rgba(0,0,0,0.02)]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-6 py-4.5 sm:py-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-[14px] text-slate-900 transition-colors cursor-pointer select-none"
                >
                  <span className={`${isOpen ? 'text-emerald-950' : 'text-slate-900'}`}>
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isOpen
                        ? 'bg-emerald-50 text-emerald-800 rotate-180'
                        : 'bg-slate-100/80 text-slate-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-0 text-xs sm:text-[13px] text-slate-600 leading-relaxed border-t border-slate-100/80 pt-3.5 animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Horizontal Premium CTA Card below FAQ */}
        <div className="mt-8 p-6 sm:p-7 rounded-[18px] bg-[#14532d] text-white flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg shadow-emerald-950/15">
          <div className="text-center sm:text-left">
            <h3 className="text-sm sm:text-base font-black text-white">
              Une autre question pour votre animal ?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5 font-normal">
              Contactez directement notre équipe par WhatsApp 7j/7.
            </p>
          </div>

          <a
            href={`https://wa.me/${cleanPhone}?text=Bonjour,%20j'ai%20une%20question%20pour%20mon%20animal`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] active:scale-98 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 transition-all shrink-0 shadow-md shadow-black/10 group cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Discuter sur WhatsApp</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </div>

      </div>
    </section>
  );
}
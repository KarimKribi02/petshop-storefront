'use client';

import React, { useState } from 'react';
import { Faq } from '@/types';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';

interface FaqSectionProps {
  faqs?: Faq[];
}

const DEFAULT_FAQS: Faq[] = [
  {
    id: 1,
    question: 'Quels sont les délais et frais de livraison à Marrakech et au Maroc ?',
    answer:
      'Nous livrons en 24h à Marrakech et en 48h dans les autres villes du Maroc (Casablanca, Rabat, Agadir, Tanger...). La livraison est offerte pour toute commande à partir de 300 DH (sinon 25 DH seulement).',
  },
  {
    id: 2,
    question: 'Comment se passe le paiement à la livraison (COD) ?',
    answer:
      'Le paiement s’effectue en espèces directement auprès du livreur au moment de la réception de votre colis. Aucune carte bancaire n’est exigée lors de votre commande en ligne.',
  },
  {
    id: 3,
    question: 'Vendez-vous des croquettes au kilo ou seulement en sacs fermés ?',
    answer:
      'Nous proposons les deux options ! Vous pouvez commander des sacs complets scellés (3kg, 10kg, 15kg...) ou choisir des portions au kilo selon vos besoins et votre budget.',
  },
  {
    id: 4,
    question: 'Puis-je commander ou demander un conseil personnalisé par WhatsApp ?',
    answer:
      'Absolument ! Notre équipe de passionnés est disponible 7j/7 sur WhatsApp pour vous conseiller sur la meilleure alimentation ou accessoire adapté à la race et à l’âge de votre animal.',
  },
];

export default function FaqSection({ faqs = [] }: FaqSectionProps) {
  const displayFaqs = faqs.length > 0 ? faqs : DEFAULT_FAQS;
  const [openId, setOpenId] = useState<number | null>(1);

  const toggleFaq = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="py-12 border-t border-slate-200/60">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-black rounded-full border border-emerald-200 mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Questions Fréquentes</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Tout ce que vous devez savoir
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Des réponses simples et rapides à vos questions sur nos produits, la livraison et nos services.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {displayFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-emerald-800 transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180 text-emerald-700' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* WhatsApp Help Card */}
        <div className="mt-8 p-6 rounded-3xl bg-emerald-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-emerald-950/15">
          <div className="text-center sm:text-left">
            <h3 className="text-sm font-black text-white">
              Une autre question pour votre animal ?
            </h3>
            <p className="text-xs text-emerald-200/90 mt-0.5">
              Contactez directement notre équipe par WhatsApp 7j/7.
            </p>
          </div>
          <a
            href="https://wa.me/212600000000"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-emerald-950 text-xs font-black rounded-xl flex items-center gap-2 transition-all shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Discuter sur WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
}

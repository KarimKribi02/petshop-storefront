'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StoreSettings } from '@/types';
import { getMediaUrl } from '@/lib/axios';
import { 
  Store, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Truck, 
  ShieldCheck, 
  Heart, 
  Award
} from 'lucide-react';

interface FooterProps {
  settings?: StoreSettings | null;
}

export default function Footer({ settings = null }: FooterProps) {
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(settings || null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (settings) {
      setStoreSettings(settings);
      return;
    }
    try {
      const cached = localStorage.getItem('petshop_store_settings');
      if (cached) {
        setStoreSettings(JSON.parse(cached));
      }
    } catch (e) {}
  }, [settings]);

  const storeName = mounted
    ? (storeSettings?.store_name && storeSettings.store_name !== 'Petshop Boutique' ? storeSettings.store_name : 'animal market only')
    : (settings?.store_name && settings.store_name !== 'Petshop Boutique' ? settings.store_name : 'animal market only');
  const phone = mounted ? (storeSettings?.phone_number || '+212 6 00 00 00 00') : (settings?.phone_number || '+212 6 00 00 00 00');
  const email = mounted ? (storeSettings?.support_email || 'contact@animalmarketonly.ma') : (settings?.support_email || 'contact@animalmarketonly.ma');
  const address = mounted ? (storeSettings?.address || 'Marrakech, Maroc') : (settings?.address || 'Marrakech, Maroc');
  const rawLogo = storeSettings?.logo_url || settings?.logo_url;
  const logoUrl = getMediaUrl(rawLogo);
  const description =
    (mounted ? storeSettings?.store_description : null) ||
    settings?.store_description ||
    'Votre animalerie & boutique en ligne spécialisée en alimentation, soins et accessoires pour animaux à Marrakech et partout au Maroc.';

  return (
    <footer className="bg-[#0f172a] text-slate-300 pt-14 pb-8 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Guarantees Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-12 border-b border-slate-800">
          
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/40 hover:border-emerald-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Livraison Express</h4>
              <p className="text-[11px] text-slate-400">24h à Marrakech, 48h au Maroc</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/40 hover:border-emerald-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Paiement à la Livraison</h4>
              <p className="text-[11px] text-slate-400">En espèces à la réception (COD)</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/40 hover:border-emerald-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Qualité Certifiée</h4>
              <p className="text-[11px] text-slate-400">Produits 100% originaux & scellés</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/40 hover:border-emerald-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Service Client 7j/7</h4>
              <p className="text-[11px] text-slate-400">Conseils d&apos;experts par WhatsApp</p>
            </div>
          </div>

        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-12">
          
          {/* Brand Info & Logo (2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 group">
              {mounted && logoUrl ? (
                <div className="bg-white p-2 rounded-2xl inline-flex items-center justify-center border border-slate-700 shadow-sm group-hover:border-emerald-500 transition-colors">
                  <img
                    src={logoUrl}
                    alt={storeName}
                    className="h-10 sm:h-12 w-auto max-w-[190px] object-contain"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
                    <Store className="w-5 h-5" />
                  </div>
                  <span className="text-lg font-black text-white tracking-tight uppercase" suppressHydrationWarning>
                    {storeName}
                  </span>
                </div>
              )}
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {description}
            </p>

            <div className="pt-2 flex items-center gap-3">
              {settings?.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-emerald-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              {settings?.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-emerald-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Nos Rayons Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Nos Rayons
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/products?search=chien" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span>Alimentation Chien</span>
                </Link>
              </li>
              <li>
                <Link href="/products?search=chat" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span>Croquettes & Pâtées Chat</span>
                </Link>
              </li>
              <li>
                <Link href="/products?search=litiere" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span>Litières & Hygiène</span>
                </Link>
              </li>
              <li>
                <Link href="/products?search=oiseau" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span>Oiseaux & Rongeurs</span>
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span>Vente de croquettes au Kilo</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Service Client
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors">
                  À propos de notre boutique
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-emerald-400 transition-colors">
                  Zones & suivi de livraison
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors">
                  Service client & aide
                </Link>
              </li>
              <li>
                <Link href="/#faqs" className="hover:text-emerald-400 transition-colors">
                  Questions fréquentes (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-emerald-400 transition-colors">
                  Suivi de commande en direct
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Contact & Boutique
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-emerald-400 font-mono transition-colors">{phone}</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-emerald-400 transition-colors">{email}</a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Ouvert 7j/7 : 09h00 - 21h00</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar with cdigital.ma link */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p suppressHydrationWarning>
            © {new Date().getFullYear()}{' '}
            <a
              href="https://cdigital.ma/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline transition-colors"
            >
              cdigital
            </a>
            . Tous droits réservés.
          </p>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Fait avec passion pour les animaux au Maroc</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>

      </div>
    </footer>
  );
}

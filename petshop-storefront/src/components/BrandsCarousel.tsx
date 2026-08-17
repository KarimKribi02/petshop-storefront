'use client';

import React, { useState } from 'react';
import { Brand } from '@/types';
import { getMediaUrl } from '@/lib/axios';
import { Award } from 'lucide-react';

import Link from 'next/link';

interface BrandsCarouselProps {
  brands: Brand[];
  selectedBrand?: number | null;
  onSelectBrand?: (brandId: number | null) => void;
}

/** Check if the brand image is a photo/banner rather than a transparent vector logo */
function isPhotoBrand(name: string, url: string | null): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  const lowerName = name.toLowerCase();
  if (lowerName.includes('royal') || lowerName.includes('canin')) return true;
  if (lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.webp')) return true;
  return false;
}

export default function BrandsCarousel({ brands, selectedBrand, onSelectBrand }: BrandsCarouselProps) {
  const [paused, setPaused] = useState(false);

  // Filter brands to only keep those with at least 1 available product
  const validBrands = brands.filter((b) => (b.products_count ?? 0) > 0);

  if (validBrands.length === 0) return null;

  // Build a looped list for seamless infinite scroll
  const CARD_SLOT = 185; // 130px logo width + 55px gap
  const copiesPerHalf = Math.max(4, Math.ceil(1920 / (validBrands.length * CARD_SLOT)) + 1);
  const half = Array.from({ length: copiesPerHalf }, () => validBrands).flat();
  const loopItems = [...half, ...half];
  const duration = `${Math.max(18, validBrands.length * copiesPerHalf * 2.8)}s`;

  return (
    <section id="marques" className="py-6 scroll-mt-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-emerald-700">
            Nos Partenaires
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Marques disponibles
          </h2>
        </div>
        {selectedBrand != null && (
          <Link
            href="/products"
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer transition-colors"
          >
            Toutes les marques
          </Link>
        )}
      </div>

      {/* Global Slider Box */}
      <div
        className="w-full bg-white border border-slate-200/90 rounded-[18px] py-7 px-6 sm:px-9 overflow-hidden relative shadow-xs"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Left fade gradient over white box */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-full w-16 sm:w-24 z-10"
          style={{ background: 'linear-gradient(to right, #ffffff 40%, transparent 100%)' }}
        />
        {/* Right fade gradient over white box */}
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-16 sm:w-24 z-10"
          style={{ background: 'linear-gradient(to left, #ffffff 40%, transparent 100%)' }}
        />

        {/* Scrolling track */}
        <div
          className="flex items-center"
          style={{
            width: 'max-content',
            gap: '55px',
            animationName: 'brands-scroll',
            animationDuration: duration,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationPlayState: paused ? 'paused' : 'running',
          }}
        >
          {loopItems.map((brand, idx) => {
            const isSelected = selectedBrand === brand.id;
            const logoUrl = getMediaUrl(brand.logo ?? null);
            const isPhoto = isPhotoBrand(brand.name, logoUrl);

            return (
              <Link
                key={`brand-${brand.id}-${idx}`}
                href={`/products?brandId=${brand.id}`}
                className={`
                  flex-0 flex-shrink-0 flex items-center justify-center cursor-pointer transition-all duration-200 no-underline text-inherit
                  ${isSelected ? 'scale-110 opacity-100 ring-2 ring-emerald-600 ring-offset-4 rounded-lg' : 'opacity-80 hover:opacity-100 hover:scale-105'}
                `}
                style={{
                  width: '130px',
                  height: '60px',
                }}
                title={brand.name}
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={brand.name}
                    className={`max-w-[120px] max-h-[55px] w-auto h-auto ${
                      isPhoto ? 'object-cover rounded-md' : 'object-contain'
                    } object-center block`}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const sib = e.currentTarget.nextElementSibling as HTMLElement | null;
                      if (sib) sib.style.display = 'flex';
                    }}
                  />
                ) : null}

                {/* Text logo fallback if image missing or fails to load */}
                <div
                  className={`items-center justify-center ${logoUrl ? 'hidden' : 'flex'}`}
                >
                  <span className="text-slate-700 font-extrabold text-sm tracking-wider uppercase hover:text-emerald-800 transition-colors">
                    {brand.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes brands-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

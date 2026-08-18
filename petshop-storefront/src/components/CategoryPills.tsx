'use client';

import React, { useState } from 'react';
import { Category } from '@/types';
import { getMediaUrl } from '@/lib/axios';
import { Dog, Cat, Bird, Fish, Layers } from 'lucide-react';

import Link from 'next/link';

interface CategoryPillsProps {
  categories: Category[];
  selectedCategory?: number | null;
  onSelectCategory?: (categoryId: number | null) => void;
}

function getCategoryStyle(name: string): { gradient: string; icon: React.ReactNode } {
  const lower = name.toLowerCase();
  if (lower.includes('chien') || lower.includes('dog'))
    return { gradient: 'from-amber-400 to-orange-500', icon: <Dog className="w-10 h-10 text-white" /> };
  if (lower.includes('chat') || lower.includes('cat'))
    return { gradient: 'from-purple-400 to-pink-500', icon: <Cat className="w-10 h-10 text-white" /> };
  if (lower.includes('oiseau') || lower.includes('bird'))
    return { gradient: 'from-sky-400 to-blue-500', icon: <Bird className="w-10 h-10 text-white" /> };
  if (lower.includes('poisson') || lower.includes('fish') || lower.includes('aqua'))
    return { gradient: 'from-cyan-400 to-teal-500', icon: <Fish className="w-10 h-10 text-white" /> };
  return { gradient: 'from-emerald-400 to-emerald-600', icon: <Layers className="w-10 h-10 text-white" /> };
}

export default function CategoryPills({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryPillsProps) {
  const [paused, setPaused] = useState(false);

  // Filter categories to only keep those with at least 1 available product
  const validCategories = categories.filter((cat) => (cat.products_count ?? 0) > 0);

  if (validCategories.length === 0) return null;

  const items = validCategories.map((cat) => {
    const style = getCategoryStyle(cat.name);
    return {
      id: cat.id,
      name: cat.name,
      image: cat.image ? getMediaUrl(cat.image) : null,
      gradient: style.gradient,
      icon: style.icon,
    };
  });

  const CARD_SLOT = 190;
  const copiesPerHalf = Math.max(5, Math.ceil(1920 / (items.length * CARD_SLOT)) + 1);
  const halfItems = Array.from({ length: copiesPerHalf }, () => items).flat();
  const loopItems = [...halfItems, ...halfItems];
  const duration = `${Math.max(20, items.length * copiesPerHalf * 2.5)}s`;

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-emerald-700">
            Explorer par univers
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
            Catégories d&apos;animaux
          </h2>
        </div>
        {selectedCategory != null && (
          <Link
            href="/products"
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer transition-colors"
          >
            Voir tous les produits
          </Link>
        )}
      </div>

      {/* Carousel */}
      <div
        className="relative overflow-hidden w-full"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Left fade */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-full w-20 z-10"
          style={{ background: 'linear-gradient(to right, #f8fafc 50%, transparent 100%)' }}
        />
        {/* Right fade */}
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-20 z-10"
          style={{ background: 'linear-gradient(to left, #f8fafc 50%, transparent 100%)' }}
        />

        {/* Scrolling track */}
        <div
          className="flex py-3"
          style={{
            width: 'max-content',
            gap: '20px',
            animationName: 'category-scroll',
            animationDuration: duration,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationPlayState: paused ? 'paused' : 'running',
          }}
        >
          {loopItems.map((item, index) => {
            const isSelected = selectedCategory === item.id;

            return (
              <Link
                key={`cat-${item.id}-${index}`}
                href={`/products?categoryId=${item.id}`}
                className={`
                  relative flex-shrink-0 flex flex-col items-center justify-start cursor-pointer group
                  bg-white rounded-2xl border transition-all duration-300 no-underline text-inherit
                  ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500 ring-offset-2 shadow-[0_6px_20px_rgba(5,150,105,0.18)] scale-[1.03]'
                      : 'border-slate-100 shadow-[0_4px_14px_rgba(0,0,0,0.06)] hover:border-emerald-200 hover:shadow-[0_8px_20px_rgba(0,0,0,0.09)] hover:-translate-y-1'
                  }
                `}
                style={{
                  width: '170px',
                  minWidth: '170px',
                  height: '195px',
                  padding: '14px',
                  borderRadius: '16px',
                }}
              >
                {/* Active check badge */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 z-10 w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Fixed Uniform Image Container */}
                <div
                  className="w-[140px] h-[140px] rounded-[14px] overflow-hidden flex-shrink-0 flex items-center justify-center bg-slate-50 relative"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-center block transform group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}

                  <div
                    className={`w-full h-full bg-gradient-to-br ${item.gradient} flex items-center justify-center ${
                      item.image ? 'hidden' : 'flex'
                    }`}
                  >
                    {item.icon}
                  </div>
                </div>

                {/* Title */}
                <span
                  className={`text-[13px] font-bold text-center leading-snug line-clamp-1 w-full mt-2.5 transition-colors duration-200 ${
                    isSelected ? 'text-emerald-800' : 'text-slate-900 group-hover:text-emerald-800'
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes category-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

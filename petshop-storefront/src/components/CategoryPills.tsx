'use client';

import React from 'react';
import { Category } from '@/types';
import { Sparkles, Dog, Cat, Bird, Fish, Heart, Layers } from 'lucide-react';

interface CategoryPillsProps {
  categories: Category[];
  selectedCategory: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

export default function CategoryPills({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryPillsProps) {
  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('chien') || lower.includes('dog')) return <Dog className="w-5 h-5" />;
    if (lower.includes('chat') || lower.includes('cat')) return <Cat className="w-5 h-5" />;
    if (lower.includes('oiseau') || lower.includes('bird')) return <Bird className="w-5 h-5" />;
    if (lower.includes('poisson') || lower.includes('fish') || lower.includes('aqua')) return <Fish className="w-5 h-5" />;
    return <Layers className="w-5 h-5" />;
  };

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
            Explorer par univers
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Catégories d&apos;animaux
          </h2>
        </div>

        {selectedCategory !== null && (
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* All Products Pill */}
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={`p-4 rounded-3xl border text-left transition-all duration-200 flex flex-col justify-between min-h-[110px] cursor-pointer ${
            selectedCategory === null
              ? 'bg-emerald-900 text-white border-emerald-900 shadow-md shadow-emerald-950/15 scale-[1.02]'
              : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800 hover:border-emerald-300'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              selectedCategory === null
                ? 'bg-emerald-800 text-amber-300'
                : 'bg-emerald-50 text-emerald-800'
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xs">Tous les Animaux</h3>
            <span
              className={`text-[11px] font-semibold ${
                selectedCategory === null ? 'text-emerald-200' : 'text-slate-400'
              }`}
            >
              Catalogue complet
            </span>
          </div>
        </button>

        {/* Dynamic Category Pills */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`p-4 rounded-3xl border text-left transition-all duration-200 flex flex-col justify-between min-h-[110px] cursor-pointer ${
                isSelected
                  ? 'bg-emerald-900 text-white border-emerald-900 shadow-md shadow-emerald-950/15 scale-[1.02]'
                  : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800 hover:border-emerald-300'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  isSelected
                    ? 'bg-emerald-800 text-amber-300'
                    : 'bg-emerald-50 text-emerald-800'
                }`}
              >
                {getCategoryIcon(cat.name)}
              </div>

              <div>
                <h3 className="font-bold text-xs line-clamp-1">{cat.name}</h3>
                <span
                  className={`text-[11px] font-semibold ${
                    isSelected ? 'text-emerald-200' : 'text-slate-400'
                  }`}
                >
                  {cat.products_count !== undefined
                    ? `${cat.products_count} produits`
                    : 'Explorer'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

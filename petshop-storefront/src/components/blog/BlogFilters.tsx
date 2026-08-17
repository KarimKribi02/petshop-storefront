'use client';

import React from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { BLOG_CATEGORIES } from '@/data/blogData';

interface BlogFiltersProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories?: typeof BLOG_CATEGORIES;
}

export default function BlogFilters({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  categories = BLOG_CATEGORIES,
}: BlogFiltersProps) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* Category Dropdown (Left, 5 cols on md) */}
        <div className="md:col-span-5 space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Catégories
          </label>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onSelectCategory(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-emerald-800 rounded-xl text-xs font-bold text-slate-900 focus:outline-none transition-all cursor-pointer shadow-2xs"
            >
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.name}>
                  {cat.name} ({cat.count})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Search Input (Right, 7 cols on md) */}
        <div className="md:col-span-7 space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Rechercher un article...
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher par titre, mot-clé, conseil..."
              className="w-full pl-4 pr-11 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-emerald-800 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-2xs"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Effacer la recherche"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                <Search className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

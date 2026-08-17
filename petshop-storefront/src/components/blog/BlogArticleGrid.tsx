'use client';

import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';
import { BlogPost } from '@/data/blogData';
import BlogArticleCard from './BlogArticleCard';

interface BlogArticleGridProps {
  posts: BlogPost[];
  onResetFilters?: () => void;
}

export default function BlogArticleGrid({ posts, onResetFilters }: BlogArticleGridProps) {
  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-10 sm:p-14 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#14532d] flex items-center justify-center mx-auto shadow-inner">
          <SearchX className="w-8 h-8 text-emerald-700" />
        </div>

        <div className="space-y-1 max-w-md mx-auto">
          <h3 className="text-lg font-black text-slate-900">
            Aucun article trouvé
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Essayez une autre recherche ou sélectionnez une autre catégorie pour explorer nos conseils.
          </p>
        </div>

        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#14532d] hover:bg-[#0f3e21] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer active:scale-98"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser les filtres</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
      {posts.map((post) => (
        <BlogArticleCard key={post.id} post={post} />
      ))}
    </div>
  );
}

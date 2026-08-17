'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Apple,
  HeartPulse,
  Smile,
  GraduationCap,
  Calendar,
  Send,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { BLOG_CATEGORIES, getPopularBlogPosts, BlogPost } from '@/data/blogData';

interface BlogSidebarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories?: typeof BLOG_CATEGORIES;
  popularPosts?: BlogPost[];
}

export default function BlogSidebar({
  selectedCategory,
  onSelectCategory,
  categories = BLOG_CATEGORIES,
  popularPosts = getPopularBlogPosts(3),
}: BlogSidebarProps) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Apple':
        return <Apple className="w-4 h-4 text-emerald-700" />;
      case 'HeartPulse':
        return <HeartPulse className="w-4 h-4 text-emerald-700" />;
      case 'Smile':
        return <Smile className="w-4 h-4 text-emerald-700" />;
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4 text-emerald-700" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-700" />;
    }
  };

  return (
    <aside className="space-y-6">
      
      {/* ── 1. CATEGORIES CARD ────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <h3 className="font-extrabold text-base text-slate-900">
            Catégories
          </h3>
        </div>

        <div className="space-y-1.5">
          {BLOG_CATEGORIES.map((cat) => {
            const isSelected =
              selectedCategory === cat.name ||
              (cat.slug === 'all' && selectedCategory === 'Toutes les catégories');

            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => onSelectCategory(cat.name)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50 text-[#14532d] border border-emerald-200 shadow-2xs font-extrabold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-emerald-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {getCategoryIcon(cat.iconName)}
                  <span>{cat.name}</span>
                </div>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-emerald-800 text-white font-bold'
                      : 'bg-slate-100 text-slate-500 font-semibold'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. POPULAR ARTICLES CARD ─────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <TrendingUp className="w-4 h-4 text-emerald-700" />
          <h3 className="font-extrabold text-base text-slate-900">
            Articles populaires
          </h3>
        </div>

        <div className="space-y-3.5 divide-y divide-slate-100">
          {popularPosts.map((post, idx) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className={`group flex items-center gap-3 transition-colors ${
                idx > 0 ? 'pt-3.5' : ''
              }`}
            >
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mt-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{post.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── 3. NEWSLETTER CARD ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#14532d] via-[#0f3e21] to-[#14532d] text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-emerald-800/60 space-y-4">
        
        {/* Subtle Decorative Circle */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative space-y-2">
          <h3 className="text-lg font-black text-white">
            Restez informé
          </h3>
          <p className="text-xs text-emerald-100/80 leading-relaxed font-medium">
            Recevez nos conseils et astuces directement dans votre boîte mail.
          </p>
        </div>

        {subscribed ? (
          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 text-emerald-100 text-xs font-bold flex items-center gap-2.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>Merci ! Vous êtes bien inscrit à notre newsletter.</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-2.5 relative">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Votre email..."
              className="w-full px-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm"
            />
            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#f59e0b] hover:bg-[#d97706] active:scale-98 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>S&apos;abonner</span>
            </button>
          </form>
        )}

      </div>

    </aside>
  );
}

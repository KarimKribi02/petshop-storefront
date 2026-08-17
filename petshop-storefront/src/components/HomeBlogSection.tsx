'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Sparkles, Calendar, Clock } from 'lucide-react';
import apiClient from '@/lib/axios';
import { BlogPost, FALLBACK_BLOG_POSTS, formatApiPost } from '@/data/blogData';

export default function HomeBlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>(FALLBACK_BLOG_POSTS.slice(0, 3));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get('/shop/posts?per_page=3')
      .then((res) => {
        if (!isMounted) return;
        const raw = res.data?.data;
        const list = Array.isArray(raw) ? raw : raw?.data;
        if (Array.isArray(list) && list.length > 0) {
          const formatted = list.map(formatApiPost);
          setPosts(formatted.slice(0, 3));
        }
      })
      .catch((err) => {
        console.error('Error loading home blog posts:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="my-16 scroll-mt-24">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>NOTRE BLOG & CONSEILS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Conseils d&apos;experts pour le{' '}
            <span className="text-[#14532d]">bien-être</span> de vos animaux
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-medium">
            Découvrez nos derniers articles, guides de nutrition et astuces vétérinaires pour prendre soin de votre compagnon au quotidien.
          </p>
        </div>

        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-bold transition-all shadow-2xs shrink-0 self-start md:self-auto group cursor-pointer"
        >
          <span>Voir tous les articles</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 3 Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="group bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1"
          >
            <Link href={`/blog/${post.slug}`} className="block flex-1 flex flex-col">
              
              {/* Image Container with Category Badge */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover object-center transform group-hover:scale-106 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                
                {/* Category Pill */}
                <div className="absolute bottom-3 left-3 z-10">
                  <span className="px-3 py-1 bg-white/95 backdrop-blur-xs text-[#14532d] text-[11px] font-black rounded-full border border-slate-200/60 shadow-xs uppercase tracking-wider">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-emerald-800 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>

                {/* Footer Info */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{post.date}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{post.readingTime}</span>
                  </div>
                </div>
              </div>

            </Link>
          </article>
        ))}
      </div>

    </section>
  );
}

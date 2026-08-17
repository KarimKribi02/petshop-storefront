'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { BlogPost } from '@/data/blogData';

interface BlogArticleCardProps {
  post: BlogPost;
}

export default function BlogArticleCard({ post }: BlogArticleCardProps) {
  return (
    <article className="group bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      <Link href={`/blog/${post.slug}`} className="block flex-1 flex flex-col">
        
        {/* Image Container with Floating Category Badge */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover object-center transform group-hover:scale-106 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
          
          {/* Category Badge */}
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-3 py-1 bg-white/95 backdrop-blur-xs text-[#14532d] text-[11px] font-black rounded-full border border-slate-200/60 shadow-xs uppercase tracking-wider">
              {post.category}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
          
          <div className="space-y-2">
            {/* Title */}
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-emerald-800 transition-colors line-clamp-2">
              {post.title}
            </h3>

            {/* Excerpt */}
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
              {post.excerpt}
            </p>
          </div>

          {/* Meta Footer (Date + Reading Time) */}
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
  );
}

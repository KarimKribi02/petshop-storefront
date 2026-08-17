'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronRight,
  Calendar,
  Clock,
  User,
  Share2,
  ArrowLeft,
  CheckCircle2,
  Bookmark,
  Sparkles,
  MessageCircle,
  ShoppingBag,
  ArrowRight,
  Heart,
  Tag,
  Loader2,
} from 'lucide-react';
import apiClient from '@/lib/axios';
import { Category, StoreSettings } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogBenefits from '@/components/blog/BlogBenefits';
import BlogArticleCard from '@/components/blog/BlogArticleCard';
import {
  getBlogPostBySlug,
  getRelatedBlogPosts,
  BlogPost,
  formatApiPost,
  FALLBACK_BLOG_POSTS,
} from '@/data/blogData';

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawSlug = Array.isArray(params.slug) ? params.slug[0] : params.slug || '';
  const slug = decodeURIComponent(rawSlug);

  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [post, setPost] = useState<BlogPost | null>(() => getBlogPostBySlug(slug) || null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>(() =>
    post ? getRelatedBlogPosts(post.slug, post.category, 3) : []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      apiClient.get('/shop/categories'),
      apiClient.get('/settings'),
      apiClient.get(`/shop/posts/${encodeURIComponent(slug)}`),
      apiClient.get('/shop/posts?per_page=20'),
    ]).then(([catRes, setRes, postRes, allPostsRes]) => {
      if (!isMounted) return;

      if (catRes.status === 'fulfilled' && catRes.value.data?.data) {
        setCategories(catRes.value.data.data);
      }

      if (setRes.status === 'fulfilled' && setRes.value.data?.data) {
        setSettings(setRes.value.data.data);
      }

      let currentPost: BlogPost | null = null;

      if (postRes.status === 'fulfilled' && postRes.value.data?.data) {
        currentPost = formatApiPost(postRes.value.data.data);
        setPost(currentPost);
      } else {
        // Fallback to local data
        currentPost = getBlogPostBySlug(slug) || null;
        setPost(currentPost);
      }

      if (allPostsRes.status === 'fulfilled') {
        const raw = allPostsRes.value.data?.data;
        const list = Array.isArray(raw) ? raw : raw?.data;
        if (Array.isArray(list) && list.length > 0) {
          const formattedAll = list.map(formatApiPost);
          if (currentPost) {
            const others = formattedAll.filter((p) => p.slug !== currentPost?.slug);
            const sameCat = others.filter(
              (p) => p.category.toLowerCase() === currentPost?.category.toLowerCase()
            );
            const finalRelated =
              sameCat.length >= 3
                ? sameCat.slice(0, 3)
                : [...sameCat, ...others.filter((p) => p.category !== currentPost?.category)].slice(0, 3);
            setRelatedPosts(finalRelated);
          }
        }
      } else if (currentPost) {
        setRelatedPosts(getRelatedBlogPosts(currentPost.slug, currentPost.category, 3));
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading && !post) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafaf8] text-slate-900 font-sans">
        <Header categories={categories} settings={settings} activePage="blog" />
        <main className="flex-1 flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3 text-emerald-800">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-bold text-slate-500">Chargement de l&apos;article...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafaf8] text-slate-900 font-sans">
        <Header categories={categories} settings={settings} activePage="blog" />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
          <h1 className="text-3xl font-black text-slate-900">Article non trouvé</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            L&apos;article que vous recherchez n&apos;existe pas ou a été déplacé.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#14532d] hover:bg-[#0f3e21] text-white text-xs font-black rounded-xl transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retourner au Blog</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf8] text-slate-900 font-sans selection:bg-emerald-200 selection:text-emerald-950">
      
      {/* ── 1. HEADER ─────────────────────────────────────────────────────── */}
      <Header categories={categories} settings={settings} activePage="blog" />

      {/* ── 2. BREADCRUMB ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 flex-wrap" aria-label="Fil d'Ariane">
          <Link href="/" className="hover:text-emerald-800 transition-colors">
            Accueil
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/blog" className="hover:text-emerald-800 transition-colors">
            Blog
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-emerald-800 font-bold">{post.category}</span>
          <ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
          <span className="text-slate-600 truncate max-w-[200px] sm:max-w-xs hidden sm:inline">
            {post.title}
          </span>
        </nav>
      </div>

      {/* ── 3. MAIN ARTICLE CONTAINER ─────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        
        {/* Article Header Card */}
        <header className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm space-y-6">
          
          {/* Top Category Badge */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-[#14532d] text-xs font-black uppercase tracking-wider border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>{post.category}</span>
            </span>

            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#14532d] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tous les articles</span>
            </Link>
          </div>

          {/* Article Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight">
            {post.title}
          </h1>

          {/* Short Excerpt Summary */}
          {post.excerpt && (
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              {post.excerpt}
            </p>
          )}

          {/* Author & Meta Row */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
            
            {/* Author Info */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-emerald-100/90 text-[#14532d] font-black flex items-center justify-center text-sm shadow-2xs border border-emerald-200/60 shrink-0 select-none">
                {post.author.name ? post.author.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black text-slate-900">
                  {post.author.name}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {post.author.role}
                </div>
              </div>
            </div>

            {/* Date & Reading Time */}
            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-800" />
                <span>{post.date}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-800" />
                <span>{post.readingTime}</span>
              </div>
            </div>

          </div>

        </header>

        {/* Featured Image */}
        {post.image && (
          <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-100">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover object-center"
            />
          </div>
        )}

        {/* Article Body Content */}
        <article className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 lg:p-12 shadow-sm space-y-8">
          
          <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-6">
            {post.content.split('\n\n').map((block, idx) => {
              const trimmed = block.trim();
              if (!trimmed) return null;

              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-lg sm:text-xl font-black text-slate-950 pt-4 pb-1 border-b border-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#14532d]" />
                    <span>{trimmed.replace('### ', '')}</span>
                  </h3>
                );
              }

              if (
                trimmed.startsWith('### 1. ') ||
                trimmed.startsWith('### 2. ') ||
                trimmed.startsWith('### 3. ') ||
                trimmed.startsWith('### 4. ') ||
                trimmed.startsWith('### 5. ')
              ) {
                return (
                  <h4 key={idx} className="text-base sm:text-lg font-black text-slate-900 pt-3">
                    {trimmed.replace('### ', '')}
                  </h4>
                );
              }

              if (trimmed.startsWith('> ')) {
                return (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-[#14532d] text-xs sm:text-sm font-semibold leading-relaxed shadow-2xs my-4"
                  >
                    {trimmed.replace('> ', '').replace(/\*\*(.*?)\*\*/g, '$1')}
                  </div>
                );
              }

              if (trimmed.startsWith('* ') || trimmed.startsWith('1. ')) {
                const items = trimmed.split('\n');
                return (
                  <ul key={idx} className="space-y-2.5 my-3 pl-2">
                    {items.map((item, iIdx) => (
                      <li key={iIdx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <span>{item.replace(/^\* |^\d+\. /, '')}</span>
                      </li>
                    ))}
                  </ul>
                );
              }

              return (
                <p key={idx} className="leading-relaxed text-slate-600">
                  {trimmed}
                </p>
              );
            })}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="pt-6 border-t border-slate-100 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
                <Tag className="w-3.5 h-3.5" /> Tags :
              </span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Share Bar */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-800" />
              <span>Partager cet article avec vos proches :</span>
            </span>

            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Découvrez cet article : ${post.title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-xl transition-colors font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors font-bold text-xs cursor-pointer"
              >
                {copied ? '✓ Lien copié !' : 'Copier le lien'}
              </button>
            </div>
          </div>

        </article>

        {/* Call to Action: Shop Products Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#14532d] via-[#0f3e21] to-[#14532d] text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-[11px] font-bold uppercase tracking-wider border border-white/10 inline-block">
              BOUTIQUE ANIMAL MARKET ONLY
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Besoin d&apos;aliments ou d&apos;accessoires pour votre compagnon ?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl">
              Retrouvez nos croquettes premium, litières, friandises et compléments livrés directement chez vous.
            </p>
          </div>

          <Link
            href="/products"
            className="px-6 py-3.5 bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-transform active:scale-95 shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Découvrir la boutique</span>
          </Link>
        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <section className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-950">
                  Articles similaires
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  D&apos;autres conseils d&apos;experts qui pourraient vous intéresser
                </p>
              </div>

              <Link
                href="/blog"
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
              >
                <span>Voir tout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {relatedPosts.map((relPost) => (
                <BlogArticleCard key={relPost.id} post={relPost} />
              ))}
            </div>
          </section>
        )}

      </main>

      {/* ── 4. BENEFITS BAR ───────────────────────────────────────────────── */}
      <BlogBenefits />

      {/* ── 5. FOOTER ─────────────────────────────────────────────────────── */}
      <Footer />

    </div>
  );
}

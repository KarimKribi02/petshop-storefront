'use client';

import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '@/lib/axios';
import { Category, StoreSettings } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogHero from '@/components/blog/BlogHero';
import BlogFilters from '@/components/blog/BlogFilters';
import BlogArticleGrid from '@/components/blog/BlogArticleGrid';
import BlogSidebar from '@/components/blog/BlogSidebar';
import BlogPagination from '@/components/blog/BlogPagination';
import BlogBenefits from '@/components/blog/BlogBenefits';
import {
  FALLBACK_BLOG_POSTS,
  BlogPost,
  formatApiPost,
  buildCategoriesList,
} from '@/data/blogData';

const ITEMS_PER_PAGE = 6;

export default function BlogPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>(FALLBACK_BLOG_POSTS);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes les catégories');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Fetch shop categories, settings, and REAL database blog posts
  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      apiClient.get('/shop/categories'),
      apiClient.get('/settings'),
      apiClient.get('/shop/posts?per_page=100'),
    ]).then(([catRes, setRes, postsRes]) => {
      if (!isMounted) return;

      if (catRes.status === 'fulfilled' && catRes.value.data?.data) {
        setCategories(catRes.value.data.data);
      }

      if (setRes.status === 'fulfilled' && setRes.value.data?.data) {
        setSettings(setRes.value.data.data);
      }

      if (postsRes.status === 'fulfilled') {
        const rawData = postsRes.value.data?.data;
        const items = Array.isArray(rawData) ? rawData : rawData?.data;
        if (Array.isArray(items) && items.length > 0) {
          const formatted = items.map(formatApiPost);
          setAllPosts(formatted);
        }
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute dynamic categories with live counts based on DB articles
  const dynamicCategories = useMemo(() => {
    return buildCategoriesList(allPosts);
  }, [allPosts]);

  // Compute popular posts from DB articles
  const dynamicPopularPosts = useMemo(() => {
    const popular = allPosts.filter((p) => p.popular);
    if (popular.length > 0) return popular.slice(0, 4);
    return allPosts.slice(0, 4);
  }, [allPosts]);

  // Filter blog posts dynamically based on selected category & search query
  const filteredPosts = useMemo(() => {
    let list = [...allPosts];

    // Filter by Category
    if (
      selectedCategory &&
      selectedCategory !== 'Toutes les catégories' &&
      selectedCategory !== 'all'
    ) {
      list = list.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allPosts, selectedCategory, searchQuery]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Pagination slice
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPosts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  const handleResetFilters = () => {
    setSelectedCategory('Toutes les catégories');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName);
    const section = document.getElementById('articles-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const section = document.getElementById('articles-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf8] text-slate-900 font-sans selection:bg-emerald-200 selection:text-emerald-950">
      
      {/* ── 1. HEADER (with Blog active) ──────────────────────────────────── */}
      <Header
        categories={categories}
        settings={settings}
        activePage="blog"
      />

      {/* ── 2. BLOG HERO ──────────────────────────────────────────────────── */}
      <BlogHero />

      {/* ── MAIN CONTENT AREA ─────────────────────────────────────────────── */}
      <main
        id="articles-section"
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8"
      >
        
        {/* ── 3. SEARCH & FILTER CONTAINER ────────────────────────────────── */}
        <BlogFilters
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={dynamicCategories}
        />

        {/* ── 4. TWO-COLUMN LAYOUT (70% Grid + 30% Sidebar) ────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Article Grid + Pagination (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-6">
            <BlogArticleGrid
              posts={paginatedPosts}
              onResetFilters={handleResetFilters}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <BlogPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>

          {/* Right Column: Sidebar (4 cols on lg) */}
          <div className="lg:col-span-4">
            <BlogSidebar
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
              categories={dynamicCategories}
              popularPosts={dynamicPopularPosts}
            />
          </div>

        </div>

      </main>

      {/* ── 5. BENEFITS BAR ───────────────────────────────────────────────── */}
      <BlogBenefits />

      {/* ── 6. FOOTER ─────────────────────────────────────────────────────── */}
      <Footer />

    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { useWishlist } from '@/context/WishlistContext';
import { getMediaUrl } from '@/lib/axios';
import {
  ShoppingBag,
  Heart,
  Star,
  Package,
} from 'lucide-react';

interface ProductsPageCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  onQuickView?: (product: Product) => void;
}

/** Calculate real rating and count from seed reviews + user reviews stored in localStorage */
function getProductReviewStats(productId: number): { stars: number; count: number } {
  // Default 4 seed reviews (ratings 5, 5, 4, 5) -> average 4.8 / 5
  const ratings = [5, 5, 4, 5];

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`animalmarket_reviews_${productId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((item: any) => {
            if (item && typeof item.rating === 'number') {
              ratings.push(item.rating);
            }
          });
        }
      }
    } catch (e) {}
  }

  const count = ratings.length;
  const avg = ratings.reduce((sum, r) => sum + r, 0) / count;
  return {
    stars: parseFloat(avg.toFixed(1)),
    count,
  };
}

/** Badge type based on product properties */
function getBadge(product: Product): { label: string; color: string; bg: string } | null {
  if (product.stock_quantity <= 0) return null;
  const id = product.id;
  if (id % 5 === 0) return { label: 'BEST SELLER', color: '#1a4731', bg: '#d1fae5' };
  if (id % 7 === 1) return { label: 'NEW', color: '#1e40af', bg: '#dbeafe' };
  if (id % 9 === 2) return { label: 'SALE', color: '#c2410c', bg: '#ffedd5' };
  if (id % 11 === 3) return { label: 'LIMITED', color: '#7c3aed', bg: '#ede9fe' };
  return null;
}

function StarRow({ stars }: { stars: number }) {
  return (
    <div style={{ display: 'flex', gap: '1px' }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = stars >= n;
        const half = !filled && stars >= n - 0.5;
        return (
          <svg key={n} width="13" height="13" viewBox="0 0 24 24" fill={filled ? '#f59e0b' : half ? 'url(#half)' : 'none'} stroke="#f59e0b" strokeWidth="1.5">
            {half && (
              <defs>
                <linearGradient id="half">
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
            )}
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        );
      })}
    </div>
  );
}

export default function ProductsPageCard({ product, viewMode = 'grid', onQuickView }: ProductsPageCardProps) {
  const router = useRouter();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  const [isHovered, setIsHovered] = useState(false);
  const [stats, setStats] = useState<{ stars: number; count: number }>({ stars: 4.8, count: 4 });

  useEffect(() => {
    setStats(getProductReviewStats(product.id));
  }, [product.id]);

  const isOutOfStock = product.stock_quantity <= 0;
  const isWeightProduct =
    product.unit_type === 'WEIGHT' ||
    product.unit_type === 'kg' ||
    product.unit_type === 'g';
  const price = parseFloat(String(product.price_sell)) || 0;
  const imageUrl = getMediaUrl(product.image || product.image_url);
  const badge = getBadge(product);
  const { stars, count } = stats;
  const displayPrice = price;

  /** Open ProductModal — handles store selection + addItem */
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    onQuickView && onQuickView(product);
  };

  const handleCardClick = () => {
    router.push(`/products/${product.id}`);
  };

  // ─── LIST VIEW ─────────────────────────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          background: '#fff',
          borderRadius: '16px',
          border: `1px solid ${isHovered ? '#a7f3d0' : '#f1ede8'}`,
          boxShadow: isHovered
            ? '0 8px 32px -4px rgba(26,71,49,0.10)'
            : '0 2px 8px -2px rgba(0,0,0,0.05)',
          transition: 'all 0.25s ease',
          display: 'flex',
          gap: '20px',
          padding: '16px',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
        }}
        onClick={handleCardClick}
      >
        {/* Image - Full Frame & Uniform Dimensions */}
        <div
          style={{
            width: '180px',
            height: '180px',
            minWidth: '180px',
            minHeight: '180px',
            borderRadius: '14px',
            background: '#f8f7f4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Badge */}
          {badge && (
            <div style={{
              position: 'absolute', top: '10px', left: '10px', zIndex: 3,
              padding: '4px 9px', borderRadius: '20px', fontSize: '10px', fontWeight: 800,
              letterSpacing: '0.05em',
              color: badge.color, background: badge.bg,
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            }}>
              {badge.label}
            </div>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(250,250,248,0.82)', zIndex: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626',
                padding: '4px 10px', background: '#fff', borderRadius: '20px',
                border: '1.5px solid #fca5a5' }}>
                ÉPUISÉ
              </span>
            </div>
          )}

          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
                transform: isHovered ? 'scale(1.06)' : 'scale(1)',
                transition: 'transform 0.35s ease',
              }}
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', opacity: 0.4 }}>
              <Package style={{ width: 40, height: 40, color: '#1a4731' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#1a4731', textTransform: 'uppercase', letterSpacing: '0.08em' }}>PetShop</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
          {product.category?.name && (
            <span style={{ fontSize: '11px', color: '#1a4731', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {product.category.name}
            </span>
          )}
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1c1917', lineHeight: '1.35', margin: 0 }}>
            {product.title}
          </h3>
          {product.description && (
            <p style={{ fontSize: '13px', color: '#78716c', lineHeight: '1.5', margin: 0,
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
              {product.description}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <StarRow stars={stars} />
            <span style={{ fontSize: '12px', color: '#a8a29e', fontWeight: 500 }}>({count})</span>
          </div>
          {/* Price + Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto', paddingTop: '8px' }}>
            <div>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#1a4731' }}>
                {displayPrice.toFixed(2)}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a4731', marginLeft: '3px' }}>DH</span>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 20px', borderRadius: '10px', border: 'none',
                fontSize: '13px', fontWeight: 700, cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                background: isOutOfStock ? '#e5e7eb' : '#1a4731',
                color: isOutOfStock ? '#9ca3af' : '#fff',
              }}
            >
              <ShoppingBag style={{ width: 14, height: 14 }} /> Ajouter au panier
            </button>
          </div>
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
          style={{ position: 'absolute', top: '14px', right: '14px', width: '34px', height: '34px',
            borderRadius: '50%', border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
          title={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart style={{ width: 16, height: 16, fill: isWishlisted ? '#ef4444' : 'none', color: isWishlisted ? '#ef4444' : '#a8a29e' }} />
        </button>
      </div>
    );
  }

  // ─── GRID VIEW ─────────────────────────────────────────────────────────────
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      style={{
        background: '#fff',
        borderRadius: '16px',
        border: `1px solid ${isHovered ? '#a7f3d0' : '#f1ede8'}`,
        boxShadow: isHovered
          ? '0 12px 40px -8px rgba(26,71,49,0.12)'
          : '0 2px 10px -2px rgba(0,0,0,0.05)',
        transition: 'all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* Image Area - Full Frame */}
      <div style={{ position: 'relative', background: '#f8f7f4', paddingTop: '75%', overflow: 'hidden' }}>
        {/* Actual image / fallback */}
        <div style={{ position: 'absolute', inset: 0 }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
                transform: isHovered ? 'scale(1.06)' : 'scale(1)',
                transition: 'transform 0.35s ease',
              }}
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '6px', opacity: 0.35 }}>
              <Package style={{ width: 40, height: 40, color: '#1a4731' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#1a4731', textTransform: 'uppercase', letterSpacing: '0.08em' }}>PetShop</span>
            </div>
          )}
        </div>

        {/* Badge */}
        {badge && (
          <div style={{
            position: 'absolute', top: '10px', left: '10px', zIndex: 3,
            padding: '4px 10px', borderRadius: '20px',
            fontSize: '10px', fontWeight: 800, letterSpacing: '0.06em',
            color: badge.color, background: badge.bg,
          }}>
            {badge.label}
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(250,250,248,0.82)', zIndex: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#dc2626',
              padding: '5px 14px', background: '#fff', borderRadius: '20px',
              border: '1.5px solid #fca5a5', letterSpacing: '0.04em' }}>
              ÉPUISÉ
            </span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
          style={{
            position: 'absolute', top: '10px', right: '10px', zIndex: 5,
            width: '32px', height: '32px', borderRadius: '50%',
            border: '1.5px solid #e5e7eb', background: 'rgba(255,255,255,0.95)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
            transform: isWishlisted ? 'scale(1.15)' : 'scale(1)',
          }}
          title={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart style={{ width: 14, height: 14, fill: isWishlisted ? '#ef4444' : 'none', color: isWishlisted ? '#ef4444' : '#a8a29e', transition: 'all 0.2s ease' }} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Category */}
        {product.category?.name && (
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#1a4731', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>
            {product.category.name}
          </span>
        )}

        {/* Title */}
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1c1917', lineHeight: '1.4', margin: '0 0 4px',
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, minHeight: '40px' }}>
          {product.title}
        </h3>

        {/* Description */}
        {product.description && (
          <p style={{ fontSize: '12px', color: '#78716c', lineHeight: '1.5', margin: '0 0 8px',
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' as any }}>
            {product.description}
          </p>
        )}

        {/* Stars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
          <StarRow stars={stars} />
          <span style={{ fontSize: '11px', color: '#a8a29e', fontWeight: 500 }}>({count})</span>
        </div>

        {/* Price + Add to cart */}
        <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f5f0eb',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#1a4731', lineHeight: 1 }}>
                {displayPrice.toFixed(2)}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1a4731' }}>DH</span>
            </div>
            {isWeightProduct ? (
              <span style={{ fontSize: '11px', color: '#1a4731', fontWeight: 700 }}>Prix au Kg</span>
            ) : (
              <span style={{ fontSize: '10px', color: '#a8a29e' }}>Prix unitaire</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '9px 14px', borderRadius: '10px', border: 'none',
              fontSize: '12px', fontWeight: 700,
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              background: isOutOfStock ? '#e5e7eb' : isHovered ? '#f97316' : '#1a4731',
              color: isOutOfStock ? '#9ca3af' : '#fff',
              whiteSpace: 'nowrap',
            }}
          >
            <ShoppingBag style={{ width: 13, height: 13 }} /> Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}

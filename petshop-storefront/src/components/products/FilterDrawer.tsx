'use client';

import React, { useEffect } from 'react';
import { Category, Brand } from '@/types';
import { X, SlidersHorizontal } from 'lucide-react';
import FilterSidebar from './FilterSidebar';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  brands: Brand[];
  selectedCategory: number | null;
  selectedBrand: number | null;
  priceMin: number;
  priceMax: number;
  priceAbsMax: number;
  onSelectCategory: (id: number | null) => void;
  onSelectBrand: (id: number | null) => void;
  onPriceChange: (min: number, max: number) => void;
  onClearAll: () => void;
  totalProducts: number;
}

export default function FilterDrawer({
  isOpen, onClose,
  ...sidebarProps
}: FilterDrawerProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          zIndex: 50, opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Drawer panel */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 51,
          width: '300px', maxWidth: '90vw',
          background: '#fafaf8',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.32s cubic-bezier(0.32, 0, 0.15, 1)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Drawer header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderBottom: '1px solid #f0ece7',
          background: '#fff', position: 'sticky', top: 0, zIndex: 2,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal style={{ width: 18, height: 18, color: '#1a4731' }} />
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#1c1917' }}>Filtres</span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X style={{ width: 16, height: 16, color: '#44403c' }} />
          </button>
        </div>

        {/* Sidebar content — reuse desktop sidebar but without sticky */}
        <div style={{ padding: '16px', flex: 1 }}>
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f0ece7', padding: '16px' }}>
            <FilterSidebar {...sidebarProps} />
          </div>
        </div>

        {/* Apply button */}
        <div style={{ padding: '16px', borderTop: '1px solid #f0ece7', background: '#fff', position: 'sticky', bottom: 0 }}>
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '13px', borderRadius: '12px',
              background: '#1a4731', border: 'none', color: '#fff',
              fontSize: '14px', fontWeight: 800, cursor: 'pointer',
            }}
          >
            Voir les produits
          </button>
        </div>
      </div>
    </>
  );
}

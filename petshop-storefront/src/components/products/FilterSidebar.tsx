'use client';

import React, { useState } from 'react';
import { Category, Brand } from '@/types';
import { ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react';

interface FilterSidebarProps {
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

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid #f0ece7', paddingBottom: '18px', marginBottom: '18px' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '0 0 12px', color: '#1c1917',
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#1c1917' }}>
          {title}
        </span>
        {open
          ? <ChevronUp style={{ width: 15, height: 15, color: '#78716c' }} />
          : <ChevronDown style={{ width: 15, height: 15, color: '#78716c' }} />}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

export default function FilterSidebar({
  categories, brands,
  selectedCategory, selectedBrand,
  priceMin, priceMax, priceAbsMax,
  onSelectCategory, onSelectBrand,
  onPriceChange, onClearAll,
  totalProducts,
}: FilterSidebarProps) {
  const [localMin, setLocalMin] = useState(priceMin);
  const [localMax, setLocalMax] = useState(priceMax);
  const [minInput, setMinInput] = useState(priceMin === 0 ? '' : String(priceMin));
  const [maxInput, setMaxInput] = useState(priceMax === priceAbsMax ? String(priceAbsMax) : String(priceMax));

  // Sync inputs with prop changes (e.g. clear filters or external param changes)
  React.useEffect(() => {
    setLocalMin(priceMin);
    setLocalMax(priceMax);
    setMinInput(priceMin === 0 ? '' : String(priceMin));
    setMaxInput(String(priceMax));
  }, [priceMin, priceMax, priceAbsMax]);

  const validCategories = categories.filter((c) => (c.products_count ?? 0) > 0);
  const validBrands = brands.filter((b) => (b.products_count ?? 0) > 0);

  const hasFilters = selectedCategory !== null || selectedBrand !== null || priceMin > 0 || priceMax < priceAbsMax;

  const applyPrice = () => {
    const parsedMin = minInput === '' ? 0 : Math.max(0, parseInt(minInput, 10) || 0);
    const parsedMax = maxInput === '' ? priceAbsMax : Math.min(priceAbsMax, parseInt(maxInput, 10) || priceAbsMax);
    const finalMin = Math.min(parsedMin, parsedMax);
    const finalMax = Math.max(parsedMin, parsedMax);

    setLocalMin(finalMin);
    setLocalMax(finalMax);
    setMinInput(finalMin === 0 ? '' : String(finalMin));
    setMaxInput(String(finalMax));
    onPriceChange(finalMin, finalMax);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    // Strip leading zeroes (e.g. "0100" -> "100")
    if (val.length > 1 && val.startsWith('0')) {
      val = val.replace(/^0+/, '');
    }
    setMinInput(val);
    if (val !== '') {
      const num = parseInt(val, 10);
      if (!isNaN(num)) {
        setLocalMin(Math.min(num, priceAbsMax));
      }
    } else {
      setLocalMin(0);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 1 && val.startsWith('0')) {
      val = val.replace(/^0+/, '');
    }
    setMaxInput(val);
    if (val !== '') {
      const num = parseInt(val, 10);
      if (!isNaN(num)) {
        setLocalMax(Math.min(num, priceAbsMax));
      }
    } else {
      setLocalMax(priceAbsMax);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyPrice();
    }
  };

  return (
    <aside style={{
      width: '100%',
      background: '#fff',
      borderRadius: '18px',
      border: '1px solid #f0ece7',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <SlidersHorizontal style={{ width: 16, height: 16, color: '#1a4731' }} />
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#1c1917' }}>Filtres</span>
        </div>
        {hasFilters && (
          <button
            onClick={onClearAll}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '4px 10px', borderRadius: '20px',
              background: '#fff7ed', border: '1px solid #fed7aa',
              fontSize: '11px', fontWeight: 700, color: '#c2410c',
              cursor: 'pointer',
            }}
          >
            <X style={{ width: 11, height: 11 }} /> Effacer tout
          </button>
        )}
      </div>

      {/* Categories */}
      {validCategories.length > 0 && (
        <Section title="Catégories">
          {/* All */}
          <button
            onClick={() => onSelectCategory(null)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
              width: '100%', padding: '8px 12px', borderRadius: '8px', border: 'none',
              background: selectedCategory === null ? '#f0fdf4' : 'transparent',
              cursor: 'pointer', marginBottom: '2px', transition: 'background 0.15s ease',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: selectedCategory === null ? 700 : 500,
              color: selectedCategory === null ? '#1a4731' : '#44403c' }}>
              Tous les produits
            </span>
          </button>
          {validCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                width: '100%', padding: '8px 12px', borderRadius: '8px', border: 'none',
                background: selectedCategory === cat.id ? '#f0fdf4' : 'transparent',
                cursor: 'pointer', marginBottom: '2px', transition: 'background 0.15s ease',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: selectedCategory === cat.id ? 700 : 500,
                color: selectedCategory === cat.id ? '#1a4731' : '#44403c' }}>
                {cat.name}
              </span>
            </button>
          ))}
        </Section>
      )}

      {/* Brands */}
      {validBrands.length > 0 && (
        <Section title="Marques">
          <button
            onClick={() => onSelectBrand(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              width: '100%', padding: '6px 10px', borderRadius: '8px', border: 'none',
              background: 'transparent', cursor: 'pointer', marginBottom: '2px',
            }}
          >
            <div style={{
              width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
              border: selectedBrand === null ? 'none' : '1.5px solid #d6d3d1',
              background: selectedBrand === null ? '#1a4731' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {selectedBrand === null && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
            </div>
            <span style={{ fontSize: '13px', fontWeight: selectedBrand === null ? 700 : 500,
              color: selectedBrand === null ? '#1c1917' : '#44403c' }}>
              Toutes les marques
            </span>
          </button>
          {validBrands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => onSelectBrand(brand.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                width: '100%', padding: '6px 10px', borderRadius: '8px', border: 'none',
                background: 'transparent', cursor: 'pointer', marginBottom: '2px',
              }}
            >
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                border: selectedBrand === brand.id ? 'none' : '1.5px solid #d6d3d1',
                background: selectedBrand === brand.id ? '#1a4731' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {selectedBrand === brand.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
              </div>
              <span style={{ fontSize: '13px', fontWeight: selectedBrand === brand.id ? 700 : 500,
                color: selectedBrand === brand.id ? '#1c1917' : '#44403c' }}>
                {brand.name}
              </span>
            </button>
          ))}
        </Section>
      )}

      {/* Price Range */}
      <Section title="Prix (DH)">
        <div style={{ padding: '0 4px' }}>
          {/* Range slider track */}
          <div style={{ position: 'relative', height: '20px', marginBottom: '14px', marginTop: '4px' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '4px',
              background: '#f0ece7', borderRadius: '2px', transform: 'translateY(-50%)' }} />
            <div style={{
              position: 'absolute', top: '50%', height: '4px', background: '#1a4731', borderRadius: '2px',
              left: `${(localMin / priceAbsMax) * 100}%`,
              right: `${100 - (localMax / priceAbsMax) * 100}%`,
              transform: 'translateY(-50%)',
            }} />
            <input
              type="range" min={0} max={priceAbsMax} value={localMin}
              onChange={(e) => {
                const val = Math.min(Number(e.target.value), localMax - 10);
                setLocalMin(val);
                setMinInput(val === 0 ? '' : String(val));
              }}
              onMouseUp={applyPrice} onTouchEnd={applyPrice}
              style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 3 }}
            />
            <input
              type="range" min={0} max={priceAbsMax} value={localMax}
              onChange={(e) => {
                const val = Math.max(Number(e.target.value), localMin + 10);
                setLocalMax(val);
                setMaxInput(String(val));
              }}
              onMouseUp={applyPrice} onTouchEnd={applyPrice}
              style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 4 }}
            />
          </div>
          {/* Min/Max inputs */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '10px', fontWeight: 600, color: '#a8a29e', display: 'block', marginBottom: '4px' }}>MIN</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="0"
                value={minInput}
                onChange={handleMinInputChange}
                onKeyDown={handleKeyDown}
                onBlur={applyPrice}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px',
                  border: '1.5px solid #e5e7eb', fontSize: '13px', fontWeight: 700, color: '#1c1917',
                  outline: 'none', boxSizing: 'border-box' as any }}
              />
            </div>
            <div style={{ width: '12px', height: '1.5px', background: '#d6d3d1', flexShrink: 0, marginTop: '16px' }} />
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '10px', fontWeight: 600, color: '#a8a29e', display: 'block', marginBottom: '4px' }}>MAX</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={String(priceAbsMax)}
                value={maxInput}
                onChange={handleMaxInputChange}
                onKeyDown={handleKeyDown}
                onBlur={applyPrice}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px',
                  border: '1.5px solid #e5e7eb', fontSize: '13px', fontWeight: 700, color: '#1c1917',
                  outline: 'none', boxSizing: 'border-box' as any }}
              />
            </div>
          </div>
          <button
            onClick={applyPrice}
            style={{
              marginTop: '12px', width: '100%', padding: '9px', borderRadius: '10px',
              background: '#1a4731', border: 'none', color: '#fff',
              fontSize: '12px', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Appliquer le prix
          </button>
        </div>
      </Section>

      {/* Clear All */}
      {hasFilters && (
        <button
          onClick={onClearAll}
          style={{
            width: '100%', padding: '10px', borderRadius: '10px',
            border: '1.5px solid #fca5a5', background: '#fff',
            fontSize: '13px', fontWeight: 700, color: '#dc2626',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          <X style={{ width: 14, height: 14 }} /> Supprimer tous les filtres
        </button>
      )}
    </aside>
  );
}

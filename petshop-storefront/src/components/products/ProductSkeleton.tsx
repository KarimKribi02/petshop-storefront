'use client';

import React from 'react';

export default function ProductSkeleton({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-stone-100 p-4 flex gap-5 animate-pulse">
        <div className="w-40 h-40 rounded-xl bg-stone-100 flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-3 py-1">
          <div className="h-3 bg-stone-100 rounded-full w-20" />
          <div className="h-5 bg-stone-100 rounded-full w-3/4" />
          <div className="h-3 bg-stone-100 rounded-full w-1/2" />
          <div className="h-3 bg-stone-100 rounded-full w-24 mt-1" />
          <div className="flex items-center gap-3 mt-auto">
            <div className="h-7 bg-stone-100 rounded-full w-24" />
            <div className="h-9 bg-stone-100 rounded-xl w-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden animate-pulse">
      {/* Image area */}
      <div className="relative bg-stone-50" style={{ paddingTop: '75%' }}>
        <div className="absolute inset-0 bg-stone-100" />
      </div>
      {/* Content */}
      <div className="p-4 flex flex-col gap-2.5">
        <div className="h-3 bg-stone-100 rounded-full w-20" />
        <div className="h-4 bg-stone-100 rounded-full w-4/5" />
        <div className="h-3 bg-stone-100 rounded-full w-3/5" />
        <div className="h-3 bg-stone-100 rounded-full w-2/5 mt-0.5" />
        <div className="h-px bg-stone-100 my-1" />
        <div className="flex items-center justify-between">
          <div className="h-6 bg-stone-100 rounded-full w-20" />
          <div className="h-9 bg-stone-100 rounded-xl w-28" />
        </div>
      </div>
    </div>
  );
}

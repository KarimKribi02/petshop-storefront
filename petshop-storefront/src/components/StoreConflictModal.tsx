'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { AlertTriangle } from 'lucide-react';

export default function StoreConflictModal() {
  const { conflictModal, handleClearAndAddNew, closeConflictModal } = useCart();

  if (!conflictModal.show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-7 space-y-5 text-center border border-slate-100 animate-fade-in">
        <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-3xl flex items-center justify-center mx-auto shadow-inner text-2xl">
          ⚠️
        </div>

        <div className="space-y-2">
          <h3 className="font-extrabold text-slate-900 text-lg">
            Changement de Magasin Impossible !
          </h3>
          <p className="text-slate-600 text-xs leading-relaxed">
            Votre panier contient déjà des produits provenant de{' '}
            <strong className="text-emerald-800 font-extrabold">
              {conflictModal.currentStoreName || 'votre magasin actuel'}
            </strong>.
            <br />
            <br />
            Pour ajouter des articles de{' '}
            <strong className="text-emerald-800 font-extrabold">
              {conflictModal.newStoreName || 'ce nouveau magasin'}
            </strong>, vous devez choisir tous vos articles dans le même magasin.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={handleClearAndAddNew}
            className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-extrabold text-xs uppercase tracking-wide rounded-2xl transition shadow-md shadow-rose-600/20 cursor-pointer"
          >
            Vider le panier et ajouter cet article
          </button>

          <button
            type="button"
            onClick={closeConflictModal}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-extrabold text-xs uppercase tracking-wide rounded-2xl transition cursor-pointer"
          >
            Conserver mon panier actuel
          </button>
        </div>
      </div>
    </div>
  );
}

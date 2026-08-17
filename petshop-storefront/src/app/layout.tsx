import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import StoreConflictModal from '@/components/StoreConflictModal';
import WishlistModal from '@/components/WishlistModal';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'animal market only | Alimentation & Accessoires Animaux Marrakech Maroc',
  description:
    'Boutique en ligne & animalerie à Marrakech. Vente de croquettes au kilo et sacs, litières et accessoires pour chiens, chats, oiseaux. Livraison express 24h & Paiement à la livraison (COD).',
  keywords: [
    'animal market only',
    'petshop marrakech',
    'croquettes chien maroc',
    'croquettes chat marrakech',
    'animalerie en ligne maroc',
    'vente au kilo croquettes',
    'accessoires animaux maroc',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-emerald-200 selection:text-emerald-950">
        <CartProvider>
          <WishlistProvider>
            {children}
            <CartDrawer />
            <CheckoutModal />
            <StoreConflictModal />
            <WishlistModal />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}

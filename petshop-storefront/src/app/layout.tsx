import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import StoreConflictModal from '@/components/StoreConflictModal';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Animal Market Only | Alimentation & Accessoires Animaux Marrakech Maroc',
  description:
    'Boutique en ligne & animalerie à Marrakech. Vente de croquettes au kilo et sacs, litières et accessoires pour chiens, chats, oiseaux. Livraison express 24h & Paiement à la livraison (COD).',
  keywords: [
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
          {children}
          <CartDrawer />
          <CheckoutModal />
          <StoreConflictModal />
        </CartProvider>
      </body>
    </html>
  );
}

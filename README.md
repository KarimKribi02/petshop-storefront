# Animal Market Only - E-Commerce Storefront

Storefront moderne, ultra-rapide et responsive conçu pour **Animal Market Only**, optimisé pour la vente en ligne d'alimentation et accessoires pour animaux au Maroc (Marrakech & livraison nationale).

---

## 🌟 Fonctionnalités Implémentées

### 1. Configuration Client API & Axios
- Instance Axios centralisée dans `src/lib/axios.ts` pointant vers `http://localhost:8000/api/v1` avec headers JSON par défaut, gestion d'erreurs gracieuse et helper de résolution d'URLs de médias (`getMediaUrl`).

### 2. Thème & Design System
- Palette épurée Off-White (`bg-[#f8fafc]`), blanc pur, et accents Vert Émeraude (`#065f46`, `emerald-700`, `emerald-800`).
- Typographie soignée Inter avec prise en charge du format monétaire marocain en Dirhams (`DH` et `DH/Kg`).
- Micro-animations, drawer coulissant fluide et célébration confetti lors de la validation de commande.

### 3. Header & Navigation (`src/components/Header.tsx`)
- Barre d'annonces supérieure avec informations de livraison express et contact WhatsApp direct.
- Logo Animal Market Only dynamique (récupération des paramètres boutique ou badge textuel).
- Barre de recherche en temps réel avec suggestions instantanées (debounced search).
- Liens de catégories rapides avec icônes d'animaux (Chien, Chat, Oiseaux, etc.) et compteurs de produits.
- Bouton Panier avec badge animé du nombre d'articles et montant en temps réel.
- Menu mobile complet pour smartphones et tablettes.

### 4. Panier Latéral Coulissant (`src/components/CartDrawer.tsx`)
- Slide-over Drawer fluide et interactif.
- Jauge d'éligibilité à la livraison gratuite (offerte dès 300 DH).
- Contrôle des quantités à l'unité et au kilo (support des incréments de 0.5kg/1kg).
- Calcul automatique des sous-totaux, frais de port et total général.
- Bouton d'action direct vers le paiement à la livraison.

### 5. Page d'Accueil & Catalogue (`src/app/page.tsx`)
- Bannière Hero attractive mettant en avant la livraison à Marrakech & au Maroc.
- Grille de pilules de catégories interactives.
- Grille de produits "Produits Vedettes / Top Ventes" avec statut de stock en direct (En Stock / Épuisé), badge de vente au kilo (`DH/Kg`), et action d'ajout rapide au panier.
- Modal de prévisualisation rapide (Quick View) pour chaque produit.
- Section de réassurance "Pourquoi choisir Animal Market Only ?".
- Section de questions fréquentes (FAQs) interactives en accordéon.
- Bouton flottant d'assistance WhatsApp.

### 6. Processus de Commande Express COD (`src/components/CheckoutModal.tsx`)
- Formulaire Cash on Delivery (Paiement en espèces à la livraison) adapté au marché marocain :
  - Nom & Prénom
  - Téléphone (06... / 07...)
  - Sélecteur rapide de villes marocaines (Marrakech, Casablanca, Rabat, Agadir, Tanger, etc.)
  - Adresse de livraison complète
  - Instructions de livraison optionnelles
- Soumission automatique du payload vers l'API `/api/v1/shop/orders` créant une commande `WEB` avec statut `PENDING` visible dans le Tableau de Bord Admin.
- Écran de confirmation de commande avec référence, feux d'artifice de confettis et bouton de suivi direct sur WhatsApp.

---

## 🚀 Démarrage du projet

```bash
cd petshop-storefront
npm install
npm run dev
```

L'application sera accessible sur `http://localhost:3000`.

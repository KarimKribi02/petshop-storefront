'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Product, CartItem } from '@/types';

interface StoreInfo {
  store_id: number;
  store_name: string;
}

interface ConflictModalState {
  show: boolean;
  newItem?: {
    product: Product;
    quantity: number;
    selectedStore: StoreInfo;
  };
  currentStoreName?: string;
  newStoreName?: string;
}

interface CartContextType {
  items: CartItem[];
  cart: CartItem[];
  addItem: (product: Product, quantity?: number, selectedStore?: StoreInfo) => void;
  addToCart: (product: Product, selectedStore?: StoreInfo, quantity?: number) => void;
  removeItem: (identifier: string | number) => void;
  updateQuantity: (identifier: string | number, quantity: number) => void;
  clearCart: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  conflictModal: ConflictModalState;
  setConflictModal: React.Dispatch<React.SetStateAction<ConflictModalState>>;
  handleClearAndAddNew: () => void;
  closeConflictModal: () => void;
  currentStore: StoreInfo | null;
  totalItems: number;
  totalPrice: number;
  shippingFee: number;
  freeShippingThreshold: number;
  finalTotal: number;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'animal_market_cart_v1';
const FREE_SHIPPING_THRESHOLD = 300; // Free delivery above 300 DH
const STANDARD_SHIPPING_FEE = 25; // 25 DH delivery

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const [conflictModal, setConflictModal] = useState<ConflictModalState>({ show: false });

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart to storage', e);
      }
    }
  }, [items, isHydrated]);

  const getItemKey = (product: Product): string => {
    return product.barcode || String(product.id);
  };

  const resolveStore = (
    product: Product,
    selectedStore?: StoreInfo
  ): StoreInfo => {
    if (selectedStore && selectedStore.store_id) {
      return {
        store_id: selectedStore.store_id,
        store_name: selectedStore.store_name || (selectedStore.store_id === 2 ? 'Store B - Agdal' : 'Store A - Gueliz'),
      };
    }

    if (product.selected_store_id) {
      const match = product.stores_stock?.find((s) => s.store_id === product.selected_store_id);
      return {
        store_id: product.selected_store_id,
        store_name: match?.store_name || (product.selected_store_id === 2 ? 'Store B - Agdal' : 'Store A - Gueliz'),
      };
    }

    // If cart already has a store, default to it
    if (items.length > 0 && items[0].store_id) {
      return {
        store_id: items[0].store_id,
        store_name: items[0].store_name || (items[0].store_id === 2 ? 'Store B - Agdal' : 'Store A - Gueliz'),
      };
    }

    // Default to store 1
    return {
      store_id: 1,
      store_name: 'Store A - Gueliz',
    };
  };

  const addItem = (
    product: Product,
    qty: number = 1,
    selectedStore?: StoreInfo
  ) => {
    const targetStore = resolveStore(product, selectedStore);

    // 1. Check if Cart already has items from another store
    if (items.length > 0) {
      const existingStoreId = items[0].store_id || items[0].product.selected_store_id || 1;
      const existingStoreName = items[0].store_name || (existingStoreId === 2 ? 'Store B - Agdal' : 'Store A - Gueliz');

      if (existingStoreId !== targetStore.store_id) {
        // 🚨 Trigger Conflict Warning Modal!
        setConflictModal({
          show: true,
          newItem: {
            product: { ...product, selected_store_id: targetStore.store_id },
            quantity: qty,
            selectedStore: targetStore,
          },
          currentStoreName: existingStoreName,
          newStoreName: targetStore.store_name,
        });
        return; // Stop execution
      }
    }

    // 2. Normal Add to Cart if same store or empty cart
    const key = getItemKey(product);
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => getItemKey(i.product) === key
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + qty;
        // Limit to available stock if known
        const maxStock = product.stock_quantity ?? 999;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(newQty, maxStock > 0 ? maxStock : newQty),
          store_id: targetStore.store_id,
          store_name: targetStore.store_name,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            product: { ...product, selected_store_id: targetStore.store_id },
            quantity: qty,
            store_id: targetStore.store_id,
            store_name: targetStore.store_name,
            id: product.id,
          },
        ];
      }
    });

    setIsDrawerOpen(true);
  };

  // addToCart alias as requested
  const addToCart = (
    product: Product,
    selectedStore?: StoreInfo,
    qty: number = 1
  ) => {
    addItem(product, qty, selectedStore);
  };

  // Function to handle clearing cart and switching to new store item
  const handleClearAndAddNew = () => {
    if (conflictModal.newItem) {
      const { product, quantity, selectedStore } = conflictModal.newItem;
      setItems([
        {
          product: {
            ...product,
            selected_store_id: selectedStore.store_id,
          },
          quantity: quantity || 1,
          store_id: selectedStore.store_id,
          store_name: selectedStore.store_name,
          id: product.id,
        },
      ]);
      setIsDrawerOpen(true);
    }
    setConflictModal({ show: false });
  };

  const closeConflictModal = () => {
    setConflictModal({ show: false });
  };

  const removeItem = (identifier: string | number) => {
    setItems((prev) =>
      prev.filter(
        (i) =>
          i.product.barcode !== String(identifier) &&
          i.product.id !== Number(identifier)
      )
    );
  };

  const updateQuantity = (identifier: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(identifier);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (
          item.product.barcode === String(identifier) ||
          item.product.id === Number(identifier)
        ) {
          const maxStock = item.product.stock_quantity ?? 999;
          const validQty = Math.min(quantity, maxStock > 0 ? maxStock : quantity);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  const openCheckout = () => {
    setIsDrawerOpen(false);
    setIsCheckoutOpen(true);
  };
  const closeCheckout = () => setIsCheckoutOpen(false);

  const currentStore = useMemo(() => {
    if (items.length === 0) return null;
    const storeId = items[0].store_id || items[0].product.selected_store_id || 1;
    const storeName = items[0].store_name || (storeId === 2 ? 'Store B - Agdal' : 'Store A - Gueliz');
    return { store_id: storeId, store_name: storeName };
  }, [items]);

  const totalItems = useMemo(() => {
    return items.reduce((acc, curr) => acc + (curr.quantity >= 1 ? Math.floor(curr.quantity) : 1), 0);
  }, [items]);

  const totalPrice = useMemo(() => {
    return items.reduce((acc, curr) => {
      const price = parseFloat(String(curr.product.price_sell)) || 0;
      return acc + price * curr.quantity;
    }, 0);
  }, [items]);

  const shippingFee = useMemo(() => {
    if (items.length === 0) return 0;
    return totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  }, [totalPrice, items.length]);

  const finalTotal = useMemo(() => {
    return totalPrice + shippingFee;
  }, [totalPrice, shippingFee]);

  return (
    <CartContext.Provider
      value={{
        items,
        cart: items,
        addItem,
        addToCart,
        removeItem,
        updateQuantity,
        clearCart,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        isCheckoutOpen,
        openCheckout,
        closeCheckout,
        conflictModal,
        setConflictModal,
        handleClearAndAddNew,
        closeConflictModal,
        currentStore,
        totalItems,
        totalPrice,
        shippingFee,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        finalTotal,
        isHydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

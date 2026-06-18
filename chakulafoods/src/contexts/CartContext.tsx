'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  department: string;
}

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  updateQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  loading: boolean;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

const STORAGE_KEY = 'chakula_cart';

function loadFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function saveToStorage(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    setItems(loadFromStorage());
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(items);
  }, [items, hydrated]);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      router.push('/sign-up-login-screen');
      return;
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });

    toast.success(`${item.name} added to cart!`);
    setCartOpen(true);
  }, [user, router]);

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === productId ? { ...i, quantity: qty } : i))
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
    toast.success('Item removed from cart');
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        cartOpen,
        setCartOpen,
        addToCart,
        updateQty,
        removeItem,
        clearCart,
        loading: false,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

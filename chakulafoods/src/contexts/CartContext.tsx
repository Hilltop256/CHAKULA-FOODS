'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SelectedProductOption } from '@/types/product-options';

export interface CartItem {
  id: string;
  cartItemId: string;
  name: string;
  price: number;
  basePrice: number;
  quantity: number;
  image: string;
  department: string;
  selectedOptions: SelectedProductOption[];
}

type AddCartItem = Omit<CartItem, 'quantity' | 'cartItemId' | 'basePrice' | 'selectedOptions'> &
  Partial<Pick<CartItem, 'basePrice' | 'selectedOptions'>>;

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (item: AddCartItem, quantity?: number) => boolean;
  updateQty: (cartItemId: string, qty: number) => void;
  removeItem: (cartItemId: string) => void;
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

function makeCartItemId(productId: string, selectedOptions: SelectedProductOption[]) {
  const signature = [...selectedOptions]
    .sort((a, b) => `${a.group_id}:${a.option_id}`.localeCompare(`${b.group_id}:${b.option_id}`))
    .map((option) => `${option.group_id}:${option.option_id}`)
    .join('|');
  return signature ? `${productId}::${signature}` : productId;
}

function loadFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => {
      const selectedOptions = Array.isArray(item.selectedOptions) ? item.selectedOptions : [];
      return {
        ...item,
        basePrice: Number(item.basePrice ?? item.price ?? 0),
        selectedOptions,
        cartItemId: item.cartItemId || makeCartItemId(String(item.id), selectedOptions),
      } as CartItem;
    });
  } catch {
    return [];
  }
}

function saveToStorage(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setItems(loadFromStorage()); setHydrated(true); }, []);
  useEffect(() => { if (hydrated) saveToStorage(items); }, [items, hydrated]);

  const addToCart = useCallback((item: AddCartItem, quantity = 1) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      router.push('/sign-up-login-screen');
      return false;
    }
    const quantityToAdd = Math.max(1, Math.floor(quantity));
    const selectedOptions = item.selectedOptions || [];
    const basePrice = Number(item.basePrice ?? item.price);
    const normalizedItem = { ...item, basePrice, selectedOptions };
    const cartItemId = makeCartItemId(item.id, selectedOptions);
    setItems((prev) => {
      const existing = prev.find((cartItem) => cartItem.cartItemId === cartItemId);
      return existing
        ? prev.map((cartItem) => cartItem.cartItemId === cartItemId ? { ...cartItem, quantity: cartItem.quantity + quantityToAdd } : cartItem)
        : [...prev, { ...normalizedItem, cartItemId, quantity: quantityToAdd }];
    });
    toast.success(`${item.name} added to cart!`);
    setCartOpen(true);
    return true;
  }, [user, router]);

  const updateQty = useCallback((cartItemId: string, qty: number) => {
    if (qty <= 0) setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    else setItems((prev) => prev.map((item) => item.cartItemId === cartItemId ? { ...item, quantity: qty } : item));
  }, []);
  const removeItem = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    toast.success('Item removed from cart');
  }, []);
  const clearCart = useCallback(() => setItems([]), []);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return <CartContext.Provider value={{ items, cartCount, cartOpen, setCartOpen, addToCart, updateQty, removeItem, clearCart, loading: false }}>{children}</CartContext.Provider>;
}

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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
  addToCart: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  updateQty: (productId: string, qty: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Keep a ref to always have current items without stale closure issues
  const itemsRef = useRef<CartItem[]>(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Load cart from Supabase when user logs in
  const loadCart = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[CartContext] loadCart error:', error);
        throw error;
      }

      const mapped: CartItem[] = (data || []).map((row) => ({
        id: row.product_id,
        name: row.name,
        price: row.price,
        quantity: row.quantity,
        image: row.image || '',
        department: row.department,
      }));
      setItems(mapped);
    } catch (err) {
      console.error('[CartContext] Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (user?.id) {
      loadCart(user.id);
    } else {
      setItems([]);
    }
  }, [user?.id, loadCart]);

  const addToCart = async (item: Omit<CartItem, 'quantity'>) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      router.push('/sign-up-login-screen');
      return;
    }

    // Read current items from ref (avoids stale closure)
    const currentItems = itemsRef.current;
    const existing = currentItems.find((i) => i.id === item.id);
    const newQty = existing ? existing.quantity + 1 : 1;

    // Optimistic update
    setItems((prev) => {
      const found = prev.find((i) => i.id === item.id);
      if (found) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });

    try {
      // Always upsert — handles both insert and update atomically
      // Uses named constraint 'cart_items_user_product_unique' for reliable conflict resolution
      const { error } = await supabase
        .from('cart_items')
        .upsert(
          {
            user_id: user.id,
            product_id: item.id,
            name: item.name,
            price: item.price,
            quantity: newQty,
            image: item.image,
            department: item.department,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,product_id', ignoreDuplicates: false }
        );

      if (error) {
        console.error('[CartContext] addToCart upsert error:', error);
        throw error;
      }

      toast.success(`${item.name} added to cart!`);
    } catch (err) {
      console.error('[CartContext] addToCart failed:', err);
      // Revert optimistic update on failure
      await loadCart(user.id);
      toast.error('Failed to add item to cart. Please try again.');
    }
  };

  const updateQty = async (productId: string, qty: number) => {
    if (!user) return;

    if (qty === 0) {
      return removeItem(productId);
    }

    // Optimistic update
    setItems((prev) =>
      prev.map((i) => i.id === productId ? { ...i, quantity: qty } : i)
    );

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: qty, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) {
        console.error('[CartContext] updateQty error:', error);
        throw error;
      }
    } catch (err) {
      console.error('[CartContext] updateQty failed:', err);
      await loadCart(user.id);
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (productId: string) => {
    if (!user) return;

    // Optimistic update
    setItems((prev) => prev.filter((i) => i.id !== productId));

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) {
        console.error('[CartContext] removeItem error:', error);
        throw error;
      }
      toast.success('Item removed from cart');
    } catch (err) {
      console.error('[CartContext] removeItem failed:', err);
      await loadCart(user.id);
      toast.error('Failed to remove item');
    }
  };

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, cartCount, cartOpen, setCartOpen, addToCart, updateQty, removeItem, loading }}>
      {children}
    </CartContext.Provider>
  );
}

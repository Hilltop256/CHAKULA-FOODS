'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';
import CartDrawer, { CartItem } from '@/components/CartDrawer';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePageClient({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const isLoggedIn = !!user;
  const userName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  const userRole = (profile?.role as 'customer' | 'admin' | 'delivery') || 'customer';

  const handleUpdateQty = (id: string, qty: number) => {
    if (qty === 0) {
      setCartItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setCartItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
      );
    }
  };

  const handleRemove = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
    toast.success('Item removed from cart');
  };

  const handleAddToCart = (item: Omit<CartItem, 'quantity'>) => {
    if (!isLoggedIn) {
      toast.error('Please sign in to add items to cart');
      router.push('/sign-up-login-screen');
      return;
    }
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} added to cart!`);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      router.push('/');
      router.refresh();
    } catch {
      toast.error('Failed to sign out');
    }
  };

  return (
    <>
      <TopNav
        cartCount={cartItems.reduce((s, i) => s + i.quantity, 0)}
        isLoggedIn={isLoggedIn}
        userName={userName}
        userRole={userRole}
        onSignOut={handleSignOut}
        onCartOpen={() => setCartOpen(true)}
      />
      {children}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemove={handleRemove}
        isLoggedIn={isLoggedIn}
      />
      {cartItems.length > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-primary text-primary-foreground rounded-full px-5 py-3 shadow-lg flex items-center gap-2 font-semibold text-sm transition-all duration-150 hover:bg-primary/90 active:scale-95 lg:hidden"
        >
          🛒 Cart ({cartItems.reduce((s, i) => s + i.quantity, 0)})
        </button>
      )}
    </>
  );
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';
import CartDrawer from '@/components/CartDrawer';
import ConfectionaryPageClient from './ConfectionaryPageClient';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

export default function ConfectionaryPageWrapper() {
  const { user, profile, signOut } = useAuth();
  const { items, cartCount, cartOpen, setCartOpen, updateQty, removeItem } = useCart();
  const router = useRouter();

  const isLoggedIn = !!user;
  const userName = profile?.full_name || user?.email?.split('@')[0] || '';
  const userRole = (profile?.role as 'customer' | 'admin' | 'delivery') || 'customer';

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
    <div className="min-h-screen bg-background">
      <TopNav
        isLoggedIn={isLoggedIn}
        userName={userName}
        userRole={userRole}
        cartCount={cartCount}
        onSignOut={handleSignOut}
        onCartOpen={() => setCartOpen(true)}
      />
      <ConfectionaryPageClient />
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={items}
        onUpdateQty={updateQty}
        onRemove={removeItem}
        isLoggedIn={isLoggedIn}
      />
      {cartCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-primary text-primary-foreground rounded-full px-5 py-3 shadow-lg flex items-center gap-2 font-semibold text-sm transition-all duration-150 hover:bg-primary/90 active:scale-95 lg:hidden"
        >
          🛒 Cart ({cartCount})
        </button>
      )}
    </div>
  );
}

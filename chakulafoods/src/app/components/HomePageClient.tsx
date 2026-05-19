'use client';

import React, { useState } from 'react';
import TopNav from '@/components/TopNav';
import CartDrawer, { CartItem } from '@/components/CartDrawer';
import { toast } from 'sonner';

const mockUser = {
  isLoggedIn: true,
  name: 'Amara Nakato',
  role: 'customer' as const,
};

export default function HomePageClient({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'cart-001',
      name: 'Chicken Stew & Matooke',
      price: 18000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=200&q=80',
      department: 'Restaurant',
    },
    {
      id: 'cart-002',
      name: 'Passion Fruit Smoothie',
      price: 9500,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=200&q=80',
      department: 'Juice Bar',
    },
  ]);
  const [cartOpen, setCartOpen] = useState(false);

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
    if (!mockUser.isLoggedIn) {
      toast.error('Please sign in to add items to cart');
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

  return (
    <>
      <TopNav
        cartCount={cartItems.reduce((s, i) => s + i.quantity, 0)}
        isLoggedIn={mockUser.isLoggedIn}
        userName={mockUser.name}
        userRole={mockUser.role}
      />
      {/* Pass addToCart via context or prop drilling — backend integration point */}
      {children}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemove={handleRemove}
        isLoggedIn={mockUser.isLoggedIn}
      />
      {/* Floating cart button for mobile */}
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
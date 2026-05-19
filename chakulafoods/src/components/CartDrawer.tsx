'use client';

import React from 'react';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  department: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  isLoggedIn: boolean;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemove,
  isLoggedIn,
}: CartDrawerProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-foreground/30 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-sm bg-card z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-primary" />
            <h2 className="font-bold text-base text-foreground">
              Your Cart ({items.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <ShoppingBag size={40} className="text-muted-foreground mb-3" />
              <p className="font-semibold text-foreground">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add items from any department to get started
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`cart-${item.id}`}
                className="flex gap-3 p-3 rounded-xl bg-muted/40 border border-border"
              >
                <AppImage
                  src={item.image}
                  alt={item.name}
                  width={56}
                  height={56}
                  className="rounded-lg object-cover w-14 h-14 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.department}</p>
                  <p className="text-sm font-bold text-primary mt-1 tabular-nums">
                    UGX {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => onRemove(item.id)}
                    className="p-1 rounded hover:bg-accent/10 text-accent transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUpdateQty(item.id, Math.max(0, item.quantity - 1))}
                      className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="text-sm font-semibold w-4 text-center tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-medium">Subtotal</span>
              <span className="font-bold text-foreground tabular-nums">
                UGX {total.toLocaleString()}
              </span>
            </div>
            {isLoggedIn ? (
              <button className="btn-primary w-full text-center">
                Proceed to Checkout
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">
                  Sign in to complete your order
                </p>
                <a href="/sign-up-login-screen" className="btn-primary w-full text-center block">
                  Sign In to Checkout
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
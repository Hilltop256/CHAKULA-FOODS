'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { useCart } from '@/contexts/CartContext';
import {
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
  Package,
  ShoppingCart,
} from 'lucide-react';

const navTabs = [
  { label: 'Home', href: '/' },
  { label: 'Restaurant', href: '/restaurant-page' },
  { label: 'Confectionary', href: '/confectionary-page' },
  { label: 'Juice Bar', href: '/juice-bar-page' },
  { label: 'Wine & Liquor', href: '/wine-liquor-page' },
  { label: 'Market Specials', href: '/market-specials' },
  { label: 'Subscriptions', href: '#subscriptions' },
  
];

interface TopNavProps {
  isLoggedIn?: boolean;
  userName?: string;
  userRole?: 'customer' | 'admin' | 'delivery';
  onSignOut?: () => void;
}

export default function TopNav({
  isLoggedIn = false,
  userName = '',
  userRole = 'customer',
  onSignOut,
}: TopNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { cartCount, setCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      {/* Brand bar */}
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <AppLogo size={40} />
            <div className="hidden sm:block">
              <span className="font-extrabold text-lg text-primary leading-none block">
                Chakula
              </span>
              <span className="text-xs text-secondary font-semibold tracking-wide leading-none">
                Foods Naalya
              </span>
            </div>
          </Link>

          {/* Desktop nav tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {navTabs.map((tab) => {
              const isActive =
                tab.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(tab.href) && tab.href !== '#';
              return (
                <Link
                  key={`nav-${tab.label}`}
                  href={tab.href}
                  className={`px-3 py-1.5 text-sm transition-all duration-150 ${
                    isActive ? 'nav-tab-active' : 'nav-tab-inactive'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Cart button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart size={20} className="text-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1 tabular-nums">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* User */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <User size={14} className="text-primary" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-foreground max-w-[100px] truncate">
                    {userName}
                  </span>
                  <ChevronDown size={14} className="text-muted-foreground" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 card-base shadow-lg py-1 animate-scale-in">
                    {userRole === 'admin' && (
                      <Link
                        href="/admin-panel"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings size={14} />
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      href="/order-tracking"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Package size={14} />
                      My Orders
                    </Link>
                    <Link
                      href="/account"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={14} />
                      My Account
                    </Link>
                    <hr className="border-border my-1" />
                    <button
                      onClick={() => { setUserMenuOpen(false); onSignOut?.(); }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-accent hover:bg-muted transition-colors w-full text-left"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/sign-up-login-screen" className="btn-primary text-sm py-2 px-4">
                Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border py-3 pb-4 animate-fade-in">
            {navTabs.map((tab) => {
              const isActive =
                tab.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(tab.href) && tab.href !== '#';
              return (
                <Link
                  key={`mobile-nav-${tab.label}`}
                  href={tab.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 text-sm font-medium rounded-lg mx-1 transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}

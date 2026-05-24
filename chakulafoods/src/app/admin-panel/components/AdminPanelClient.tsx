'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingBag, Users, Store, ChevronLeft, ChevronRight, LogOut, Bell, Search, Tag } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import AdminOverview from './AdminOverview';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminUsers from './AdminUsers';
import AdminMarketSpecials from './AdminMarketSpecials';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';


const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package, badge: 0 },
  { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: 7 },
  { id: 'users', label: 'Users', icon: Users, badge: 0 },
  { id: 'departments', label: 'Departments', icon: Store, badge: 0 },
  { id: 'market-specials', label: 'Market Specials', icon: Tag, badge: 0 },
];

export default function AdminPanelClient() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, profile } = useAuth();

  const adminName = profile?.full_name || user?.email?.split('@')?.[0] || 'Admin';

  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return <AdminOverview />;
      case 'products': return <AdminProducts />;
      case 'orders': return <AdminOrders />;
      case 'users': return <AdminUsers />;
      case 'market-specials': return <AdminMarketSpecials />;
      default: return <AdminOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-primary text-primary-foreground transition-all duration-300 ease-in-out shrink-0 ${
          sidebarCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 h-16">
          <AppLogo size={32} />
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <span className="font-extrabold text-sm block leading-none">Chakula</span>
              <span className="text-secondary text-xs font-semibold">Admin Panel</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems?.map((item) => {
            const Icon = item?.icon;
            const isActive = activeSection === item?.id;
            return (
              <button
                key={`admin-nav-${item?.id}`}
                onClick={() => setActiveSection(item?.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                  isActive
                    ? 'bg-white/20 text-white' :'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
                title={sidebarCollapsed ? item?.label : undefined}
              >
                <Icon size={18} className="shrink-0" />
                {!sidebarCollapsed && <span className="flex-1 text-left">{item?.label}</span>}
                {!sidebarCollapsed && item?.badge && item?.badge > 0 ? (
                  <span className="bg-secondary text-secondary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {item?.badge}
                  </span>
                ) : null}
                {sidebarCollapsed && item?.badge && item?.badge > 0 ? (
                  <span className="absolute top-1 right-1 bg-secondary rounded-full w-3 h-3" />
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-3 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all duration-150"
          >
            <LogOut size={18} className="shrink-0" />
            {!sidebarCollapsed && <span>Back to Store</span>}
          </Link>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-20 -right-3 bg-primary border-2 border-background rounded-full p-0.5 z-10 hover:bg-primary/80 transition-colors"
          style={{ position: 'relative', alignSelf: 'flex-end', marginBottom: '-12px', marginRight: '-6px' }}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={14} className="text-primary-foreground" />
          ) : (
            <ChevronLeft size={14} className="text-primary-foreground" />
          )}
        </button>
      </aside>
      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            <h1 className="font-bold text-lg text-foreground capitalize">
              {activeSection === 'overview' ? 'Dashboard Overview' : activeSection === 'market-specials' ? 'Market Specials' : activeSection}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search orders, products..."
                className="input-field pl-9 w-56 text-sm h-9"
              />
            </div>
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users size={14} className="text-primary" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-foreground leading-none">{adminName}</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
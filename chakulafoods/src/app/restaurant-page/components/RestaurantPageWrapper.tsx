'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';
import RestaurantPageClient, { RestaurantItem, LastOrder } from './RestaurantPageClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RestaurantPageWrapperProps {
  items: RestaurantItem[];
  lastOrder: LastOrder | null;
}

export default function RestaurantPageWrapper({ items, lastOrder }: RestaurantPageWrapperProps) {
  const { user, profile, signOut } = useAuth();
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
        onSignOut={handleSignOut}
      />
      <RestaurantPageClient items={items} lastOrder={lastOrder} />
    </div>
  );
}

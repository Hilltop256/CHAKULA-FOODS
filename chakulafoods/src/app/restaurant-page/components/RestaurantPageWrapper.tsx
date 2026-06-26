'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';
import RestaurantPageClient from './RestaurantPageClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { RestaurantItem } from '../page';

interface RestaurantPageWrapperProps {
  initialItems: RestaurantItem[];
}

export default function RestaurantPageWrapper({ initialItems }: RestaurantPageWrapperProps) {
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
      <RestaurantPageClient items={initialItems} />
    </div>
  );
}

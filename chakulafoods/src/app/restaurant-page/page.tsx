import React from 'react';
import TopNav from '@/components/TopNav';
import RestaurantPageClient from '@/app/restaurant-page/components/RestaurantPageClient';

export default function RestaurantPage() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav isLoggedIn={true} userName="Amara Nakato" userRole="customer" cartCount={2} />
      <RestaurantPageClient />
    </div>
  );
}
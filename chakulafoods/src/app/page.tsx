import React from 'react';

import HeroBanner from '@/app/components/HeroBanner';
import DepartmentCards from '@/app/components/DepartmentCards';
import HomePageClient from '@/app/components/HomePageClient';
import TodaysOffers from '@/app/components/TodaysOffers';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HomePageClient>
        <HeroBanner />
        <TodaysOffers />
        <DepartmentCards />
      </HomePageClient>
    </div>
  );
}

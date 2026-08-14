import React from 'react';

import HeroBanner from '@/app/components/HeroBanner';
import DepartmentCards from '@/app/components/DepartmentCards';
import TodaysOffersCarousel from '@/app/components/TodaysOffersCarousel';
import HomePageClient from '@/app/components/HomePageClient';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HomePageClient>
        <HeroBanner />
        <TodaysOffersCarousel />
        <DepartmentCards />
      </HomePageClient>
    </div>
  );
}

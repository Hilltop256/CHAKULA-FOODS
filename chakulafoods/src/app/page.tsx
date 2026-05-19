import React from 'react';

import HeroBanner from '@/app/components/HeroBanner';
import DepartmentCards from '@/app/components/DepartmentCards';
import FeaturedItemsSection from '@/app/components/FeaturedItemsSection';
import HomePageClient from '@/app/components/HomePageClient';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HomePageClient>
        <HeroBanner />
        <DepartmentCards />
        <FeaturedItemsSection />
      </HomePageClient>
    </div>
  );
}
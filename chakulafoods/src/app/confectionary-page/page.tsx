import React from 'react';
import TopNav from '@/components/TopNav';
import ConfectionaryPageClient from '@/app/confectionary-page/components/ConfectionaryPageClient';

export default function ConfectionaryPage() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav isLoggedIn={true} userName="Amara Nakato" userRole="customer" cartCount={2} />
      <ConfectionaryPageClient />
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import TopNav from '@/components/TopNav';
import AgeVerificationGate from './AgeVerificationGate';
import WineLiquorCatalog from './WineLiquorCatalog';

export default function WineLiquorPageClient() {
  const [ageVerified, setAgeVerified] = useState(false);
  const [verificationDenied, setVerificationDenied] = useState(false);

  if (verificationDenied) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-extrabold text-foreground mb-2">Access Restricted</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          You must be 18 years or older to access the Wine & Liquor section. 
          Please explore our other departments.
        </p>
        <a href="/" className="btn-primary">
          Back to Home
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {!ageVerified && (
        <AgeVerificationGate
          onVerified={() => setAgeVerified(true)}
          onDenied={() => setVerificationDenied(true)}
        />
      )}
      {ageVerified && (
        <>
          <TopNav isLoggedIn={true} userName="Amara Nakato" userRole="customer" cartCount={2} />
          <WineLiquorCatalog />
        </>
      )}
    </div>
  );
}
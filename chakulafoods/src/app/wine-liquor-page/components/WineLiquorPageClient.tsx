'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';
import AgeVerificationGate from './AgeVerificationGate';
import WineLiquorCatalog from './WineLiquorCatalog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SESSION_KEY = 'chakula_age_verified';

export default function WineLiquorPageClient() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [ageVerified, setAgeVerified] = useState(false);
  const [verificationDenied, setVerificationDenied] = useState(false);

  const isLoggedIn = !!user;
  const userName = profile?.full_name || user?.email?.split('@')[0] || '';
  const userRole = (profile?.role as 'customer' | 'admin' | 'delivery') || 'customer';

  useEffect(() => {
    if (isLoggedIn && sessionStorage.getItem(SESSION_KEY) === 'true') {
      setAgeVerified(true);
    }
  }, [isLoggedIn]);

  const handleVerified = () => {
    if (isLoggedIn) {
      sessionStorage.setItem(SESSION_KEY, 'true');
    }
    setAgeVerified(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      sessionStorage.removeItem(SESSION_KEY);
      toast.success('Signed out successfully');
      router.push('/');
      router.refresh();
    } catch {
      toast.error('Failed to sign out');
    }
  };

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
          onVerified={handleVerified}
          onDenied={() => setVerificationDenied(true)}
        />
      )}
      {ageVerified && (
        <>
          <TopNav
            isLoggedIn={isLoggedIn}
            userName={userName}
            userRole={userRole}
            onSignOut={handleSignOut}
          />
          <WineLiquorCatalog />
        </>
      )}
    </div>
  );
}
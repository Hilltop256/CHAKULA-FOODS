'use client';

import React, { useState } from 'react';
import { Shield, AlertTriangle, Wine } from 'lucide-react';
import { useForm } from 'react-hook-form';
import AppLogo from '@/components/ui/AppLogo';

type AgeForm = {
  day: string;
  month: string;
  year: string;
};

interface AgeVerificationGateProps {
  onVerified: () => void;
  onDenied: () => void;
}

export default function AgeVerificationGate({ onVerified, onDenied }: AgeVerificationGateProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<AgeForm>();

  const onSubmit = (data: AgeForm) => {
    setError('');
    setIsChecking(true);
    // Backend integration point: POST /api/age-verification { dob: `${data.year}-${data.month}-${data.day}` }
    setTimeout(() => {
      setIsChecking(false);
      const dob = new Date(`${data.year}-${data.month.padStart(2, '0')}-${data.day.padStart(2, '0')}`);
      const today = new Date('2026-05-18');
      const age = today.getFullYear() - dob.getFullYear() -
        (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
      if (age >= 18) {
        onVerified();
      } else {
        onDenied();
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 age-gate-overlay flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-scale-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <AppLogo size={48} />
          <div className="text-left">
            <span className="font-extrabold text-xl text-white block leading-none">Chakula</span>
            <span className="text-secondary font-semibold text-sm">Foods Naalya</span>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-accent px-6 py-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Wine size={22} className="text-white" />
              <span className="font-extrabold text-lg text-white">Wine & Liquor</span>
            </div>
            <p className="text-white/80 text-sm">Age verification required</p>
          </div>

          <div className="px-6 py-6">
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-800">Legal Requirement</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  You must be 18 years or older to browse and purchase alcoholic beverages in Uganda.
                </p>
              </div>
            </div>

            <p className="text-sm font-semibold text-foreground text-center mb-4">
              Enter your date of birth
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Day</label>
                  <input
                    type="number"
                    {...register('day', {
                      required: true,
                      min: { value: 1, message: '' },
                      max: { value: 31, message: '' },
                    })}
                    placeholder="DD"
                    min={1}
                    max={31}
                    className="input-field text-center text-lg font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Month</label>
                  <input
                    type="number"
                    {...register('month', {
                      required: true,
                      min: { value: 1, message: '' },
                      max: { value: 12, message: '' },
                    })}
                    placeholder="MM"
                    min={1}
                    max={12}
                    className="input-field text-center text-lg font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Year</label>
                  <input
                    type="number"
                    {...register('year', {
                      required: true,
                      min: { value: 1900, message: '' },
                      max: { value: 2008, message: '' },
                    })}
                    placeholder="YYYY"
                    min={1900}
                    max={2026}
                    className="input-field text-center text-lg font-bold tabular-nums"
                  />
                </div>
              </div>

              {(errors.day || errors.month || errors.year) && (
                <p className="text-xs text-accent text-center">Please enter a valid date of birth</p>
              )}
              {error && <p className="text-xs text-accent text-center">{error}</p>}

              <button
                type="submit"
                disabled={isChecking}
                className="w-full bg-accent text-accent-foreground font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-accent/90 transition-all active:scale-95 disabled:opacity-60"
              >
                {isChecking ? (
                  <>
                    <span className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield size={15} />
                    Verify My Age
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => window.location.href = '/'}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                I am under 18 — take me back
              </button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
              By entering this section, you confirm you are of legal drinking age. 
              Chakula Foods promotes responsible alcohol consumption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
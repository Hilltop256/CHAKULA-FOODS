import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function NotFound()  {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
            <div className="text-center max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <h1 className="text-9xl font-bold text-primary opacity-20">404</h1>
                    </div>
                </div>

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
            <div className="text-center max-w-md">
                <h1 className="text-9xl font-bold text-primary opacity-20">
                    404
                </h1>

                <h2 className="text-2xl font-medium text-onBackground mb-2">
                    Page Not Found
                </h2>

                <p className="text-onBackground/70 mb-8">
                    The page you&apos;re looking for doesn&apos;t exist.
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-200"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

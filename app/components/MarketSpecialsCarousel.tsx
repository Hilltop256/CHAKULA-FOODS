'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { createClient } from '@/lib/supabase/client';

interface MarketSpecial {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  discount_label: string | null;
  link_url: string | null;
  sort_order: number;
}

export default function MarketSpecialsCarousel() {
  const [specials, setSpecials] = useState<MarketSpecial[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchSpecials = async () => {
      try {
        const { data, error } = await supabase
          .from('market_specials')
          .select('id, title, description, image_url, discount_label, link_url, sort_order')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (!error && data) {
          setSpecials(data);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchSpecials();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleCount = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth >= 1280) return 4;
    if (window.innerWidth >= 768) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
  };

  const [cols, setCols] = useState(3);

  useEffect(() => {
    const update = () => setCols(visibleCount());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const maxIndex = Math.max(0, specials.length - cols);

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(maxIndex, i + 1));

  if (loading) {
    return (
      <section className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="h-7 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (specials.length === 0) return null;

  return (
    <section className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Tag size={22} className="text-accent" />
            Market Specials
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Exclusive deals and bundle offers
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Carousel nav */}
          {expanded && (
            <>
              <button
                onClick={prev}
                disabled={currentIndex === 0}
                className="p-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous specials"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={next}
                disabled={currentIndex >= maxIndex}
                className="p-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next specials"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
          {/* Expand/collapse toggle */}
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium text-foreground"
            aria-label={expanded ? 'Collapse market specials' : 'Expand market specials'}
          >
            {expanded ? (
              <>
                <ChevronUp size={15} />
                <span className="hidden sm:inline">Collapse</span>
              </>
            ) : (
              <>
                <ChevronDown size={15} />
                <span className="hidden sm:inline">Show Deals</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Carousel */}
      {expanded && (
        <div className="overflow-hidden" ref={carouselRef}>
          <div
            className="flex gap-4 transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(calc(-${currentIndex} * (100% / ${cols} + 1rem / ${cols} * (${cols} - 1) / ${cols})))` }}
          >
            {specials.map((special) => (
              <Link
                key={special.id}
                href={special.link_url || '#market'}
                className={`shrink-0 rounded-2xl overflow-hidden relative group card-hover cursor-pointer`}
                style={{ width: `calc((100% - ${(cols - 1) * 16}px) / ${cols})` }}
              >
                {/* Image */}
                <div className="relative h-44 bg-muted overflow-hidden">
                  <AppImage
                    src={special.image_url || ''}
                    alt={special.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {/* Discount badge */}
                  {special.discount_label && (
                    <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow">
                      {special.discount_label}
                    </span>
                  )}
                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-bold text-white text-sm leading-tight line-clamp-1">
                      {special.title}
                    </h3>
                    {special.description && (
                      <p className="text-white/80 text-xs mt-0.5 line-clamp-1">
                        {special.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Dot indicators */}
      {expanded && specials.length > cols && (
        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex ? 'bg-primary w-4' : 'bg-muted-foreground/30'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

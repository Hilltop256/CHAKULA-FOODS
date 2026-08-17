"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AppImage from "@/components/ui/AppImage";
import { createClient } from "@/lib/supabase/client";

interface Offer {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  sort_order: number;
}

const AUTO_SLIDE_MS = 4500;

const DEMO_OFFER_ROUTES: Record<string, string> = {
  "Meals You''ll Love": "/restaurant-page",
  "Grocery Savings": "/market-specials",
  "Weekend Drinks": "/wine-liquor-page",
};

function getOfferHref(offer: Offer) {
  const demoRoute = DEMO_OFFER_ROUTES[offer.title];
  if (demoRoute) return demoRoute;

  const value = (offer.link_url || "").trim();
  if (!value || value === "#") return null;

  // Keep internal links inside the Next.js app.
  if (value.startsWith("/")) return value;
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin === window.location.origin) return `${url.pathname}${url.search}${url.hash}`;
  } catch {}
  return null;
}

export default function TodaysOffersCarousel() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const supabase = createClient();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data, error } = await supabase
          .from("offers")
          .select("id, title, description, image_url, link_url, sort_order")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false });

        if (!error && data) setOffers(data as Offer[]);
      } catch {
        // Keep the home page usable if offers cannot be loaded.
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 640) setVisibleCount(1);
      else if (window.innerWidth < 1024) setVisibleCount(2);
      else setVisibleCount(3);
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const maxIndex = Math.max(0, offers.length - visibleCount);
  const canSlide = offers.length > visibleCount;

  useEffect(() => {
    if (!canSlide) return;

    const timer = window.setInterval(() => {
      setCurrentIndex((index) => (index >= maxIndex ? 0 : index + 1));
    }, AUTO_SLIDE_MS);

    return () => window.clearInterval(timer);
  }, [canSlide, maxIndex]);

  useEffect(() => {
    setCurrentIndex((index) => Math.min(index, maxIndex));
  }, [maxIndex]);

  const cardWidth = useMemo(
    () => `calc((100% - ${(visibleCount - 1) * 16}px) / ${visibleCount})`,
    [visibleCount]
  );

  if (loading) {
    return (
      <section className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-7">
        <div className="text-center mb-6">
          <div className="h-10 w-64 mx-auto bg-muted rounded-xl animate-pulse" />
        </div>
        <div className="h-40 md:h-44 bg-muted rounded-3xl animate-pulse" />
      </section>
    );
  }

  if (!offers.length) return null;

  const previous = () =>
    setCurrentIndex((index) => (index <= 0 ? maxIndex : index - 1));
  const next = () =>
    setCurrentIndex((index) => (index >= maxIndex ? 0 : index + 1));

  return (
    <section className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-7 md:py-9">
      <div className="text-center mb-5 md:mb-6 overflow-visible">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.15] bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent mb-2 overflow-visible px-1">
          Today&apos;s Offers
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Fresh deals and special offers available today
        </p>
      </div>

      <div className="relative group">
        <div className="overflow-hidden rounded-3xl">
          <div
            className="flex gap-4 transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(calc(-${currentIndex} * ((100% + 16px) / ${visibleCount})))`,
            }}
          >
            {offers.map((offer) => {
              const href = getOfferHref(offer);
              const card = (
                <div
                  className="shrink-0 relative overflow-hidden rounded-3xl min-h-[150px] md:min-h-[175px] bg-primary shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                  style={{ width: cardWidth }}
                >
                {offer.image_url ? (
                  <AppImage
                    src={offer.image_url}
                    alt={offer.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/5" />
                <div className="absolute inset-0 flex items-center p-5 md:p-7">
                  <div className="max-w-[78%] text-white">
                    <h3 className="text-lg md:text-2xl font-extrabold leading-tight">
                      {offer.title}
                    </h3>
                    {offer.description && (
                      <p className="text-xs md:text-sm text-white/85 mt-1 line-clamp-2">
                        {offer.description}
                      </p>
                    )}
                  </div>
                </div>
                </div>
              );
              return href ? (
                <Link key={offer.id} href={href} className="contents">
                  {card}
                </Link>
              ) : (
                <React.Fragment key={offer.id}>{card}</React.Fragment>
              );
            })}
          </div>
        </div>

        {canSlide && (
          <>
            <button
              type="button"
              onClick={previous}
              aria-label="Previous offer"
              className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/90 text-foreground shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            >
              <ChevronLeft size={19} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next offer"
              className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/90 text-foreground shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            >
              <ChevronRight size={19} />
            </button>
          </>
        )}
      </div>

      {canSlide && (
        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to offer group ${index + 1}`}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

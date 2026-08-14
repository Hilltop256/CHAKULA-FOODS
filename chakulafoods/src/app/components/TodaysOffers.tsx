"use client";

import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import AppImage from "@/components/ui/AppImage";
import Link from "next/link";

const MarketSpecialsCarousel = dynamic(
  () => import("@/app/components/MarketSpecialsCarousel").then((m) => m?.default ?? m),
  { ssr: false }
);

interface Offer {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export default function TodaysOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [index, setIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [usingMarketSpecials, setUsingMarketSpecials] = useState(false);
  const timerRef = useRef<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetch = async () => {
      try {
        // First try the dedicated todays_offers table (admin control)
        const { data: todaysData, error: todaysError } = await supabase
          .from("todays_offers")
          .select(
            "id, title, description, image_url, link_url, is_active, sort_order"
          )
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (!todaysError && Array.isArray(todaysData) && todaysData.length > 0) {
          setOffers(todaysData as Offer[]);
          setUsingMarketSpecials(false);
          return;
        }

        // Fallback to the generic 'offers' table if todays_offers is empty
        const { data: offersData, error: offersError } = await supabase
          .from("offers")
          .select(
            "id, title, description, image_url, link_url, is_active, sort_order"
          )
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (!offersError && Array.isArray(offersData) && offersData.length > 0) {
          setOffers(offersData as Offer[]);
          setUsingMarketSpecials(false);
          return;
        }

        // Final fallback: use market_specials (keeps Market Specials heading on Home)
        const { data: specialsData, error: specialsError } = await supabase
          .from("market_specials")
          .select(
            "id, title, description, image_url, link_url, sort_order, is_active"
          )
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (!specialsError && Array.isArray(specialsData) && specialsData.length > 0) {
          // delegate rendering to MarketSpecialsCarousel which includes its own layout/heading
          setUsingMarketSpecials(true);
          return;
        }

        // No offers found — leave offers empty so component renders nothing
      } catch (e) {
        // silent — don't crash the page; showing nothing is acceptable
        // console.error("TodaysOffers fetch error:", e);
      }
    };

    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If we're falling back to market specials delegate entirely to that component
  if (usingMarketSpecials) {
    return <MarketSpecialsCarousel />;
  }

  // responsive visible count
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1280) setVisibleCount(3);
      else if (w >= 768) setVisibleCount(2);
      else setVisibleCount(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // auto slide
  useEffect(() => {
    if (offers.length <= visibleCount) return;
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % offers.length);
    }, 4000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [offers.length, visibleCount]);

  const prev = () => {
    setIndex((i) => (i - 1 + offers.length) % offers.length);
  };
  const next = () => {
    setIndex((i) => (i + 1) % offers.length);
  };

  if (offers.length === 0) return null;

  // Build visible window starting at index
  const windowItems: Offer[] = [];
  for (let i = 0; i < Math.min(offers.length, visibleCount); i++) {
    windowItems.push(offers[(index + i) % offers.length]);
  }

  return (
    <section className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-6">
      <div className="text-center mb-4">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent mb-1">
          Today's Offers
        </h2>
      </div>

      <div className="relative overflow-hidden rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={prev}
            aria-label="Previous offers"
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-muted/60 hover:bg-muted transition-colors"
          >
            ◀
          </button>

          <div className="flex-1 overflow-hidden">
            <div className="flex gap-4 transition-transform duration-500" style={{ transform: "translateX(0)" }}>
              {windowItems.map((offer) => (
                <Link
                  key={offer.id}
                  href={offer.link_url || '#'}
                  className="flex-1 min-w-0 block rounded-xl overflow-hidden shadow-sm bg-card h-28 md:h-32 lg:h-36"
                >
                  <div className="relative h-full w-full flex items-stretch">
                    <div className="w-1/3 md:w-1/4 lg:w-1/5 relative">
                      <AppImage
                        src={offer.image_url || '/assets/images/no_image.png'}
                        alt={offer.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 p-3 md:p-4 flex flex-col justify-center">
                      <h3 className="font-bold text-sm md:text-base line-clamp-2">{offer.title}</h3>
                      {offer.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{offer.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <button
            onClick={next}
            aria-label="Next offers"
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-muted/60 hover:bg-muted transition-colors"
          >
            ▶
          </button>
        </div>
      </div>
    </section>
  );
}

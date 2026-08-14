"use client";

import React, { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import AppImage from "@/components/ui/AppImage";
import Link from "next/link";

interface Offer {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export default function TodaysOffersSection() {
  const supabase = createClient();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [perPage, setPerPage] = useState(3);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data, error } = await supabase
          .from("offers")
          .select("id, title, description, image_url, link_url, is_active, sort_order")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (!error && data) setOffers(data as Offer[]);
      } catch (err) {
        // silent
      }
    };

    fetchOffers();
    // Realtime updates (optional)
    const channel = supabase
      .channel("offers_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "offers" }, (payload) => {
        // simple refresh on any change
        fetchOffers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const updatePerPage = () => {
      if (window.innerWidth >= 1024) setPerPage(3);
      else if (window.innerWidth >= 640) setPerPage(2);
      else setPerPage(1);
    };

    updatePerPage();
    window.addEventListener("resize", updatePerPage);
    return () => window.removeEventListener("resize", updatePerPage);
  }, []);

  const pages = Math.max(1, Math.ceil(offers.length / perPage));

  useEffect(() => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setPageIndex((p) => (p + 1) % pages);
    }, 4000);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [pages]);

  const grouped: Offer[][] = [];
  for (let i = 0; i < pages; i++) {
    grouped.push(offers.slice(i * perPage, i * perPage + perPage));
  }

  if (offers.length === 0) return null;

  return (
    <section className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-6">
      <div className="text-center mb-3">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
          Today's Offers
        </h2>
      </div>

      <div className="w-full overflow-hidden rounded-lg">
        <div
          className="flex transition-transform duration-700"
          style={{ transform: `translateX(-${pageIndex * 100}%)`, width: `${pages * 100}%` }}
        >
          {grouped.map((group, idx) => (
            <div key={`page-${idx}`} className="flex gap-3 items-stretch w-full px-2">
              {group.map((offer) => (
                <Link
                  key={offer.id}
                  href={offer.link_url || '#'}
                  className="flex-1 block bg-card rounded-lg overflow-hidden min-h-[100px] h-28 relative"
                >
                  {offer.image_url ? (
                    <div className="absolute inset-0">
                      <AppImage src={offer.image_url} alt={offer.title} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-muted" />
                  )}

                  <div className="relative z-10 p-4 h-full flex flex-col justify-center">
                    <h3 className="text-sm font-bold text-white line-clamp-1">{offer.title}</h3>
                    {offer.description && (
                      <p className="text-xs text-white/90 mt-1 line-clamp-1">{offer.description}</p>
                    )}
                  </div>
                </Link>
              ))}
              {/* fill empty slots so layout stays consistent */}
              {group.length < perPage && Array.from({ length: perPage - group.length }).map((_, i) => (
                <div key={`empty-${i}`} className="flex-1 bg-card/30 rounded-lg h-28" />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination dots */}
      <div className="flex items-center justify-center gap-2 mt-3">
        {Array.from({ length: pages }).map((_, i) => (
          <button
            key={`dot-${i}`}
            onClick={() => setPageIndex(i)}
            className={`w-2 h-2 rounded-full ${i === pageIndex ? 'bg-foreground' : 'bg-muted'}`}
          />
        ))}
      </div>
    </section>
  );
}

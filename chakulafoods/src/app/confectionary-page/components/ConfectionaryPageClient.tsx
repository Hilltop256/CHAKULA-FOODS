'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Star, Clock, Gift, Repeat, Plus, Search } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import ScheduleConfectionaryModal from './ScheduleConfectionaryModal';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: string;
  name: string;
  description: string | null;
  department: string;
  category: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
  tag: string | null;
  rating: number | null;
  prep_time: string | null; // Maps to leadTime
  available: boolean;
  featured: boolean;
  orders_count: number;
  schedulable?: boolean; // Supported if present in schema
}

export default function ConfectionaryPageClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleItem, setScheduleItem] = useState<Product | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { addToCart } = useCart();

  // Fetch data dynamically from Supabase
  useEffect(() => {
    async function fetchProducts() {
      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .eq('department', 'Confectionary')
          .order('featured', { ascending: false })
          .order('orders_count', { ascending: false });

        if (fetchError) throw fetchError;
        setProducts(data || []);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load confectionary products';
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Derive categories dynamically from database rows
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  // Client side search and category filters
  const filtered = products.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesCategory && matchesSearch;
  });

  // Find the sub pack dynamically for the subscription CTA button
  const subscriptionItem = products.find(
    (p) => p.tag === 'Subscribe & Save' || p.name.toLowerCase().includes('subscription')
  );

  const handleAddToCart = (product: Product) => {
    setAddingId(product.id);
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || '/assets/images/no_image.png',
      department: 'Confectionary'
    });
    setTimeout(() => setAddingId(null), 600);
  };

  // Helper logic to verify if an item can be scheduled (falls back to category rules if missing field)
  const isSchedulable = (product: Product) => {
    if (product.schedulable !== undefined) return product.schedulable;
    return product.category !== 'Pastries'; 
  };

  if (loading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🎂</span>
            <h1 className="text-3xl font-extrabold text-foreground">Confectionary</h1>
          </div>
          <p className="text-muted-foreground">Loading delicious treats...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="card-base overflow-hidden animate-pulse">
              <div className="w-full h-40 bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-4">⚠️</span>
          <h2 className="text-xl font-bold text-foreground mb-2">Failed to load confectionary menu</h2>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🎂</span>
          <h1 className="text-3xl font-extrabold text-foreground">Confectionary</h1>
          {products.length > 0 && (
            <span className="bg-secondary/10 text-secondary text-xs font-bold px-2.5 py-0.5 rounded-full ml-1">
              {products.length} items
            </span>
          )}
        </div>
        <p className="text-muted-foreground">
          Custom cakes, birthday packages, fresh pastries and curated dessert boxes
        </p>
      </div>

      {/* Birthday package upsell banner */}
      <div className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-r from-secondary to-amber-400 p-6 text-white">
        <div className="absolute right-4 top-2 text-6xl opacity-20 select-none">🎂</div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Gift size={18} />
            <span className="text-sm font-bold uppercase tracking-wide">Planning a Celebration?</span>
          </div>
          <h2 className="text-xl font-extrabold mb-2">Birthday Packages Available</h2>
          <p className="text-white/80 text-sm mb-4">
            Complete packages with custom cake, cupcakes, decorations and delivery.
          </p>
          <button
            onClick={() => setActiveCategory('Birthday Packages')}
            className="bg-white text-secondary font-bold px-5 py-2 rounded-lg text-sm hover:bg-white/90 transition-colors active:scale-95"
          >
            View Birthday Packages
          </button>
        </div>
      </div>

      {/* Weekly dessert subscription CTA */}
      {subscriptionItem && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Repeat size={18} className="text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground">{subscriptionItem.name}</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {subscriptionItem.description || 'Fresh curated dessert box every week — subscribe and save!'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setScheduleItem(subscriptionItem);
              setScheduleOpen(true);
            }}
            className="btn-primary shrink-0 text-sm flex items-center gap-2"
          >
            <Calendar size={14} />
            Subscribe Now
          </button>
        </div>
      )}

      {/* Search + Dynamic Category filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search cakes & pastries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat) => (
            <button
              key={`cat-${cat}`}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
                activeCategory === cat
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notice Bar */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
        <Clock size={15} className="text-amber-600 shrink-0" />
        <p className="text-xs text-amber-800 font-medium">
          Cakes and birthday packages require advance notice. Use the calendar icon to schedule your order timing.
        </p>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-4">🍰</span>
          <h2 className="text-xl font-bold text-foreground mb-2">No items found</h2>
          <p className="text-muted-foreground text-sm">
            {searchQuery
              ? `No results match "${searchQuery}"`
              : 'No dynamic products available under this category right now.'}
          </p>
        </div>
      )}

      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
        {filtered.map((item) => (
          <div 
            key={item.id} 
            className={`card-base overflow-hidden card-hover flex flex-col group ${
              !item.available ? 'opacity-60' : ''
            }`}
          >
            <div className="relative">
              <AppImage
                src={item.image_url || '/assets/images/no_image.png'}
                alt={`${item.name} — Confectionary Item`}
                width={300}
                height={200}
                className="w-full h-40 object-cover"
              />
              {item.tag && (
                <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  item.tag === 'Bestseller' || item.tag === 'Popular' ? 'bg-secondary text-secondary-foreground' :
                  item.tag === 'Complete Package' || item.tag === 'Subscribe & Save' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground border border-border'
                }`}>
                  {item.tag}
                </span>
              )}
              {isSchedulable(item) && (
                <div className="absolute bottom-2 right-2">
                  <span className="flex items-center gap-1 bg-card/90 text-xs font-semibold px-2 py-0.5 rounded-full text-foreground">
                    <Calendar size={10} />
                    Schedulable
                  </span>
                </div>
              )}
              {!item.available && (
                <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center">
                  <span className="bg-card text-foreground text-xs font-bold px-3 py-1.5 rounded-full">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-bold text-sm text-foreground leading-tight mb-1 line-clamp-2">
                {item.name}
              </h3>
              {item.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                  {item.description}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                {item.rating !== null && (
                  <span className="flex items-center gap-0.5">
                    <Star size={11} className="text-secondary fill-secondary" />
                    {Number(item.rating).toFixed(1)}
                  </span>
                )}
                {item.prep_time && (
                  <span className="flex items-center gap-0.5">
                    <Clock size={11} />
                    {item.prep_time}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mb-3 mt-auto">
                <p className="font-extrabold text-secondary tabular-nums text-sm">
                  UGX {item.price.toLocaleString()}
                </p>
                {item.original_price && item.original_price > item.price && (
                  <span className="text-xs text-muted-foreground line-through tabular-nums">
                    UGX {item.original_price.toLocaleString()}
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                {isSchedulable(item) && (
                  <button
                    onClick={() => {
                      setScheduleItem(item);
                      setScheduleOpen(true);
                    }}
                    disabled={!item.available}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border hover:border-secondary hover:bg-secondary/5 text-xs font-semibold transition-all duration-150 disabled:opacity-50"
                    title="Schedule this order"
                  >
                    <Calendar size={13} className="text-muted-foreground" />
                    Schedule
                  </button>
                )}
                <button
                  onClick={() => item.available && handleAddToCart(item)}
                  disabled={!item.available || addingId === item.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 text-xs font-semibold transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingId === item.id ? (
                    <span className="w-3.5 h-3.5 border-2 border-secondary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus size={13} />
                      {item.available ? 'Add to Cart' : 'Out of Stock'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scheduling Modals */}
      {scheduleOpen && scheduleItem && (
        <ScheduleConfectionaryModal
          item={scheduleItem}
          onClose={() => {
            setScheduleOpen(false);
            setScheduleItem(null);
          }}
        />
      )}
    </div>
  );
}

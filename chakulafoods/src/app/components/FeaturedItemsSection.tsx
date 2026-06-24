'use client';

import React, { useState, useEffect } from 'react';
import { Star, Clock, Plus } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/contexts/CartContext';

const categories = [
  { id: 'cat-restaurant', label: 'Restaurant' },
  { id: 'cat-confectionary', label: 'Confectionary' },
  { id: 'cat-juice', label: 'Juice Bar' },
  { id: 'cat-wine', label: 'Wine & Liquor' },
  { id: 'cat-market', label: 'Market Specials' },
];

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  department: string;
  rating: number;
  prep_time: string;
  image_url: string;
  tag: string;
  available: boolean;
}

export default function FeaturedItemsSection() {
  const [activeCategory, setActiveCategory] = useState('cat-restaurant');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const { addToCart } = useCart();
  const supabase = createClient();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, original_price, department, rating, prep_time, image_url, tag, available')
          .eq('featured', true)
          .eq('available', true)
          .order('orders_count', { ascending: false })
          .limit(12);

        if (error) {
          console.log('Products fetch error:', error.message);
        } else {
          setProducts(data || []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered =
    activeCategory === 'cat-all'
      ? products
      : products.filter(
          (item) =>
            item.department?.toLowerCase() ===
            categories.find((c) => c.id === activeCategory)?.label?.toLowerCase()
        );

  const handleAddToCart = (item: Product) => {
    setAddingId(item.id);
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image_url || '',
      department: item.department,
    });
    setTimeout(() => setAddingId(null), 600);
  };

  return (
    <section className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 pb-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Featured Items</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Top picks from all our departments
          </p>
        </div>
        <Link href="/restaurant-page" className="text-sm font-semibold text-primary hover:underline">
          View all →
        </Link>
      </div>

      {/* Category filter tabs */}
<div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
  {categories.map((cat) => {
    if (cat.id === 'cat-restaurant') {
      return (
        <Link
          key={cat.id}
          href="/restaurant-page"
          className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        >
          {cat.label}
        </Link>
      );
    }

    return (
      <button
        key={cat.id}
        onClick={() => setActiveCategory(cat.id)}
        className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
  activeCategory === cat.id
    ? 'bg-green-600 text-white shadow-md'
    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
}`}
      >
        {cat.label}
      </button>
    );
  })}
</div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`skel-${i}`} className="card-base overflow-hidden animate-pulse">
              <div className="w-full h-36 bg-muted" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Items grid */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="card-base overflow-hidden card-hover group flex flex-col"
            >
              <div className="relative">
                <AppImage
                  src={item.image_url || ''}
                  alt={`${item.name} — Chakula Foods menu item`}
                  width={300}
                  height={180}
                  className="w-full h-36 object-cover"
                />
                {item.tag && (
                  <span
                    className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      item.tag === '18+' ? 'bg-accent text-accent-foreground'
                        : item.tag === 'Best Seller' || item.tag === 'Combo Deal' ? 'bg-secondary text-secondary-foreground' : 'bg-primary/90 text-primary-foreground'
                    }`}
                  >
                    {item.tag}
                  </span>
                )}
                {item.original_price && (
                  <span className="absolute top-2 right-2 text-xs font-bold bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                    SALE
                  </span>
                )}
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="text-sm font-semibold text-foreground leading-tight mb-1 line-clamp-2">
                  {item.name}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center gap-0.5 text-xs text-amber-500 font-medium">
                    <Star size={10} fill="currentColor" />
                    {item.rating}
                  </span>
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Clock size={10} />
                    {item.prep_time}
                  </span>
                </div>
                <div className="mt-auto mb-2">
                  <span className="text-sm font-bold text-foreground">
                    UGX {item.price?.toLocaleString()}
                  </span>
                  {item.original_price && (
                    <span className="text-xs text-muted-foreground line-through ml-1">
                      {item.original_price?.toLocaleString()}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={addingId === item.id}
                  className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-all duration-150 active:scale-95 disabled:opacity-70"
                >
                  {addingId === item.id ? (
                    <span className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus size={12} />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
          {!loading && filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No items found in this category.
            </div>
          )}
        </div>
      )}
    </section>
  );
}

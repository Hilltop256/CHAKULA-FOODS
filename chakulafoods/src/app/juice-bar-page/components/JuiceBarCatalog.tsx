'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, Clock, Search } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

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
  prep_time: string | null;
  available: boolean;
  featured: boolean;
  orders_count: number;
}

export default function JuiceBarCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  useEffect(() => {
    async function fetchProducts() {
      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .eq('department', 'Juice Bar')
          .order('featured', { ascending: false })
          .order('orders_count', { ascending: false });

        if (fetchError) throw fetchError;
        setProducts(data || []);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load products';
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filtered = products.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = async (product: Product) => {
    if (!product.available) {
      toast.error(`${product.name} is currently out of stock`);
      return;
    }
    setAddingId(product.id);
    await addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || '',
      department: 'Juice Bar',
    });
    setAddingId(null);
  };

  if (loading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🥤</span>
            <h1 className="text-3xl font-extrabold text-foreground">Juice Bar</h1>
          </div>
          <p className="text-muted-foreground">Fresh juices, smoothies & healthy blends</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="card-base overflow-hidden animate-pulse">
              <div className="w-full h-44 bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-2/3" />
                <div className="h-8 bg-muted rounded mt-3" />
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
          <h2 className="text-xl font-bold text-foreground mb-2">Failed to load products</h2>
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
          <span className="text-2xl">🥤</span>
          <h1 className="text-3xl font-extrabold text-foreground">Juice Bar</h1>
          {products.length > 0 && (
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full ml-1">
              {products.length} items
            </span>
          )}
        </div>
        <p className="text-muted-foreground">
          Fresh juices, smoothies & healthy blends — made to order
        </p>
      </div>

      {/* Search + Category filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search juices & smoothies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat) => (
            <button
              key={`cat-${cat}`}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-4">🥤</span>
          <h2 className="text-xl font-bold text-foreground mb-2">No items found</h2>
          <p className="text-muted-foreground text-sm">
            {searchQuery
              ? `No results for "${searchQuery}"`
              : 'No products available in this category yet.'}
          </p>
        </div>
      )}

      {/* Products grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-4 mb-8">
          {filtered.map((product) => (
            <div
              key={product.id}
              className={`card-base overflow-hidden card-hover flex flex-col group ${
                !product.available ? 'opacity-60' : ''
              }`}
            >
              <div className="relative">
                <AppImage
                  src={product.image_url || '/assets/images/no_image.png'}
                  alt={`${product.name} — Chakula Foods Juice Bar`}
                  width={300}
                  height={220}
                  className="w-full h-44 object-cover"
                />
                {product.tag && (
                  <span
                    className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      product.featured
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-card text-foreground border border-border'
                    }`}
                  >
                    {product.tag}
                  </span>
                )}
                {!product.available && (
                  <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center">
                    <span className="bg-card text-foreground text-xs font-bold px-3 py-1.5 rounded-full">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-sm text-foreground leading-tight mb-1 line-clamp-2">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                    {product.description}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  {product.rating !== null && (
                    <span className="flex items-center gap-0.5">
                      <Star size={11} className="text-secondary fill-secondary" />
                      {Number(product.rating).toFixed(1)}
                    </span>
                  )}
                  {product.prep_time && (
                    <span className="flex items-center gap-0.5">
                      <Clock size={11} />
                      {product.prep_time}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mb-3 mt-auto">
                  <span className="font-extrabold text-primary tabular-nums text-sm">
                    UGX {product.price.toLocaleString()}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-xs text-muted-foreground line-through tabular-nums">
                      {product.original_price.toLocaleString()}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={addingId === product.id || !product.available}
                  className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-95 ${
                    !product.available
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : addingId === product.id
                      ? 'bg-primary/20 text-primary cursor-not-allowed' :'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'
                  }`}
                >
                  {addingId === product.id ? (
                    <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShoppingCart size={12} />
                  )}
                  {!product.available
                    ? 'Out of Stock'
                    : addingId === product.id
                    ? 'Adding...' :'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

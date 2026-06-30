'use client';

import React, { useState, useEffect } from 'react';
import { Star, Search, Plus, Wine, Clock } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

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

const subCategories = [
  { id: 'wl-all', label: 'All' },
  { id: 'wl-wines', label: 'Wines' },
  { id: 'wl-whiskey', label: 'Whiskey' },
  { id: 'wl-champagne', label: 'Champagne' },
  { id: 'wl-bundles', label: 'Party Bundles' }
];

export default function WineLiquorCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .eq('department', 'Wine & Liquor');

        if (fetchError) throw fetchError;
        setProducts(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleAddToCart = async (product: Product) => {
    setAddingId(product.id);
    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url || '',
        quantity: 1
      });
      toast.success(`${product.name} added to cart`);
    } catch {
      toast.error('Failed to add item to cart');
    } finally {
      setAddingId(null);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === 'All' || product.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <input
          type="text"
          placeholder="Search wine & spirits..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Categories Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        {subCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.label)}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.label
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Content State Handling */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center text-destructive py-8">{error}</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">No products found in this category.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group relative flex flex-col bg-card rounded-2xl overflow-hidden border border-border transition-all duration-200 hover:shadow-md">
              <div className="relative aspect-square w-full bg-muted">
                <AppImage
                  src={product.image_url || ''}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {product.tag && (
                  <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                    {product.tag}
                  </span>
                )}
              </div>

              <div className="flex flex-col flex-1 p-3.5">
                <div className="flex items-center gap-2 mb-1 text-[11px] text-muted-foreground">
                  {product.rating && (
                    <div className="flex items-center gap-0.5 text-amber-500 font-semibold">
                      <Star size={12} fill="currentColor" />
                      <span>{product.rating}</span>
                    </div>
                  )}
                  {product.prep_time && (
                    <div className="flex items-center gap-0.5">
                      <Clock size={12} />
                      <span>{product.prep_time}</span>
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-foreground text-sm line-clamp-1 mb-1">{product.name}</h3>
                <p className="text-muted-foreground text-xs line-clamp-2 mb-3 min-h-[2rem] leading-relaxed">
                  {product.description || 'Premium selection'}
                </p>

                <div className="flex items-center gap-1.5 mb-3 mt-auto">
                  <span className="font-extrabold text-accent tabular-nums text-sm">
                    UGX {product.price.toLocaleString()}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-xs text-muted-foreground line-through tabular-nums">
                      UGX {product.original_price.toLocaleString()}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => product.available && handleAddToCart(product)}
                  disabled={!product.available || addingId === product.id}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-semibold transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingId === product.id ? (
                    <span className="w-3.5 h-3.5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus size={13} />
                      {product.available ? 'Add to Cart' : 'Out of Stock'}
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Responsible drinking footer */}
      <div className="border border-border rounded-2xl p-5 flex items-start gap-4 bg-muted/30">
        <Wine size={24} className="text-muted-foreground shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-foreground mb-1">Drink Responsibly</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Chakula Foods promotes responsible alcohol consumption. Do not drink and drive. 
            Alcohol is harmful to your health if consumed excessively. 
            For alcohol helpline support in Uganda, call <strong>0800 200 600</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

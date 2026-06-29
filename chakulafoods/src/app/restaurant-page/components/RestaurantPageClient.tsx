'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { RotateCcw, Calendar, Clock, Star, Plus, Search } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { toast } from 'sonner';
import ScheduleMealModal from './ScheduleMealModal';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { createClient } from '@/lib/supabase/client';

interface RestaurantProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  rating: number;
  prepTime: string;
  category: string;
  tag?: string;
  originalPrice?: number;
}

const subCategories = [
  { id: 'sub-all', label: 'All' },
  { id: 'sub-shawarma', label: 'Shawarma / Wraps / Rolex / Burgers' },
  { id: 'sub-bowls', label: 'Bowl Meals' },
  { id: 'sub-pizza', label: 'Pizza' },
  { id: 'sub-roasts', label: 'Roasts & Grills' },
  { id: 'sub-specials', label: 'Specials & Toppings' },
  { id: 'sub-bakery', label: 'Bakery & Breakfast' },
  { id: 'sub-platters', label: 'Party & Group Platters' },
  { id: 'sub-drinks', label: 'Drinks' }
];

const categoryMap: Record<string, string[]> = {
  'sub-all': [],
  'sub-shawarma': ['Shawarma/Wraps/Rolex/Burgers', 'Wraps', 'Rolex', 'Burger', 'Burgers'],
  'sub-bowls': ['Meals', 'Bowl Meals'],
  'sub-pizza': ['Pizza'],
  'sub-roasts': ['Roasts & Grills', 'Roasts&Grills', 'BBQ'],
  'sub-specials': ['Specials & Toppings', 'Specials&Toppings'],
  'sub-bakery': ['Bakery', 'Breakfast', 'Bakery & Breakfast', 'Bakery&Breakfast'],
  'sub-platters': ['Party Platters', 'Group Platters', 'Meal Plans', 'Party & Group Platters'],
  'sub-drinks': ['Drinks', 'Beverages', 'Juice', 'Soda']
};

const lastOrder = {
  id: 'ord-2831',
  date: '15 May 2026',
  items: [
    { name: 'Chicken Stew & Matooke', qty: 1, price: 18000 },
    { name: 'Rolex (Chapati & Egg Roll)', qty: 2, price: 13000 }
  ],
  total: 31000
};

export default function RestaurantPageClient() {
  const [products, setProducts] = useState<RestaurantProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('sub-all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleItem, setScheduleItem] = useState<RestaurantProduct | null>(null);
  const [repeatLoading, setRepeatLoading] = useState(false);

  const supabase = createClient();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const isLoggedIn = !!user;

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .eq('department', 'Restaurant')
          .eq('available', true);

        if (fetchError) throw fetchError;

        if (data) {
          const mapped: RestaurantProduct[] = data.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            image: p.image_url || '/assets/images/no_image.png',
            price: p.price,
            rating: Number(p.rating || 0),
            prepTime: p.prep_time || '15-25 mins',
            category: p.category || '',
            tag: p.tag,
            originalPrice: p.original_price
          }));
          setProducts(mapped);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load restaurant products';
        setError(message);
        console.error('Supabase error:', message);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [supabase]);

  // Combined real-time search & subcategory filter matching Juice Bar specification
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const allowedCategories = categoryMap[activeCategory] ?? [];
      const matchesCategory =
        activeCategory === 'sub-all' ||
        allowedCategories.some(
          (cat) => product.category?.trim().toLowerCase() === cat.toLowerCase()
        );

      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const handleRepeatOrder = () => {
    setRepeatLoading(true);
    setTimeout(() => {
      setRepeatLoading(false);
      toast.success('Order placed! Our team will contact you to confirm.');
    }, 1200);
  };

  const handleAddToCart = (item: RestaurantProduct) => {
    setAddingId(item.id);
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      department: 'Restaurant'
    });
    setTimeout(() => setAddingId(null), 600);
  };

  // Loading State Skeleton
  if (loading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🍽️</span>
            <h1 className="text-3xl font-extrabold text-foreground">Restaurant</h1>
          </div>
          <p className="text-muted-foreground">Loading fresh dishes...</p>
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

  // Error State Interface
  if (error) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-4">⚠️</span>
          <h2 className="text-xl font-bold text-foreground mb-2">Failed to load restaurant menu</h2>
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
          <span className="text-2xl">🍽️</span>
          <h1 className="text-3xl font-extrabold text-foreground">Restaurant</h1>
          {products.length > 0 && (
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full ml-1">
              {products.length} options
            </span>
          )}
        </div>
        <p className="text-muted-foreground">
          Shawarma, wraps, burgers, bowl meals & more — made fresh daily at Chakula Foods · Kampala
        </p>
      </div>

      {/* Repeat Order MVP section */}
      {isLoggedIn && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <RotateCcw size={16} className="text-primary" />
                <span className="text-sm font-bold text-primary uppercase tracking-wide">
                  Repeat Last Order
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                Order #{lastOrder.id} — {lastOrder.date}
              </p>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {lastOrder.items.map((item) => (
                  <span
                    key={`repeat-${item.name}`}
                    className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium"
                  >
                    {item.qty}× {item.name}
                  </span>
                ))}
              </div>
              <p className="text-sm font-bold text-foreground mt-2 tabular-nums">
                Total: UGX {lastOrder.total.toLocaleString()}
              </p>
            </div>
            <button
              onClick={handleRepeatOrder}
              disabled={repeatLoading}
              className="btn-primary flex items-center gap-2 shrink-0 h-11"
            >
              {repeatLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RotateCcw size={15} />
                  Repeat Order
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search delicious meals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {subCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty Filter State */}
      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-4">🍲</span>
          <h2 className="text-xl font-bold text-foreground mb-2">No meals found</h2>
          <p className="text-muted-foreground text-sm">
            {searchQuery
              ? `No menu matches for "${searchQuery}"`
              : 'No dynamic products available under this tab right now.'}
          </p>
        </div>
      )}

      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-4 mb-12">
        {filteredProducts.map((item) => (
          <div key={item.id} className="card-base overflow-hidden card-hover flex flex-col group">
            <div className="relative">
              <AppImage
                src={item.image}
                alt={`${item.name} — Chakula Foods restaurant dish`}
                width={300}
                height={200}
                className="w-full h-40 object-cover"
              />
              {item.tag && (
                <span
                  className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    item.tag === 'Best Seller' ? 'bg-secondary text-secondary-foreground' :
                    item.tag === 'Hot' ? 'bg-amber-500 text-white' :
                    item.tag === 'Local Fav' ? 'bg-green-600 text-white' :
                    item.tag === 'Stacked' ? 'bg-purple-600 text-white' :
                    item.tag === 'Mixed Bowl' ? 'bg-amber-500 text-white' :
                    item.tag === 'Veggie Bowl' ? 'bg-green-600 text-white' : 'bg-primary/90 text-primary-foreground'
                  }`}
                >
                  {item.tag}
                </span>
              )}
              {item.category === 'Bowl Meals' && (
                <div className="absolute bottom-2 right-2">
                  <span className="flex items-center gap-1 bg-card/90 text-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                    <Calendar size={10} />
                    Customisable
                  </span>
                </div>
              )}
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-bold text-sm text-foreground leading-tight mb-1 line-clamp-2">
                {item.name}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                {item.description}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-0.5">
                  <Star size={11} className="text-secondary fill-secondary" />
                  {item.rating.toFixed(1)}
                </span>
                <span className="flex items-center gap-0.5">
                  <Clock size={11} />
                  {item.prepTime}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mb-3 mt-auto">
                <span className="font-extrabold text-primary tabular-nums text-sm">
                  UGX {item.price.toLocaleString()}
                </span>
                {item.originalPrice && item.originalPrice > item.price && (
                  <span className="text-xs text-muted-foreground line-through tabular-nums">
                    UGX {item.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {item.category === 'Bowl Meals' && (
                  <button
                    onClick={() => {
                      setScheduleItem(item);
                      setScheduleOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 text-xs font-semibold transition-all duration-150"
                    title="Schedule this order"
                  >
                    <Calendar size={13} className="text-muted-foreground" />
                    Schedule
                  </button>
                )}
                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={addingId === item.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-all duration-150 active:scale-95 disabled:opacity-70"
                >
                  {addingId === item.id ? (
                    <span className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus size={13} />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {scheduleOpen && scheduleItem && (
        <ScheduleMealModal
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

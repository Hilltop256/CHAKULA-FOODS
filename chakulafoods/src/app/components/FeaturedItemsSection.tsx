'use client';

import React, { useState } from 'react';
import { ShoppingCart, Star, Clock } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { toast } from 'sonner';
import Link from 'next/link';

const categories = [
{ id: 'cat-all', label: 'All Items' },
{ id: 'cat-restaurant', label: 'Restaurant' },
{ id: 'cat-confectionary', label: 'Confectionary' },
{ id: 'cat-juice', label: 'Juice Bar' },
{ id: 'cat-wine', label: 'Wine & Liquor' },
{ id: 'cat-market', label: 'Market Specials' }];


// Backend integration point: replace with API call to /api/products?featured=true
const featuredItems = [
{
  id: 'item-001',
  name: 'Chicken Stew & Matooke',
  price: 18000,
  originalPrice: null,
  category: 'Restaurant',
  rating: 4.9,
  prepTime: '25 min',
  image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80',
  tag: 'Best Seller',
  available: true
},
{
  id: 'item-002',
  name: 'Rolex (Chapati & Egg Roll)',
  price: 6500,
  originalPrice: null,
  category: 'Restaurant',
  rating: 4.8,
  prepTime: '10 min',
  image: "https://images.unsplash.com/photo-1719206927942-f0c8b52b884a",
  tag: 'Local Fav',
  available: true
},
{
  id: 'item-003',
  name: 'Birthday Celebration Cake',
  price: 85000,
  originalPrice: 95000,
  category: 'Confectionary',
  rating: 4.9,
  prepTime: '24h notice',
  image: "https://images.unsplash.com/photo-1686651952819-de42dd47b237",
  tag: 'Order Ahead',
  available: true
},
{
  id: 'item-004',
  name: 'Mango & Pineapple Smoothie',
  price: 9500,
  originalPrice: null,
  category: 'Juice Bar',
  rating: 4.7,
  prepTime: '8 min',
  image: "https://images.unsplash.com/photo-1666181767084-91e0cd358adf",
  tag: 'Refreshing',
  available: true
},
{
  id: 'item-005',
  name: 'Beef & Pork Combo Meal',
  price: 28000,
  originalPrice: 34000,
  category: 'Restaurant',
  rating: 4.6,
  prepTime: '30 min',
  image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80',
  tag: 'Combo Deal',
  available: true
},
{
  id: 'item-006',
  name: 'Red Velvet Cupcakes (6 pack)',
  price: 32000,
  originalPrice: null,
  category: 'Confectionary',
  rating: 4.8,
  prepTime: '3h notice',
  image: "https://images.unsplash.com/photo-1655650166075-11705e680bb1",
  tag: 'Popular',
  available: true
},
{
  id: 'item-007',
  name: 'Passion Fruit Detox Juice',
  price: 11000,
  originalPrice: null,
  category: 'Juice Bar',
  rating: 4.5,
  prepTime: '10 min',
  image: "https://images.unsplash.com/photo-1612975817531-e81150eaa3e1",
  tag: 'Detox',
  available: true
},
{
  id: 'item-008',
  name: 'South African Red Wine',
  price: 65000,
  originalPrice: null,
  category: 'Wine & Liquor',
  rating: 4.7,
  prepTime: 'In stock',
  image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80',
  tag: '18+',
  available: true
},
{
  id: 'item-009',
  name: 'Premium Rice Bundle (10kg)',
  price: 58000,
  originalPrice: 68000,
  category: 'Market Specials',
  rating: 4.6,
  prepTime: 'Same day',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_19101ba4f-1768321892069.png",
  tag: 'Bundle',
  available: true
},
{
  id: 'item-010',
  name: 'Ugandan Breakfast Plate',
  price: 14000,
  originalPrice: null,
  category: 'Restaurant',
  rating: 4.8,
  prepTime: '20 min',
  image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80',
  tag: 'Breakfast',
  available: true
},
{
  id: 'item-011',
  name: 'Chocolate Fudge Brownie Box',
  price: 24000,
  originalPrice: null,
  category: 'Confectionary',
  rating: 4.7,
  prepTime: '2h notice',
  image: "https://images.unsplash.com/photo-1607775643915-28dbfb0f3a77",
  tag: 'Dessert',
  available: true
},
{
  id: 'item-012',
  name: 'Johnnie Walker Black Label',
  price: 145000,
  originalPrice: null,
  category: 'Wine & Liquor',
  rating: 4.9,
  prepTime: 'In stock',
  image: "https://images.unsplash.com/photo-1638567827189-ec12e06c4ded",
  tag: '18+',
  available: true
}];


const isLoggedIn = true; // Backend: replace with auth state

export default function FeaturedItemsSection() {
  const [activeCategory, setActiveCategory] = useState('cat-all');
  const [addingId, setAddingId] = useState<string | null>(null);

  const filtered =
  activeCategory === 'cat-all' ?
  featuredItems :
  featuredItems.filter(
    (item) =>
    item.category.toLowerCase() ===
    categories.
    find((c) => c.id === activeCategory)?.
    label.toLowerCase()
  );

  const handleAddToCart = (item: typeof featuredItems[0]) => {
    if (!isLoggedIn) {
      toast.error('Please sign in to add items to your cart');
      return;
    }
    setAddingId(item.id);
    setTimeout(() => {
      setAddingId(null);
      toast.success(`${item.name} added to cart!`);
    }, 600);
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
        {categories.map((cat) =>
        <button
          key={cat.id}
          onClick={() => setActiveCategory(cat.id)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
          activeCategory === cat.id ?
          'bg-primary text-primary-foreground' :
          'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'}`
          }>
          
            {cat.label}
          </button>
        )}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
        {filtered.map((item) =>
        <div
          key={item.id}
          className="card-base overflow-hidden card-hover group flex flex-col">
          
            <div className="relative">
              <AppImage
              src={item.image}
              alt={`${item.name} — Chakula Foods menu item`}
              width={300}
              height={180}
              className="w-full h-36 object-cover" />
            
              <span
              className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
              item.tag === '18+' ? 'bg-accent text-accent-foreground' :
              item.tag === 'Best Seller' || item.tag === 'Combo Deal' ? 'bg-secondary text-secondary-foreground' : 'bg-primary/90 text-primary-foreground'}`
              }>
              
                {item.tag}
              </span>
              {item.originalPrice &&
            <span className="absolute top-2 right-2 text-xs font-bold bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                  SALE
                </span>
            }
            </div>
            <div className="p-3 flex flex-col flex-1">
              <h3 className="font-semibold text-sm text-foreground leading-tight mb-1 line-clamp-2">
                {item.name}
              </h3>
              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <Star size={11} className="text-secondary fill-secondary" />
                  {item.rating}
                </span>
                <span className="flex items-center gap-0.5">
                  <Clock size={11} />
                  {item.prepTime}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mb-3 mt-auto">
                <span className="font-bold text-primary tabular-nums text-sm">
                  UGX {item.price.toLocaleString()}
                </span>
                {item.originalPrice &&
              <span className="text-xs text-muted-foreground line-through tabular-nums">
                    {item.originalPrice.toLocaleString()}
                  </span>
              }
              </div>
              <button
              onClick={() => handleAddToCart(item)}
              disabled={addingId === item.id}
              className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-95 ${
              addingId === item.id ?
              'bg-primary/20 text-primary cursor-not-allowed' : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'}`
              }>
              
                {addingId === item.id ?
              <>
                    <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </> :

              <>
                    <ShoppingCart size={13} />
                    Add to Cart
                  </>
              }
              </button>
            </div>
          </div>
        )}
      </div>
    </section>);

}
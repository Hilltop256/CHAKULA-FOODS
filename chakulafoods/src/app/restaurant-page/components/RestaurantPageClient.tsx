'use client';

import React, { useState } from 'react';
import { RotateCcw, Calendar, Clock, ShoppingCart, Star } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { toast } from 'sonner';
import ScheduleMealModal from './ScheduleMealModal';

const subCategories = [
{ id: 'sub-all', label: 'All' },
{ id: 'sub-meals', label: 'Meals' },
{ id: 'sub-combos', label: 'Combo Offers' },
{ id: 'sub-breakfast', label: 'Breakfast' },
{ id: 'sub-lunch', label: 'Lunch' },
{ id: 'sub-dinner', label: 'Dinner' },
{ id: 'sub-plans', label: 'Meal Plans' }];


// Backend integration point: replace with GET /api/products?department=restaurant
const restaurantItems = [
{ id: 'rest-001', name: 'Chicken Stew & Matooke', category: 'Meals', price: 18000, rating: 4.9, prepTime: '25 min', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1cfc51ef2-1765187011661.png", tag: 'Best Seller', available: true, description: 'Tender chicken slow-cooked in rich tomato sauce served with steamed matooke' },
{ id: 'rest-002', name: 'Rolex (Chapati & Egg Roll)', category: 'Meals', price: 6500, rating: 4.8, prepTime: '10 min', image: "https://images.unsplash.com/photo-1691112683306-f971c67cd69e", tag: 'Local Fav', available: true, description: 'Freshly made chapati rolled with seasoned eggs, tomatoes and onions' },
{ id: 'rest-003', name: 'Beef & Pork Combo Meal', category: 'Combo Offers', price: 28000, originalPrice: 34000, rating: 4.6, prepTime: '30 min', image: "https://images.unsplash.com/photo-1664761044412-777bb099a6d0", tag: 'Combo Deal', available: true, description: 'Grilled beef ribs + pork chops with chips, coleslaw and a soft drink' },
{ id: 'rest-004', name: 'Family Feast Combo (4 pax)', category: 'Combo Offers', price: 85000, originalPrice: 108000, rating: 4.7, prepTime: '45 min', image: "https://images.unsplash.com/photo-1583549322669-af8248a306c1", tag: 'Save 21%', available: true, description: 'Feeds 4 — includes 2 stews, rice, matooke, chapati and 4 drinks' },
{ id: 'rest-005', name: 'Ugandan Breakfast Plate', category: 'Breakfast', price: 14000, rating: 4.8, prepTime: '20 min', image: "https://images.unsplash.com/photo-1733024451049-b9f36d6eb4be", tag: 'Morning Pick', available: true, description: 'Eggs, fried plantain, beans, chapati and a cup of black tea' },
{ id: 'rest-006', name: 'Katogo (Offal & Matooke)', category: 'Breakfast', price: 12000, rating: 4.5, prepTime: '15 min', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1cfc51ef2-1765187011661.png", tag: 'Traditional', available: true, description: 'Traditional Ugandan morning stew with offal and green matooke' },
{ id: 'rest-007', name: 'Grilled Tilapia & Rice', category: 'Lunch', price: 22000, rating: 4.7, prepTime: '35 min', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1ec37d2b6-1772798873768.png", tag: 'Fresh', available: true, description: 'Whole tilapia grilled with herbs, served with steamed rice and salad' },
{ id: 'rest-008', name: 'Matoke & Groundnut Sauce', category: 'Lunch', price: 11000, rating: 4.6, prepTime: '20 min', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1c950f9b3-1772057293469.png", tag: 'Veg-Friendly', available: true, description: 'Steamed green bananas in rich groundnut sauce, a Ugandan classic' },
{ id: 'rest-009', name: 'Nyama Choma (Goat)', category: 'Dinner', price: 35000, rating: 4.8, prepTime: '40 min', image: "https://img.rocket.new/generatedImages/rocket_gen_img_12303aac5-1766231845831.png", tag: 'Evening Special', available: true, description: 'Slow-roasted goat meat with kachumbari salad and ugali' },
{ id: 'rest-010', name: 'Pork Muchomo Platter', category: 'Dinner', price: 28000, rating: 4.7, prepTime: '35 min', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1fa79c909-1779098360699.png", tag: 'Weekend Fav', available: true, description: 'Skewered pork muchomo with roasted cassava and pepper sauce' },
{ id: 'rest-011', name: 'Weekly Meal Plan — 5 Days', category: 'Meal Plans', price: 175000, rating: 4.9, prepTime: 'Scheduled', image: "https://images.unsplash.com/photo-1592111300500-e893c1447151", tag: 'Best Value', available: true, description: 'Breakfast + lunch + dinner for 5 days, customized to your preferences' },
{ id: 'rest-012', name: 'Office Lunch Plan (10 days)', category: 'Meal Plans', price: 280000, rating: 4.8, prepTime: 'Scheduled', image: "https://img.rocket.new/generatedImages/rocket_gen_img_186637692-1773505144986.png", tag: 'Office Pack', available: true, description: '10 working-day lunch deliveries to your office, minimum 5 people' }];


const lastOrder = {
  id: 'ord-2831',
  date: '15 May 2026',
  items: [
  { name: 'Chicken Stew & Matooke', qty: 1, price: 18000 },
  { name: 'Rolex (Chapati & Egg Roll)', qty: 2, price: 13000 }],

  total: 31000
};

export default function RestaurantPageClient() {
  const [activeCategory, setActiveCategory] = useState('sub-all');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleItem, setScheduleItem] = useState<typeof restaurantItems[0] | null>(null);
  const [repeatLoading, setRepeatLoading] = useState(false);
  const isLoggedIn = true;

  const filtered =
  activeCategory === 'sub-all' ?
  restaurantItems :
  restaurantItems.filter(
    (item) =>
    item.category ===
    subCategories.find((c) => c.id === activeCategory)?.label
  );

  const handleAddToCart = (item: typeof restaurantItems[0]) => {
    if (!isLoggedIn) {toast.error('Sign in to add items to cart');return;}
    setAddingId(item.id);
    setTimeout(() => {setAddingId(null);toast.success(`${item.name} added to cart!`);}, 600);
  };

  const handleRepeatOrder = () => {
    setRepeatLoading(true);
    // Backend integration point: POST /api/orders/repeat { orderId: lastOrder.id }
    setTimeout(() => {
      setRepeatLoading(false);
      toast.success('Order repeated! Items added to your cart.');
    }, 1200);
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🍽️</span>
          <h1 className="text-3xl font-extrabold text-foreground">Restaurant</h1>
        </div>
        <p className="text-muted-foreground">
          Authentic Ugandan meals, combos, and scheduled meal plans — cooked fresh daily
        </p>
      </div>

      {/* Repeat Order MVP section */}
      {isLoggedIn &&
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <RotateCcw size={16} className="text-primary" />
                <span className="text-sm font-bold text-primary uppercase tracking-wide">Repeat Last Order</span>
              </div>
              <p className="text-sm font-semibold text-foreground">Order #{lastOrder.id} — {lastOrder.date}</p>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {lastOrder.items.map((item) =>
              <span key={`repeat-${item.name}`} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                    {item.qty}× {item.name}
                  </span>
              )}
              </div>
              <p className="text-sm font-bold text-foreground mt-2 tabular-nums">
                Total: UGX {lastOrder.total.toLocaleString()}
              </p>
            </div>
            <button
            onClick={handleRepeatOrder}
            disabled={repeatLoading}
            className="btn-primary flex items-center gap-2 shrink-0 h-11">
            
              {repeatLoading ?
            <>
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Adding to cart...
                </> :

            <>
                  <RotateCcw size={15} />
                  Repeat Order
                </>
            }
            </button>
          </div>
        </div>
      }

      {/* Sub-category tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
        {subCategories.map((cat) =>
        <button
          key={cat.id}
          onClick={() => setActiveCategory(cat.id)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
          activeCategory === cat.id ?
          'bg-primary text-primary-foreground' :
          'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'}`
          }>
          
            {cat.label}
          </button>
        )}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-4 mb-12">
        {filtered.map((item) =>
        <div key={item.id} className="card-base overflow-hidden card-hover flex flex-col group">
            <div className="relative">
              <AppImage
              src={item.image}
              alt={`${item.name} — Chakula Foods restaurant dish`}
              width={300}
              height={200}
              className="w-full h-40 object-cover" />
            
              <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
            item.tag === 'Best Seller' ? 'bg-secondary text-secondary-foreground' :
            item.tag === 'Combo Deal' || item.tag.startsWith('Save') ? 'bg-accent text-accent-foreground' :
            'bg-primary/90 text-primary-foreground'}`
            }>
                {item.tag}
              </span>
              {item.category === 'Meal Plans' &&
            <div className="absolute bottom-2 right-2">
                  <span className="flex items-center gap-1 bg-card/90 text-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                    <Calendar size={10} />
                    Schedulable
                  </span>
                </div>
            }
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
                  {item.rating}
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
                {'originalPrice' in item && item.originalPrice &&
              <span className="text-xs text-muted-foreground line-through tabular-nums">
                    {(item.originalPrice as number).toLocaleString()}
                  </span>
              }
              </div>
              <div className="flex gap-2">
                <button
                onClick={() => handleAddToCart(item)}
                disabled={addingId === item.id}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-95 ${
                addingId === item.id ?
                'bg-primary/20 text-primary cursor-not-allowed' : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'}`
                }>
                
                  {addingId === item.id ?
                <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" /> :

                <ShoppingCart size={12} />
                }
                  {addingId === item.id ? 'Adding...' : 'Add'}
                </button>
                {(item.category === 'Meal Plans' || item.category === 'Combo Offers') &&
              <button
                onClick={() => {setScheduleItem(item);setScheduleOpen(true);}}
                className="p-2 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all duration-150"
                title="Schedule this order">
                
                    <Calendar size={13} className="text-muted-foreground" />
                  </button>
              }
              </div>
            </div>
          </div>
        )}
      </div>

      {scheduleOpen && scheduleItem &&
      <ScheduleMealModal
        item={scheduleItem}
        onClose={() => {setScheduleOpen(false);setScheduleItem(null);}} />

      }
    </div>);

}
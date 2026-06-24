'use client';

import React, { useState } from 'react';
import { Calendar, Star, Clock, Gift, Repeat, Plus } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';

import ScheduleConfectionaryModal from './ScheduleConfectionaryModal';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

const subCategories = [
{ id: 'conf-all', label: 'All' },
{ id: 'conf-cakes', label: 'Cakes' },
{ id: 'conf-birthday', label: 'Birthday Packages' },
{ id: 'conf-pastries', label: 'Pastries' },
{ id: 'conf-dessert', label: 'Dessert Boxes' }];

const confectionaryItems = [
{ id: 'conf-001', name: 'Classic Vanilla Birthday Cake (1kg)', category: 'Cakes', price: 65000, rating: 4.9, leadTime: '24h notice', image: "https://img.rocket.new/generatedImages/rocket_gen_img_16105badc-1772206992144.png", tag: 'Bestseller', schedulable: true, description: 'Light vanilla sponge with buttercream frosting, custom message included' },
{ id: 'conf-002', name: 'Chocolate Fudge Cake (1.5kg)', category: 'Cakes', price: 85000, rating: 4.8, leadTime: '24h notice', image: "https://img.rocket.new/generatedImages/rocket_gen_img_15321a258-1772464596437.png", tag: 'Rich & Dark', schedulable: true, description: 'Triple-layer chocolate fudge cake with ganache drip, serves 10–12' },
{ id: 'conf-003', name: 'Red Velvet Cake (1kg)', category: 'Cakes', price: 72000, rating: 4.7, leadTime: '24h notice', image: "https://img.rocket.new/generatedImages/rocket_gen_img_11b4e1d9f-1772985545370.png", tag: 'Popular', schedulable: true, description: 'Vibrant red velvet layers with cream cheese frosting, custom decorations' },
{ id: 'conf-004', name: 'Birthday Deluxe Package', category: 'Birthday Packages', price: 185000, rating: 5.0, leadTime: '48h notice', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1935e7062-1779095230262.png", tag: 'Complete Package', schedulable: true, description: '2kg cake + 12 cupcakes + 20 cake pops + personalized decoration & candles' },
{ id: 'conf-005', name: 'Kids Birthday Package', category: 'Birthday Packages', price: 120000, rating: 4.9, leadTime: '36h notice', image: "https://images.unsplash.com/photo-1624027390997-d4dc600fa432", tag: 'Kids Fav', schedulable: true, description: '1kg themed cake + 10 cupcakes + party favors + balloon set' },
{ id: 'conf-006', name: 'Corporate Event Package', category: 'Birthday Packages', price: 350000, rating: 4.8, leadTime: '72h notice', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1935e7062-1779095230262.png", tag: 'Corporate', schedulable: true, description: '3kg cake + 50 mini pastries + branded packaging for events of 30+ people' },
{ id: 'conf-007', name: 'Cinnamon Croissants (6 pack)', category: 'Pastries', price: 22000, rating: 4.6, leadTime: '3h notice', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1a0f08120-1772413576166.png", tag: 'Fresh Baked', schedulable: false, description: 'Flaky, buttery croissants with cinnamon filling, baked fresh daily' },
{ id: 'conf-008', name: 'Assorted Pastry Box (12 pcs)', category: 'Pastries', price: 45000, rating: 4.7, leadTime: '4h notice', image: "https://images.unsplash.com/photo-1733108948784-a4fecc17b8b7", tag: 'Variety Pack', schedulable: true, description: 'Mix of croissants, pain au chocolat, danish pastries and cinnamon rolls' },
{ id: 'conf-009', name: 'Red Velvet Cupcakes (6 pack)', category: 'Pastries', price: 32000, rating: 4.8, leadTime: '3h notice', image: "https://images.unsplash.com/photo-1614707267785-109d783758ea", tag: 'Popular', schedulable: false, description: 'Moist red velvet cupcakes topped with cream cheese frosting' },
{ id: 'conf-010', name: 'Chocolate Brownie Dessert Box', category: 'Dessert Boxes', price: 28000, rating: 4.7, leadTime: '2h notice', image: "https://img.rocket.new/generatedImages/rocket_gen_img_19229641b-1779095229526.png", tag: 'Indulgent', schedulable: true, description: 'Box of 9 fudgy brownies — plain, walnut, and caramel swirl' },
{ id: 'conf-011', name: 'Luxury Dessert Box (Mixed)', category: 'Dessert Boxes', price: 55000, rating: 4.9, leadTime: '4h notice', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1dfb448d2-1772288683051.png", tag: 'Gift Ready', schedulable: true, description: 'Macarons, chocolate truffles, mini tarts and brownies — perfect gift' },
{ id: 'conf-012', name: 'Weekly Dessert Pack Subscription', category: 'Dessert Boxes', price: 95000, rating: 4.8, leadTime: 'Weekly', image: "https://img.rocket.new/generatedImages/rocket_gen_img_100547903-1772211482970.png", tag: 'Subscribe & Save', schedulable: true, description: 'Fresh dessert box every week — curated selection, 10% off vs individual orders' }];

//  FIXED HOOKS SECTION:
export default function ConfectionaryPageClient() {
  const [activeCategory, setActiveCategory] = useState('conf-all'); // Restored
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleItem, setScheduleItem] = useState<typeof confectionaryItems[0] | null>(null); // Clean single declaration
  const [addingId, setAddingId] = useState<string | null>(null);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const isLoggedIn = !!user;

  const filtered =
  activeCategory === 'conf-all' ?
  confectionaryItems :
  confectionaryItems?.filter(
    (item) =>
    item?.category ===
    subCategories?.find((c) => c?.id === activeCategory)?.label
  );

  const handleAddToCart = (item: typeof confectionaryItems[0]) => {
    setAddingId(item.id);
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      department: 'Confectionary'
    });
    setTimeout(() => setAddingId(null), 600);
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🎂</span>
          <h1 className="text-3xl font-extrabold text-foreground">Confectionary</h1>
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
          <h2 className="text-xl font-extrabold mb-2">Birthday Packages from UGX 120,000</h2>
          <p className="text-white/80 text-sm mb-4">
            Complete packages with custom cake, cupcakes, decorations and delivery — 
            order 48 hours in advance.
          </p>
          <button
            onClick={() => setActiveCategory('conf-birthday')}
            className="bg-white text-secondary font-bold px-5 py-2 rounded-lg text-sm hover:bg-white/90 transition-colors active:scale-95">
            View Birthday Packages
          </button>
        </div>
      </div>
      {/* Weekly dessert subscription CTA */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Repeat size={18} className="text-primary" />
          </div>
          <div>
            <p className="font-bold text-foreground">Weekly Dessert Pack Subscription</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Fresh curated dessert box every week — UGX 95,000/week, 10% off vs individual orders
            </p>
          </div>
        </div>
        <button
          onClick={() => {setScheduleItem(confectionaryItems?.find((i) => i?.id === 'conf-012') || null);setScheduleOpen(true);}}
          className="btn-primary shrink-0 text-sm flex items-center gap-2">
          <Calendar size={14} />
          Subscribe Now
        </button>
      </div>
      {/* Sub-category tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
        {subCategories?.map((cat) =>
        <button
          key={cat?.id}
          onClick={() => setActiveCategory(cat?.id)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
          activeCategory === cat?.id ?
          'bg-secondary text-secondary-foreground' :
          'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'}`
          }>
            {cat?.label}
          </button>
        )}
      </div>
      {/* Notice */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
        <Clock size={15} className="text-amber-600 shrink-0" />
        <p className="text-xs text-amber-800 font-medium">
          Cakes and birthday packages require advance notice (24–72 hours). Use the calendar icon to schedule your order.
        </p>
      </div>
      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
        {filtered?.map((item) =>
        <div key={item?.id} className="card-base overflow-hidden card-hover flex flex-col group">
            <div className="relative">
              <AppImage
              src={item?.image}
              alt={`${item?.name} — Chakula Foods confectionary item`}
              width={300}
              height={200}
              className="w-full h-40 object-cover" />
              <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
            item?.tag === 'Bestseller' || item?.tag === 'Popular' ? 'bg-secondary text-secondary-foreground' :
            item?.tag === 'Complete Package' || item?.tag === 'Subscribe & Save' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground border border-border'}`
            }>
                {item?.tag}
              </span>
              {item?.schedulable &&
            <div className="absolute bottom-2 right-2">
                  <span className="flex items-center gap-1 bg-card/90 text-xs font-semibold px-2 py-0.5 rounded-full text-foreground">
                    <Calendar size={10} />
                    Schedulable
                  </span>
                </div>
            }
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-bold text-sm text-foreground leading-tight mb-1 line-clamp-2">
                {item?.name}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                {item?.description}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-0.5">
                  <Star size={11} className="text-secondary fill-secondary" />
                  {item?.rating}
                </span>
                <span className="flex items-center gap-0.5">
                  <Clock size={11} />
                  {item?.leadTime}
                </span>
              </div>
              <p className="font-extrabold text-secondary tabular-nums text-sm mb-3 mt-auto">
                UGX {item?.price?.toLocaleString()}
              </p>
              <div className="flex gap-2">
                {item?.schedulable &&
              <button
                onClick={() => {setScheduleItem(item);setScheduleOpen(true);}}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border hover:border-secondary hover:bg-secondary/5 text-xs font-semibold transition-all duration-150"
                title="Schedule this order">
                    <Calendar size={13} className="text-muted-foreground" />
                    Schedule
                  </button>
              }
                <button
                onClick={() => handleAddToCart(item)}
                disabled={addingId === item?.id}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 text-xs font-semibold transition-all duration-150 active:scale-95 disabled:opacity-70">
                
                  {addingId === item?.id ?
                <span className="w-3.5 h-3.5 border-2 border-secondary-foreground border-t-transparent rounded-full animate-spin" /> :

                <>
                      <Plus size={13} />
                      Add to Cart
                    </>
                }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {scheduleOpen && scheduleItem &&
      <ScheduleConfectionaryModal
        item={scheduleItem}
        onClose={() => {setScheduleOpen(false);setScheduleItem(null);}} />
      }
    </div>);
}

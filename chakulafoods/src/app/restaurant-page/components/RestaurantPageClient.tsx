'use client';

import React, { useState } from 'react';
import { RotateCcw, Calendar, Clock, Star, Plus } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { toast } from 'sonner';
import ScheduleMealModal from './ScheduleMealModal';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

const subCategories = [
{ id: 'sub-all', label: 'All' },
{ id: 'sub-shawarma', label: 'Shawarma / Wraps / Rolex / Burgers' },
{ id: 'sub-bowls', label: 'Bowl Meals' },
{ id: 'sub-pizza', label: 'Pizza' },
{ id: 'sub-roasts', label: 'Roasts & Grills' },
{ id: 'sub-specials', label: 'Specials & Toppings' },
{ id: 'sub-bakery', label: 'Bakery & Breakfast' },
{ id: 'sub-platters', label: 'Party & Group Platters' },
{ id: 'sub-drinks', label: 'Drinks' }];



const restaurantItems = [
// Shawarma / Wraps / Rolex / Burgers
{
  id: 'rest-001',
  name: 'Shawarma',
  category: 'Shawarma / Wraps / Rolex / Burgers',
  price: 8000,
  originalPrice: 12000,
  rating: 4.9,
  prepTime: '15 min',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1a8c2c257-1767724313282.png",
  tag: 'Best Seller',
  available: true,
  description: 'Marinated meat, garlic sauce, pickles & fresh veggies wrapped in soft flatbread. Choose chicken, beef, pork or veggie. UGX 8,000 – 12,000'
},
{
  id: 'rest-002',
  name: 'Wrap',
  category: 'Shawarma / Wraps / Rolex / Burgers',
  price: 8000,
  originalPrice: 12000,
  rating: 4.7,
  prepTime: '10 min',
  image: "https://images.unsplash.com/photo-1653983194833-7a10838b12f4",
  tag: 'Hot',
  available: true,
  description: 'Grilled protein, crisp veggies and our signature Chakula sauce, all rolled up in a warm soft tortilla. Chicken, beef, pork or veggie. UGX 8,000 – 12,000'
},
{
  id: 'rest-003',
  name: 'Rolex',
  category: 'Shawarma / Wraps / Rolex / Burgers',
  price: 8000,
  originalPrice: 12000,
  rating: 4.8,
  prepTime: '10 min',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1f42edde2-1765187010416.png",
  tag: 'Local Fav',
  available: true,
  description: "Uganda's iconic street food — egg omelette with cabbage, tomato and your choice of meat, rolled in a fresh chapati. UGX 8,000 – 12,000"
},
{
  id: 'rest-004',
  name: 'Burger',
  category: 'Shawarma / Wraps / Rolex / Burgers',
  price: 8000,
  originalPrice: 12000,
  rating: 4.7,
  prepTime: '15 min',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1598722ac-1780982375179.png",
  tag: 'Stacked',
  available: true,
  description: 'Juicy patty, fresh lettuce, tomato, pickles and Chakula special sauce in a toasted brioche bun. Served hot. Chicken, beef, pork or veggie. UGX 8,000 – 12,000'
},
// Bowl Meals
{
  id: 'rest-005',
  name: 'Bowl Meal',
  category: 'Bowl Meals',
  price: 20000,
  originalPrice: 30000,
  rating: 4.9,
  prepTime: '20 min',
  image: "https://images.unsplash.com/photo-1717239679756-9059e0d18e81",
  tag: 'Best Seller',
  available: true,
  description: 'Pick your base and your meat — we build it fresh for you. Bases: Rice, Noodles, Veggies, Wedges, Plantain, Mixed. Protein: Chicken, Beef, Pork, Veggie. UGX 20,000 – 30,000'
},
{
  id: 'rest-006',
  name: 'Mixed Bowl',
  category: 'Bowl Meals',
  price: 25000,
  originalPrice: 30000,
  rating: 4.8,
  prepTime: '20 min',
  image: "https://images.unsplash.com/photo-1717239678710-b4808c7d65b2",
  tag: 'Mixed Bowl',
  available: true,
  description: "Can't decide? Get a mix of bases and proteins — all in one generous bowl. Bases: Rice, Noodles, Veggies, Wedges, Plantain, Mixed. UGX 25,000 – 30,000"
},
{
  id: 'rest-007',
  name: 'Veggie Bowl',
  category: 'Bowl Meals',
  price: 20000,
  rating: 4.6,
  prepTime: '15 min',
  image: "https://images.unsplash.com/photo-1629740745409-7e1c41418529",
  tag: 'Veggie Bowl',
  available: true,
  description: 'A fresh, light bowl packed with garden goodness — no meat, full flavour. Bases: Rice, Noodles, Wedges, Plantain, Mixed. Toppings: Salad, Cucumber, Tomato, Dressing. UGX 20,000'
},
// Pizza
{
  id: 'rest-008',
  name: 'Chicken Pizza',
  category: 'Pizza',
  price: 25000,
  originalPrice: 30000,
  rating: 4.8,
  prepTime: '25 min',
  image: "https://images.unsplash.com/photo-1734099387978-463d8fd09678",
  tag: 'Best Seller',
  available: true,
  description: 'Stone-baked pizza topped with grilled chicken, mozzarella, bell peppers and our signature tomato sauce. Available in regular & large. UGX 25,000 – 30,000'
},
{
  id: 'rest-009',
  name: 'Beef & Pepperoni Pizza',
  category: 'Pizza',
  price: 28000,
  originalPrice: 35000,
  rating: 4.7,
  prepTime: '25 min',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1879a5394-1773160898008.png",
  tag: 'Hot',
  available: true,
  description: 'Loaded with seasoned beef mince, pepperoni slices, red onion and melted mozzarella on a crispy base. UGX 28,000 – 35,000'
},
{
  id: 'rest-010',
  name: 'Veggie Pizza',
  category: 'Pizza',
  price: 22000,
  originalPrice: 28000,
  rating: 4.5,
  prepTime: '20 min',
  image: "https://images.unsplash.com/photo-1705276920817-da1a9b029b7b",
  tag: 'Local Fav',
  available: true,
  description: 'Garden-fresh mushrooms, olives, capsicum, sweet corn and cherry tomatoes on a golden crust with rich tomato base. UGX 22,000 – 28,000'
},
// Roasts & Grills
{
  id: 'rest-011',
  name: 'Grilled Chicken',
  category: 'Roasts & Grills',
  price: 22000,
  originalPrice: 28000,
  rating: 4.9,
  prepTime: '30 min',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_19fc0c453-1765407892152.png",
  tag: 'Best Seller',
  available: true,
  description: 'Whole or half chicken marinated in Chakula spice blend, slow-grilled to perfection. Served with kachumbari and choice of side. UGX 22,000 – 28,000'
},
{
  id: 'rest-012',
  name: 'Roasted Pork Ribs',
  category: 'Roasts & Grills',
  price: 30000,
  originalPrice: 38000,
  rating: 4.8,
  prepTime: '35 min',
  image: "https://images.unsplash.com/photo-1595507238835-bff863eb6edb",
  tag: 'Hot',
  available: true,
  description: 'Tender pork ribs slow-roasted with smoky BBQ glaze, served with coleslaw and roasted wedges. UGX 30,000 – 38,000'
},
{
  id: 'rest-013',
  name: 'Beef Nyama Choma',
  category: 'Roasts & Grills',
  price: 25000,
  originalPrice: 32000,
  rating: 4.7,
  prepTime: '30 min',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_19fc0c453-1765407892152.png",
  tag: 'Local Fav',
  available: true,
  description: 'East African-style roasted beef, seasoned with local herbs and charcoal-grilled. Served with ugali or chapati and kachumbari. UGX 25,000 – 32,000'
},
// Specials & Toppings
{
  id: 'rest-014',
  name: 'Chakula Special Platter',
  category: 'Specials & Toppings',
  price: 35000,
  originalPrice: 45000,
  rating: 4.9,
  prepTime: '25 min',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_13d352cf7-1773982756586.png",
  tag: 'Best Seller',
  available: true,
  description: "Chef's daily special — a curated combo of our top-selling items. Changes daily. Ask our team what's on today! UGX 35,000 – 45,000"
},
{
  id: 'rest-015',
  name: 'Extra Toppings',
  category: 'Specials & Toppings',
  price: 2000,
  rating: 4.5,
  prepTime: '5 min',
  image: "https://images.unsplash.com/photo-1543858694-1c9299c7e916",
  tag: 'Add-On',
  available: true,
  description: 'Customise your meal with extra toppings: avocado, fried egg, extra cheese, jalapeños, caramelised onions, or extra sauce. UGX 2,000 per topping'
},
{
  id: 'rest-016',
  name: 'Loaded Fries',
  category: 'Specials & Toppings',
  price: 12000,
  originalPrice: 15000,
  rating: 4.7,
  prepTime: '15 min',
  image: "https://images.unsplash.com/photo-1725155632077-4e881ed8f8ce",
  tag: 'Hot',
  available: true,
  description: 'Crispy golden fries loaded with melted cheese, bacon bits, jalapeños and Chakula special sauce. Perfect as a side or snack. UGX 12,000 – 15,000'
},
// Bakery & Breakfast
{
  id: 'rest-017',
  name: 'Full Breakfast Plate',
  category: 'Bakery & Breakfast',
  price: 18000,
  originalPrice: 22000,
  rating: 4.8,
  prepTime: '20 min',
  image: "https://images.unsplash.com/photo-1665663592726-fc468e9a3335",
  tag: 'Best Seller',
  available: true,
  description: 'Scrambled or fried eggs, sausages, baked beans, toast and a fresh juice. The perfect morning start. UGX 18,000 – 22,000'
},
{
  id: 'rest-018',
  name: 'Mandazi & Chai',
  category: 'Bakery & Breakfast',
  price: 5000,
  rating: 4.6,
  prepTime: '10 min',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_155afb556-1781774213475.png",
  tag: 'Local Fav',
  available: true,
  description: 'Freshly fried Ugandan mandazi served warm with a cup of spiced masala chai. A classic East African breakfast combo. UGX 5,000'
},
{
  id: 'rest-019',
  name: 'Croissant & Coffee',
  category: 'Bakery & Breakfast',
  price: 10000,
  originalPrice: 13000,
  rating: 4.7,
  prepTime: '10 min',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_19fd4864a-1779691175840.png",
  tag: 'Hot',
  available: true,
  description: 'Buttery flaky croissant — plain, chocolate or ham & cheese — paired with a freshly brewed Arabica coffee. UGX 10,000 – 13,000'
},
// Party & Group Platters
{
  id: 'rest-020',
  name: 'Party Shawarma Platter',
  category: 'Party & Group Platters',
  price: 80000,
  originalPrice: 100000,
  rating: 4.9,
  prepTime: '45 min',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1f79c3caa-1773214933563.png",
  tag: 'Best Seller',
  available: true,
  description: 'Feeds 8–10 people. A generous spread of shawarmas, wraps and rolexes with dipping sauces and fresh salad. Perfect for events. UGX 80,000 – 100,000'
},
{
  id: 'rest-021',
  name: 'BBQ Grill Platter',
  category: 'Party & Group Platters',
  price: 120000,
  originalPrice: 150000,
  rating: 4.8,
  prepTime: '60 min',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_15cc6f48d-1779691176514.png",
  tag: 'Hot',
  available: true,
  description: 'Feeds 10–12 people. Mixed grill of chicken, beef and pork ribs with sides of ugali, kachumbari and roasted plantain. UGX 120,000 – 150,000'
},
{
  id: 'rest-022',
  name: 'Bowl Meal Group Pack',
  category: 'Party & Group Platters',
  price: 90000,
  originalPrice: 110000,
  rating: 4.7,
  prepTime: '40 min',
  image: "https://images.unsplash.com/photo-1558689509-900d3d3cc727",
  tag: 'Group Deal',
  available: true,
  description: 'Feeds 6–8 people. Choose your bases and proteins — we pack everything fresh. Great for office lunches and family gatherings. UGX 90,000 – 110,000'
},
// Drinks
{
  id: 'rest-023',
  name: 'Fresh Fruit Juice',
  category: 'Drinks',
  price: 5000,
  originalPrice: 7000,
  rating: 4.8,
  prepTime: '5 min',
  image: "https://images.unsplash.com/photo-1584586994460-0c8d029148fd",
  tag: 'Best Seller',
  available: true,
  description: 'Freshly blended seasonal fruits — mango, passion, pineapple, watermelon or mixed. No added sugar. UGX 5,000 – 7,000'
},
{
  id: 'rest-024',
  name: 'Masala Chai',
  category: 'Drinks',
  price: 3000,
  rating: 4.7,
  prepTime: '5 min',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1ae0005a3-1772279316965.png",
  tag: 'Local Fav',
  available: true,
  description: 'Spiced East African tea brewed with ginger, cardamom and cinnamon. Served hot with milk. UGX 3,000'
},
{
  id: 'rest-025',
  name: 'Soft Drinks & Water',
  category: 'Drinks',
  price: 2000,
  originalPrice: 3000,
  rating: 4.5,
  prepTime: '2 min',
  image: "https://images.unsplash.com/photo-1651307426653-2b63a236ece5",
  tag: 'Cold',
  available: true,
  description: 'Chilled sodas (Coke, Fanta, Sprite, Stoney), still or sparkling water. UGX 2,000 – 3,000'
}];



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
  const { user } = useAuth();
  const { addToCart } = useCart();
  const isLoggedIn = !!user;

  const filtered =
  activeCategory === 'sub-all' ?
  restaurantItems :
  restaurantItems.filter(
    (item) =>
    item.category ===
    subCategories.find((c) => c.id === activeCategory)?.label
  );

  const handleRepeatOrder = () => {
    setRepeatLoading(true);
    setTimeout(() => {
      setRepeatLoading(false);
      toast.success('Order placed! Our team will contact you to confirm.');
    }, 1200);
  };

  const handleAddToCart = (item: typeof restaurantItems[0]) => {
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

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🍽️</span>
          <h1 className="text-3xl font-extrabold text-foreground">Restaurant</h1>
        </div>
        <p className="text-muted-foreground">
          Shawarma, wraps, burgers, bowl meals & more — made fresh daily at Chakula Foods · Kampala
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
                  Processing...
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
            item.tag === 'Hot' ? 'bg-amber-500 text-white' :
            item.tag === 'Local Fav' ? 'bg-green-600 text-white' :
            item.tag === 'Stacked' ? 'bg-purple-600 text-white' :
            item.tag === 'Mixed Bowl' ? 'bg-amber-500 text-white' :
            item.tag === 'Veggie Bowl' ? 'bg-green-600 text-white' : 'bg-primary/90 text-primary-foreground'}`
            }>
                {item.tag}
              </span>
              {item.category === 'Bowl Meals' &&
            <div className="absolute bottom-2 right-2">
                  <span className="flex items-center gap-1 bg-card/90 text-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                    <Calendar size={10} />
                    Customisable
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
                {item.category === 'Bowl Meals' &&
              <button
                onClick={() => {setScheduleItem(item);setScheduleOpen(true);}}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 text-xs font-semibold transition-all duration-150"
                title="Schedule this order">
                    <Calendar size={13} className="text-muted-foreground" />
                    Schedule
                  </button>
              }
                <button
                onClick={() => handleAddToCart(item)}
                disabled={addingId === item.id}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-all duration-150 active:scale-95 disabled:opacity-70">
                
                  {addingId === item.id ?
                <span className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> :

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
      <ScheduleMealModal
        item={scheduleItem}
        onClose={() => {setScheduleOpen(false);setScheduleItem(null);}} />
      }
    </div>);

}

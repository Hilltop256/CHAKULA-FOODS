'use client';

import React, { useState } from 'react';
import { ShoppingCart, Star, MapPin, Clock, AlertTriangle, Wine } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { toast } from 'sonner';

const subCategories = [
{ id: 'wl-all', label: 'All' },
{ id: 'wl-wines', label: 'Wines' },
{ id: 'wl-whiskey', label: 'Whiskey' },
{ id: 'wl-champagne', label: 'Champagne' },
{ id: 'wl-bundles', label: 'Party Bundles' }];


// Backend integration point: replace with GET /api/products?department=wine-liquor
const wineItems = [
{ id: 'wl-001', name: 'Nederburg Cabernet Sauvignon', category: 'Wines', price: 65000, rating: 4.7, origin: 'South Africa', volume: '750ml', image: "https://img.rocket.new/generatedImages/rocket_gen_img_109adbe7e-1772951391122.png", tag: 'Popular', inStock: true, description: 'Bold red wine with dark fruit flavors and a long, smooth finish' },
{ id: 'wl-002', name: 'Fairtrade Sauvignon Blanc', category: 'Wines', price: 58000, rating: 4.5, origin: 'South Africa', volume: '750ml', image: "https://img.rocket.new/generatedImages/rocket_gen_img_143a4fa91-1779095229298.png", tag: 'White Wine', inStock: true, description: 'Crisp and refreshing white wine with citrus and tropical fruit notes' },
{ id: 'wl-003', name: 'Rosé Zinfandel', category: 'Wines', price: 55000, rating: 4.4, origin: 'California, USA', volume: '750ml', image: "https://images.unsplash.com/photo-1655485676228-fbabfcf8502b", tag: 'Rosé', inStock: true, description: 'Light and fruity rosé with strawberry and watermelon notes, chilled best' },
{ id: 'wl-004', name: 'Johnnie Walker Black Label', category: 'Whiskey', price: 145000, rating: 4.9, origin: 'Scotland', volume: '700ml', image: "https://images.unsplash.com/photo-1636560652843-28c12bafa1e9", tag: 'Premium', inStock: true, description: 'Aged 12 years, rich and smooth blended Scotch whisky with smoky undertones' },
{ id: 'wl-005', name: 'Jack Daniel\'s Tennessee Whiskey', category: 'Whiskey', price: 125000, rating: 4.8, origin: 'Tennessee, USA', volume: '700ml', image: "https://images.unsplash.com/photo-1695948862027-17b08abc2be2", tag: 'Best Seller', inStock: true, description: 'Smooth Tennessee sour mash whiskey, charcoal mellowed for a distinctive taste' },
{ id: 'wl-006', name: 'Jameson Irish Whiskey', category: 'Whiskey', price: 118000, rating: 4.7, origin: 'Ireland', volume: '700ml', image: "https://img.rocket.new/generatedImages/rocket_gen_img_118179cfd-1779174455513.png", tag: 'Irish', inStock: true, description: 'Triple-distilled Irish whiskey, famously smooth with nutty and vanilla notes' },
{ id: 'wl-007', name: 'Moët & Chandon Brut', category: 'Champagne', price: 280000, rating: 4.9, origin: 'Champagne, France', volume: '750ml', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1efce10f6-1779174454764.png", tag: 'Luxury', inStock: true, description: 'Iconic French champagne with fine bubbles, green apple and citrus notes' },
{ id: 'wl-008', name: 'Cinzano Prosecco DOC', category: 'Champagne', price: 85000, rating: 4.5, origin: 'Veneto, Italy', volume: '750ml', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1018793ea-1779095228427.png", tag: 'Prosecco', inStock: true, description: 'Italian sparkling wine, light and refreshing with pear and peach aromas' },
{ id: 'wl-009', name: 'Party Bundle — 20 Guests', category: 'Party Bundles', price: 450000, originalPrice: 540000, rating: 4.8, origin: 'Mixed', volume: 'Bundle', image: "https://images.unsplash.com/photo-1586123041722-2212f07c86f7", tag: 'Save 17%', inStock: true, description: '3 wines + 2 whiskeys + 1 champagne + mixers — perfect for 20 guests' },
{ id: 'wl-010', name: 'Corporate Event Bundle', category: 'Party Bundles', price: 850000, originalPrice: 980000, rating: 4.9, origin: 'Mixed', volume: 'Bundle', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1c387bbb3-1778342652064.png", tag: 'Corporate', inStock: true, description: '6 wines + 4 whiskeys + 2 champagnes + premium glassware for 50+ guests' },
{ id: 'wl-011', name: 'Konyagi (Uganda Gin)', category: 'Whiskey', price: 35000, rating: 4.3, origin: 'Uganda', volume: '750ml', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1178eacf4-1779174456607.png", tag: 'Local', inStock: true, description: 'Uganda\'s most popular spirit — smooth gin with a clean, refreshing taste' },
{ id: 'wl-012', name: 'Wine Lovers Trio Pack', category: 'Party Bundles', price: 175000, originalPrice: 210000, rating: 4.7, origin: 'Mixed', volume: '3 × 750ml', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1cd4fed38-1769669520005.png", tag: 'Gift Pack', inStock: false, description: 'Red, white and rosé — a curated trio for wine enthusiasts, gift-wrapped' }];


const deliveryZones = [
{ zone: 'Naalya', available: true, hours: '10:00 AM – 9:00 PM' },
{ zone: 'Kyaliwajjala', available: true, hours: '10:00 AM – 8:00 PM' },
{ zone: 'Ntinda', available: true, hours: '11:00 AM – 8:00 PM' },
{ zone: 'Bukoto', available: true, hours: '11:00 AM – 7:00 PM' },
{ zone: 'Namugongo', available: false, hours: 'Not available' }];


const isLoggedIn = true;

export default function WineLiquorCatalog() {
  const [activeCategory, setActiveCategory] = useState('wl-all');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);

  const filtered =
  activeCategory === 'wl-all' ?
  wineItems :
  wineItems.filter(
    (item) =>
    item.category ===
    subCategories.find((c) => c.id === activeCategory)?.label
  );

  const handleAddToCart = (item: typeof wineItems[0]) => {
    if (!item.inStock) {toast.error(`${item.name} is currently out of stock`);return;}
    if (!isLoggedIn) {toast.error('Sign in to add items to cart');return;}
    setAddingId(item.id);
    setTimeout(() => {setAddingId(null);toast.success(`${item.name} added to cart!`);}, 600);
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🍷</span>
          <h1 className="text-3xl font-extrabold text-foreground">Wine & Liquor</h1>
          <span className="bg-accent/10 text-accent text-xs font-bold px-2.5 py-0.5 rounded-full ml-1">18+</span>
        </div>
        <p className="text-muted-foreground">
          Premium wines, whiskies, champagnes and party bundles — delivered responsibly
        </p>
      </div>

      {/* Compliance banner */}
      <div className="bg-accent/5 border border-accent/20 rounded-2xl p-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <AlertTriangle size={18} className="text-accent mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-foreground">Responsible Alcohol Sale — Uganda Alcohol Control Act</p>
              <p className="text-xs text-muted-foreground mt-1">
                We comply with Uganda's Alcohol Control Act. Alcohol will not be sold or delivered to persons under 18. 
                Delivery is restricted to licensed zones during permitted hours. 
                We reserve the right to refuse delivery.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDeliveryInfo(!showDeliveryInfo)}
            className="flex items-center gap-2 text-xs font-semibold text-accent bg-accent/10 hover:bg-accent/20 px-4 py-2 rounded-lg transition-colors shrink-0">
            
            <MapPin size={13} />
            Delivery Zones
          </button>
        </div>

        {/* Delivery zones panel */}
        {showDeliveryInfo &&
        <div className="mt-4 pt-4 border-t border-accent/20 animate-fade-in">
            <p className="text-xs font-bold text-foreground mb-3 uppercase tracking-wide">
              Delivery Availability by Zone
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {deliveryZones.map((zone) =>
            <div
              key={`zone-${zone.zone}`}
              className={`rounded-xl p-3 border ${
              zone.available ?
              'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`
              }>
              
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-2 h-2 rounded-full ${zone.available ? 'bg-green-500' : 'bg-red-400'}`} />
                    <span className="text-xs font-bold text-foreground">{zone.zone}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={10} />
                    {zone.hours}
                  </div>
                </div>
            )}
            </div>
          </div>
        }
      </div>

      {/* Sub-category tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
        {subCategories.map((cat) =>
        <button
          key={cat.id}
          onClick={() => setActiveCategory(cat.id)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
          activeCategory === cat.id ?
          'bg-accent text-accent-foreground' :
          'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'}`
          }>
          
            {cat.label}
          </button>
        )}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-4 mb-8">
        {filtered.map((item) =>
        <div
          key={item.id}
          className={`card-base overflow-hidden card-hover flex flex-col group ${
          !item.inStock ? 'opacity-60' : ''}`
          }>
          
            <div className="relative">
              <AppImage
              src={item.image}
              alt={`${item.name} — ${item.origin} — Chakula Foods Wine & Liquor`}
              width={300}
              height={220}
              className="w-full h-44 object-cover" />
            
              <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
            item.tag === 'Premium' || item.tag === 'Luxury' ? 'bg-secondary text-secondary-foreground' :
            item.tag === 'Best Seller' ? 'bg-accent text-accent-foreground' : 'bg-card text-foreground border border-border'}`
            }>
                {item.tag}
              </span>
              {!item.inStock &&
            <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center">
                  <span className="bg-card text-foreground text-xs font-bold px-3 py-1.5 rounded-full">
                    Out of Stock
                  </span>
                </div>
            }
              <div className="absolute top-2 right-2">
                <span className="bg-accent/90 text-accent-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                  18+
                </span>
              </div>
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-bold text-sm text-foreground leading-tight mb-1 line-clamp-2">
                {item.name}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                {item.description}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
                <span className="flex items-center gap-0.5">
                  <Star size={11} className="text-secondary fill-secondary" />
                  {item.rating}
                </span>
                <span className="font-medium">{item.volume}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                🌍 {item.origin}
              </p>
              <div className="flex items-center gap-1.5 mb-3 mt-auto">
                <span className="font-extrabold text-accent tabular-nums text-sm">
                  UGX {item.price.toLocaleString()}
                </span>
                {'originalPrice' in item && item.originalPrice &&
              <span className="text-xs text-muted-foreground line-through tabular-nums">
                    {(item.originalPrice as number).toLocaleString()}
                  </span>
              }
              </div>
              <button
              onClick={() => handleAddToCart(item)}
              disabled={addingId === item.id || !item.inStock}
              className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-95 ${
              !item.inStock ?
              'bg-muted text-muted-foreground cursor-not-allowed' :
              addingId === item.id ?
              'bg-accent/20 text-accent cursor-not-allowed' : 'bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground'}`
              }>
              
                {addingId === item.id ?
              <span className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" /> :

              <ShoppingCart size={12} />
              }
                {!item.inStock ? 'Out of Stock' : addingId === item.id ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        )}
      </div>

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
    </div>);

}
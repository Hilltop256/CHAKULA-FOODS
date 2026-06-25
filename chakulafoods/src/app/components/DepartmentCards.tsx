import React from 'react';
import Link from 'next/link';
import { ArrowRight, UtensilsCrossed, Cake, Leaf, Wine, ShoppingBasket, Repeat } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const departments = [
  {
    id: 'dept-restaurant',
    name: 'Restaurant',
    description: 'Meals, combos, breakfast, lunch & dinner',
    icon: UtensilsCrossed,
    href: '/restaurant-page',
    colorClass: 'dept-card-restaurant',
    badge: 'Most Popular',
    itemCount: 48,
  },
  {
    id: 'dept-confectionary',
    name: 'Confectionary',
    description: 'Cakes, pastries & birthday packages',
    icon: Cake,
    href: '/confectionary-page',
    colorClass: 'dept-card-confectionary',
    badge: 'Order Ahead',
    itemCount: 32,
  },
  {
    id: 'dept-juice',
    name: 'Juice Bar',
    description: 'Smoothies, detox plans & fresh juices',
    icon: Leaf,
    href: '#juice-bar',
    colorClass: 'dept-card-juice',
    badge: 'Daily Delivery',
    itemCount: 24,
  },
  {
    id: 'dept-wine',
    name: 'Wine & Liquor',
    description: 'Wines, whiskey, champagne & party bundles',
    icon: Wine,
    href: '/wine-liquor-page',
    colorClass: 'dept-card-wine',
    badge: '18+ Only',
    itemCount: 40,
  },
  {
    id: 'dept-market',
    name: 'Market Specials',
    description: 'Rice, sugar, cooking oil & bundle packs',
    icon: ShoppingBasket,
    href: '#market',
    colorClass: 'dept-card-market',
    badge: 'Best Value',
    itemCount: 28,
  },
  {
    id: 'dept-subscriptions',
    name: 'Subscriptions',
    description: 'Weekly wellness & meal plans',
    icon: Repeat,
    href: '#subscriptions',
    colorClass: 'dept-card-subscription',
    badge: 'Coming Soon',
    itemCount: 0,
  },
];

export default function DepartmentCards() {
  return (
    <section className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Our Departments</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Everything you need, from one kitchen
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 max-w-5xl mx-auto">
        {departments?.map((dept) => {
          const Icon = dept?.icon;
          return (
<Link
  key={dept?.id}
  href={dept?.href}
  className={`${dept?.colorClass} rounded-3xl p-8 text-white card-hover cursor-pointer block relative overflow-hidden min-h-[220px]`}
>
  <div className="absolute top-3 right-3">
    <span className="text-xs font-semibold bg-white/20 rounded-full px-2 py-0.5 leading-none">
      {dept?.badge}
    </span>
  </div>

  <Icon size={42} className="mb-5 opacity-90" />

  <h3 className="font-bold text-xl leading-tight mb-2">
    {dept?.name}
  </h3>

  <p className="text-sm opacity-80 leading-relaxed mb-5">
    {dept?.description}
  </p>

  <div className="flex items-center justify-between">
    {dept?.itemCount > 0 && (
      <span className="text-sm opacity-90">
        {dept?.itemCount} items
      </span>
    )}

    <ArrowRight size={20} className="opacity-70 ml-auto" />
  </div>
</Link>
          );
        })}
      </div>
    </section>
  );
}

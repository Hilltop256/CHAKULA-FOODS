"use client";
import { SectionHeader } from "./SectionHeader";
import { MenuItem } from "../types";

const wrapsItems: MenuItem[] = [
  {
    id: "shawarma",
    name: "Shawarma",
    description: "Marinated meat, garlic sauce, pickles & fresh veggies wrapped in soft flatbread. Choose chicken, beef, pork or veggie.",
    price: 8000,
    priceRange: "UGX 8,000 – 12,000",
    image: "/images/menu/shawarma.jpg",
    badge: "⭐ BESTSELLER",
    badgeColor: "cf-badge-red",
  },
  {
    id: "wrap",
    name: "Wrap",
    description: "Grilled protein, crisp veggies and our signature Chakula sauce, all rolled up in a warm soft tortilla.",
    price: 8000,
    priceRange: "UGX 8,000 – 12,000",
    image: "/images/menu/wrap.jpg",
    badge: "🔥 HOT",
    badgeColor: "cf-badge-gold",
  },
  {
    id: "rolex",
    name: "Rolex",
    description: "Uganda's iconic street food — egg omelette with cabbage, tomato and your choice of meat, rolled in a fresh chapati.",
    price: 8000,
    priceRange: "UGX 8,000 – 12,000",
    image: "/images/menu/rolex.jpg",
    badge: "🇺🇬 LOCAL FAV",
    badgeColor: "cf-badge-green",
  },
  {
    id: "burger",
    name: "Burger",
    description: "Juicy patty, fresh lettuce, tomato, pickles and Chakula special sauce in a toasted brioche bun. Served hot.",
    price: 8000,
    priceRange: "UGX 8,000 – 12,000",
    image: "/images/menu/burger.jpg",
    badge: "👑 STACKED",
    badgeColor: "cf-badge-purple",
  },
];

interface WrapsSectionProps {
  renderCard: (item: MenuItem) => React.ReactNode;
}

export function WrapsSection({ renderCard }: WrapsSectionProps) {
  return (
    <div className="cf-section" id="wraps">
      <SectionHeader
        icon="🌯"
        iconBg="#FFE8EC"
        title="Shawarma / Wraps / Rolex / Burgers"
        description="Chicken · Beef · Pork · Veggie  |  UGX 8,000 – 12,000"
      />
      <div className="cf-grid">
        {wrapsItems.map((item) => renderCard(item))}
      </div>
    </div>
  );
}

"use client";
import { SectionHeader } from "./SectionHeader";
import { MenuItem } from "../types";
import { BowlCard } from "./BowlCard";

const pizzaToppings = [
  { label: "Chicken", bgColor: "#FFE8EC", borderColor: "#f5c0c8", textColor: "#c0304a" },
  { label: "Beef", bgColor: "#FFF3DC", borderColor: "#f5dfa0", textColor: "#9a6200" },
  { label: "Pork", bgColor: "#FFF0E8", borderColor: "#f5d0b8", textColor: "#c85000" },
  { label: "Veggie", bgColor: "#E0FFF3", borderColor: "#a0e8cc", textColor: "#1a9e63" },
  { label: "Half & Half", bgColor: "#F0E8FF", borderColor: "#d0b8f5", textColor: "#7B3FE4" },
];

const pizzaItems: MenuItem[] = [
  {
    id: "classic-pizza",
    name: "Classic Pizza",
    description: "Hand-stretched crispy base, rich tomato sauce, melted mozzarella and your choice of toppings. Perfect for sharing.",
    price: 25000,
    priceRange: "UGX 25,000 – 35,000",
    priceLabel: "medium · serves 2–3",
    badge: "⭐ BESTSELLER",
    badgeColor: "cf-badge-red",
    optionGroups: [
      { title: "🍗 CHOOSE TOPPING", tags: pizzaToppings },
    ],
  },
  {
    id: "cheesy-pull-pizza",
    name: "Cheesy Pull Pizza",
    description: "Extra cheese, extra pull — our loaded cheese pizza with a golden herb crust. A crowd favourite for groups.",
    price: 28000,
    priceRange: "UGX 28,000 – 38,000",
    priceLabel: "medium · serves 2–3",
    badge: "🧀 CHEESY",
    badgeColor: "cf-badge-gold",
    optionGroups: [
      { title: "🍗 CHOOSE TOPPING", tags: pizzaToppings },
    ],
  },
];

export function PizzaSection() {
  return (
    <div className="cf-section" id="pizza">
      <SectionHeader
        icon="🍕"
        iconBg="#F0E8FF"
        title="Pizza"
        description="Group driver — share, enjoy, repeat  |  Chicken · Beef · Veggie · Half & Half"
      />
      <div className="cf-grid">
        {pizzaItems.map((item) => (
          <BowlCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

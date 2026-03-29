"use client";
import { SectionHeader } from "./SectionHeader";
import { MenuItem } from "../types";
import { BowlCard } from "./BowlCard";

const baseOptions = [
  { label: "Rice", bgColor: "#F8F4EE", borderColor: "#ddd", textColor: "#444" },
  { label: "Noodles", bgColor: "#F8F4EE", borderColor: "#ddd", textColor: "#444" },
  { label: "Veggies", bgColor: "#F8F4EE", borderColor: "#ddd", textColor: "#444" },
  { label: "Wedges", bgColor: "#F8F4EE", borderColor: "#ddd", textColor: "#444" },
  { label: "Plantain", bgColor: "#F8F4EE", borderColor: "#ddd", textColor: "#444" },
  { label: "Mixed", bgColor: "#F8F4EE", borderColor: "#ddd", textColor: "#444" },
];

const veggieBaseOptions = [
  { label: "Rice", bgColor: "#F8F4EE", borderColor: "#ddd", textColor: "#444" },
  { label: "Noodles", bgColor: "#F8F4EE", borderColor: "#ddd", textColor: "#444" },
  { label: "Wedges", bgColor: "#F8F4EE", borderColor: "#ddd", textColor: "#444" },
  { label: "Plantain", bgColor: "#F8F4EE", borderColor: "#ddd", textColor: "#444" },
  { label: "Mixed", bgColor: "#F8F4EE", borderColor: "#ddd", textColor: "#444" },
];

const meatOptions = [
  { label: "Chicken", bgColor: "#FFE8EC", borderColor: "#f5c0c8", textColor: "#c0304a" },
  { label: "Beef", bgColor: "#FFF3DC", borderColor: "#f5dfa0", textColor: "#9a6200" },
  { label: "Pork", bgColor: "#FFF0E8", borderColor: "#f5d0b8", textColor: "#c85000" },
  { label: "Veggie", bgColor: "#E0FFF3", borderColor: "#a0e8cc", textColor: "#1a9e63" },
];

const veggieToppings = [
  { label: "Salad", bgColor: "#E0FFF3", borderColor: "#a0e8cc", textColor: "#1a9e63" },
  { label: "Cucumber", bgColor: "#E0FFF3", borderColor: "#a0e8cc", textColor: "#1a9e63" },
  { label: "Tomato", bgColor: "#E0FFF3", borderColor: "#a0e8cc", textColor: "#1a9e63" },
  { label: "Dressing", bgColor: "#E0FFF3", borderColor: "#a0e8cc", textColor: "#1a9e63" },
];

const loadedVeggieToppings = [
  { label: "Avocado", bgColor: "#E0FFF3", borderColor: "#a0e8cc", textColor: "#1a9e63" },
  { label: "Black Beans", bgColor: "#E0FFF3", borderColor: "#a0e8cc", textColor: "#1a9e63" },
  { label: "Corn", bgColor: "#E0FFF3", borderColor: "#a0e8cc", textColor: "#1a9e63" },
  { label: "Sweet Potato", bgColor: "#E0FFF3", borderColor: "#a0e8cc", textColor: "#1a9e63" },
  { label: "Peppers", bgColor: "#E0FFF3", borderColor: "#a0e8cc", textColor: "#1a9e63" },
];

const bowlItems: MenuItem[] = [
  {
    id: "bowl-meal",
    name: "Bowl Meal",
    description: "Pick your base and your meat — we build it fresh for you.",
    price: 20000,
    priceRange: "UGX 20,000 – 30,000",
    priceLabel: "based on your selection",
    badge: "⭐ BESTSELLER",
    badgeColor: "cf-badge-red",
    optionGroups: [
      { title: "🍚 CHOOSE BASE", tags: baseOptions },
      { title: "🍗 CHOOSE MEAT", tags: meatOptions },
    ],
  },
  {
    id: "mixed-bowl",
    name: "Mixed Bowl",
    description: "Can't decide? Get a mix of bases and proteins — all in one generous bowl.",
    price: 25000,
    priceRange: "UGX 25,000 – 30,000",
    priceLabel: "based on your selection",
    badge: "🔥 MIXED BOWL",
    badgeColor: "cf-badge-gold",
    optionGroups: [
      { title: "🍚 CHOOSE BASE", tags: baseOptions },
      { title: "🍗 CHOOSE MEAT", tags: meatOptions },
    ],
  },
  {
    id: "veggie-bowl",
    name: "Veggie Bowl",
    description: "A fresh, light bowl packed with garden goodness — no meat, full flavour.",
    price: 20000,
    priceLabel: "fully plant-based",
    badge: "🌿 VEGGIE BOWL",
    badgeColor: "cf-badge-green",
    optionGroups: [
      { title: "🍚 CHOOSE BASE", tags: veggieBaseOptions },
      { title: "🥦 TOPPINGS", tags: veggieToppings },
    ],
  },
  {
    id: "loaded-veggie-bowl",
    name: "Loaded Veggie Bowl",
    description: "The ultimate plant-based bowl — roasted sweet potato, black beans, corn, avocado, peppers and our signature drizzle.",
    price: 22000,
    priceLabel: "fully plant-based",
    badge: "🌿 LOADED VEGGIE",
    badgeColor: "cf-badge-green",
    optionGroups: [
      { title: "🍚 CHOOSE BASE", tags: veggieBaseOptions },
      { title: "🥦 TOPPINGS", tags: loadedVeggieToppings },
    ],
  },
];

export function BowlsSection() {
  return (
    <div className="cf-section" id="bowls">
      <SectionHeader
        icon="🥣"
        iconBg="#FFF0E8"
        title="Bowl Meals"
        description="Choose your base & meat  |  UGX 20,000 – 30,000"
      />
      <div className="cf-grid">
        {bowlItems.map((item) => (
          <BowlCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

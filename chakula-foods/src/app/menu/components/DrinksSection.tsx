"use client";
import { SectionHeader } from "./SectionHeader";
import { MenuItem } from "../types";

// TODO: Populate from Part 7 HTML content
const drinkItems: MenuItem[] = [];

interface DrinksSectionProps {
  renderDrinkCard: (item: MenuItem) => React.ReactNode;
}

export function DrinksSection({ renderDrinkCard }: DrinksSectionProps) {
  if (drinkItems.length === 0) return null;

  return (
    <div className="cf-section" id="drinks">
      <SectionHeader
        icon="🥤"
        iconBg="#E8ECF5"
        title="Drinks & Beverages"
        description="Refreshing juices, smoothies, and hot drinks"
      />
      <div className="cf-drinks-grid">
        {drinkItems.map((item) => renderDrinkCard(item))}
      </div>
    </div>
  );
}

"use client";
import { SectionHeader } from "./SectionHeader";
import { MenuItem } from "../types";

// TODO: Populate from Part 3 HTML content
const pizzaItems: MenuItem[] = [];

interface PizzaSectionProps {
  renderCard: (item: MenuItem) => React.ReactNode;
}

export function PizzaSection({ renderCard }: PizzaSectionProps) {
  if (pizzaItems.length === 0) return null;

  return (
    <div className="cf-section" id="pizza">
      <SectionHeader
        icon="🍕"
        iconBg="#FFF0E8"
        title="Pizza"
        description="Wood-fired and loaded with fresh toppings"
      />
      <div className="cf-grid">
        {pizzaItems.map((item) => renderCard(item))}
      </div>
    </div>
  );
}

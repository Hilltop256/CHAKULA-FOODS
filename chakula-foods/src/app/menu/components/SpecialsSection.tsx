"use client";
import { SectionHeader } from "./SectionHeader";
import { MenuItem } from "../types";

// TODO: Populate from Part 5 HTML content
const specialsItems: MenuItem[] = [];

interface SpecialsSectionProps {
  renderCard: (item: MenuItem) => React.ReactNode;
}

export function SpecialsSection({ renderCard }: SpecialsSectionProps) {
  if (specialsItems.length === 0) return null;

  return (
    <div className="cf-section" id="specials">
      <SectionHeader
        icon="⭐"
        iconBg="#F0E8FF"
        title="Specials & Toppings"
        description="Chef's specials and extra toppings"
      />
      <div className="cf-grid">
        {specialsItems.map((item) => renderCard(item))}
      </div>
    </div>
  );
}

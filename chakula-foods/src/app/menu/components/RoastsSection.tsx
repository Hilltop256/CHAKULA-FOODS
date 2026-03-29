"use client";
import { SectionHeader } from "./SectionHeader";
import { MenuItem } from "../types";

// TODO: Populate from Part 4 HTML content
const roastItems: MenuItem[] = [];

interface RoastsSectionProps {
  renderCard: (item: MenuItem) => React.ReactNode;
  renderHeroCard?: (item: MenuItem) => React.ReactNode;
}

export function RoastsSection({ renderCard, renderHeroCard }: RoastsSectionProps) {
  if (roastItems.length === 0) return null;

  const heroItem = roastItems.find((i) => i.featured);
  const regularItems = roastItems.filter((i) => !i.featured);

  return (
    <div className="cf-section" id="roasts">
      <SectionHeader
        icon="🔥"
        iconBg="#FFF0E8"
        title="Roasts & Grills"
        description="Perfectly seasoned and flame-grilled to order"
      />
      <div className="cf-grid">
        {heroItem && renderHeroCard ? renderHeroCard(heroItem) : null}
        {regularItems.map((item) => renderCard(item))}
      </div>
    </div>
  );
}

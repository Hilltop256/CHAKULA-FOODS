"use client";
import { SectionHeader } from "./SectionHeader";
import { MenuItem } from "../types";

// TODO: Populate from Part 2 HTML content
const wrapsItems: MenuItem[] = [];

interface WrapsSectionProps {
  renderCard: (item: MenuItem) => React.ReactNode;
  renderHeroCard?: (item: MenuItem) => React.ReactNode;
}

export function WrapsSection({ renderCard, renderHeroCard }: WrapsSectionProps) {
  if (wrapsItems.length === 0) return null;

  const heroItem = wrapsItems.find((i) => i.featured);
  const regularItems = wrapsItems.filter((i) => !i.featured);

  return (
    <div className="cf-section" id="wraps">
      <SectionHeader
        icon="🌯"
        iconBg="#FFE8EC"
        title="Wraps"
        description="Hand-rolled wraps packed with flavour"
      />
      <div className="cf-grid">
        {heroItem && renderHeroCard ? renderHeroCard(heroItem) : null}
        {regularItems.map((item) => renderCard(item))}
      </div>
    </div>
  );
}

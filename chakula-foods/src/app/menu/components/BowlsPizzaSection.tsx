"use client";
import { SectionHeader } from "./SectionHeader";
import { MenuItem } from "../types";

// TODO: Populate from Part 3 HTML content
const bowlItems: MenuItem[] = [];
const pizzaItems: MenuItem[] = [];

interface BowlsPizzaSectionProps {
  renderCard: (item: MenuItem) => React.ReactNode;
  renderHeroCard?: (item: MenuItem) => React.ReactNode;
}

export function BowlsPizzaSection({ renderCard, renderHeroCard }: BowlsPizzaSectionProps) {
  if (bowlItems.length === 0 && pizzaItems.length === 0) return null;

  const heroItem = [...bowlItems, ...pizzaItems].find((i) => i.featured);

  return (
    <div className="cf-section" id="bowls-pizza">
      <SectionHeader
        icon="🍕"
        iconBg="#FFF3DC"
        title="Bowls & Pizza"
        description="Hearty bowl meals and wood-fired pizzas"
      />

      {bowlItems.length > 0 && (
        <>
          <div className="cf-sub-label">Bowl Meals</div>
          <div className="cf-grid">
            {heroItem && renderHeroCard && bowlItems.includes(heroItem)
              ? renderHeroCard(heroItem)
              : null}
            {bowlItems
              .filter((i) => !i.featured)
              .map((item) => renderCard(item))}
          </div>
        </>
      )}

      {pizzaItems.length > 0 && (
        <>
          <div className="cf-sub-label">Pizza</div>
          <div className="cf-grid">
            {heroItem && renderHeroCard && pizzaItems.includes(heroItem)
              ? renderHeroCard(heroItem)
              : null}
            {pizzaItems
              .filter((i) => !i.featured)
              .map((item) => renderCard(item))}
          </div>
        </>
      )}
    </div>
  );
}

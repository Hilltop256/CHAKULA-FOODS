"use client";
import { SectionHeader } from "./SectionHeader";
import { MenuItem } from "../types";

// TODO: Populate from Part 5 HTML content
const specialsItems: MenuItem[] = [];
const bakeryItems: MenuItem[] = [];

interface SpecialsBakerySectionProps {
  renderCard: (item: MenuItem) => React.ReactNode;
  renderHeroCard?: (item: MenuItem) => React.ReactNode;
}

export function SpecialsBakerySection({ renderCard, renderHeroCard }: SpecialsBakerySectionProps) {
  if (specialsItems.length === 0 && bakeryItems.length === 0) return null;

  const heroItem = [...specialsItems, ...bakeryItems].find((i) => i.featured);

  return (
    <div className="cf-section" id="specials">
      <SectionHeader
        icon="⭐"
        iconBg="#F0E8FF"
        title="Specials & Bakery"
        description="Chef's specials and freshly baked goods"
      />

      {specialsItems.length > 0 && (
        <>
          <div className="cf-sub-label">Chef&apos;s Specials</div>
          <div className="cf-grid">
            {heroItem && renderHeroCard && specialsItems.includes(heroItem)
              ? renderHeroCard(heroItem)
              : null}
            {specialsItems
              .filter((i) => !i.featured)
              .map((item) => renderCard(item))}
          </div>
        </>
      )}

      {bakeryItems.length > 0 && (
        <>
          <div className="cf-sub-label">Bakery</div>
          <div className="cf-grid">
            {heroItem && renderHeroCard && bakeryItems.includes(heroItem)
              ? renderHeroCard(heroItem)
              : null}
            {bakeryItems
              .filter((i) => !i.featured)
              .map((item) => renderCard(item))}
          </div>
        </>
      )}
    </div>
  );
}

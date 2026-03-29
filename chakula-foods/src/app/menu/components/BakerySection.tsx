"use client";
import { SectionHeader } from "./SectionHeader";
import { MenuItem } from "../types";

// TODO: Populate from Part 6 HTML content
const bakeryItems: MenuItem[] = [];

interface BakerySectionProps {
  renderCard: (item: MenuItem) => React.ReactNode;
}

export function BakerySection({ renderCard }: BakerySectionProps) {
  if (bakeryItems.length === 0) return null;

  return (
    <div className="cf-section" id="bakery">
      <SectionHeader
        icon="🥐"
        iconBg="#FFE8EC"
        title="Bakery & Breakfast"
        description="Freshly baked and morning favourites"
      />
      <div className="cf-grid">
        {bakeryItems.map((item) => renderCard(item))}
      </div>
    </div>
  );
}

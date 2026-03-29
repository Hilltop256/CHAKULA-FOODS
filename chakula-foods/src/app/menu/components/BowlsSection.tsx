"use client";
import { SectionHeader } from "./SectionHeader";
import { MenuItem } from "../types";

// TODO: Populate from Part 3 HTML content
const bowlItems: MenuItem[] = [];

interface BowlsSectionProps {
  renderCard: (item: MenuItem) => React.ReactNode;
}

export function BowlsSection({ renderCard }: BowlsSectionProps) {
  if (bowlItems.length === 0) return null;

  return (
    <div className="cf-section" id="bowls">
      <SectionHeader
        icon="🍲"
        iconBg="#FFF3DC"
        title="Bowl Meals"
        description="Hearty bowls loaded with flavour"
      />
      <div className="cf-grid">
        {bowlItems.map((item) => renderCard(item))}
      </div>
    </div>
  );
}

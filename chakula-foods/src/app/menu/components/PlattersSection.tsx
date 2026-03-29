"use client";
import { SectionHeader } from "./SectionHeader";
import { MenuItem } from "../types";

// TODO: Populate from Part 6 HTML content
const platterItems: MenuItem[] = [];

interface PlattersSectionProps {
  renderPlatterCard: (item: MenuItem) => React.ReactNode;
}

export function PlattersSection({ renderPlatterCard }: PlattersSectionProps) {
  if (platterItems.length === 0) return null;

  return (
    <div className="cf-section" id="platters">
      <SectionHeader
        icon="🍽️"
        iconBg="#E0FFF3"
        title="Party & Group Platters"
        description="Feast-ready platters for groups and celebrations"
      />
      <div className="cf-platter-grid">
        {platterItems.map((item) => renderPlatterCard(item))}
      </div>
    </div>
  );
}

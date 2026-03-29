"use client";
import { HERO_TAGS } from "../types";

export function MenuHero() {
  return (
    <div className="cf-hero">
      <div className="cf-hero-logo">🍽 Chakula Foods · Kampala</div>
      <h1>
        Our <span>Menu</span>
      </h1>
      <p>&quot;Everyday food, delivered and experienced differently.&quot;</p>
      <div className="cf-hero-tags">
        {HERO_TAGS.map((tag) => (
          <span key={tag} className="cf-hero-tag">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

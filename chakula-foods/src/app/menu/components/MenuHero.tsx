"use client";
import { HERO_TAGS } from "../types";

export function MenuHero() {
  return (
    <div className="cf-hero">
      <div className="cf-hero-logo">CHAKULA FOODS</div>
      <h1>
        Our <span>Menu</span>
      </h1>
      <p>Fresh ingredients, bold flavours — crafted with love in Kampala</p>
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

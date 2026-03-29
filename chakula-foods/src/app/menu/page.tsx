"use client";
import { Suspense } from "react";
import "./menu.css";
import {
  MenuHero,
  MenuNav,
  MenuCard,
  HeroMenuCard,
  DrinkCard,
  PlatterCard,
  WrapsSection,
  BowlsPizzaSection,
  RoastsSection,
  SpecialsBakerySection,
  PlattersSection,
  DrinksSection,
} from "./components";
import { MenuItem } from "./types";

function MenuContent() {
  return (
    <div className="chakula-menu">
      <MenuHero />
      <MenuNav />

      <WrapsSection
        renderCard={(item: MenuItem) => <MenuCard key={item.id} item={item} />}
        renderHeroCard={(item: MenuItem) => <HeroMenuCard key={item.id} item={item} />}
      />

      <div className="cf-divider" />

      <BowlsPizzaSection
        renderCard={(item: MenuItem) => <MenuCard key={item.id} item={item} />}
        renderHeroCard={(item: MenuItem) => <HeroMenuCard key={item.id} item={item} />}
      />

      <div className="cf-divider" />

      <RoastsSection
        renderCard={(item: MenuItem) => <MenuCard key={item.id} item={item} />}
        renderHeroCard={(item: MenuItem) => <HeroMenuCard key={item.id} item={item} />}
      />

      <div className="cf-divider" />

      <SpecialsBakerySection
        renderCard={(item: MenuItem) => <MenuCard key={item.id} item={item} />}
        renderHeroCard={(item: MenuItem) => <HeroMenuCard key={item.id} item={item} />}
      />

      <div className="cf-divider" />

      <PlattersSection
        renderPlatterCard={(item: MenuItem) => <PlatterCard key={item.id} item={item} />}
      />

      <div className="cf-divider" />

      <DrinksSection
        renderDrinkCard={(item: MenuItem) => <DrinkCard key={item.id} item={item} />}
      />
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="text-center py-16">Loading menu...</div>}>
      <MenuContent />
    </Suspense>
  );
}

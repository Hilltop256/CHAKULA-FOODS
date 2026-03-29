"use client";
import { MenuItem } from "../types";
import { useCart } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface MenuCardProps {
  item: MenuItem;
}

export function MenuCard({ item }: MenuCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      productId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="cf-card">
      {item.image ? (
        <img
          src={item.image}
          alt={item.name}
          className="cf-card-img"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            const placeholder = (e.target as HTMLImageElement).nextElementSibling;
            if (placeholder) (placeholder as HTMLElement).style.display = "flex";
          }}
        />
      ) : null}
      <div
        className="cf-card-img-placeholder"
        style={{ display: item.image ? "none" : "flex" }}
      >
        🍽️
      </div>
      <div className="cf-card-body">
        {item.badge && (
          <span className={`cf-card-badge ${item.badgeColor ?? "cf-badge-red"}`}>
            {item.badge}
          </span>
        )}
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <div className="cf-card-footer">
          <div>
            <div className="cf-price">
              {item.priceRange ?? formatCurrency(item.price)}
            </div>
            <div className="cf-price-label">
              chicken / beef / pork / veggie
            </div>
          </div>
          <button className="cf-add-btn" onClick={handleAdd}>
            {added ? "✓ Added" : "Order Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface HeroMenuCardProps {
  item: MenuItem;
}

export function HeroMenuCard({ item }: HeroMenuCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      productId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="cf-hero-card">
      {item.image ? (
        <img src={item.image} alt={item.name} className="cf-card-img" />
      ) : (
        <div className="cf-card-img-placeholder">🍽️</div>
      )}
      <div className="cf-card-body">
        {item.badge && (
          <span className={`cf-card-badge ${item.badgeColor ?? "cf-badge-red"}`}>
            {item.badge}
          </span>
        )}
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <div className="cf-card-footer">
          <div>
            <span className="cf-price">{formatCurrency(item.price)}</span>
          </div>
          <button className="cf-add-btn" onClick={handleAdd}>
            {added ? "✓ Added" : "Order Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

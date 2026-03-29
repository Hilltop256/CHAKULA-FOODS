"use client";
import { MenuItem } from "../types";
import { useCart } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface BowlCardProps {
  item: MenuItem;
}

export function BowlCard({ item }: BowlCardProps) {
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
        🥣
      </div>
      <div className="cf-card-body">
        {item.badge && (
          <span className={`cf-card-badge ${item.badgeColor ?? "cf-badge-red"}`}>
            {item.badge}
          </span>
        )}
        <h3>{item.name}</h3>
        <p style={{ marginBottom: 10 }}>{item.description}</p>

        {item.optionGroups?.map((group) => (
          <div key={group.title} style={{ marginBottom: group.title === item.optionGroups![item.optionGroups!.length - 1].title ? 14 : 8 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#1A1A2E",
                marginBottom: 5,
                letterSpacing: 0.5,
              }}
            >
              {group.title}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {group.tags.map((tag) => (
                <span
                  key={tag.label}
                  style={{
                    background: tag.bgColor,
                    border: `1px solid ${tag.borderColor}`,
                    borderRadius: 12,
                    padding: "3px 10px",
                    fontSize: 11,
                    color: tag.textColor,
                  }}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        ))}

        <div className="cf-card-footer">
          <div>
            <div className="cf-price">
              {item.priceRange ?? formatCurrency(item.price)}
            </div>
            {item.priceLabel && (
              <div className="cf-price-label">{item.priceLabel}</div>
            )}
          </div>
          <button className="cf-add-btn" onClick={handleAdd}>
            {added ? "✓ Added" : "Order Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

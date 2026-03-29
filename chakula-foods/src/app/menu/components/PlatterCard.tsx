"use client";
import { MenuItem } from "../types";
import { useCart } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface PlatterCardProps {
  item: MenuItem;
}

export function PlatterCard({ item }: PlatterCardProps) {
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
    <div className="cf-platter-card">
      {item.image ? (
        <img src={item.image} alt={item.name} className="cf-card-img" />
      ) : (
        <div className="cf-card-img-placeholder">🍽️</div>
      )}
      <div className="cf-platter-overlay">
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <div className="cf-card-footer">
          <span className="cf-price">{formatCurrency(item.price)}</span>
          <button className="cf-add-btn" onClick={handleAdd}>
            {added ? "✓ Added" : "+ Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

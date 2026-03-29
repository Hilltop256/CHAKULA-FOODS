"use client";
import { MenuItem } from "../types";
import { useCart } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface DrinkCardProps {
  item: MenuItem;
}

export function DrinkCard({ item }: DrinkCardProps) {
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
    <div className="cf-drink-card">
      {item.image ? (
        <img src={item.image} alt={item.name} className="cf-card-img" />
      ) : (
        <div className="cf-card-img-placeholder">🥤</div>
      )}
      <div className="cf-card-body">
        <h3>{item.name}</h3>
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

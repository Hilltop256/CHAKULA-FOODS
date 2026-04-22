"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Minus, ShoppingCart, Search } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";

const COLORS = {
  dark: "#1A1A2E",
  card: "#0F3460",
  accent: "#E94560",
  gold: "#F5A623",
  green: "#2DCE89",
  white: "#FFFFFF",
  light: "#F8F4EE",
  muted: "#8a8a9a",
};

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: string;
  isFeatured: boolean;
  isAvailable: boolean;
  preparationTime: number | null;
  unit: string | null;
  availableFrom: string | null;
  availableTo: string | null;
  availableDays: string[];
}

const categoryMap: Record<string, string> = {
  FAST_FOOD: "restaurant",
  BAKERY: "bakery",
  JUICE_BAR: "drinks",
  FRESH_MARKET: "restaurant",
  DRY_MARKET: "restaurant",
  ROASTS: "restaurant",
  SPECIALS: "restaurant",
  BREAKFAST: "bakery",
  PLATTERS: "restaurant",
  DRINKS: "drinks",
  WINES_SPIRITS: "drinks",
};

const categories = [
  { key: "restaurant", label: "Restaurant", emoji: "🍽️", iconBg: "#FFE8EC", subcategories: ["Fast Foods", "Breakfast Treats", "Roasts & Grills", "Party Platters", "Specials & Toppings"] },
  { key: "bakery", label: "Bakery / Confectionary", emoji: "🥐", iconBg: "#FFF0E8", subcategories: ["Bread", "Cakes", "Pastries", "Cookies", "Doughnuts"] },
  { key: "drinks", label: "Drinks & Beverages", emoji: "🧃", iconBg: "#E0FFF3", subcategories: ["Juice Bar", "Smoothies", "Coffee", "Tea", "Mocktails & Cocktails"] },
];

interface CategoryInfo {
  key: string;
  label: string;
  emoji: string;
  iconBg: string;
  subcategories: string[];
}

function MenuContent() {
  const searchParams = useSearchParams();
  const groupParam = searchParams.get("group");
  const categoryParam = searchParams.get("category");
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(groupParam || "restaurant");
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (groupParam && ["restaurant", "bakery", "drinks"].includes(groupParam)) {
      setActiveCategory(groupParam);
    } else if (categoryParam === "WINES_SPIRITS" || categoryParam === "BAKERY" || categoryParam === "BREAKFAST") {
      setActiveCategory("bakery");
    } else if (categoryParam === "JUICE_BAR" || categoryParam === "DRINKS") {
      setActiveCategory("drinks");
    } else if (categoryParam === "FRESH_MARKET" || categoryParam === "DRY_MARKET" || categoryParam === "FAST_FOOD" || categoryParam === "ROASTS" || categoryParam === "SPECIALS" || categoryParam === "PLATTERS") {
      setActiveCategory("restaurant");
    }
  }, [groupParam, categoryParam]);

  useEffect(() => {
    setLoading(true);
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, []);

  // Check if product is currently within its scheduled availability
  const isProductAvailableNow = (product: Product): boolean => {
    // If no schedule defined, always available (business hours)
    if (!product.availableDays?.length && !product.availableFrom && !product.availableTo) {
      return true;
    }

    const now = new Date();
    const currentDay = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase().slice(0, 3); // "mon", "tue", ...
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    // Check day
    if (product.availableDays?.length) {
      const dayMatches = product.availableDays.some((d) => d.toLowerCase() === currentDay);
      if (!dayMatches) return false;
    }

    // Check time if both from and to are set
    if (product.availableFrom && product.availableTo) {
      return currentTime >= product.availableFrom && currentTime <= product.availableTo;
    }

    return true;
  };

   const filteredProducts = products.filter((product) => {
     const mappedCategory = categoryMap[product.category] || "wraps";
     const matchesCategory = mappedCategory === activeCategory;
     const matchesSearch =
       search === "" ||
       product.name.toLowerCase().includes(search.toLowerCase()) ||
       (product.description && product.description.toLowerCase().includes(search.toLowerCase()));
     return matchesCategory && matchesSearch && product.isAvailable && isProductAvailableNow(product);
   });

  const handleAddToCart = (product: Product) => {
    const qty = quantities[product.id] ?? 1;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image ?? undefined,
      quantity: qty,
    });
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
  };

  const getQty = (productId: string) => quantities[productId] ?? 1;
  const setQty = (productId: string, qty: number) =>
    setQuantities((prev) => ({ ...prev, [productId]: qty }));

  const categoryInfo = categories.find((c) => c.key === activeCategory);

  return (
    <div style={{ background: COLORS.light, minHeight: "100vh" }}>
      <div
        style={{
          background: COLORS.dark,
          color: "white",
          textAlign: "center",
          padding: "60px 20px 50px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -80,
            left: -80,
            width: 320,
            height: 320,
            background: `radial-gradient(circle, ${COLORS.accent}33 0%, transparent 70%)`,
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            right: -60,
            width: 260,
            height: 260,
            background: `radial-gradient(circle, ${COLORS.gold}33 0%, transparent 70%)`,
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            fontSize: 13,
            letterSpacing: 6,
            color: COLORS.gold,
            fontWeight: 600,
            marginBottom: 14,
            textTransform: "uppercase",
          }}
        >
          🍽 Chakula Foods · Kampala
        </div>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2rem, 6vw, 3.5rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: 16,
          }}
        >
          Our <span style={{ color: COLORS.accent }}>Menu</span>
        </h1>
        <p style={{ fontSize: "1rem", color: "#aab", fontStyle: "italic", marginBottom: 30 }}>
          "Everyday food, delivered and experienced differently."
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          padding: "16px 20px",
          justifyContent: "center",
        }}
      >
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 18px",
                fontSize: 14,
                fontWeight: 600,
                color: activeCategory === cat.key ? "white" : COLORS.dark,
                background: activeCategory === cat.key ? COLORS.accent : "white",
                border: activeCategory === cat.key ? "none" : "1px solid #eee",
                borderRadius: 10,
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: activeCategory === cat.key ? "0 4px 12px rgba(233,69,96,0.3)" : "none",
              }}
            >
              <span style={{ fontSize: 18 }}>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 0" }}>
        <div style={{ position: "relative", maxWidth: 400, margin: "0 auto" }}>
          <Search
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              width: 20,
              height: 20,
              color: COLORS.muted,
            }}
          />
          <input
            type="text"
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 12px 12px 44px",
              border: "1px solid #ddd",
              borderRadius: 12,
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              background: categoryInfo?.iconBg,
            }}
          >
            {categoryInfo?.emoji}
          </div>
          <div>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.9rem",
                fontWeight: 700,
                color: COLORS.dark,
              }}
            >
              {categoryInfo?.label}
            </h2>
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              {categoryInfo?.subcategories?.map((sub: string) => (
                <span
                  key={sub}
                  style={{
                    fontSize: 12,
                    color: COLORS.muted,
                    background: "#f5f5f5",
                    padding: "4px 10px",
                    borderRadius: 6,
                  }}
                >
                  {sub}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 24 }}>
          {loading ? "Loading..." : `${filteredProducts.length} ${filteredProducts.length === 1 ? "item" : "items"}`}
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 60px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>Loading menu...</div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ fontSize: "3rem", marginBottom: 16 }}>🍽️</p>
            <p style={{ color: COLORS.muted, fontSize: "1.1rem" }}>No items found in this category.</p>
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  color: COLORS.accent,
                  background: "none",
                  border: "none",
                  fontSize: 14,
                  cursor: "pointer",
                  textDecoration: "underline",
                  marginTop: 12,
                }}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                style={{
                  background: "white",
                  borderRadius: 18,
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  transition: "transform 0.25s, box-shadow 0.25s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = "0 12px 36px rgba(0,0,0,0.14)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
                }}
              >
                <div
                  style={{
                    height: 180,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "4rem",
                    background: `linear-gradient(135deg, ${COLORS.dark}, ${COLORS.card})`,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <span>🍽️</span>
                  )}
                  {product.isFeatured && (
                    <span
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        background: COLORS.accent,
                        color: "white",
                        padding: "4px 10px",
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      Featured
                    </span>
                  )}
                </div>

                <div style={{ padding: "18px 20px 20px" }}>
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      marginBottom: 6,
                      color: COLORS.dark,
                    }}
                  >
                    {product.name}
                  </h3>
                  {product.description && (
                    <p
                      style={{
                        fontSize: 13,
                        color: COLORS.muted,
                        lineHeight: 1.55,
                        marginBottom: 14,
                      }}
                    >
                      {product.description}
                    </p>
                  )}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "1.15rem",
                          fontWeight: 700,
                          color: COLORS.accent,
                        }}
                      >
                        {formatCurrency(product.price)}
                        {product.unit && <span style={{ fontSize: 12, color: COLORS.muted }}> / {product.unit}</span>}
                      </div>
                      {product.preparationTime && (
                        <p style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>
                          ⏱️ {product.preparationTime} mins
                        </p>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #eee",
                          borderRadius: 8,
                        }}
                      >
                        <button
                          onClick={() => setQty(product.id, Math.max(1, getQty(product.id) - 1))}
                          style={{
                            padding: 8,
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                          }}
                        >
                          <Minus style={{ width: 14, height: 14 }} />
                        </button>
                        <span style={{ width: 28, textAlign: "center", fontSize: 14, fontWeight: 500 }}>
                          {getQty(product.id)}
                        </span>
                        <button
                          onClick={() => setQty(product.id, getQty(product.id) + 1)}
                          style={{
                            padding: 8,
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                          }}
                        >
                          <Plus style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        style={{
                          background: COLORS.dark,
                          color: "white",
                          border: "none",
                          borderRadius: 10,
                          padding: "10px 16px",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <ShoppingCart style={{ width: 16, height: 16 }} />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          background: COLORS.dark,
          color: "white",
          textAlign: "center",
          padding: "40px 20px",
        }}
      >
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", marginBottom: 8 }}>
          Chakula Foods
        </h3>
        <p style={{ color: "#aab", fontSize: 13, marginBottom: 6 }}>
          "Everyday food, delivered and experienced differently."
        </p>
        <p style={{ color: COLORS.gold, fontWeight: 600, fontSize: 13 }}>
          🍽 Kampala, Uganda
        </p>
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading menu...</div>}>
      <MenuContent />
    </Suspense>
  );
}
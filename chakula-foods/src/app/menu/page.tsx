"use client";
import { useState } from "react";
import { Plus, Minus, ShoppingCart, Search } from "lucide-react";
import { useCart } from "@/store/cart";

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

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  priceMin: number;
  priceMax: number;
  category: string;
  badge?: string;
  badgeColor?: string;
  emoji: string;
}

const menuData: MenuItem[] = [
  {
    id: "shawarma",
    name: "Shawarma",
    description: "Marinated meat, garlic sauce, pickles & fresh veggies wrapped in soft flatbread. Choose chicken, beef, pork or veggie.",
    price: "UGX 8,000 – 12,000",
    priceMin: 8000,
    priceMax: 12000,
    category: "wraps",
    badge: "⭐ BESTSELLER",
    badgeColor: "badge-red",
    emoji: "🥙",
  },
  {
    id: "wrap",
    name: "Wrap",
    description: "Grilled protein, crisp veggies and our signature Chakula sauce, all rolled up in a warm soft tortilla.",
    price: "UGX 8,000 – 12,000",
    priceMin: 8000,
    priceMax: 12000,
    category: "wraps",
    badge: "🔥 HOT",
    badgeColor: "badge-gold",
    emoji: "🌯",
  },
  {
    id: "rolex",
    name: "Rolex",
    description: "Uganda's iconic street food — egg omelette with cabbage, tomato and your choice of meat, rolled in a fresh chapati.",
    price: "UGX 8,000 – 12,000",
    priceMin: 8000,
    priceMax: 12000,
    category: "wraps",
    badge: "🇺🇬 LOCAL FAV",
    badgeColor: "badge-green",
    emoji: "🇺🇬",
  },
  {
    id: "burger",
    name: "Burger",
    description: "Juicy patty, fresh lettuce, tomato, pickles and Chakula special sauce in a toasted brioche bun. Served hot.",
    price: "UGX 8,000 – 12,000",
    priceMin: 8000,
    priceMax: 12000,
    category: "wraps",
    badge: "👑 STACKED",
    badgeColor: "badge-purple",
    emoji: "🍔",
  },
  {
    id: "jollof-bowl",
    name: "Jollof Bowl",
    description: "Our signature jollof rice topped with your choice of protein, coleslaw and Chakula pepper.",
    price: "UGX 20,000 – 30,000",
    priceMin: 20000,
    priceMax: 30000,
    category: "bowls",
    emoji: "🍚",
  },
  {
    id: "waakye-bowl",
    name: "Waakye Bowl",
    description: "Rice and beans cooked with waakye leaves, served with spaghetti, fried fish, and shito.",
    price: "UGX 20,000 – 30,000",
    priceMin: 20000,
    priceMax: 30000,
    category: "bowls",
    emoji: "🍚",
  },
  {
    id: "pilau-bowl",
    name: "Pilau Bowl",
    description: "Aromatic spiced rice with your choice of beef, chicken or goat, served with kachumbari.",
    price: "UGX 20,000 – 30,000",
    priceMin: 20000,
    priceMax: 30000,
    category: "bowls",
    emoji: "🍚",
  },
  {
    id: "fufu-bowl",
    name: "Fufu Bowl",
    description: "Pounded cassava and plantain served with flavorful light soup and your choice of meat.",
    price: "UGX 20,000 – 30,000",
    priceMin: 20000,
    priceMax: 30000,
    category: "bowls",
    emoji: "🍚",
  },
  {
    id: "margherita-pizza",
    name: "Margherita Pizza",
    description: "Classic tomato sauce, fresh mozzarella, basil and olive oil on our signature crust.",
    price: "UGX 25,000 – 45,000",
    priceMin: 25000,
    priceMax: 45000,
    category: "pizza",
    badge: "🍕 CLASSIC",
    badgeColor: "badge-red",
    emoji: "🍕",
  },
  {
    id: "pepperoni-pizza",
    name: "Pepperoni Pizza",
    description: "Loaded with pepperoni slices and melted mozzarella cheese.",
    price: "UGX 28,000 – 48,000",
    priceMin: 28000,
    priceMax: 48000,
    category: "pizza",
    emoji: "🍕",
  },
  {
    id: "chicken-supreme",
    name: "Chicken Supreme",
    description: "Grilled chicken, mushrooms, onions, peppers and sweet corn.",
    price: "UGX 30,000 – 50,000",
    priceMin: 30000,
    priceMax: 50000,
    category: "pizza",
    emoji: "🍕",
  },
  {
    id: "bbq-steak",
    name: "BBQ Steak",
    description: "Tender grilled steak with BBQ sauce, served with fries and grilled vegetables.",
    price: "UGX 35,000",
    priceMin: 35000,
    priceMax: 35000,
    category: "roasts",
    badge: "🔥 POPULAR",
    badgeColor: "badge-gold",
    emoji: "🥩",
  },
  {
    id: "grilled-chicken",
    name: "Grilled Chicken",
    description: "Marinated chicken grilled to perfection, served with chips and salad.",
    price: "UGX 25,000",
    priceMin: 25000,
    priceMax: 25000,
    category: "roasts",
    emoji: "🍗",
  },
  {
    id: "fish-grill",
    name: "Grilled Fish",
    description: "Fresh tilapia grilled with herbs and lemon, served with rice and veggies.",
    price: "UGX 30,000",
    priceMin: 30000,
    priceMax: 30000,
    category: "roasts",
    emoji: "🐟",
  },
  {
    id: "mixed-grill",
    name: "Mixed Grill",
    description: "Combination of beef, chicken, and pork with grilled vegetables.",
    price: "UGX 45,000",
    priceMin: 45000,
    priceMax: 45000,
    category: "roasts",
    emoji: "🔥",
  },
  {
    id: "roasted-matooke",
    name: "Roasted Matooke",
    description: "Green bananas roasted and served with groundnut sauce.",
    price: "UGX 15,000",
    priceMin: 15000,
    priceMax: 15000,
    category: "specials",
    badge: "🇺🇬 LOCAL",
    badgeColor: "badge-green",
    emoji: "🍌",
  },
  {
    id: "groundnut-soup",
    name: "Groundnut Soup",
    description: "Rich and creamy groundnut (peanut) soup served with rice or bread.",
    price: "UGX 12,000",
    priceMin: 12000,
    priceMax: 12000,
    category: "specials",
    emoji: "🥜",
  },
  {
    id: "greens-sukuma",
    name: "Sukuma Wiki",
    description: "Collard greens cooked with onions and tomatoes, traditional East African style.",
    price: "UGX 8,000",
    priceMin: 8000,
    priceMax: 8000,
    category: "specials",
    emoji: "🥬",
  },
  {
    id: "chapati",
    name: "Chapati (4 pcs)",
    description: "Flaky, layered flatbread - perfect for wrapping or dipping.",
    price: "UGX 4,000",
    priceMin: 4000,
    priceMax: 4000,
    category: "bakery",
    emoji: "🫓",
  },
  {
    id: "mandazi",
    name: "Mandazi (5 pcs)",
    description: "Sweet, fluffy doughnuts - perfect with tea or coffee.",
    price: "UGX 3,000",
    priceMin: 3000,
    priceMax: 3000,
    category: "bakery",
    emoji: "🍩",
  },
  {
    id: "samosas",
    name: "Samosas (4 pcs)",
    description: "Crispy pastry filled with spiced potatoes and peas.",
    price: "UGX 6,000",
    priceMin: 6000,
    priceMax: 6000,
    category: "bakery",
    emoji: "🥟",
  },
  {
    id: "breakfast-bun",
    name: "Breakfast Bun",
    description: "Soft bun served with eggs, sausage and cheese.",
    price: "UGX 8,000",
    priceMin: 8000,
    priceMax: 8000,
    category: "bakery",
    badge: "☕ BREAKFAST",
    badgeColor: "badge-orange",
    emoji: "🥐",
  },
  {
    id: "party-platter-small",
    name: "Party Platter (Small)",
    description: "Perfect for 4-6 people. Assorted wraps, samosas, and grilled items.",
    price: "UGX 120,000",
    priceMin: 120000,
    priceMax: 120000,
    category: "platters",
    emoji: "🎉",
  },
  {
    id: "party-platter-medium",
    name: "Party Platter (Medium)",
    description: "Perfect for 8-10 people. Full selection of our menu items.",
    price: "UGX 200,000",
    priceMin: 200000,
    priceMax: 200000,
    category: "platters",
    emoji: "🎉",
  },
  {
    id: "party-platter-large",
    name: "Party Platter (Large)",
    description: "Perfect for 15-20 people. Complete feast with everything.",
    price: "UGX 350,000",
    priceMin: 350000,
    priceMax: 350000,
    category: "platters",
    emoji: "🎉",
  },
  {
    id: "fresh-juice",
    name: "Fresh Juice",
    description: "Mango, pineapple, orange, or mixed fruit - freshly blended.",
    price: "UGX 8,000",
    priceMin: 8000,
    priceMax: 8000,
    category: "drinks",
    emoji: "🧃",
  },
  {
    id: "smoothie",
    name: "Smoothie",
    description: "Banana, strawberry, or avocado smoothie with milk and honey.",
    price: "UGX 10,000",
    priceMin: 10000,
    priceMax: 10000,
    category: "drinks",
    emoji: "🥤",
  },
  {
    id: "milk-tea",
    name: "Milk Tea",
    description: "Sweet milk tea with your choice of flavor - original, ginger, or cardamom.",
    price: "UGX 5,000",
    priceMin: 5000,
    priceMax: 5000,
    category: "drinks",
    emoji: "🧋",
  },
  {
    id: "coffee",
    name: "Coffee",
    description: "Espresso, cappuccino, or latte - freshly brewed.",
    price: "UGX 6,000",
    priceMin: 6000,
    priceMax: 6000,
    category: "drinks",
    badge: "☕ FRESH",
    badgeColor: "badge-dark",
    emoji: "☕",
  },
  {
    id: "water",
    name: "Bottled Water",
    description: "500ml still or sparkling water.",
    price: "UGX 2,000",
    priceMin: 2000,
    priceMax: 2000,
    category: "drinks",
    emoji: "💧",
  },
  {
    id: "soda",
    name: "Soft Drinks",
    description: "Coca Cola, Fanta, Sprite, or soda water.",
    price: "UGX 3,000",
    priceMin: 3000,
    priceMax: 3000,
    category: "drinks",
    emoji: "🥤",
  },
];

const categories = [
  { key: "wraps", label: "Shawarma / Wraps / Rolex / Burgers", emoji: "🌯", iconBg: "#FFE8EC" },
  { key: "bowls", label: "Bowl Meals", emoji: "🥣", iconBg: "#FFF0E8" },
  { key: "pizza", label: "Pizza", emoji: "🍕", iconBg: "#FFE8EC" },
  { key: "roasts", label: "Roasts & Grills", emoji: "🔥", iconBg: "#FFF3DC" },
  { key: "specials", label: "Specials & Toppings", emoji: "⭐", iconBg: "#F0E8FF" },
  { key: "bakery", label: "Bakery & Breakfast", emoji: "🥐", iconBg: "#E0FFF3" },
  { key: "platters", label: "Party & Group Platters", emoji: "🎉", iconBg: "#FFF0E8" },
  { key: "drinks", label: "Drinks", emoji: "🥤", iconBg: "#E8ECF5" },
];

const badgeStyles: Record<string, { bg: string; color: string }> = {
  "badge-red": { bg: "#FFE8EC", color: COLORS.accent },
  "badge-gold": { bg: "#FFF3DC", color: "#B07A00" },
  "badge-green": { bg: "#E0FFF3", color: "#1A9E63" },
  "badge-purple": { bg: "#F0E8FF", color: "#7B3FE4" },
  "badge-orange": { bg: "#FFF0E8", color: "#C85000" },
  "badge-dark": { bg: "#E8ECF5", color: "#2A3F7A" },
};

export default function MenuPage() {
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState("wraps");
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const filteredItems = menuData.filter((item) => {
    const matchesCategory = item.category === activeCategory;
    const matchesSearch =
      search === "" ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (item: MenuItem) => {
    const qty = quantities[item.id] ?? 1;
    addItem({
      productId: item.id,
      name: item.name,
      price: item.priceMin,
      quantity: qty,
    });
    setQuantities((prev) => ({ ...prev, [item.id]: 1 }));
  };

  const getQty = (itemId: string) => quantities[itemId] ?? 1;
  const setQty = (itemId: string, qty: number) =>
    setQuantities((prev) => ({ ...prev, [itemId]: qty }));

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
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 10 }}>
          {["Dine In", "Delivery", "WhatsApp Orders", "Subscription"].map((tag) => (
            <span
              key={tag}
              style={{
                padding: "6px 18px",
                border: `1.5px solid ${COLORS.accent}`,
                borderRadius: 20,
                fontSize: 12,
                color: "white",
                letterSpacing: 1,
                fontWeight: 500,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "white",
          boxShadow: "0 2px 16px rgba(0,0,0,0.1)",
          overflowX: "auto",
          whiteSpace: "nowrap",
          padding: "0 20px",
        }}
      >
        <div style={{ display: "inline-flex", gap: 0 }}>
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              style={{
                display: "inline-block",
                padding: "16px 22px",
                fontSize: 13,
                fontWeight: 600,
                color: activeCategory === cat.key ? COLORS.accent : COLORS.muted,
                textDecoration: "none",
                borderBottom: activeCategory === cat.key ? `3px solid ${COLORS.accent}` : "3px solid transparent",
                background: "none",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
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
              background: categories.find((c) => c.key === activeCategory)?.iconBg,
            }}
          >
            {categories.find((c) => c.key === activeCategory)?.emoji}
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
              {categories.find((c) => c.key === activeCategory)?.label}
            </h2>
          </div>
        </div>

        <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 24 }}>
          {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 60px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
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
                }}
              >
                {item.emoji}
              </div>

              <div style={{ padding: "18px 20px 20px" }}>
                {item.badge && (
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 1,
                      padding: "3px 10px",
                      borderRadius: 20,
                      marginBottom: 10,
                      textTransform: "uppercase",
                      background: item.badgeColor ? badgeStyles[item.badgeColor]?.bg : "#eee",
                      color: item.badgeColor ? badgeStyles[item.badgeColor]?.color : "#333",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    marginBottom: 6,
                    color: COLORS.dark,
                  }}
                >
                  {item.name}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: COLORS.muted,
                    lineHeight: 1.55,
                    marginBottom: 14,
                  }}
                >
                  {item.description}
                </p>
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
                      {item.price}
                    </div>
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
                        onClick={() => setQty(item.id, Math.max(1, getQty(item.id) - 1))}
                        style={{
                          padding: 8,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Minus style={{ width: 14, height: 14 }} />
                      </button>
                      <span style={{ width: 28, textAlign: "center", fontSize: 14, fontWeight: 500 }}>
                        {getQty(item.id)}
                      </span>
                      <button
                        onClick={() => setQty(item.id, getQty(item.id) + 1)}
                        style={{
                          padding: 8,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Plus style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleAddToCart(item)}
                      style={{
                        background: COLORS.dark,
                        color: "white",
                        border: "none",
                        borderRadius: 10,
                        padding: "10px 16px",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "background 0.2s",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.accent)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = COLORS.dark)}
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

        {filteredItems.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ fontSize: "3rem", marginBottom: 16 }}>🍽️</p>
            <p style={{ color: COLORS.muted, fontSize: "1.1rem" }}>No items found</p>
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
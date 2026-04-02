"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Minus, ShoppingCart, Search } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

const categoryLabels: Record<string, string> = {
  FAST_FOOD: "Fast Food",
  BAKERY: "Bakery",
  JUICE_BAR: "Juice Bar",
  FRESH_MARKET: "Fresh Market",
  DRY_MARKET: "Dry Market",
  ROASTS: "Roasts & Grills",
  SPECIALS: "Specials & Toppings",
  BREAKFAST: "Breakfast Treats",
  PLATTERS: "Party Platters",
  DRINKS: "Drinks & Beverages",
  WINES_SPIRITS: "Wines & Spirits",
};

const categoryEmojis: Record<string, string> = {
  FAST_FOOD: "🍔",
  BAKERY: "🥐",
  JUICE_BAR: "🧃",
  FRESH_MARKET: "🥬",
  DRY_MARKET: "🌾",
  ROASTS: "🔥",
  SPECIALS: "⭐",
  BREAKFAST: "☕",
  PLATTERS: "🎉",
  DRINKS: "🥤",
  WINES_SPIRITS: "🍷",
};

const groups = [
  { key: "", label: "All Items", emoji: "📋", categories: [] as string[] },
  { key: "restaurant", label: "Restaurant", emoji: "🍽️", categories: ["FAST_FOOD", "BREAKFAST"] },
  { key: "bakery", label: "Bakery", emoji: "🥐", categories: ["BAKERY"] },
  { key: "drinks", label: "Drinks & Beverages", emoji: "🧃", categories: ["JUICE_BAR", "DRINKS"] },
  { key: "roasts", label: "Roasts & Grills BBQ", emoji: "🔥", categories: ["ROASTS"] },
  { key: "platters", label: "Party Platters", emoji: "🎉", categories: ["PLATTERS"] },
  { key: "specials", label: "Specials & Toppings", emoji: "⭐", categories: ["SPECIALS"] },
];

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: string;
  isAvailable: boolean;
  preparationTime: number | null;
  isFeatured: boolean;
}

function getGroupForCategory(category: string): string {
  for (const g of groups) {
    if (g.categories.includes(category)) return g.key;
  }
  return "";
}

function MenuContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") ?? "";
  const groupParam = searchParams.get("group") ?? "";
  const { addItem } = useCart();

  // Determine active group: explicit group param, or derive from category
  const activeGroup = groupParam || getGroupForCategory(categoryParam);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const currentGroup = groups.find((g) => g.key === activeGroup) ?? groups[0];
  const subcategories = currentGroup.categories;

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        if (categoryParam) {
          // Single category fetch
          const params = new URLSearchParams();
          params.set("category", categoryParam);
          if (search) params.set("search", search);
          const res = await fetch(`/api/products?${params}`);
          const data = await res.json();
          setProducts(Array.isArray(data) ? data : []);
        } else if (subcategories.length > 0) {
          // Group fetch — fetch all subcategories in parallel
          const results = await Promise.all(
            subcategories.map(async (cat) => {
              const params = new URLSearchParams();
              params.set("category", cat);
              if (search) params.set("search", search);
              const res = await fetch(`/api/products?${params}`);
              const data = await res.json();
              return Array.isArray(data) ? data : [];
            })
          );
          setProducts(results.flat());
        } else {
          // All items
          const params = new URLSearchParams();
          if (search) params.set("search", search);
          const res = await fetch(`/api/products?${params}`);
          const data = await res.json();
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [categoryParam, activeGroup, search]);

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

  const headerTitle = categoryParam
    ? `${categoryEmojis[categoryParam] ?? ""} ${categoryLabels[categoryParam] ?? categoryParam}`
    : activeGroup
    ? `${currentGroup.emoji} ${currentGroup.label}`
    : "Our Menu";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">{headerTitle}</h1>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Main group tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-hide">
        {groups.map((group) => (
          <Link
            key={group.key}
            href={group.key ? `/menu?group=${group.key}` : "/menu"}
            className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold transition border ${
              activeGroup === group.key && !categoryParam
                ? "bg-orange-600 text-white border-orange-600"
                : "bg-white border-gray-200 hover:bg-orange-50 hover:border-orange-300"
            }`}
          >
            {group.emoji} {group.label}
          </Link>
        ))}
      </div>

      {/* Subcategory tabs (only when a group with subcategories is selected) */}
      {subcategories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <Link
            href={`/menu?group=${activeGroup}`}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-medium transition border ${
              !categoryParam
                ? "bg-orange-100 text-orange-700 border-orange-200"
                : "bg-gray-50 border-gray-200 hover:bg-orange-50"
            }`}
          >
            All {currentGroup.label}
          </Link>
          {subcategories.map((cat) => (
            <Link
              key={cat}
              href={`/menu?category=${cat}`}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-medium transition border ${
                categoryParam === cat
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-gray-50 border-gray-200 hover:bg-orange-50 hover:border-orange-300"
              }`}
            >
              {categoryEmojis[cat]} {categoryLabels[cat]}
            </Link>
          ))}
        </div>
      )}

      {/* Product count */}
      {!loading && products.length > 0 && (
        <p className="text-sm text-gray-500 mb-4">
          {products.length} {products.length === 1 ? "item" : "items"}
        </p>
      )}

      {/* Product grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border animate-pulse"
            >
              <div className="h-48 bg-gray-200 rounded-t-2xl" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🍽️</p>
          <p className="text-gray-500 text-lg mb-4">No products found</p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-orange-600 hover:underline text-sm"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition overflow-hidden flex flex-col"
            >
              {/* Image */}
              <div className="h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                {product.isFeatured && (
                  <span className="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-0.5 rounded-full font-medium z-10">
                    Featured
                  </span>
                )}
                {subcategories.length > 1 && !categoryParam && (
                  <span className="absolute top-2 right-2 bg-white/90 text-xs px-2 py-0.5 rounded-full font-medium z-10">
                    {categoryEmojis[product.category] ?? "🍽️"}{" "}
                    {categoryLabels[product.category] ?? product.category}
                  </span>
                )}
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                ) : (
                  <span className="text-6xl">
                    {categoryEmojis[product.category] ?? "🍽️"}
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-base leading-tight flex-1">
                    {product.name}
                  </h3>
                  <span className="text-orange-600 font-bold text-sm ml-2 shrink-0">
                    {formatCurrency(product.price)}
                  </span>
                </div>
                {product.description && (
                  <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                    {product.description}
                  </p>
                )}
                {product.preparationTime && (
                  <p className="text-xs text-gray-400 mb-3">
                    ⏱️ {product.preparationTime} mins
                  </p>
                )}

                <div className="flex items-center gap-2 mt-auto">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={() =>
                        setQty(product.id, Math.max(1, getQty(product.id) - 1))
                      }
                      className="p-2 hover:bg-gray-100 rounded-l-lg transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center text-sm font-medium">
                      {getQty(product.id)}
                    </span>
                    <button
                      onClick={() =>
                        setQty(product.id, getQty(product.id) + 1)
                      }
                      className="p-2 hover:bg-gray-100 rounded-r-lg transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.isAvailable}
                    className="flex-1 bg-orange-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-orange-700 transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {product.isAvailable ? "Add" : "Unavailable"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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

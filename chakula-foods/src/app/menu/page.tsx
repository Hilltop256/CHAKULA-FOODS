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
};

const categoryEmojis: Record<string, string> = {
  FAST_FOOD: "🍔",
  BAKERY: "🥐",
  JUICE_BAR: "🧃",
  FRESH_MARKET: "🥬",
  DRY_MARKET: "🌾",
  ROASTS: "🔥",
};

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

function MenuContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const { addItem } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (search) params.set("search", search);
        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [category, search]);

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

  const allCategories = [
    "",
    "FAST_FOOD",
    "BAKERY",
    "JUICE_BAR",
    "FRESH_MARKET",
    "DRY_MARKET",
    "ROASTS",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">
          {category
            ? `${categoryEmojis[category] ?? ""} ${categoryLabels[category] ?? category}`
            : "Our Menu"}
        </h1>
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

      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        {allCategories.map((cat) => (
          <Link
            key={cat}
            href={cat ? `/menu?category=${cat}` : "/menu"}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition border ${
              category === cat
                ? "bg-orange-600 text-white border-orange-600"
                : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
          >
            {cat
              ? `${categoryEmojis[cat]} ${categoryLabels[cat]}`
              : "All Items"}
          </Link>
        ))}
      </div>

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

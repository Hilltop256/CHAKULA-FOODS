"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Minus, ShoppingCart, Search } from "lucide-react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

const categoryLabels: Record<string, string> = {
  FAST_FOOD: "Fast Food",
  BAKERY: "Bakery",
  JUICE_BAR: "Juice Bar",
  FRESH_MARKET: "Fresh Market",
  DRY_MARKET: "Dry Market",
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
}

function MenuContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const { addItem, items } = useCart();
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchProducts() {
      try {
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (search) params.set("search", search);
        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [category, search]);

  const handleAddToCart = (product: Product) => {
    const qty = quantities[product.id] || 1;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image || undefined,
      quantity: qty,
    });
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
  };

  const getQty = (productId: string) => quantities[productId] || 1;
  const setQty = (productId: string, qty: number) => setQuantities((prev) => ({ ...prev, [productId]: qty }));

  const categories = ["", "FAST_FOOD", "BAKERY", "JUICE_BAR", "FRESH_MARKET", "DRY_MARKET"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">
          {category ? categoryLabels[category] || category : "Our Menu"}
        </h1>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={cat ? `/menu?category=${cat}` : "/menu"}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
              category === cat ? "bg-orange-600 text-white" : "bg-white border hover:bg-gray-50"
            }`}
          >
            {cat ? categoryLabels[cat] : "All"}
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm border hover:shadow-lg transition overflow-hidden">
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl">🍽️</span>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <span className="text-orange-600 font-bold">{formatCurrency(product.price)}</span>
                </div>
                {product.description && (
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
                )}
                {product.preparationTime && (
                  <p className="text-xs text-gray-400 mb-3">⏱️ {product.preparationTime} mins</p>
                )}
                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-lg">
                    <button onClick={() => setQty(product.id, Math.max(1, getQty(product.id) - 1))} className="p-2 hover:bg-gray-100">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center">{getQty(product.id)}</span>
                    <button onClick={() => setQty(product.id, getQty(product.id) + 1)} className="p-2 hover:bg-gray-100">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.isAvailable}
                    className="flex-1 bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add
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
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <MenuContent />
    </Suspense>
  );
}

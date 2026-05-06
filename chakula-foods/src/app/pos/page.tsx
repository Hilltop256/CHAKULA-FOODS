"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Coffee, Sandwich, UtensilsCrossed, X, Plus, Minus, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: string;
  isAvailable: boolean;
  preparationTime: number | null;
  unit: string | null;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface Table {
  id: string;
  number: string;
  capacity: number;
  isActive: boolean;
  occupied: boolean;
  activeOrder?: { id: string; orderNumber: string; status: string; total: number };
}

const CATEGORIES = [
  { key: "FAST_FOOD", label: "Fast Food", icon: Sandwich },
  { key: "BAKERY", label: "Bakery", icon: Coffee },
  { key: "JUICE_BAR", label: "Drinks", icon: Coffee },
  { key: "ROASTS", label: "Roasts", icon: UtensilsCrossed },
  { key: "BREAKFAST", label: "Breakfast", icon: Coffee },
  { key: "DRINKS", label: "Beverages", icon: Coffee },
];

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [activeCategory, setActiveCategory] = useState("FAST_FOOD");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKEAWAY">("DINE_IN");
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then(r => r.ok ? r.json() : []),
      fetch("/api/pos/tables").then(r => r.ok ? r.json() : []),
    ]).then(([productsData, tablesData]) => {
      setProducts(Array.isArray(productsData) ? productsData : []);
      setTables(Array.isArray(tablesData) ? tablesData : []);
    }).catch(() => {
      setProducts([]);
      setTables([]);
    }).finally(() => setLoading(false));
  }, []);

  const addToCart = (product: Product) => {
    const existing = cart.find(i => i.productId === product.id);
    if (existing) {
      setCart(cart.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { productId: product.id, name: product.name, price: product.price, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(i => i.productId !== productId));
    } else {
      setCart(cart.map(i => i.productId === productId ? { ...i, quantity } : i));
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;

  const submitOrder = async () => {
    if (cart.length === 0) return;
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/pos/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items: cart.map(i => ({ productId: i.productId, quantity: i.quantity })),
          type: orderType,
          tableNumber: orderType === "DINE_IN" ? selectedTable : undefined,
        }),
      });
      
      if (res.ok) {
        setCart([]);
        setSelectedTable("");
        setShowPayment(true);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create order");
      }
    } catch {
      alert("Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(
    p => p.category === activeCategory && p.isAvailable
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading POS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">POS Terminal</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Staff Access</span>
            <button
              onClick={() => setShowPayment(true)}
              disabled={cart.length === 0}
              className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" /> Pay
            </button>
          </div>
        </header>

        {/* Order Type & Table Selection */}
        <div className="bg-white p-4 border-b flex gap-4 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setOrderType("DINE_IN")}
              className={`px-4 py-2 rounded-lg font-medium ${orderType === "DINE_IN" ? "bg-orange-600 text-white" : "bg-gray-200"}`}
            >
              Dine In
            </button>
            <button
              onClick={() => setOrderType("TAKEAWAY")}
              className={`px-4 py-2 rounded-lg font-medium ${orderType === "TAKEAWAY" ? "bg-orange-600 text-white" : "bg-gray-200"}`}
            >
              Takeaway
            </button>
          </div>
          
          {orderType === "DINE_IN" && (
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">Select Table</option>
              {tables.filter(t => t.isActive).map(table => (
                <option key={table.id} value={table.number}>
                  Table {table.number} ({table.capacity}p)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Categories */}
        <div className="bg-white p-2 border-b overflow-x-auto">
          <div className="flex gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${activeCategory === cat.key ? "bg-orange-100 text-orange-800" : "hover:bg-gray-100"}`}
              >
                <cat.icon className="w-4 h-4 inline mr-1" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-center"
              >
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-24 object-cover rounded mb-2" />
                ) : (
                  <div className="w-full h-24 bg-gray-200 rounded mb-2 flex items-center justify-center">
                    🍽️
                  </div>
                )}
                <h3 className="font-medium text-sm">{product.name}</h3>
                <p className="text-orange-600 font-bold">{formatCurrency(product.price)}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-96 bg-white shadow-lg flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Current Order ({cart.reduce((s, i) => s + i.quantity, 0)})
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No items in cart</p>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.productId} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(item.price)} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span className="font-bold">{formatCurrency(subtotal)}</span>
          </div>
          <button
            onClick={submitOrder}
            disabled={cart.length === 0 || submitting}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Order"}
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Payment</h3>
              <button onClick={() => setShowPayment(false)} className="text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-2xl font-bold text-center mb-4">{formatCurrency(total)}</p>
            <div className="space-y-2">
              <button className="w-full py-3 bg-green-600 text-white rounded-lg font-medium">
                Cash Payment
              </button>
              <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium">
                MTN Mobile Money
              </button>
              <button className="w-full py-3 bg-red-600 text-white rounded-lg font-medium">
                Airtel Money
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
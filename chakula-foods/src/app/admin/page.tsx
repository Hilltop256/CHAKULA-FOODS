"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/store/auth";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  Users,
  ShoppingBag,
  Calendar,
  DollarSign,
  Plus,
  X,
  Package,
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  type: string;
  total: number;
  createdAt: string;
  userId: string;
  user: { name: string; phone: string };
  items: { product: { name: string }; quantity: number }[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
  isFeatured: boolean;
  description: string | null;
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  activeSubscriptions: number;
  totalCustomers: number;
}

const CATEGORIES = [
  "FAST_FOOD",
  "BAKERY",
  "JUICE_BAR",
  "FRESH_MARKET",
  "DRY_MARKET",
  "ROASTS",
  "SPECIALS",
  "BREAKFAST",
  "PLATTERS",
  "DRINKS",
  "WINES_SPIRITS",
];

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

const statusColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-yellow-100 text-yellow-700",
  READY: "bg-green-100 text-green-700",
  DELIVERED: "bg-green-200 text-green-800",
  CANCELLED: "bg-red-100 text-red-700",
};

type Tab = "orders" | "products";

function AdminContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  // Product form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "FAST_FOOD",
    preparationTime: "",
    isFeatured: false,
    unit: "",
    image: "",
  });
  const [savingProduct, setSavingProduct] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/");
    } else if (user?.role === "ADMIN") {
      Promise.all([
        fetch("/api/orders").then((r) => r.json()),
        fetch("/api/subscriptions").then((r) => r.json()),
        fetch("/api/products").then((r) => r.json()),
      ])
        .then(([ordersData, subsData, productsData]) => {
          const orders = Array.isArray(ordersData) ? ordersData : [];
          const subs = Array.isArray(subsData) ? subsData : [];
          const prods = Array.isArray(productsData) ? productsData : [];
          setOrders(orders);
          setProducts(prods);
          const activeSubs = subs.filter(
            (s: { status: string }) => s.status === "ACTIVE"
          ).length;
          setStats({
            totalOrders: orders.length,
            totalRevenue: orders.reduce(
              (s: number, o: Order) => s + o.total,
              0
            ),
            activeSubscriptions: activeSubs,
            totalCustomers: new Set(orders.map((o: Order) => o.userId)).size,
          });
        })
        .catch((err) => {
          console.error("Admin data fetch error:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productForm),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to save product");
      }
      const newProduct = await res.json();
      setProducts((prev) => [newProduct, ...prev]);
      setShowProductForm(false);
      setProductForm({
        name: "",
        description: "",
        price: "",
        category: "FAST_FOOD",
        preparationTime: "",
        isFeatured: false,
        unit: "",
        image: "",
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSavingProduct(false);
    }
  };

  const toggleProductAvailability = async (product: Product) => {
    await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: product.id,
        isAvailable: !product.isAvailable,
      }),
    });
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, isAvailable: !p.isAvailable } : p
      )
    );
  };

  if (authLoading || loading) {
    return (
      <div className="text-center py-12 text-gray-500">Loading...</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link href="/" className="text-orange-600 hover:underline text-sm">
          ← Back to Site
        </Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {[
          {
            label: "Total Orders",
            value: stats.totalOrders,
            icon: ShoppingBag,
            color: "bg-blue-100 text-blue-600",
          },
          {
            label: "Revenue",
            value: formatCurrency(stats.totalRevenue),
            icon: DollarSign,
            color: "bg-green-100 text-green-600",
          },
          {
            label: "Active Subscriptions",
            value: stats.activeSubscriptions,
            icon: Calendar,
            color: "bg-purple-100 text-purple-600",
          },
          {
            label: "Customers",
            value: stats.totalCustomers,
            icon: Users,
            color: "bg-orange-100 text-orange-600",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div
              className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-3`}
            >
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-gray-500 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("orders")}
          className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition ${
            tab === "orders"
              ? "bg-orange-600 text-white"
              : "bg-white border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <ShoppingBag className="w-4 h-4 inline mr-1.5 -mt-0.5" />
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setTab("products")}
          className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition ${
            tab === "products"
              ? "bg-orange-600 text-white"
              : "bg-white border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <Package className="w-4 h-4 inline mr-1.5 -mt-0.5" />
          Products ({products.length})
        </button>
      </div>

      {/* Orders tab */}
      {tab === "orders" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b">
            <h2 className="font-bold text-lg">Recent Orders</h2>
          </div>
          {orders.length === 0 ? (
            <p className="text-center py-12 text-gray-400">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-600">Order #</th>
                    <th className="text-left p-4 font-semibold text-gray-600">Customer</th>
                    <th className="text-left p-4 font-semibold text-gray-600">Items</th>
                    <th className="text-left p-4 font-semibold text-gray-600">Type</th>
                    <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                    <th className="text-left p-4 font-semibold text-gray-600">Total</th>
                    <th className="text-left p-4 font-semibold text-gray-600">Date</th>
                    <th className="text-left p-4 font-semibold text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.slice(0, 50).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="p-4 font-medium">{order.orderNumber}</td>
                      <td className="p-4">
                        <p className="font-medium">{order.user.name}</p>
                        <p className="text-gray-400 text-xs">{order.user.phone}</p>
                      </td>
                      <td className="p-4 text-gray-500 max-w-[200px] truncate">
                        {order.items
                          .map((i) => `${i.quantity}× ${i.product.name}`)
                          .join(", ")}
                      </td>
                      <td className="p-4">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {order.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            statusColors[order.status] ??
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 font-bold">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="p-4 text-gray-400 text-xs">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value)
                          }
                          className="border border-gray-200 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="PREPARING">Preparing</option>
                          <option value="READY">Ready</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Products tab */}
      {tab === "products" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-500 text-sm">{products.length} products</p>
            <button
              onClick={() => setShowProductForm(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-orange-700 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          {/* Add Product Modal */}
          {showProductForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Add New Product</h3>
                  <button
                    onClick={() => setShowProductForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm({ ...productForm, name: e.target.value })
                      }
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm h-20 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Price (UGX) *
                      </label>
                      <input
                        type="number"
                        value={productForm.price}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            price: e.target.value,
                          })
                        }
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm"
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Category *
                      </label>
                      <select
                        value={productForm.category}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            category: e.target.value,
                          })
                        }
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {categoryLabels[c]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Prep Time (mins)
                      </label>
                      <input
                        type="number"
                        value={productForm.preparationTime}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            preparationTime: e.target.value,
                          })
                        }
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Unit (e.g. kg, piece)
                      </label>
                      <input
                        type="text"
                        value={productForm.unit}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            unit: e.target.value,
                          })
                        }
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={productForm.image}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          image: e.target.value,
                        })
                      }
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm"
                      placeholder="https://..."
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isFeatured}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          isFeatured: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-orange-600"
                    />
                    <span className="text-sm">Mark as Featured</span>
                  </label>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowProductForm(false)}
                      className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingProduct}
                      className="flex-1 bg-orange-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-700 transition disabled:opacity-50"
                    >
                      {savingProduct ? "Saving..." : "Save Product"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">No products yet.</p>
              <button
                onClick={() => setShowProductForm(true)}
                className="bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-orange-700 transition"
              >
                Add First Product
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-600">Name</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Category</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Price</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Featured</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <p className="font-medium">{product.name}</p>
                          {product.description && (
                            <p className="text-gray-400 text-xs truncate max-w-[200px]">
                              {product.description}
                            </p>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                            {categoryLabels[product.category] ?? product.category}
                          </span>
                        </td>
                        <td className="p-4 font-semibold">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="p-4">
                          {product.isFeatured ? (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                              ⭐ Featured
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-xs px-2 py-1 rounded font-medium ${
                              product.isAvailable
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {product.isAvailable ? "Available" : "Unavailable"}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => toggleProductAvailability(product)}
                            className="text-xs text-orange-600 hover:underline font-medium"
                          >
                            {product.isAvailable ? "Disable" : "Enable"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <AdminContent />
    </Suspense>
  );
}

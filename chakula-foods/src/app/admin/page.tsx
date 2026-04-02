"use client";
// TEST MODE: Admin panel accessible without login
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
  UtensilsCrossed,
  Tag,
  Gift,
  Pencil,
  Trash2,
  Upload,
  Image as ImageIcon,
  Eye,
  EyeOff,
} from "lucide-react";

// ── Interfaces ──────────────────────────────────────────────────────────────
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
  image: string | null;
  preparationTime: number | null;
  unit: string | null;
}

interface Offer {
  id: string;
  name: string;
  description: string | null;
  type: string;
  value: number;
  code: string | null;
  image: string | null;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  usageLimit: number | null;
  usedCount: number;
  productId: string | null;
  product: { id: string; name: string } | null;
}

interface Pkg {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  isActive: boolean;
  items: {
    id: string;
    quantity: number;
    product: { id: string; name: string; price: number; image: string | null };
  }[];
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  activeSubscriptions: number;
  totalCustomers: number;
}

// ── Constants ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  "FAST_FOOD", "BAKERY", "JUICE_BAR", "FRESH_MARKET", "DRY_MARKET",
  "ROASTS", "SPECIALS", "BREAKFAST", "PLATTERS", "DRINKS", "WINES_SPIRITS",
];

const categoryLabels: Record<string, string> = {
  FAST_FOOD: "Fast Food", BAKERY: "Bakery", JUICE_BAR: "Juice Bar",
  FRESH_MARKET: "Fresh Market", DRY_MARKET: "Dry Market",
  ROASTS: "Roasts & Grills", SPECIALS: "Specials & Toppings",
  BREAKFAST: "Breakfast Treats", PLATTERS: "Party Platters",
  DRINKS: "Drinks & Beverages", WINES_SPIRITS: "Wines & Spirits",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-yellow-100 text-yellow-700",
  READY: "bg-green-100 text-green-700",
  DELIVERED: "bg-green-200 text-green-800",
  CANCELLED: "bg-red-100 text-red-700",
};

type Tab = "orders" | "menu" | "offers" | "packages";

// ── Image Upload Helper ─────────────────────────────────────────────────────
async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.url;
}

// ── Component ───────────────────────────────────────────────────────────────
function AdminContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // TEST MODE - Remove in production
  const isTestMode = true;
  
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalRevenue: 0, activeSubscriptions: 0, totalCustomers: 0 });
  const [loading, setLoading] = useState(true);

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "", description: "", price: "", category: "FAST_FOOD",
    preparationTime: "", isFeatured: false, unit: "", image: "",
  });
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Offer form
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [offerForm, setOfferForm] = useState({
    name: "", description: "", type: "PERCENTAGE", value: "",
    code: "", image: "", startDate: "", endDate: "",
    usageLimit: "", productId: "",
  });
  const [savingOffer, setSavingOffer] = useState(false);

  // Package form
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Pkg | null>(null);
  const [packageForm, setPackageForm] = useState({
    name: "", description: "", price: "", image: "",
    items: [] as { productId: string; quantity: number }[],
  });
  const [savingPackage, setSavingPackage] = useState(false);

  // ── Data Loading ──────────────────────────────────────────────────────────
  useEffect(() => {
    // Skip auth check in test mode
    if (!isTestMode && !authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/");
    }
    
    // Load data if admin OR in test mode
    if (isTestMode || user?.role === "ADMIN") {
      Promise.all([
        fetch("/api/orders").then((r) => r.json()),
        fetch("/api/subscriptions").then((r) => r.json()),
        fetch("/api/products").then((r) => r.json()),
        fetch("/api/offers").then((r) => r.json()),
        fetch("/api/packages").then((r) => r.json()),
      ])
        .then(([ordersData, subsData, productsData, offersData, packagesData]) => {
          const orders = Array.isArray(ordersData) ? ordersData : [];
          const subs = Array.isArray(subsData) ? subsData : [];
          setOrders(orders);
          setProducts(Array.isArray(productsData) ? productsData : []);
          setOffers(Array.isArray(offersData) ? offersData : []);
          setPackages(Array.isArray(packagesData) ? packagesData : []);
          setStats({
            totalOrders: orders.length,
            totalRevenue: orders.reduce((s: number, o: Order) => s + o.total, 0),
            activeSubscriptions: subs.filter((s: { status: string }) => s.status === "ACTIVE").length,
            totalCustomers: new Set(orders.map((o: Order) => o.userId)).size,
          });
        })
        .catch((err) => console.error("Admin data fetch error:", err))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  // ── Order Actions ─────────────────────────────────────────────────────────
  const updateOrderStatus = async (orderId: string, status: string) => {
    await fetch("/api/orders", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  // ── Image Upload ──────────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadImage(file);
      setter(url);
    } catch {
      alert("Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  // ── Product Actions ───────────────────────────────────────────────────────
  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
      category: product.category,
      preparationTime: product.preparationTime ? String(product.preparationTime) : "",
      isFeatured: product.isFeatured,
      unit: product.unit ?? "",
      image: product.image ?? "",
    });
    setShowProductForm(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      if (editingProduct) {
        const res = await fetch("/api/products", {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingProduct.id, ...productForm }),
        });
        if (!res.ok) throw new Error("Failed to update");
        const updated = await res.json();
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const res = await fetch("/api/products", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productForm),
        });
        if (!res.ok) throw new Error("Failed to create");
        const newProduct = await res.json();
        setProducts((prev) => [newProduct, ...prev]);
      }
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({ name: "", description: "", price: "", category: "FAST_FOOD", preparationTime: "", isFeatured: false, unit: "", image: "" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSavingProduct(false);
    }
  };

  const toggleProductAvailability = async (product: Product) => {
    await fetch("/api/products", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: product.id, isAvailable: !product.isAvailable }),
    });
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, isAvailable: !p.isAvailable } : p));
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // ── Offer Actions ─────────────────────────────────────────────────────────
  const openEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setOfferForm({
      name: offer.name,
      description: offer.description ?? "",
      type: offer.type,
      value: String(offer.value),
      code: offer.code ?? "",
      image: offer.image ?? "",
      startDate: offer.startDate ? offer.startDate.split("T")[0] : "",
      endDate: offer.endDate ? offer.endDate.split("T")[0] : "",
      usageLimit: offer.usageLimit ? String(offer.usageLimit) : "",
      productId: offer.productId ?? "",
    });
    setShowOfferForm(true);
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingOffer(true);
    try {
      if (editingOffer) {
        const res = await fetch("/api/offers", {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingOffer.id, ...offerForm }),
        });
        if (!res.ok) throw new Error("Failed to update");
        const updated = await res.json();
        setOffers((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      } else {
        const res = await fetch("/api/offers", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(offerForm),
        });
        if (!res.ok) throw new Error("Failed to create");
        const newOffer = await res.json();
        setOffers((prev) => [newOffer, ...prev]);
      }
      setShowOfferForm(false);
      setEditingOffer(null);
      setOfferForm({ name: "", description: "", type: "PERCENTAGE", value: "", code: "", image: "", startDate: "", endDate: "", usageLimit: "", productId: "" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save offer");
    } finally {
      setSavingOffer(false);
    }
  };

  const toggleOfferActive = async (offer: Offer) => {
    await fetch("/api/offers", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: offer.id, isActive: !offer.isActive }),
    });
    setOffers((prev) => prev.map((o) => o.id === offer.id ? { ...o, isActive: !o.isActive } : o));
  };

  const deleteOffer = async (id: string) => {
    if (!confirm("Delete this offer?")) return;
    await fetch(`/api/offers?id=${id}`, { method: "DELETE" });
    setOffers((prev) => prev.filter((o) => o.id !== id));
  };

  // ── Package Actions ───────────────────────────────────────────────────────
  const openEditPackage = (pkg: Pkg) => {
    setEditingPackage(pkg);
    setPackageForm({
      name: pkg.name,
      description: pkg.description ?? "",
      price: String(pkg.price),
      image: pkg.image ?? "",
      items: pkg.items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
    });
    setShowPackageForm(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPackage(true);
    try {
      if (editingPackage) {
        const res = await fetch("/api/packages", {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingPackage.id, ...packageForm }),
        });
        if (!res.ok) throw new Error("Failed to update");
        const updated = await res.json();
        setPackages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const res = await fetch("/api/packages", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(packageForm),
        });
        if (!res.ok) throw new Error("Failed to create");
        const newPkg = await res.json();
        setPackages((prev) => [newPkg, ...prev]);
      }
      setShowPackageForm(false);
      setEditingPackage(null);
      setPackageForm({ name: "", description: "", price: "", image: "", items: [] });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save package");
    } finally {
      setSavingPackage(false);
    }
  };

  const togglePackageActive = async (pkg: Pkg) => {
    await fetch("/api/packages", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: pkg.id, isActive: !pkg.isActive }),
    });
    setPackages((prev) => prev.map((p) => p.id === pkg.id ? { ...p, isActive: !p.isActive } : p));
  };

  const deletePackage = async (id: string) => {
    if (!confirm("Delete this package?")) return;
    await fetch(`/api/packages?id=${id}`, { method: "DELETE" });
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  const addPackageItem = () => {
    setPackageForm((prev) => ({ ...prev, items: [...prev.items, { productId: "", quantity: 1 }] }));
  };

  const removePackageItem = (index: number) => {
    setPackageForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  // ── Auth Guard ────────────────────────────────────────────────────────────
  if (!isTestMode && (authLoading || loading)) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  // In test mode, show loading until data is ready
  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading admin...</div>;
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link href="/" className="text-orange-600 hover:underline text-sm">← Back to Site</Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "bg-blue-100 text-blue-600" },
          { label: "Revenue", value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: "bg-green-100 text-green-600" },
          { label: "Active Subscriptions", value: stats.activeSubscriptions, icon: Calendar, color: "bg-purple-100 text-purple-600" },
          { label: "Customers", value: stats.totalCustomers, icon: Users, color: "bg-orange-100 text-orange-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-gray-500 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {([
          { key: "orders", label: "Orders", icon: ShoppingBag, count: orders.length },
          { key: "menu", label: "Menu", icon: UtensilsCrossed, count: products.length },
          { key: "offers", label: "Offers", icon: Tag, count: offers.length },
          { key: "packages", label: "Packages", icon: Gift, count: packages.length },
        ] as { key: Tab; label: string; icon: typeof ShoppingBag; count: number }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition whitespace-nowrap ${
              tab === t.key ? "bg-orange-600 text-white" : "bg-white border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <t.icon className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ORDERS TAB
          ══════════════════════════════════════════════════════════════════════ */}
      {tab === "orders" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b"><h2 className="font-bold text-lg">Recent Orders</h2></div>
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
                        {order.items.map((i) => `${i.quantity}× ${i.product.name}`).join(", ")}
                      </td>
                      <td className="p-4"><span className="text-xs bg-gray-100 px-2 py-1 rounded">{order.type}</span></td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 font-bold">{formatCurrency(order.total)}</td>
                      <td className="p-4 text-gray-400 text-xs">{formatDateTime(order.createdAt)}</td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
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

      {/* ══════════════════════════════════════════════════════════════════════
          MENU TAB
          ══════════════════════════════════════════════════════════════════════ */}
      {tab === "menu" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-500 text-sm">{products.length} products</p>
            <button
              onClick={() => { setEditingProduct(null); setProductForm({ name: "", description: "", price: "", category: "FAST_FOOD", preparationTime: "", isFeatured: false, unit: "", image: "" }); setShowProductForm(true); }}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-orange-700 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          {/* Product Form Modal */}
          {showProductForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
                  <button onClick={() => { setShowProductForm(false); setEditingProduct(null); }} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name *</label>
                    <input type="text" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm h-20 resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Price (UGX) *</label>
                      <input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm" required min="0" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category *</label>
                      <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm">
                        {CATEGORIES.map((c) => (<option key={c} value={c}>{categoryLabels[c]}</option>))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Prep Time (mins)</label>
                      <input type="number" value={productForm.preparationTime} onChange={(e) => setProductForm({ ...productForm, preparationTime: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm" min="0" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Unit (e.g. kg, piece)</label>
                      <input type="text" value={productForm.unit} onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm" />
                    </div>
                  </div>
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Image</label>
                    <div className="flex items-center gap-3">
                      {productForm.image && (
                        <img src={productForm.image} alt="Preview" className="w-16 h-16 rounded-lg object-cover border" />
                      )}
                      <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 transition text-sm text-gray-500">
                        <Upload className="w-4 h-4" />
                        {uploadingImage ? "Uploading..." : "Upload Image"}
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => setProductForm({ ...productForm, image: url }))} className="hidden" />
                      </label>
                    </div>
                    <input type="url" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} className="w-full p-2 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs" placeholder="Or paste image URL..." />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={productForm.isFeatured} onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })} className="w-4 h-4 accent-orange-600" />
                    <span className="text-sm">Mark as Featured</span>
                  </label>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => { setShowProductForm(false); setEditingProduct(null); }} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                    <button type="submit" disabled={savingProduct} className="flex-1 bg-orange-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-700 transition disabled:opacity-50">
                      {savingProduct ? "Saving..." : editingProduct ? "Update Product" : "Save Product"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Products Table */}
          {products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">No products yet.</p>
              <button onClick={() => setShowProductForm(true)} className="bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-orange-700 transition">Add First Product</button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-600">Image</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Name</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Category</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Price</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Featured</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <p className="font-medium">{product.name}</p>
                          {product.description && <p className="text-gray-400 text-xs truncate max-w-[200px]">{product.description}</p>}
                        </td>
                        <td className="p-4">
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">{categoryLabels[product.category] ?? product.category}</span>
                        </td>
                        <td className="p-4 font-semibold">{formatCurrency(product.price)}</td>
                        <td className="p-4">
                          {product.isFeatured ? (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">⭐ Featured</span>
                          ) : (<span className="text-gray-400 text-xs">—</span>)}
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded font-medium ${product.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {product.isAvailable ? "Available" : "Unavailable"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditProduct(product)} className="p-1.5 hover:bg-gray-100 rounded transition" title="Edit">
                              <Pencil className="w-4 h-4 text-gray-500" />
                            </button>
                            <button onClick={() => toggleProductAvailability(product)} className="p-1.5 hover:bg-gray-100 rounded transition" title={product.isAvailable ? "Disable" : "Enable"}>
                              {product.isAvailable ? <EyeOff className="w-4 h-4 text-orange-500" /> : <Eye className="w-4 h-4 text-green-500" />}
                            </button>
                            <button onClick={() => deleteProduct(product.id)} className="p-1.5 hover:bg-red-50 rounded transition" title="Delete">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
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

      {/* ══════════════════════════════════════════════════════════════════════
          OFFERS TAB
          ══════════════════════════════════════════════════════════════════════ */}
      {tab === "offers" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-500 text-sm">{offers.length} offers</p>
            <button
              onClick={() => { setEditingOffer(null); setOfferForm({ name: "", description: "", type: "PERCENTAGE", value: "", code: "", image: "", startDate: "", endDate: "", usageLimit: "", productId: "" }); setShowOfferForm(true); }}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-orange-700 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Offer
            </button>
          </div>

          {/* Offer Form Modal */}
          {showOfferForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">{editingOffer ? "Edit Offer" : "Add New Offer"}</h3>
                  <button onClick={() => { setShowOfferForm(false); setEditingOffer(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSaveOffer} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Offer Name *</label>
                    <input type="text" value={offerForm.name} onChange={(e) => setOfferForm({ ...offerForm, name: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea value={offerForm.description} onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm h-20 resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Discount Type *</label>
                      <select value={offerForm.type} onChange={(e) => setOfferForm({ ...offerForm, type: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm">
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FIXED_AMOUNT">Fixed Amount (UGX)</option>
                        <option value="BUY_ONE_GET_ONE">Buy One Get One</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Value *</label>
                      <input type="number" value={offerForm.value} onChange={(e) => setOfferForm({ ...offerForm, value: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm" required min="0" placeholder={offerForm.type === "PERCENTAGE" ? "e.g. 10" : "e.g. 5000"} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Promo Code</label>
                      <input type="text" value={offerForm.code} onChange={(e) => setOfferForm({ ...offerForm, code: e.target.value.toUpperCase() })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm" placeholder="e.g. SAVE20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Usage Limit</label>
                      <input type="number" value={offerForm.usageLimit} onChange={(e) => setOfferForm({ ...offerForm, usageLimit: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm" min="0" placeholder="Unlimited" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Start Date</label>
                      <input type="date" value={offerForm.startDate} onChange={(e) => setOfferForm({ ...offerForm, startDate: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">End Date</label>
                      <input type="date" value={offerForm.endDate} onChange={(e) => setOfferForm({ ...offerForm, endDate: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Apply to Product (optional)</label>
                    <select value={offerForm.productId} onChange={(e) => setOfferForm({ ...offerForm, productId: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm">
                      <option value="">All Products</option>
                      {products.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </select>
                  </div>
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Offer Image</label>
                    <div className="flex items-center gap-3">
                      {offerForm.image && <img src={offerForm.image} alt="Preview" className="w-16 h-16 rounded-lg object-cover border" />}
                      <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 transition text-sm text-gray-500">
                        <Upload className="w-4 h-4" />
                        {uploadingImage ? "Uploading..." : "Upload Image"}
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => setOfferForm({ ...offerForm, image: url }))} className="hidden" />
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => { setShowOfferForm(false); setEditingOffer(null); }} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                    <button type="submit" disabled={savingOffer} className="flex-1 bg-orange-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-700 transition disabled:opacity-50">
                      {savingOffer ? "Saving..." : editingOffer ? "Update Offer" : "Save Offer"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Offers Grid */}
          {offers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">No offers yet.</p>
              <button onClick={() => setShowOfferForm(true)} className="bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-orange-700 transition">Create First Offer</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {offers.map((offer) => (
                <div key={offer.id} className={`bg-white rounded-xl shadow-sm border p-5 ${!offer.isActive ? "opacity-60" : ""}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold">{offer.name}</h3>
                      <p className="text-xs text-gray-400">
                        {offer.type === "PERCENTAGE" ? `${offer.value}% off` : offer.type === "FIXED_AMOUNT" ? `${formatCurrency(offer.value)} off` : "Buy 1 Get 1"}
                        {offer.code && <span className="ml-2 bg-gray-100 px-1.5 py-0.5 rounded font-mono">{offer.code}</span>}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${offer.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {offer.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {offer.description && <p className="text-gray-500 text-xs mb-3 line-clamp-2">{offer.description}</p>}
                  {offer.product && <p className="text-xs text-orange-600 mb-2">🏷️ {offer.product.name}</p>}
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <span>Used: {offer.usedCount}{offer.usageLimit ? `/${offer.usageLimit}` : ""}</span>
                    {offer.endDate && <span>Expires: {new Date(offer.endDate).toLocaleDateString()}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditOffer(offer)} className="p-1.5 hover:bg-gray-100 rounded transition" title="Edit"><Pencil className="w-4 h-4 text-gray-500" /></button>
                    <button onClick={() => toggleOfferActive(offer)} className="p-1.5 hover:bg-gray-100 rounded transition" title={offer.isActive ? "Deactivate" : "Activate"}>
                      {offer.isActive ? <EyeOff className="w-4 h-4 text-orange-500" /> : <Eye className="w-4 h-4 text-green-500" />}
                    </button>
                    <button onClick={() => deleteOffer(offer.id)} className="p-1.5 hover:bg-red-50 rounded transition" title="Delete"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PACKAGES TAB
          ══════════════════════════════════════════════════════════════════════ */}
      {tab === "packages" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-500 text-sm">{packages.length} packages</p>
            <button
              onClick={() => { setEditingPackage(null); setPackageForm({ name: "", description: "", price: "", image: "", items: [] }); setShowPackageForm(true); }}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-orange-700 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Package
            </button>
          </div>

          {/* Package Form Modal */}
          {showPackageForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">{editingPackage ? "Edit Package" : "Add New Package"}</h3>
                  <button onClick={() => { setShowPackageForm(false); setEditingPackage(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSavePackage} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Package Name *</label>
                    <input type="text" value={packageForm.name} onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea value={packageForm.description} onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm h-20 resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Bundle Price (UGX) *</label>
                    <input type="number" value={packageForm.price} onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm" required min="0" />
                  </div>
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Package Image</label>
                    <div className="flex items-center gap-3">
                      {packageForm.image && <img src={packageForm.image} alt="Preview" className="w-16 h-16 rounded-lg object-cover border" />}
                      <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 transition text-sm text-gray-500">
                        <Upload className="w-4 h-4" />
                        {uploadingImage ? "Uploading..." : "Upload Image"}
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => setPackageForm({ ...packageForm, image: url }))} className="hidden" />
                      </label>
                    </div>
                  </div>
                  {/* Package Items */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium">Products in Package</label>
                      <button type="button" onClick={addPackageItem} className="text-orange-600 text-xs font-medium hover:underline">+ Add Item</button>
                    </div>
                    {packageForm.items.length === 0 && (
                      <p className="text-xs text-gray-400 mb-2">No items added yet. Click &quot;+ Add Item&quot; to add products.</p>
                    )}
                    {packageForm.items.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <select
                          value={item.productId}
                          onChange={(e) => {
                            const newItems = [...packageForm.items];
                            newItems[index].productId = e.target.value;
                            setPackageForm({ ...packageForm, items: newItems });
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        >
                          <option value="">Select product...</option>
                          {products.map((p) => (<option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</option>))}
                        </select>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...packageForm.items];
                            newItems[index].quantity = parseInt(e.target.value) || 1;
                            setPackageForm({ ...packageForm, items: newItems });
                          }}
                          className="w-16 p-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          min="1"
                        />
                        <button type="button" onClick={() => removePackageItem(index)} className="p-2 hover:bg-red-50 rounded-lg text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => { setShowPackageForm(false); setEditingPackage(null); }} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                    <button type="submit" disabled={savingPackage} className="flex-1 bg-orange-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-700 transition disabled:opacity-50">
                      {savingPackage ? "Saving..." : editingPackage ? "Update Package" : "Save Package"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Packages Grid */}
          {packages.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">No packages yet.</p>
              <button onClick={() => setShowPackageForm(true)} className="bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-orange-700 transition">Create First Package</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <div key={pkg.id} className={`bg-white rounded-xl shadow-sm border p-5 ${!pkg.isActive ? "opacity-60" : ""}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold">{pkg.name}</h3>
                      <p className="text-orange-600 font-bold text-lg">{formatCurrency(pkg.price)}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${pkg.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {pkg.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {pkg.description && <p className="text-gray-500 text-xs mb-3 line-clamp-2">{pkg.description}</p>}
                  {pkg.items.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Includes:</p>
                      <ul className="text-xs text-gray-500 space-y-0.5">
                        {pkg.items.map((item) => (
                          <li key={item.id}>• {item.quantity}× {item.product.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditPackage(pkg)} className="p-1.5 hover:bg-gray-100 rounded transition" title="Edit"><Pencil className="w-4 h-4 text-gray-500" /></button>
                    <button onClick={() => togglePackageActive(pkg)} className="p-1.5 hover:bg-gray-100 rounded transition" title={pkg.isActive ? "Deactivate" : "Activate"}>
                      {pkg.isActive ? <EyeOff className="w-4 h-4 text-orange-500" /> : <Eye className="w-4 h-4 text-green-500" />}
                    </button>
                    <button onClick={() => deletePackage(pkg.id)} className="p-1.5 hover:bg-red-50 rounded transition" title="Delete"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </div>
                </div>
              ))}
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

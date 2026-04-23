"use client";
import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/store/auth";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ShoppingBag, Star, Share2, Copy, Camera, User } from "lucide-react";

interface OrderItem {
  product: { name: string };
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  type: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  payment: { status: string; method: string } | null;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-yellow-100 text-yellow-700",
  READY: "bg-green-100 text-green-700",
  DELIVERED: "bg-green-200 text-green-800",
  CANCELLED: "bg-red-100 text-red-700",
};

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const newOrder = searchParams.get("order");
  const { user, loading: authLoading, refresh } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "avatars");

      // If existing avatar, try to delete it
      if (user?.avatar) {
        try {
          const url = new URL(user.avatar);
          const path = url.pathname.split("/media/")[1];
          if (path) {
            await fetch(`/api/upload?path=${encodeURIComponent(path)}`, { method: "DELETE" });
          }
        } catch (err) {
          console.warn("Failed to delete old avatar:", err);
        }
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (res.ok) {
        await refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/account");
      return;
    }
    if (user) {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((data) => setOrders(Array.isArray(data) ? data : []))
        .catch(() => setOrders([]))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!user) return null;

  const totalSpent = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {newOrder && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6">
          ✅ Order <strong>#{newOrder}</strong> placed successfully! You&apos;ll
          receive an SMS confirmation shortly.
        </div>
      )}

      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      {/* Stats cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-500 text-sm uppercase mb-3">
            Profile
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-20 h-20 rounded-full object-cover border-2 border-orange-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center border-2 border-orange-200">
                  <User className="w-10 h-10 text-orange-600" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-orange-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-orange-700 transition">
                <Camera className="w-4 h-4" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
            {uploading && (
              <span className="text-sm text-gray-500">Uploading...</span>
            )}
          </div>
          <p className="font-bold text-lg">{user.name}</p>
          <p className="text-gray-500 text-sm">{user.email}</p>
          <p className="text-gray-500 text-sm">{user.phone}</p>
          {user.address && (
            <p className="text-gray-500 text-sm mt-1">{user.address}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">Tap camera icon to change photo</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-500 text-sm uppercase mb-3">
            Stats
          </h2>
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {orders.length}
              </p>
              <p className="text-gray-500 text-xs">Total Orders</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalSpent)}
              </p>
              <p className="text-gray-500 text-xs">Total Spent</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-500 text-sm uppercase mb-3">
            My Member Code
          </h2>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Share this code with members to join:</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-orange-600 tracking-wider">
                {user.referralCode || "Generating..."}
              </span>
              <button
                onClick={() => {
                  if (user.referralCode) {
                    navigator.clipboard.writeText(`${window.location.origin}/register?ref=${user.referralCode}`);
                    alert("Registration link copied!");
                  }
                }}
                className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg"
                title="Copy registration link"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Link: {typeof window !== "undefined" ? window.location.origin : ""}/register?ref={user.referralCode || ""}
            </p>
          </div>
        </div>
       </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-10">
        <h2 className="font-semibold text-gray-500 text-sm uppercase mb-3">
          Quick Actions
        </h2>
        <div className="space-y-2">
          <Link
            href="/menu"
            className="flex items-center gap-2 text-orange-600 hover:underline text-sm font-medium"
          >
            🍔 Browse Menu
          </Link>
          <Link
            href="/subscriptions"
            className="flex items-center gap-2 text-orange-600 hover:underline text-sm font-medium"
          >
            📅 Manage Subscription
          </Link>
          <Link
            href="/cart"
            className="flex items-center gap-2 text-orange-600 hover:underline text-sm font-medium"
          >
            🛒 View Cart
          </Link>
        </div>
      </div>

      {/* Order history */}
      <h2 className="text-2xl font-bold mb-6">Order History</h2>
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No orders yet</p>
          <Link
            href="/menu"
            className="bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition"
          >
            Order Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-lg">Order #{order.orderNumber}</p>
                  <p className="text-gray-400 text-sm">
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    statusColors[order.status] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <p className="text-sm text-gray-500 mb-3">
                {order.items
                  .map((i) => `${i.quantity}× ${i.product.name}`)
                  .join(", ")}
              </p>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    {order.type}
                  </span>
                  {order.payment && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {order.payment.method.replace("_", " ")}
                    </span>
                  )}
                </div>
                <span className="font-bold text-lg">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <AccountContent />
    </Suspense>
  );
}

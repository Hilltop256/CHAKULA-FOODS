"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/store/auth";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  type: string;
  total: number;
  createdAt: string;
  user: { name: string; phone: string };
  items: { product: { name: string }; quantity: number }[];
}

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/account");
    } else if (user) {
      fetch("/api/orders").then((r) => r.json()).then(setOrders).finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-4">Profile</h2>
          <p className="font-medium">{user?.name}</p>
          <p className="text-gray-500">{user?.email}</p>
          <p className="text-gray-500">{user?.phone}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-4">Quick Stats</h2>
          <p>Total Orders: <span className="font-bold text-orange-600">{orders.length}</span></p>
          <p>Total Spent: <span className="font-bold text-orange-600">{formatCurrency(orders.reduce((s, o) => s + o.total, 0))}</span></p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/menu" className="block text-orange-600 hover:underline">Browse Menu</Link>
            <Link href="/subscriptions" className="block text-orange-600 hover:underline">Manage Subscription</Link>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Order History</h2>
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500 mb-4">No orders yet</p>
          <Link href="/menu" className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700">Order Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-bold text-lg">Order #{order.orderNumber}</p>
                  <p className="text-gray-500 text-sm">{formatDateTime(order.createdAt)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === "DELIVERED" ? "bg-green-100 text-green-700" :
                  order.status === "READY" ? "bg-blue-100 text-blue-700" :
                  order.status === "PREPARING" ? "bg-yellow-100 text-yellow-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {order.items.map((i) => `${i.quantity}x ${i.product.name}`).join(", ")}
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <span className="font-bold text-lg">{formatCurrency(order.total)}</span>
                <span className="text-gray-500">{order.type}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/store/auth";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Users, ShoppingBag, Calendar, DollarSign } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  type: string;
  total: number;
  createdAt: string;
  userId: string;
  user: { name: string; phone: string };
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  activeSubscriptions: number;
  totalCustomers: number;
}

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalRevenue: 0, activeSubscriptions: 0, totalCustomers: 0 });
  const [loading, setLoading] = useState(true);
  const [statusUpdate, setStatusUpdate] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/");
    } else if (user?.role === "ADMIN") {
      Promise.all([
        fetch("/api/orders").then((r) => r.json()),
        fetch("/api/subscriptions").then((r) => r.json()),
      ]).then(([ordersData, subsData]) => {
        setOrders(ordersData);
        const activeSubs = subsData.filter((s: { status: string }) => s.status === "ACTIVE").length;
        setStats({
          totalOrders: ordersData.length,
          totalRevenue: ordersData.reduce((s: number, o: Order) => s + o.total, 0),
          activeSubscriptions: activeSubs,
          totalCustomers: new Set(ordersData.map((o: Order) => o.userId)).size + 1,
        });
      }).finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  const updateStatus = async (orderId: string, status: string) => {
    await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  if (authLoading || loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link href="/" className="text-orange-600 hover:underline">← Back to Site</Link>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "bg-blue-100 text-blue-600" },
          { label: "Revenue", value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: "bg-green-100 text-green-600" },
          { label: "Active Subscriptions", value: stats.activeSubscriptions, icon: Calendar, color: "bg-purple-100 text-purple-600" },
          { label: "Customers", value: stats.totalCustomers, icon: Users, color: "bg-orange-100 text-orange-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm">
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4">Order #</th>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Type</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Total</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 20).map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="p-4 font-medium">{order.orderNumber}</td>
                  <td className="p-4">{order.user.name}</td>
                  <td className="p-4">{order.type}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === "DELIVERED" ? "bg-green-100 text-green-700" :
                      order.status === "READY" ? "bg-blue-100 text-blue-700" :
                      order.status === "PREPARING" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 font-bold">{formatCurrency(order.total)}</td>
                  <td className="p-4 text-gray-500 text-sm">{formatDateTime(order.createdAt)}</td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
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
        </div>
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

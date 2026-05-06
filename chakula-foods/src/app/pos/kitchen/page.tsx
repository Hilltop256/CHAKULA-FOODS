"use client";

import { useState, useEffect } from "react";
import { Clock, Printer, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface OrderItem {
  id: string;
  quantity: number;
  product: { name: string };
  notes?: string;
  staffNotes?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  type: string;
  status: string;
  tableNumber?: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "border-yellow-400 bg-yellow-50",
  CONFIRMED: "border-blue-400 bg-blue-50",
  PREPARING: "border-orange-400 bg-orange-50",
  READY: "border-green-400 bg-green-50",
};

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/pos/orders?status=PENDING&limit=100");
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const printTicket = (order: Order) => {
    const printContent = `
      <html>
        <head><title>Kitchen Ticket</title></head>
        <body>
          <h2>Order #${order.orderNumber}</h2>
          <p>Type: ${order.type} ${order.tableNumber ? `- Table ${order.tableNumber}` : ""}</p>
          <hr>
          ${order.items.map(i => `<p>${i.quantity}x ${i.product.name}${i.staffNotes ? ` (${i.staffNotes})` : ""}</p>`).join("")}
          <hr>
          <p><strong>Total: ${formatCurrency(order.total)}</strong></p>
        </body>
      </html>
    `;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <Clock className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p>Loading kitchen display...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-center">Kitchen Display</h1>
        <p className="text-center text-gray-400">{new Date().toLocaleString()}</p>
      </header>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <p className="text-xl">No pending orders</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map(order => (
            <div
              key={order.id}
              className={`rounded-lg border-2 ${STATUS_COLORS[order.status] || "border-gray-600 bg-gray-800"} p-4`}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">#{order.orderNumber}</h3>
                <span className="text-sm px-2 py-1 rounded bg-white/20">{order.type}</span>
              </div>
              
              {order.tableNumber && (
                <p className="text-sm mb-2">Table: {order.tableNumber}</p>
              )}
              
              <div className="space-y-1 mb-3">
                {order.items.map(item => (
                  <div key={item.id} className="text-sm">
                    <span className="font-medium">{item.quantity}x</span> {item.product.name}
                    {item.staffNotes && <span className="text-orange-600"> ({item.staffNotes})</span>}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-white/20">
                <span className="font-bold">{formatCurrency(order.total)}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => printTicket(order)}
                    className="p-1 hover:bg-white/20 rounded"
                    title="Print ticket"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateStatus(order.id, "PREPARING")}
                    className="px-3 py-1 bg-orange-600 rounded text-xs"
                  >
                    Start
                  </button>
                  <button
                    onClick={() => updateStatus(order.id, "READY")}
                    className="px-3 py-1 bg-green-600 rounded text-xs"
                  >
                    Ready
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
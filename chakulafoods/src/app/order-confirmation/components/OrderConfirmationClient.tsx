'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  MapPin,
  Clock,
  ShoppingBag,
  Truck,
  Phone,
  FileText,
  Navigation,
  ChevronRight,
  Package,
  Home,
  Printer,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import TopNav from '@/components/TopNav';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string | null;
  status: string;
  total_amount: number;
  delivery_address: string | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  department: string | null;
}

// Returns estimated delivery time based on status
function getETA(createdAt: string): string {
  const created = new Date(createdAt);
  const eta = new Date(created.getTime() + 45 * 60 * 1000); // 45 min from order
  return eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export default function OrderConfirmationClient() {
  const { user, profile } = useAuth();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const orderId = searchParams.get('id');

  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber && !orderId) {
      setLoading(false);
      return;
    }
    const fetchOrder = async () => {
      const supabase = createClient();
      let query = supabase
        .from('orders')
        .select('id, order_number, customer_name, customer_phone, status, total_amount, delivery_address, payment_method, notes, created_at, department');

      if (orderId) {
        query = query.eq('id', orderId);
      } else if (orderNumber) {
        query = query.eq('order_number', orderNumber);
      }

      const { data, error } = await query.single();
      if (!error && data) {
        setOrder(data);
        // Fetch order items
        const { data: items } = await supabase
          .from('order_items')
          .select('id, product_name, quantity, unit_price')
          .eq('order_id', data.id);
        if (items) setOrderItems(items);
      }
      setLoading(false);
    };
    fetchOrder();
  }, [orderNumber, orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav isLoggedIn={!!user} userName={profile?.full_name || ''} userRole={profile?.role as any} />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav isLoggedIn={!!user} userName={profile?.full_name || ''} userRole={profile?.role as any} />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <Package size={48} className="text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Order not found</h2>
          <p className="text-muted-foreground mb-6">We couldn't find the order details. Please check your order history.</p>
          <Link href="/" className="btn-primary px-8 py-3 font-bold inline-block">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const displayTotal = order.total_amount || subtotal;

  return (
    <div className="min-h-screen bg-background">
      <TopNav isLoggedIn={!!user} userName={profile?.full_name || user?.email} userRole={profile?.role as any} />

      <div className="max-w-2xl mx-auto px-4 py-8 lg:py-12">

        {/* Success Hero */}
        <div className="text-center mb-8">
          <div className="relative inline-flex mb-5">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle size={48} className="text-green-600" />
            </div>
            <span className="absolute -top-1 -right-1 text-2xl">🎉</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground text-base">
            Thank you, <span className="font-semibold text-foreground">{order.customer_name.split(' ')[0]}</span>! Your order is being prepared.
          </p>
        </div>

        {/* Order Number Banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl px-6 py-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Order Number</p>
            <p className="text-xl font-extrabold text-primary font-mono mt-0.5">#{order.order_number}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Placed On</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">{formatDate(order.created_at)}</p>
          </div>
        </div>

        {/* ETA Card */}
        <div className="bg-secondary/10 border border-secondary/25 rounded-2xl px-6 py-4 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
            <Clock size={24} className="text-secondary" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estimated Delivery</p>
            <p className="text-2xl font-extrabold text-secondary mt-0.5">{getETA(order.created_at)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Approximately 30–45 minutes from now</p>
          </div>
          <Truck size={28} className="text-secondary/40 shrink-0" />
        </div>

        {/* Receipt Card */}
        <div className="card-base p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              <h2 className="font-bold text-foreground">Receipt</h2>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <Printer size={13} />
              Print
            </button>
          </div>

          {/* Items */}
          {orderItems.length > 0 ? (
            <div className="space-y-3 mb-4">
              {orderItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                      {item.quantity}
                    </span>
                    <p className="text-sm text-foreground truncate">{item.product_name}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground tabular-nums shrink-0">
                    UGX {(item.unit_price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-3 mb-4">
              <p className="text-sm text-muted-foreground">Order items loading…</p>
            </div>
          )}

          {/* Totals */}
          <div className="border-t border-border pt-3 space-y-2">
            {orderItems.length > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tabular-nums">UGX {subtotal.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="text-green-600 font-semibold text-xs">Calculated on arrival</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-1 border-t border-border">
              <span className="text-foreground">Total</span>
              <span className="text-primary tabular-nums">UGX {displayTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="card-base p-6 mb-6 space-y-4">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <MapPin size={18} className="text-primary" />
            Delivery Details
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {order.delivery_address && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                <Navigation size={15} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Delivering to</p>
                  <p className="text-sm text-foreground">{order.delivery_address}</p>
                </div>
              </div>
            )}

            {order.customer_phone && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                <Phone size={15} className="text-primary shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Contact</p>
                  <p className="text-sm text-foreground">{order.customer_phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
              <Truck size={15} className="text-primary shrink-0" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Payment</p>
                <p className="text-sm text-foreground capitalize">
                  {order.payment_method?.replace(/_/g, ' ') || 'Cash on Delivery'}
                </p>
              </div>
            </div>

            {order.notes && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                <FileText size={15} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Notes</p>
                  <p className="text-sm text-foreground">{order.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Link
            href={`/order-tracking?order_id=${order.id}`}
            className="btn-primary w-full py-4 font-bold text-base flex items-center justify-center gap-2"
          >
            <Navigation size={18} />
            Track My Order
            <ChevronRight size={16} />
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-sm font-semibold text-foreground"
            >
              <Home size={16} />
              Continue Shopping
            </Link>
            <Link
              href="/order-tracking"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-sm font-semibold text-foreground"
            >
              <ShoppingBag size={16} />
              All Orders
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          Questions? Call us at <span className="font-semibold text-foreground">+256 700 000 000</span> or visit our store in Naalya, Kampala.
        </p>
      </div>
    </div>
  );
}

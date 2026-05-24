'use client';

import React, { useState, useEffect } from 'react';
import { Search, Clock, MapPin, Phone } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string | null;
  department: string | null;
  items_count?: number;
  total_amount: number;
  status: string;
  delivery_address: string | null;
  created_at: string;
  scheduled_at: string | null;
}

const statusOptions = ['All', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

const statusLabel: Record<string, string> = {
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    preparing: 'badge-preparing',
    confirmed: 'badge-pending',
    out_for_delivery: 'badge-active',
    delivered: 'badge-delivered',
    cancelled: 'badge-cancelled',
  };
  return map[status] || 'badge-pending';
};

const nextStatus: Record<string, string> = {
  confirmed: 'preparing',
  preparing: 'out_for_delivery',
  out_for_delivery: 'delivered',
};

export default function AdminOrders() {
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, customer_phone, department, total_amount, status, delivery_address, created_at, scheduled_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.log('Orders fetch error:', error.message);
      } else {
        setOrderList(data || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Real-time subscription
    const channel = supabase
      .channel('admin_orders_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrderList((prev) => [payload.new as Order, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setOrderList((prev) =>
              prev.map((o) => (o.id === payload.new.id ? (payload.new as Order) : o))
            );
          } else if (payload.eventType === 'DELETE') {
            setOrderList((prev) => prev.filter((o) => o.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = orderList.filter((o) => {
    const matchSearch =
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.order_number?.includes(search);
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAdvanceStatus = async (id: string, currentStatus: string) => {
    const next = nextStatus[currentStatus];
    if (!next) return;
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: next })
        .eq('id', id);
      if (error) {
        toast.error('Failed to update order status');
      } else {
        toast.success(`Order moved to ${statusLabel[next]}`);
      }
    } catch {
      toast.error('Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-screen-2xl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`skel-${i}`} className="card-base p-3 animate-pulse">
              <div className="h-8 bg-muted rounded mb-1" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-screen-2xl">
      {/* Status pipeline summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map((s) => {
          const count = orderList.filter((o) => o.status === s).length;
          return (
            <button
              key={`pipeline-${s}`}
              onClick={() => setStatusFilter(statusFilter === s ? 'All' : s)}
              className={`card-base p-3 text-left transition-all ${
                statusFilter === s ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
              }`}
            >
              <p className="text-2xl font-bold text-foreground tabular-nums">{count}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{statusLabel[s]}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 w-60 h-9 text-sm"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statusOptions.map((s) => (
            <button
              key={`filter-${s}`}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {s === 'All' ? 'All' : statusLabel[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Orders table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                {['Order ID', 'Customer', 'Department', 'Total', 'Status', 'Scheduled', 'Actions'].map((h) => (
                  <th key={`oh-${h}`} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((order) => (
                <React.Fragment key={order.id}>
                  <tr
                    className="hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  >
                    <td className="px-5 py-3 text-sm font-mono font-semibold text-primary">
                      #{order.order_number}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground">{order.customer_name}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{order.department || '—'}</td>
                    <td className="px-5 py-3 text-sm font-bold text-foreground tabular-nums">
                      UGX {order.total_amount?.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className={statusBadge(order.status)}>{statusLabel[order.status] || order.status}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {order.scheduled_at ? (
                        <span className="flex items-center gap-1 text-secondary font-medium">
                          <Clock size={11} />
                          {new Date(order.scheduled_at).toLocaleDateString('en-GB')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {nextStatus[order.status] && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAdvanceStatus(order.id, order.status); }}
                          className="text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1 rounded-lg transition-colors whitespace-nowrap"
                        >
                          → {statusLabel[nextStatus[order.status]]}
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedId === order.id && (
                    <tr className="bg-muted/20">
                      <td colSpan={7} className="px-5 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-start gap-2">
                            <MapPin size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Delivery Address</p>
                              <p className="text-foreground font-medium">{order.delivery_address || '—'}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Phone size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Phone</p>
                              <p className="text-foreground font-medium">{order.customer_phone || '—'}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Clock size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Order Placed</p>
                              <p className="text-foreground font-medium">
                                {new Date(order.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
          <span className="text-sm text-muted-foreground">
            {filtered.length} order{filtered.length !== 1 ? 's' : ''} shown
          </span>
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
            Live updates
          </span>
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { Search, Clock, MapPin, Phone } from 'lucide-react';

// Backend integration point: replace with GET /api/orders
const orders = [
  { id: 'ord-2847', customer: 'Amara Nakato', phone: '+256 772 345 678', dept: 'Restaurant', items: 3, total: 46000, status: 'Preparing', address: 'Naalya Estate, Plot 14', time: '2026-05-18T08:42:00', scheduled: null },
  { id: 'ord-2846', customer: 'Julius Ssebunya', phone: '+256 700 123 456', dept: 'Confectionary', items: 1, total: 85000, status: 'Confirmed', address: 'Kiwatule Road, Apt 3B', time: '2026-05-18T08:28:00', scheduled: '2026-05-19T10:00:00' },
  { id: 'ord-2845', customer: 'Grace Achieng', phone: '+256 752 987 654', dept: 'Juice Bar', items: 2, total: 19000, status: 'Out for Delivery', address: 'Kyaliwajjala, Green Park', time: '2026-05-18T08:15:00', scheduled: null },
  { id: 'ord-2844', customer: 'Robert Kato', phone: '+256 701 234 567', dept: 'Wine & Liquor', items: 2, total: 210000, status: 'Delivered', address: 'Bukoto, Spring Road', time: '2026-05-18T07:55:00', scheduled: null },
  { id: 'ord-2843', customer: 'Fatuma Namutebi', phone: '+256 788 456 123', dept: 'Market Specials', items: 5, total: 62000, status: 'Cancelled', address: 'Namugongo, Sunrise Rd', time: '2026-05-18T07:30:00', scheduled: null },
  { id: 'ord-2842', customer: 'David Okello', phone: '+256 776 321 654', dept: 'Restaurant', items: 2, total: 32000, status: 'Delivered', address: 'Naalya, Block C', time: '2026-05-18T07:10:00', scheduled: null },
  { id: 'ord-2841', customer: 'Esther Namukasa', phone: '+256 703 654 321', dept: 'Confectionary', items: 1, total: 120000, status: 'Confirmed', address: 'Ntinda, Church Road', time: '2026-05-17T20:45:00', scheduled: '2026-05-20T09:00:00' },
];

const statusOptions = ['All', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Preparing: 'badge-preparing',
    Confirmed: 'badge-pending',
    'Out for Delivery': 'badge-active',
    Delivered: 'badge-delivered',
    Cancelled: 'badge-cancelled',
  };
  return map[status] || 'badge-pending';
};

const nextStatus: Record<string, string> = {
  Confirmed: 'Preparing',
  Preparing: 'Out for Delivery',
  'Out for Delivery': 'Delivered',
};

export default function AdminOrders() {
  const [orderList, setOrderList] = useState(orders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = orderList.filter((o) => {
    const matchSearch =
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.includes(search);
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAdvanceStatus = (id: string, currentStatus: string) => {
    const next = nextStatus[currentStatus];
    if (!next) return;
    // Backend integration point: PATCH /api/orders/:id { status: next }
    setOrderList((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: next } : o))
    );
  };

  return (
    <div className="space-y-4 max-w-screen-2xl">
      {/* Status pipeline summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map((s) => {
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
              <p className="text-xs text-muted-foreground mt-0.5">{s}</p>
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
              {s}
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
                {['Order ID', 'Customer', 'Department', 'Items', 'Total', 'Status', 'Scheduled', 'Actions'].map((h) => (
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
                      #{order.id}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground">{order.customer}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{order.dept}</td>
                    <td className="px-5 py-3 text-sm text-foreground tabular-nums">{order.items}</td>
                    <td className="px-5 py-3 text-sm font-bold text-foreground tabular-nums">
                      UGX {order.total.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className={statusBadge(order.status)}>{order.status}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {order.scheduled ? (
                        <span className="flex items-center gap-1 text-secondary font-medium">
                          <Clock size={11} />
                          {new Date(order.scheduled).toLocaleDateString('en-GB')}
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
                          → {nextStatus[order.status]}
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedId === order.id && (
                    <tr className="bg-muted/20">
                      <td colSpan={8} className="px-5 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-start gap-2">
                            <MapPin size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Delivery Address</p>
                              <p className="text-foreground font-medium">{order.address}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Phone size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Phone</p>
                              <p className="text-foreground font-medium">{order.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Clock size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Order Placed</p>
                              <p className="text-foreground font-medium">
                                {new Date(order.time).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
          <span className="text-sm text-muted-foreground">
            {filtered.length} order{filtered.length !== 1 ? 's' : ''} shown
          </span>
        </div>
      </div>
    </div>
  );
}
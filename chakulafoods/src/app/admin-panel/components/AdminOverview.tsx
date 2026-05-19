'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ShoppingBag, TrendingUp, Users, Package, AlertTriangle, Clock,  } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const OrdersChart = dynamic(() => import('./OrdersChart'), { ssr: false });
const DepartmentChart = dynamic(() => import('./DepartmentChart'), { ssr: false });

const stats = [
  {
    id: 'stat-orders-today',
    label: "Today\'s Orders",
    value: '47',
    change: '+12 vs yesterday',
    trend: 'up',
    icon: ShoppingBag,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    id: 'stat-revenue',
    label: 'Revenue Today',
    value: 'UGX 1,284,500',
    change: '+8.3% vs yesterday',
    trend: 'up',
    icon: TrendingUp,
    color: 'text-secondary',
    bg: 'bg-secondary/10',
  },
  {
    id: 'stat-pending',
    label: 'Pending Deliveries',
    value: '7',
    change: '3 delayed',
    trend: 'warning',
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    id: 'stat-active-products',
    label: 'Active Products',
    value: '172',
    change: '4 out of stock',
    trend: 'warning',
    icon: Package,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    id: 'stat-customers',
    label: 'Total Customers',
    value: '1,842',
    change: '+23 this week',
    trend: 'up',
    icon: Users,
    color: 'text-secondary',
    bg: 'bg-secondary/10',
  },
];

const recentOrders = [
  { id: 'ord-2847', customer: 'Amara Nakato', dept: 'Restaurant', total: 28000, status: 'Preparing', time: '14 min ago' },
  { id: 'ord-2846', customer: 'Julius Ssebunya', dept: 'Confectionary', total: 85000, status: 'Confirmed', time: '28 min ago' },
  { id: 'ord-2845', customer: 'Grace Achieng', dept: 'Juice Bar', total: 19000, status: 'Out for Delivery', time: '41 min ago' },
  { id: 'ord-2844', customer: 'Robert Kato', dept: 'Wine & Liquor', total: 145000, status: 'Delivered', time: '1h ago' },
  { id: 'ord-2843', customer: 'Fatuma Namutebi', dept: 'Market Specials', total: 62000, status: 'Cancelled', time: '2h ago' },
];

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

export default function AdminOverview() {
  return (
    <div className="space-y-6 max-w-screen-2xl">
      {/* KPI cards — 5 cards: 3+2 layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className={`card-base p-5 ${stat.trend === 'warning' ? 'border-amber-200 bg-amber-50/50' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <Icon size={18} className={stat.color} />
                </div>
                {stat.trend === 'warning' && (
                  <AlertTriangle size={14} className="text-amber-500" />
                )}
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
              <p
                className={`text-xs mt-1 font-medium ${
                  stat.trend === 'up' ?'text-green-600'
                    : stat.trend === 'warning' ?'text-amber-600' :'text-muted-foreground'
                }`}
              >
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 card-base p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-foreground">Daily Order Volume</h3>
              <p className="text-xs text-muted-foreground">Last 14 days across all departments</p>
            </div>
            <span className="text-xs bg-primary/10 text-primary font-semibold px-3 py-1 rounded-full">
              Live
            </span>
          </div>
          <OrdersChart />
        </div>
        <div className="card-base p-5">
          <div className="mb-4">
            <h3 className="font-bold text-foreground">Orders by Department</h3>
            <p className="text-xs text-muted-foreground">This week's distribution</p>
          </div>
          <DepartmentChart />
        </div>
      </div>

      {/* Recent orders */}
      <div className="card-base overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-foreground">Recent Orders</h3>
          <button className="text-sm font-semibold text-primary hover:underline">View all →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {['Order ID', 'Customer', 'Department', 'Total', 'Status', 'Time'].map((h) => (
                  <th key={`rh-${h}`} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 text-sm font-mono font-semibold text-primary">
                    #{order.id}
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{order.customer}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{order.dept}</td>
                  <td className="px-5 py-3 text-sm font-bold text-foreground tabular-nums">
                    UGX {order.total.toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <span className={statusBadge(order.status)}>{order.status}</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground flex items-center gap-1">
                    <Clock size={11} />
                    {order.time}
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
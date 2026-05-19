'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ShoppingBag, TrendingUp, Users, Package, AlertTriangle, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';


const OrdersChart = dynamic(() => import('./OrdersChart'), { ssr: false });
const DepartmentChart = dynamic(() => import('./DepartmentChart'), { ssr: false });

interface OverviewStats {
  ordersToday: number;
  revenueToday: number;
  pendingDeliveries: number;
  activeProducts: number;
  totalCustomers: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  department: string | null;
  total_amount: number;
  status: string;
  created_at: string;
}

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

const statusLabel: Record<string, string> = {
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<OverviewStats>({
    ordersToday: 0,
    revenueToday: 0,
    pendingDeliveries: 0,
    activeProducts: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [ordersRes, productsRes, customersRes, recentRes] = await Promise.all([
          supabase
            .from('orders')
            .select('id, total_amount, status, created_at')
            .gte('created_at', todayStart.toISOString()),
          supabase
            .from('products')
            .select('id, available', { count: 'exact' })
            .eq('available', true),
          supabase
            .from('user_profiles')
            .select('id', { count: 'exact' })
            .eq('role', 'customer'),
          supabase
            .from('orders')
            .select('id, order_number, customer_name, department, total_amount, status, created_at')
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        const todayOrders = ordersRes.data || [];
        const revenueToday = todayOrders
          .filter((o) => o.status !== 'cancelled')
          .reduce((sum, o) => sum + (o.total_amount || 0), 0);
        const pendingDeliveries = todayOrders.filter(
          (o) => o.status === 'confirmed' || o.status === 'preparing' || o.status === 'out_for_delivery'
        ).length;

        setStats({
          ordersToday: todayOrders.length,
          revenueToday,
          pendingDeliveries,
          activeProducts: productsRes.count || 0,
          totalCustomers: customersRes.count || 0,
        });

        setRecentOrders(recentRes.data || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Real-time: refresh stats when orders change
    const channel = supabase
      .channel('overview_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statCards = [
    {
      id: 'stat-orders-today',
      label: "Today\'s Orders",
      value: loading ? '—' : String(stats.ordersToday),
      change: 'Live count',
      trend: 'up',
      icon: ShoppingBag,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      id: 'stat-revenue',
      label: 'Revenue Today',
      value: loading ? '—' : `UGX ${stats.revenueToday.toLocaleString()}`,
      change: 'Confirmed orders only',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
    {
      id: 'stat-pending',
      label: 'Pending Deliveries',
      value: loading ? '—' : String(stats.pendingDeliveries),
      change: 'Active today',
      trend: 'warning',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      id: 'stat-active-products',
      label: 'Active Products',
      value: loading ? '—' : String(stats.activeProducts),
      change: 'Available now',
      trend: 'up',
      icon: Package,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      id: 'stat-customers',
      label: 'Total Customers',
      value: loading ? '—' : stats.totalCustomers.toLocaleString(),
      change: 'Registered accounts',
      trend: 'up',
      icon: Users,
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
  ];

  return (
    <div className="space-y-6 max-w-screen-2xl">
      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5 gap-4">
        {statCards.map((stat) => {
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
                {stat.trend === 'warning' && <AlertTriangle size={14} className="text-amber-500" />}
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
            <p className="text-xs text-muted-foreground">This week&apos;s distribution</p>
          </div>
          <DepartmentChart />
        </div>
      </div>

      {/* Recent orders */}
      <div className="card-base overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-foreground">Recent Orders</h3>
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
            Live
          </span>
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
                  <td className="px-5 py-3 text-xs text-muted-foreground flex items-center gap-1">
                    <Clock size={11} />
                    {timeAgo(order.created_at)}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No orders yet today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
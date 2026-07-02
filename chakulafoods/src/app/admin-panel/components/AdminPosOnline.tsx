'use client';

import React, { useEffect, useState } from 'react';
import { Monitor, Search, ShoppingBag, WalletCards } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface PosOnlineRecord {
  order_number: string;
  customer_name: string;
  department: string;
  total: number;
}

export default function AdminPosOnline() {
  const [records, setRecords] = useState<PosOnlineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const supabase = createClient();

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('pos_online')
        .select('order_number, customer_name, department, total')
        .order('order_number', { ascending: false });

      if (error) {
        console.error('POS Online fetch error:', error.message);
      } else {
        setRecords(data || []);
      }
    } catch (error) {
      console.error('POS Online fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();

    const channel = supabase
      .channel('admin_pos_online_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pos_online' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const inserted = payload.new as PosOnlineRecord;
            setRecords((current) => [
              inserted,
              ...current.filter((record) => record.order_number !== inserted.order_number),
            ]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as PosOnlineRecord;
            setRecords((current) =>
              current.map((record) =>
                record.order_number === updated.order_number ? updated : record
              )
            );
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as PosOnlineRecord;
            setRecords((current) =>
              current.filter((record) => record.order_number !== deleted.order_number)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const departments = Array.from(
    new Set(records.map((record) => record.department).filter(Boolean))
  ).sort();

  const filteredRecords = records.filter((record) => {
    const searchTerm = search.toLowerCase().trim();
    const matchesSearch =
      !searchTerm ||
      record.order_number.toLowerCase().includes(searchTerm) ||
      record.customer_name.toLowerCase().includes(searchTerm);
    const matchesDepartment =
      departmentFilter === 'All' || record.department === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  const totalSales = records.reduce((sum, record) => sum + (record.total || 0), 0);

  if (loading) {
    return (
      <div className="space-y-4 max-w-screen-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`pos-skeleton-${index}`} className="card-base p-4 animate-pulse">
              <div className="h-8 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-screen-2xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-base p-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{records.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Completed online orders</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShoppingBag size={20} className="text-primary" />
          </div>
        </div>

        <div className="card-base p-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              UGX {totalSales.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Total online sales</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <WalletCards size={20} className="text-green-700" />
          </div>
        </div>

        <div className="card-base p-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{departments.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Departments represented</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Monitor size={20} className="text-secondary" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search order or customer..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="input-field pl-9 w-64 h-9 text-sm"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {['All', ...departments].map((department) => (
            <button
              key={`pos-department-${department}`}
              onClick={() => setDepartmentFilter(department)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                departmentFilter === department
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {department}
            </button>
          ))}
        </div>
      </div>

      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                {['Order Number', 'Customer Name', 'Department', 'Total'].map((heading) => (
                  <th
                    key={`pos-heading-${heading}`}
                    className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRecords.map((record) => (
                <tr
                  key={record.order_number}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-5 py-3 text-sm font-mono font-semibold text-primary">
                    #{record.order_number}
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-foreground">
                    {record.customer_name}
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {record.department}
                  </td>
                  <td className="px-5 py-3 text-sm font-bold text-foreground tabular-nums">
                    UGX {record.total.toLocaleString()}
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    No completed online orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
          <span className="text-sm text-muted-foreground">
            {filteredRecords.length} order{filteredRecords.length !== 1 ? 's' : ''} shown
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

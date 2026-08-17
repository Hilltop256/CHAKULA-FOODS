"use client";

import React, { useEffect, useState } from "react";
import {
  Monitor,
  Package,
  Search,
  ShoppingBag,
  WalletCards,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface PosOrderItem {
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  selected_options?: Array<{ group_name: string; option_name: string; additional_price: number }>;
}

interface PosOnlineRecord {
  order_number: string;
  customer_name: string;
  department: string;
  items: PosOrderItem[] | null;
  items_count: number;
  total: number;
  created_at: string;
}

export default function AdminPosOnline() {
  const [records, setRecords] = useState<PosOnlineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const supabase = createClient();

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from("pos_online")
        .select(
          "order_number, customer_name, department, items, items_count, total, created_at",
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("POS Online fetch error:", error.message);
      } else {
        setRecords(data || []);
      }
    } catch (error) {
      console.error("POS Online fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();

    const channel = supabase
      .channel("admin_pos_online_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pos_online" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const inserted = payload.new as PosOnlineRecord;
            setRecords((current) => [
              inserted,
              ...current.filter(
                (record) => record.order_number !== inserted.order_number,
              ),
            ]);
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as PosOnlineRecord;
            setRecords((current) =>
              current.map((record) =>
                record.order_number === updated.order_number ? updated : record,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            const deleted = payload.old as PosOnlineRecord;
            setRecords((current) =>
              current.filter(
                (record) => record.order_number !== deleted.order_number,
              ),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const departments = Array.from(
    new Set(records.map((record) => record.department).filter(Boolean)),
  ).sort();

  const filteredRecords = records.filter((record) => {
    const searchTerm = search.toLowerCase().trim();
    const orderedItems = Array.isArray(record.items) ? record.items : [];
    const matchesSearch =
      !searchTerm ||
      record.order_number.toLowerCase().includes(searchTerm) ||
      record.customer_name.toLowerCase().includes(searchTerm) ||
      orderedItems.some((item) =>
        item.product_name?.toLowerCase().includes(searchTerm),
      );
    const matchesDepartment =
      departmentFilter === "All" || record.department === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  const totalSales = records.reduce(
    (sum, record) => sum + (record.total || 0),
    0,
  );
  const totalItems = records.reduce((sum, record) => {
    if (typeof record.items_count === "number") return sum + record.items_count;
    const orderedItems = Array.isArray(record.items) ? record.items : [];
    return (
      sum +
      orderedItems.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0)
    );
  }, 0);

  if (loading) {
    return (
      <div className="space-y-4 max-w-screen-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`pos-skeleton-${index}`}
              className="card-base p-4 animate-pulse"
            >
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="card-base p-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {records.length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Completed online orders
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShoppingBag size={20} className="text-primary" />
          </div>
        </div>

        <div className="card-base p-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {totalItems}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Items sold online
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Package size={20} className="text-amber-700" />
          </div>
        </div>

        <div className="card-base p-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              UGX {totalSales.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Total online sales
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <WalletCards size={20} className="text-green-700" />
          </div>
        </div>

        <div className="card-base p-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {departments.length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Departments represented
            </p>
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
            placeholder="Search order, customer or item..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="input-field pl-9 w-64 h-9 text-sm"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {["All", ...departments].map((department) => (
            <button
              key={`pos-department-${department}`}
              onClick={() => setDepartmentFilter(department)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                departmentFilter === department
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
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
                {[
                  "Order Number",
                  "Completed At",
                  "Customer Name",
                  "Department",
                  "Ordered Items",
                  "Total",
                ].map((heading) => (
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
              {filteredRecords.map((record) => {
                const orderedItems = Array.isArray(record.items)
                  ? record.items
                  : [];
                const itemQuantity =
                  record.items_count ??
                  orderedItems.reduce(
                    (sum, item) => sum + (item.quantity || 0),
                    0,
                  );

                return (
                  <tr
                    key={record.order_number}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-3 text-sm font-mono font-semibold text-primary whitespace-nowrap">
                      #{record.order_number}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(record.created_at).toLocaleString("en-UG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground">
                      {record.customer_name}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {record.department}
                    </td>
                    <td className="px-5 py-3 min-w-[320px]">
                      {orderedItems.length > 0 ? (
                        <div className="space-y-2">
                          {orderedItems.map((item, index) => (
                            <div
                              key={`${record.order_number}-${item.product_id || item.product_name}-${index}`}
                              className="rounded-lg border border-border bg-muted/20 px-3 py-2"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-sm font-semibold text-foreground">
                                  <span className="mr-2 text-primary">
                                    {item.quantity}×
                                  </span>
                                  {item.product_name}
                                  {item.selected_options?.length ? (
                                    <span className="block pl-7 mt-0.5 text-[11px] font-normal text-muted-foreground">
                                      {item.selected_options.map((option) => `${option.group_name}: ${option.option_name}`).join(' · ')}
                                    </span>
                                  ) : null}
                                </p>
                                <p className="shrink-0 text-xs font-bold tabular-nums text-foreground">
                                  UGX{" "}
                                  {(
                                    item.line_total ??
                                    (item.quantity || 0) *
                                      (item.unit_price || 0)
                                  ).toLocaleString()}
                                </p>
                              </div>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                UGX {(item.unit_price || 0).toLocaleString()}{" "}
                                each
                              </p>
                            </div>
                          ))}
                          <p className="text-xs font-medium text-muted-foreground">
                            {itemQuantity} item{itemQuantity !== 1 ? "s" : ""}{" "}
                            total
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No items recorded
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm font-bold text-foreground tabular-nums">
                      UGX {record.total.toLocaleString()}
                    </td>
                  </tr>
                );
              })}

              {filteredRecords.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-muted-foreground"
                  >
                    No completed online orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
          <span className="text-sm text-muted-foreground">
            {filteredRecords.length} order
            {filteredRecords.length !== 1 ? "s" : ""} shown
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

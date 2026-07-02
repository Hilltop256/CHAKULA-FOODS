"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Monitor,
  Search,
  ShoppingBag,
  Store,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type PeriodFilter = "week" | "month" | "year" | "all";
type SourceFilter = "all" | "online" | "inhouse";

interface RawSaleRecord {
  order_number: string;
  customer_name: string;
  department: string;
  items_count: number;
  total: number;
  created_at: string;
}

interface BalanceRecord extends RawSaleRecord {
  source: "online" | "inhouse";
}

const formatCurrency = (value: number) =>
  `UGX ${(value || 0).toLocaleString()}`;

const startOfWeek = (date: Date) => {
  const start = new Date(date);
  const day = start.getDay();
  const difference = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + difference);
  start.setHours(0, 0, 0, 0);
  return start;
};

const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);

const startOfYear = (date: Date) =>
  new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);

const isInsidePeriod = (dateValue: string, period: PeriodFilter) => {
  if (period === "all") return true;
  const recordDate = new Date(dateValue);
  const now = new Date();
  const periodStart =
    period === "week"
      ? startOfWeek(now)
      : period === "month"
        ? startOfMonth(now)
        : startOfYear(now);
  return recordDate >= periodStart && recordDate <= now;
};

export default function AdminBalanceSheet() {
  const [records, setRecords] = useState<BalanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [search, setSearch] = useState("");
  const supabase = createClient();

  const fetchRecords = async () => {
    try {
      const [onlineResult, counterResult] = await Promise.all([
        supabase
          .from("pos_online")
          .select(
            "order_number, customer_name, department, items_count, total, created_at",
          )
          .order("created_at", { ascending: false }),
        supabase
          .from("pos_counter")
          .select(
            "order_number, customer_name, department, items_count, total, created_at",
          )
          .order("created_at", { ascending: false }),
      ]);

      if (onlineResult.error) throw onlineResult.error;
      if (counterResult.error) throw counterResult.error;

      const online = ((onlineResult.data || []) as RawSaleRecord[]).map(
        (record) => ({
          ...record,
          source: "online" as const,
        }),
      );
      const inhouse = ((counterResult.data || []) as RawSaleRecord[]).map(
        (record) => ({
          ...record,
          source: "inhouse" as const,
        }),
      );

      setRecords(
        [...online, ...inhouse].sort(
          (first, second) =>
            new Date(second.created_at).getTime() -
            new Date(first.created_at).getTime(),
        ),
      );
    } catch (error) {
      console.error("Balance Sheet fetch error:", error);
      toast.error("Failed to load Balance Sheet data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();

    const onlineChannel = supabase
      .channel("balance_sheet_online_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pos_online" },
        () => fetchRecords(),
      )
      .subscribe();

    const counterChannel = supabase
      .channel("balance_sheet_counter_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pos_counter" },
        () => fetchRecords(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(onlineChannel);
      supabase.removeChannel(counterChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const periodSummaries = useMemo(() => {
    const summarize = (period: PeriodFilter) => {
      const periodRecords = records.filter((record) =>
        isInsidePeriod(record.created_at, period),
      );
      return {
        total: periodRecords.reduce(
          (sum, record) => sum + (record.total || 0),
          0,
        ),
        orders: periodRecords.length,
      };
    };

    return {
      week: summarize("week"),
      month: summarize("month"),
      year: summarize("year"),
      all: summarize("all"),
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();
    return records.filter((record) => {
      const matchesPeriod = isInsidePeriod(record.created_at, periodFilter);
      const matchesSource =
        sourceFilter === "all" || record.source === sourceFilter;
      const matchesSearch =
        !term ||
        record.order_number.toLowerCase().includes(term) ||
        record.customer_name.toLowerCase().includes(term) ||
        record.department.toLowerCase().includes(term);
      return matchesPeriod && matchesSource && matchesSearch;
    });
  }, [records, periodFilter, sourceFilter, search]);

  const filteredTotal = filteredRecords.reduce(
    (sum, record) => sum + (record.total || 0),
    0,
  );
  const filteredItems = filteredRecords.reduce(
    (sum, record) => sum + (record.items_count || 0),
    0,
  );
  const onlineTotal = filteredRecords
    .filter((record) => record.source === "online")
    .reduce((sum, record) => sum + (record.total || 0), 0);
  const inhouseTotal = filteredRecords
    .filter((record) => record.source === "inhouse")
    .reduce((sum, record) => sum + (record.total || 0), 0);

  const periodCards: Array<{
    id: PeriodFilter;
    label: string;
    description: string;
    icon: React.ElementType;
  }> = [
    {
      id: "week",
      label: "Current Week",
      description: "Monday to today",
      icon: CalendarDays,
    },
    {
      id: "month",
      label: "Current Month",
      description: "Month-to-date sales",
      icon: TrendingUp,
    },
    {
      id: "year",
      label: "Current Year",
      description: "Year-to-date sales",
      icon: WalletCards,
    },
    {
      id: "all",
      label: "Overall Grand Total",
      description: "All recorded sales",
      icon: ShoppingBag,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4 max-w-screen-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`balance-loading-${index}`}
              className="card-base p-5 animate-pulse"
            >
              <div className="h-7 bg-muted rounded mb-3" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-screen-2xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">
          Combined Sales Balance Sheet
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          POS Online and POS Counter transactions in one financial report.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {periodCards.map((card) => {
          const Icon = card.icon;
          const summary = periodSummaries[card.id];
          const active = periodFilter === card.id;
          return (
            <button
              key={`balance-period-${card.id}`}
              type="button"
              onClick={() => setPeriodFilter(card.id)}
              className={`card-base p-4 text-left transition-all ${
                active
                  ? "ring-2 ring-primary border-primary"
                  : "hover:border-primary/40 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {card.label}
                  </p>
                  <p className="text-xl font-black text-foreground tabular-nums mt-2">
                    {formatCurrency(summary.total)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.orders} order{summary.orders !== 1 ? "s" : ""} ·{" "}
                    {card.description}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon size={19} className="text-primary" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="card-base p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-xl bg-muted/30 border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Monitor size={16} />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Online sales
              </span>
            </div>
            <p className="text-xl font-bold mt-2 tabular-nums">
              {formatCurrency(onlineTotal)}
            </p>
          </div>
          <div className="rounded-xl bg-muted/30 border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Store size={16} />
              <span className="text-xs font-semibold uppercase tracking-wide">
                In-house sales
              </span>
            </div>
            <p className="text-xl font-bold mt-2 tabular-nums">
              {formatCurrency(inhouseTotal)}
            </p>
          </div>
          <div className="rounded-xl bg-muted/30 border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShoppingBag size={16} />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Orders shown
              </span>
            </div>
            <p className="text-xl font-bold mt-2 tabular-nums">
              {filteredRecords.length}
            </p>
          </div>
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
            <div className="flex items-center gap-2 text-primary">
              <WalletCards size={16} />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Filtered grand total
              </span>
            </div>
            <p className="text-xl font-black text-primary mt-2 tabular-nums">
              {formatCurrency(filteredTotal)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredItems} item{filteredItems !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ["all", "All Transactions"],
              ["online", "Online Orders"],
              ["inhouse", "In-house Orders"],
            ] as Array<[SourceFilter, string]>
          ).map(([value, label]) => (
            <button
              key={`balance-source-${value}`}
              type="button"
              onClick={() => setSourceFilter(value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                sourceFilter === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order, customer or department..."
            className="input-field pl-9 w-72 h-9"
          />
        </div>
      </div>

      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                {[
                  "Date",
                  "Order Number",
                  "Order Type",
                  "Customer",
                  "Department",
                  "Items",
                  "Total",
                ].map((heading) => (
                  <th
                    key={`balance-heading-${heading}`}
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
                  key={`${record.source}-${record.order_number}`}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-5 py-3 text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(record.created_at).toLocaleString("en-UG", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-5 py-3 text-sm font-mono font-semibold text-primary whitespace-nowrap">
                    {record.order_number}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        record.source === "online"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {record.source === "online" ? (
                        <Monitor size={12} />
                      ) : (
                        <Store size={12} />
                      )}
                      {record.source === "online" ? "Online" : "In-house"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm font-medium whitespace-nowrap">
                    {record.customer_name}
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground whitespace-nowrap">
                    {record.department}
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground tabular-nums">
                    {record.items_count || 0}
                  </td>
                  <td className="px-5 py-3 text-sm font-bold tabular-nums whitespace-nowrap">
                    {formatCurrency(record.total)}
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-muted-foreground"
                  >
                    No sales records match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-4 border-t border-border bg-muted/20">
          <span className="text-sm text-muted-foreground">
            {filteredRecords.length} transaction
            {filteredRecords.length !== 1 ? "s" : ""}
          </span>
          <span className="text-base font-black text-primary tabular-nums">
            Grand total: {formatCurrency(filteredTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}

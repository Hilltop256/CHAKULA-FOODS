"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Edit2,
  Minus,
  Package,
  Plus,
  Save,
  Search,
  ShoppingBag,
  Store,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Product {
  id: string;
  name: string;
  department: string;
  category: string;
  price: number;
  available: boolean;
}

interface PosCounterItem {
  product_id: string;
  product_name: string;
  category: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface PosCounterRecord {
  order_number: string;
  customer_name: string;
  department: string;
  items: PosCounterItem[] | null;
  items_count: number;
  total: number;
  created_at: string;
  updated_at: string;
}

const formatCurrency = (value: number) =>
  `UGX ${(value || 0).toLocaleString()}`;

const normalizeItems = (
  items: PosCounterItem[] | null | undefined,
): PosCounterItem[] =>
  Array.isArray(items)
    ? items.map((item) => ({
        ...item,
        quantity: Math.max(Number(item.quantity) || 1, 1),
        unit_price: Math.max(Number(item.unit_price) || 0, 0),
        line_total:
          Math.max(Number(item.quantity) || 1, 1) *
          Math.max(Number(item.unit_price) || 0, 0),
      }))
    : [];

export default function AdminPosCounter() {
  const [records, setRecords] = useState<PosCounterRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<PosCounterItem[]>([]);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  const supabase = createClient();
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const [recordsResult, productsResult] = await Promise.all([
        supabase
          .from("pos_counter")
          .select(
            "order_number, customer_name, department, items, items_count, total, created_at, updated_at",
          )
          .order("created_at", { ascending: false }),
        supabase
          .from("products")
          .select("id, name, department, category, price, available")
          .eq("available", true)
          .order("department", { ascending: true })
          .order("category", { ascending: true })
          .order("name", { ascending: true }),
      ]);

      if (recordsResult.error) throw recordsResult.error;
      if (productsResult.error) throw productsResult.error;

      setRecords((recordsResult.data || []) as PosCounterRecord[]);
      setProducts((productsResult.data || []) as Product[]);
    } catch (error) {
      console.error("POS Counter fetch error:", error);
      toast.error("Failed to load POS Counter data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("admin_pos_counter_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pos_counter" },
        () => fetchData(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const departments = useMemo(
    () =>
      Array.from(
        new Set(products.map((product) => product.department).filter(Boolean)),
      ).sort(),
    [products],
  );

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .filter((product) => product.department === department)
            .map((product) => product.category)
            .filter(Boolean),
        ),
      ).sort(),
    [products, department],
  );

  const selectableProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.department === department &&
          (!category || product.category === category),
      ),
    [products, department, category],
  );

  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0,
  );
  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const resetForm = () => {
    setEditingOrder(null);
    setCustomerName("Walk-in Customer");
    setDepartment("");
    setCategory("");
    setProductId("");
    setQuantity(1);
    setItems([]);
  };

  const handleDepartmentChange = (nextDepartment: string) => {
    if (items.length > 0 && nextDepartment !== department) {
      const shouldClear = window.confirm(
        "Changing the department will clear the current order items. Continue?",
      );
      if (!shouldClear) return;
      setItems([]);
    }

    setDepartment(nextDepartment);
    setCategory("");
    setProductId("");
  };

  const addSelectedProduct = () => {
    const product = products.find((candidate) => candidate.id === productId);
    if (!department) {
      toast.error("Select a department first");
      return;
    }
    if (!category) {
      toast.error("Select a category first");
      return;
    }
    if (!product) {
      toast.error("Select a product");
      return;
    }

    const safeQuantity = Math.max(Number(quantity) || 1, 1);

    setItems((current) => {
      const existing = current.find((item) => item.product_id === product.id);
      if (existing) {
        return current.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + safeQuantity,
                line_total: (item.quantity + safeQuantity) * item.unit_price,
              }
            : item,
        );
      }

      return [
        ...current,
        {
          product_id: product.id,
          product_name: product.name,
          category: product.category,
          quantity: safeQuantity,
          unit_price: product.price,
          line_total: safeQuantity * product.price,
        },
      ];
    });

    setProductId("");
    setQuantity(1);
  };

  const changeItemQuantity = (productIdToUpdate: string, change: number) => {
    setItems((current) =>
      current
        .map((item) => {
          if (item.product_id !== productIdToUpdate) return item;
          const nextQuantity = item.quantity + change;
          return {
            ...item,
            quantity: nextQuantity,
            line_total: nextQuantity * item.unit_price,
          };
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (productIdToRemove: string) => {
    setItems((current) =>
      current.filter((item) => item.product_id !== productIdToRemove),
    );
  };

  const saveOrder = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!department) {
      toast.error("Select an order department");
      return;
    }
    if (items.length === 0) {
      toast.error("Add at least one product to the order");
      return;
    }

    setSaving(true);
    const payload = {
      customer_name: customerName.trim() || "Walk-in Customer",
      department,
      items: items.map((item) => ({
        ...item,
        line_total: item.quantity * item.unit_price,
      })),
      items_count: itemsCount,
      total,
      created_by: user?.id || null,
    };

    try {
      if (editingOrder) {
        const { error } = await supabase
          .from("pos_counter")
          .update({
            customer_name: payload.customer_name,
            department: payload.department,
            items: payload.items,
          })
          .eq("order_number", editingOrder);

        if (error) throw error;
        toast.success(`${editingOrder} updated successfully`);
      } else {
        const { data, error } = await supabase
          .from("pos_counter")
          .insert(payload)
          .select("order_number")
          .single();

        if (error) throw error;
        toast.success(`Counter order ${data.order_number} saved`);
      }

      resetForm();
      await fetchData();
    } catch (error: any) {
      console.error("POS Counter save error:", error);
      toast.error(error?.message || "Failed to save counter order");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (record: PosCounterRecord) => {
    setEditingOrder(record.order_number);
    setCustomerName(record.customer_name || "Walk-in Customer");
    setDepartment(record.department);
    setCategory("");
    setProductId("");
    setQuantity(1);
    setItems(normalizeItems(record.items));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteOrder = async (record: PosCounterRecord) => {
    const confirmed = window.confirm(
      `Delete counter order ${record.order_number}? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingOrder(record.order_number);
    try {
      const { error } = await supabase
        .from("pos_counter")
        .delete()
        .eq("order_number", record.order_number);

      if (error) throw error;
      setRecords((current) =>
        current.filter((item) => item.order_number !== record.order_number),
      );
      if (editingOrder === record.order_number) resetForm();
      toast.success(`${record.order_number} deleted`);
    } catch (error: any) {
      console.error("POS Counter delete error:", error);
      toast.error(error?.message || "Failed to delete counter order");
    } finally {
      setDeletingOrder(null);
    }
  };

  const reportDepartments = Array.from(
    new Set(records.map((record) => record.department).filter(Boolean)),
  ).sort();

  const filteredRecords = records.filter((record) => {
    const term = search.trim().toLowerCase();
    const recordItems = normalizeItems(record.items);
    const matchesSearch =
      !term ||
      record.order_number.toLowerCase().includes(term) ||
      record.customer_name.toLowerCase().includes(term) ||
      recordItems.some((item) =>
        item.product_name.toLowerCase().includes(term),
      );
    const matchesDepartment =
      departmentFilter === "All" || record.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const totalCounterSales = records.reduce(
    (sum, record) => sum + (record.total || 0),
    0,
  );
  const totalCounterItems = records.reduce(
    (sum, record) => sum + (record.items_count || 0),
    0,
  );

  if (loading) {
    return (
      <div className="space-y-4 max-w-screen-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`counter-loading-${index}`}
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
    <div className="space-y-6 max-w-screen-2xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-base p-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold tabular-nums">{records.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              In-house orders
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShoppingBag size={20} className="text-primary" />
          </div>
        </div>
        <div className="card-base p-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold tabular-nums">
              {totalCounterItems}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Items sold at counter
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Package size={20} className="text-amber-700" />
          </div>
        </div>
        <div className="card-base p-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(totalCounterSales)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Total counter sales
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <WalletCards size={20} className="text-green-700" />
          </div>
        </div>
      </div>

      <form onSubmit={saveOrder} className="card-base overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border bg-muted/30">
          <div>
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <Store size={18} className="text-primary" />
              {editingOrder ? `Edit ${editingOrder}` : "New In-house Order"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Select a department, category and product from the existing
              product catalogue.
            </p>
          </div>
          {editingOrder && (
            <button
              type="button"
              onClick={resetForm}
              className="btn-ghost text-sm flex items-center gap-2"
            >
              <X size={15} /> Cancel edit
            </button>
          )}
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Customer name
              </label>
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Walk-in Customer"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Department
              </label>
              <select
                value={department}
                onChange={(event) => handleDepartmentChange(event.target.value)}
                className="input-field"
              >
                <option value="">Select department...</option>
                {departments.map((option) => (
                  <option key={`counter-department-${option}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setProductId("");
                }}
                disabled={!department}
                className="input-field disabled:opacity-50"
              >
                <option value="">
                  {department
                    ? "Select category..."
                    : "Select department first"}
                </option>
                {categories.map((option) => (
                  <option key={`counter-category-${option}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Product
              </label>
              <select
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
                disabled={!category}
                className="input-field disabled:opacity-50"
              >
                <option value="">
                  {category ? "Select product..." : "Select category first"}
                </option>
                {selectableProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} — {formatCurrency(product.price)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="w-28">
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Quantity
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(event) =>
                  setQuantity(Math.max(Number(event.target.value) || 1, 1))
                }
                className="input-field"
              />
            </div>
            <button
              type="button"
              onClick={addSelectedProduct}
              disabled={!productId}
              className="btn-outline flex items-center gap-2 disabled:opacity-50"
            >
              <Plus size={16} /> Add item
            </button>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <div className="grid grid-cols-[minmax(0,1fr)_100px_130px_44px] gap-3 bg-muted/50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Item</span>
              <span className="text-center">Quantity</span>
              <span className="text-right">Subtotal</span>
              <span />
            </div>
            {items.length > 0 ? (
              <div className="divide-y divide-border">
                {items.map((item) => (
                  <div
                    key={item.product_id}
                    className="grid grid-cols-[minmax(0,1fr)_100px_130px_44px] gap-3 items-center px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.category} · {formatCurrency(item.unit_price)} each
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => changeItemQuantity(item.product_id, -1)}
                        className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/70"
                        aria-label={`Reduce ${item.product_name} quantity`}
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-7 text-center text-sm font-bold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeItemQuantity(item.product_id, 1)}
                        className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/70"
                        aria-label={`Increase ${item.product_name} quantity`}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <p className="text-right text-sm font-bold tabular-nums">
                      {formatCurrency(item.quantity * item.unit_price)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.product_id)}
                      className="w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 flex items-center justify-center"
                      aria-label={`Remove ${item.product_name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                No products have been added to this order.
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl bg-primary/5 border border-primary/10 px-4 py-4">
            <div>
              <p className="text-xs text-muted-foreground">Order total</p>
              <p className="text-2xl font-black text-primary tabular-nums">
                {formatCurrency(total)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {itemsCount} item{itemsCount !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              type="submit"
              disabled={saving || items.length === 0}
              className="btn-primary flex items-center justify-center gap-2 min-w-44"
            >
              <Save size={16} />
              {saving
                ? "Saving..."
                : editingOrder
                  ? "Update order"
                  : "Save counter order"}
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-lg text-foreground">
              POS Counter Reports
            </h2>
            <p className="text-sm text-muted-foreground">
              Saved in-house transactions with edit and delete controls.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search order, customer or item..."
                className="input-field pl-9 w-64 h-9"
              />
            </div>
            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              className="input-field w-48 h-9 py-1.5"
            >
              <option value="All">All departments</option>
              {reportDepartments.map((option) => (
                <option
                  key={`counter-report-department-${option}`}
                  value={option}
                >
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  {[
                    "Order Number",
                    "Date",
                    "Customer",
                    "Department",
                    "Ordered Items",
                    "Total",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={`counter-report-heading-${heading}`}
                      className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRecords.map((record) => {
                  const recordItems = normalizeItems(record.items);
                  return (
                    <tr
                      key={record.order_number}
                      className="hover:bg-muted/30 transition-colors align-top"
                    >
                      <td className="px-4 py-3 text-sm font-mono font-semibold text-primary whitespace-nowrap">
                        {record.order_number}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(record.created_at).toLocaleString("en-UG", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground whitespace-nowrap">
                        {record.customer_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {record.department}
                      </td>
                      <td className="px-4 py-3 min-w-[300px]">
                        <div className="space-y-1.5">
                          {recordItems.map((item) => (
                            <div
                              key={`${record.order_number}-${item.product_id}`}
                              className="flex items-start justify-between gap-3 rounded-lg bg-muted/30 px-3 py-2"
                            >
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  <span className="text-primary mr-1.5">
                                    {item.quantity}×
                                  </span>
                                  {item.product_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.category}
                                </p>
                              </div>
                              <span className="text-xs font-bold whitespace-nowrap tabular-nums">
                                {formatCurrency(
                                  item.quantity * item.unit_price,
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold whitespace-nowrap tabular-nums">
                        {formatCurrency(record.total)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => startEditing(record)}
                            className="w-8 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center"
                            aria-label={`Edit ${record.order_number}`}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => deleteOrder(record)}
                            disabled={deletingOrder === record.order_number}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center disabled:opacity-50"
                            aria-label={`Delete ${record.order_number}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredRecords.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-sm text-muted-foreground"
                    >
                      No in-house orders found.
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
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live updates
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Trash2, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AppImage from '@/components/ui/AppImage';
import { createClient } from '@/lib/supabase/client';

interface Product {
  id: string;
  name: string;
  department: string;
  category: string;
  price: number;
  available: boolean;
  orders_count: number;
  image_url: string;
}

type ProductForm = {
  name: string;
  department: string;
  category: string;
  price: number;
  description: string;
  available: boolean;
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [sortField, setSortField] = useState<'name' | 'price' | 'orders_count'>('orders_count');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductForm>();

  const departments = ['all', 'Restaurant', 'Confectionary', 'Juice Bar', 'Wine & Liquor', 'Market Specials'];

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, department, category, price, available, orders_count, image_url')
        .order('orders_count', { ascending: false });

      if (error) {
        console.log('Products fetch error:', error.message);
      } else {
        setProducts(data || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = products
    .filter((p) => {
      const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter === 'all' || p.department === deptFilter;
      return matchSearch && matchDept;
    })
    .sort((a, b) => {
      const val =
        sortField === 'name'
          ? a.name.localeCompare(b.name)
          : (a[sortField] as number) - (b[sortField] as number);
      return sortDir === 'asc' ? val : -val;
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', deletingId);
      if (error) {
        toast.error('Failed to delete product');
      } else {
        setProducts((prev) => prev.filter((p) => p.id !== deletingId));
        toast.success('Product deleted successfully');
      }
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleAvailable = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ available: !current })
        .eq('id', id);
      if (error) {
        toast.error('Failed to update availability');
      } else {
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, available: !current } : p)));
        toast.success('Product availability updated');
      }
    } catch {
      toast.error('Failed to update availability');
    }
  };

  const handleBulkDelete = async () => {
    try {
      const { error } = await supabase.from('products').delete().in('id', selectedRows);
      if (error) {
        toast.error('Failed to delete products');
      } else {
        setProducts((prev) => prev.filter((p) => !selectedRows.includes(p.id)));
        toast.success(`${selectedRows.length} products deleted`);
        setSelectedRows([]);
      }
    } catch {
      toast.error('Failed to delete products');
    }
  };

  const onAddProduct = async (data: ProductForm) => {
    setIsSubmitting(true);
    try {
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert({
          name: data.name,
          department: data.department,
          category: data.category,
          price: Number(data.price),
          available: data.available,
          description: data.description,
          image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=100&q=70',
          orders_count: 0,
          featured: false,
        })
        .select()
        .single();

      if (error) {
        toast.error('Failed to add product');
      } else {
        setProducts((prev) => [newProduct as Product, ...prev]);
        setShowAddModal(false);
        reset();
        toast.success(`${data.name} added to ${data.department}`);
      }
    } catch {
      toast.error('Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRowSelect = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const SortIcon = ({ field }: { field: typeof sortField }) =>
    sortField === field ? (
      sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
    ) : (
      <ChevronDown size={13} className="opacity-30" />
    );

  if (loading) {
    return (
      <div className="space-y-4 max-w-screen-2xl">
        <div className="card-base p-8 text-center animate-pulse">
          <div className="h-4 bg-muted rounded w-1/3 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-screen-2xl">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 w-56 h-9 text-sm"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-muted-foreground" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="input-field h-9 text-sm w-44"
            >
              {departments.map((d) => (
                <option key={`dept-filter-${d}`} value={d}>
                  {d === 'all' ? 'All Departments' : d}
                </option>
              ))}
            </select>
          </div>
          <span className="text-sm text-muted-foreground">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 h-9 text-sm"
        >
          <Plus size={15} />
          Add Product
        </button>
      </div>

      {/* Bulk action bar */}
      {selectedRows.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-5 py-3 flex items-center justify-between animate-slide-up">
          <span className="text-sm font-semibold text-primary">
            {selectedRows.length} product{selectedRows.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 text-sm font-semibold text-accent bg-accent/10 hover:bg-accent/20 px-4 py-1.5 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedRows([])}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={selectedRows.length === filtered.length && filtered.length > 0}
                    onChange={(e) =>
                      setSelectedRows(e.target.checked ? filtered.map((p) => p.id) : [])
                    }
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer select-none"
                  onClick={() => toggleSort('price')}
                >
                  <span className="flex items-center gap-1">Price <SortIcon field="price" /></span>
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer select-none"
                  onClick={() => toggleSort('orders_count')}
                >
                  <span className="flex items-center gap-1">Orders <SortIcon field="orders_count" /></span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((product) => (
                <tr
                  key={product.id}
                  className={`hover:bg-muted/30 transition-colors group ${
                    selectedRows.includes(product.id) ? 'bg-primary/5' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="accent-primary"
                      checked={selectedRows.includes(product.id)}
                      onChange={() => toggleRowSelect(product.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <AppImage
                        src={product.image_url || ''}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <span className="text-sm font-semibold text-foreground line-clamp-1">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{product.department}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{product.category}</td>
                  <td className="px-4 py-3 text-sm font-bold text-foreground tabular-nums">
                    UGX {product.price?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground tabular-nums">{product.orders_count}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleAvailable(product.id, product.available)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                        product.available
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' :'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {product.available ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDeletingId(product.id)}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-accent opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirm modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in">
          <div className="card-base shadow-2xl p-6 max-w-sm w-full mx-4 animate-scale-in">
            <h3 className="font-bold text-foreground mb-2">Delete Product?</h3>
            <p className="text-sm text-muted-foreground mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={confirmDelete} className="flex-1 bg-accent text-accent-foreground rounded-xl py-2.5 text-sm font-semibold hover:bg-accent/90 transition-colors">
                Delete
              </button>
              <button onClick={() => setDeletingId(null)} className="flex-1 btn-outline text-sm py-2.5">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in">
          <div className="card-base shadow-2xl p-6 max-w-md w-full mx-4 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-foreground">Add New Product</h3>
              <button onClick={() => { setShowAddModal(false); reset(); }} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onAddProduct)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Product Name</label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  placeholder="e.g. Chicken Stew & Matooke"
                  className="input-field w-full"
                />
                {errors.name && <p className="text-xs text-accent mt-1">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Department</label>
                  <select {...register('department', { required: 'Required' })} className="input-field w-full">
                    <option value="">Select...</option>
                    {departments.filter((d) => d !== 'all').map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {errors.department && <p className="text-xs text-accent mt-1">{errors.department.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Category</label>
                  <input
                    type="text"
                    {...register('category', { required: 'Required' })}
                    placeholder="e.g. Meals"
                    className="input-field w-full"
                  />
                  {errors.category && <p className="text-xs text-accent mt-1">{errors.category.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Price (UGX)</label>
                <input
                  type="number"
                  {...register('price', { required: 'Price is required', min: { value: 0, message: 'Must be positive' } })}
                  placeholder="18000"
                  className="input-field w-full"
                />
                {errors.price && <p className="text-xs text-accent mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Description</label>
                <textarea
                  {...register('description')}
                  placeholder="Brief product description..."
                  rows={2}
                  className="input-field w-full resize-none"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('available')} defaultChecked className="accent-primary" />
                <span className="text-sm text-foreground">Available for ordering</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Add Product'
                  )}
                </button>
                <button type="button" onClick={() => { setShowAddModal(false); reset(); }} className="flex-1 btn-outline">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
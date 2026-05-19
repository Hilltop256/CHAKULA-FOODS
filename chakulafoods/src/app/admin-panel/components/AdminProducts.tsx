'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Eye, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AppImage from '@/components/ui/AppImage';

// Backend integration point: replace with GET /api/products
const initialProducts = [
{ id: 'prod-001', name: 'Chicken Stew & Matooke', department: 'Restaurant', category: 'Meals', price: 18000, available: true, orders: 342, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=100&q=70' },
{ id: 'prod-002', name: 'Rolex (Chapati & Egg Roll)', department: 'Restaurant', category: 'Street Food', price: 6500, available: true, orders: 589, image: "https://images.unsplash.com/photo-1719206927942-f0c8b52b884a" },
{ id: 'prod-003', name: 'Birthday Celebration Cake', department: 'Confectionary', category: 'Cakes', price: 85000, available: true, orders: 124, image: "https://images.unsplash.com/photo-1686651952819-de42dd47b237" },
{ id: 'prod-004', name: 'Mango & Pineapple Smoothie', department: 'Juice Bar', category: 'Smoothies', price: 9500, available: true, orders: 278, image: "https://images.unsplash.com/photo-1666181767084-91e0cd358adf" },
{ id: 'prod-005', name: 'South African Red Wine', department: 'Wine & Liquor', category: 'Wines', price: 65000, available: true, orders: 95, image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=100&q=70' },
{ id: 'prod-006', name: 'Premium Rice Bundle (10kg)', department: 'Market Specials', category: 'Rice', price: 58000, available: true, orders: 203, image: "https://img.rocket.new/generatedImages/rocket_gen_img_19101ba4f-1768321892069.png" },
{ id: 'prod-007', name: 'Red Velvet Cupcakes (6 pack)', department: 'Confectionary', category: 'Pastries', price: 32000, available: true, orders: 167, image: "https://images.unsplash.com/photo-1655650166075-11705e680bb1" },
{ id: 'prod-008', name: 'Passion Fruit Detox Juice', department: 'Juice Bar', category: 'Detox Plans', price: 11000, available: false, orders: 88, image: "https://images.unsplash.com/photo-1612975817531-e81150eaa3e1" },
{ id: 'prod-009', name: 'Beef & Pork Combo Meal', department: 'Restaurant', category: 'Combos', price: 28000, available: true, orders: 215, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100&q=70' },
{ id: 'prod-010', name: 'Johnnie Walker Black Label', department: 'Wine & Liquor', category: 'Whiskey', price: 145000, available: true, orders: 62, image: "https://images.unsplash.com/photo-1638567827189-ec12e06c4ded" },
{ id: 'prod-011', name: 'Ugandan Breakfast Plate', department: 'Restaurant', category: 'Breakfast', price: 14000, available: true, orders: 431, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=100&q=70' },
{ id: 'prod-012', name: 'Chocolate Fudge Brownie Box', department: 'Confectionary', category: 'Dessert Boxes', price: 24000, available: true, orders: 149, image: "https://images.unsplash.com/photo-1607775643915-28dbfb0f3a77" }];


type ProductForm = {
  name: string;
  department: string;
  category: string;
  price: number;
  description: string;
  available: boolean;
};

export default function AdminProducts() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [sortField, setSortField] = useState<'name' | 'price' | 'orders'>('orders');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductForm>();

  const departments = ['all', 'Restaurant', 'Confectionary', 'Juice Bar', 'Wine & Liquor', 'Market Specials'];

  const filtered = products.
  filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'all' || p.department === deptFilter;
    return matchSearch && matchDept;
  }).
  sort((a, b) => {
    const val = sortField === 'name' ? a.name.localeCompare(b.name) : (a[sortField] as number) - (b[sortField] as number);
    return sortDir === 'asc' ? val : -val;
  });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');else
    {setSortField(field);setSortDir('desc');}
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    // Backend integration point: DELETE /api/products/:id
    setProducts((prev) => prev.filter((p) => p.id !== deletingId));
    setDeletingId(null);
    toast.success('Product deleted successfully');
  };

  const handleToggleAvailable = (id: string) => {
    setProducts((prev) =>
    prev.map((p) => p.id === id ? { ...p, available: !p.available } : p)
    );
    toast.success('Product availability updated');
  };

  const handleBulkDelete = () => {
    setProducts((prev) => prev.filter((p) => !selectedRows.includes(p.id)));
    setSelectedRows([]);
    toast.success(`${selectedRows.length} products deleted`);
  };

  const onAddProduct = (data: ProductForm) => {
    setIsSubmitting(true);
    // Backend integration point: POST /api/products with data
    setTimeout(() => {
      const newProduct = {
        id: `prod-${Date.now()}`,
        name: data.name,
        department: data.department,
        category: data.category,
        price: Number(data.price),
        available: data.available,
        orders: 0,
        image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=100&q=70'
      };
      setProducts((prev) => [newProduct, ...prev]);
      setIsSubmitting(false);
      setShowAddModal(false);
      reset();
      toast.success(`${data.name} added to ${data.department}`);
    }, 800);
  };

  const toggleRowSelect = (id: string) => {
    setSelectedRows((prev) =>
    prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const SortIcon = ({ field }: {field: typeof sortField;}) =>
  sortField === field ?
  sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} /> :

  <ChevronDown size={13} className="opacity-30" />;


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
              className="input-field pl-9 w-56 h-9 text-sm" />
            
          </div>
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-muted-foreground" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="input-field h-9 text-sm w-44">
              
              {departments.map((d) =>
              <option key={`dept-filter-${d}`} value={d}>
                  {d === 'all' ? 'All Departments' : d}
                </option>
              )}
            </select>
          </div>
          <span className="text-sm text-muted-foreground">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 h-9 text-sm">
          
          <Plus size={15} />
          Add Product
        </button>
      </div>

      {/* Bulk action bar */}
      {selectedRows.length > 0 &&
      <div className="bg-primary/5 border border-primary/20 rounded-xl px-5 py-3 flex items-center justify-between animate-slide-up">
          <span className="text-sm font-semibold text-primary">
            {selectedRows.length} product{selectedRows.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 text-sm font-semibold text-accent bg-accent/10 hover:bg-accent/20 px-4 py-1.5 rounded-lg transition-colors">
            
              <Trash2 size={14} />
              Delete Selected
            </button>
            <button
            onClick={() => setSelectedRows([])}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            
              <X size={15} />
            </button>
          </div>
        </div>
      }

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
                    } />
                  
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Product
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Department
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Category
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer select-none"
                  onClick={() => toggleSort('price')}>
                  
                  <span className="flex items-center gap-1">
                    Price <SortIcon field="price" />
                  </span>
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer select-none"
                  onClick={() => toggleSort('orders')}>
                  
                  <span className="flex items-center gap-1">
                    Orders <SortIcon field="orders" />
                  </span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((product) =>
              <tr
                key={product.id}
                className={`hover:bg-muted/30 transition-colors group ${
                selectedRows.includes(product.id) ? 'bg-primary/5' : ''}`
                }>
                
                  <td className="px-4 py-3">
                    <input
                    type="checkbox"
                    className="accent-primary"
                    checked={selectedRows.includes(product.id)}
                    onChange={() => toggleRowSelect(product.id)} />
                  
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <AppImage
                      src={product.image}
                      alt={`${product.name} product image`}
                      width={40}
                      height={40}
                      className="rounded-lg object-cover w-10 h-10 shrink-0" />
                    
                      <span className="text-sm font-semibold text-foreground max-w-[180px] truncate">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{product.department}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{product.category}</td>
                  <td className="px-4 py-3 text-sm font-bold text-foreground tabular-nums">
                    UGX {product.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground tabular-nums">{product.orders}</td>
                  <td className="px-4 py-3">
                    <button
                    onClick={() => handleToggleAvailable(product.id)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    product.available ?
                    'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`
                    }>
                    
                      {product.available ? 'Available' : 'Out of Stock'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      title="View product">
                      
                        <Eye size={14} />
                      </button>
                      <button
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                      title="Edit product">
                      
                        <Edit2 size={14} />
                      </button>
                      <button
                      onClick={() => handleDelete(product.id)}
                      className="p-1.5 rounded-lg hover:bg-accent/10 transition-colors text-muted-foreground hover:text-accent"
                      title="Delete product — this cannot be undone">
                      
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
          <span className="text-sm text-muted-foreground">
            Showing {filtered.length} of {products.length} products
          </span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((page) =>
            <button
              key={`page-${page}`}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
              page === 1 ?
              'bg-primary text-primary-foreground' :
              'hover:bg-muted text-muted-foreground'}`
              }>
              
                {page}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirm modal */}
      {deletingId &&
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in">
          <div className="card-base shadow-2xl p-6 max-w-sm w-full mx-4 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Trash2 size={18} className="text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Delete Product</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Are you sure you want to delete this product? All associated data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
              onClick={() => setDeletingId(null)}
              className="flex-1 btn-outline text-sm py-2">
              
                Cancel
              </button>
              <button
              onClick={confirmDelete}
              className="flex-1 bg-accent text-accent-foreground font-semibold px-4 py-2 rounded-lg text-sm hover:bg-accent/90 transition-all active:scale-95">
              
                Delete Product
              </button>
            </div>
          </div>
        </div>
      }

      {/* Add product modal */}
      {showAddModal &&
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in">
          <div className="card-base shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-bold text-foreground text-lg">Add New Product</h3>
              <button onClick={() => {setShowAddModal(false);reset();}} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onAddProduct)} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Product Name</label>
                <input
                type="text"
                {...register('name', { required: 'Product name is required' })}
                placeholder="e.g. Chicken Stew & Matooke"
                className="input-field" />
              
                {errors.name && <p className="text-xs text-accent mt-1">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Department</label>
                  <select {...register('department', { required: 'Select a department' })} className="input-field">
                    <option value="">Select department</option>
                    {['Restaurant', 'Confectionary', 'Juice Bar', 'Wine & Liquor', 'Market Specials'].map((d) =>
                  <option key={`add-dept-${d}`} value={d}>{d}</option>
                  )}
                  </select>
                  {errors.department && <p className="text-xs text-accent mt-1">{errors.department.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Category</label>
                  <input
                  type="text"
                  {...register('category', { required: 'Category is required' })}
                  placeholder="e.g. Meals, Cakes"
                  className="input-field" />
                
                  {errors.category && <p className="text-xs text-accent mt-1">{errors.category.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Price (UGX)</label>
                <p className="text-xs text-muted-foreground mb-1.5">Enter price in Ugandan Shillings</p>
                <input
                type="number"
                {...register('price', { required: 'Price is required', min: { value: 500, message: 'Minimum price is UGX 500' } })}
                placeholder="18000"
                className="input-field" />
              
                {errors.price && <p className="text-xs text-accent mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Description</label>
                <textarea
                {...register('description')}
                placeholder="Brief description of the product..."
                rows={3}
                className="input-field resize-none" />
              
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('available')} defaultChecked className="accent-primary w-4 h-4" />
                <span className="text-sm font-medium text-foreground">Available immediately</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => {setShowAddModal(false);reset();}} className="flex-1 btn-outline text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary text-sm flex items-center justify-center gap-2">
                  {isSubmitting ?
                <>
                      <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </> :

                'Add Product'
                }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>);

}
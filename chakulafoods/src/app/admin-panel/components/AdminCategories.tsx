'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Trash2, X, Edit2, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface Category {
  id: string;
  name: string;
  department: string;
  description?: string;
  created_at: string;
}

type CategoryForm = {
  name: string;
  department: string;
  description: string;
};

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const supabase = createClient();

  const addForm = useForm<CategoryForm>();
  const editForm = useForm<CategoryForm>();

  const departments = ['Restaurant', 'Confectionary', 'Juice Bar', 'Wine & Liquor', 'Market Specials'];

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, department, description, created_at')
        .order('department', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.log('Categories fetch error:', error.message);
      } else {
        setCategories(data || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = categories
    .filter((c) => {
      const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter === 'all' || c.department === deptFilter;
      return matchSearch && matchDept;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const groupedByDept = departments.reduce((acc, dept) => {
    acc[dept] = filtered.filter((c) => c.department === dept);
    return acc;
  }, {} as Record<string, Category[]>);

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', deletingId);
      if (error) {
        toast.error('Failed to delete category');
      } else {
        setCategories((prev) => prev.filter((c) => c.id !== deletingId));
        toast.success('Category deleted successfully');
      }
    } catch {
      toast.error('Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  const onAddCategory = async (data: CategoryForm) => {
    if (!selectedDept) {
      toast.error('Please select a department');
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if category already exists in this department
      const existing = categories.find(
        (c) => c.name.toLowerCase() === data.name.toLowerCase() && c.department === selectedDept
      );

      if (existing) {
        toast.error('This category already exists in this department');
        setIsSubmitting(false);
        return;
      }

      const { data: newCategory, error } = await supabase
        .from('categories')
        .insert({
          name: data.name,
          department: selectedDept,
          description: data.description || null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        toast.error('Failed to add category');
      } else {
        setCategories((prev) => [...prev, newCategory as Category]);
        setShowAddModal(false);
        setSelectedDept(null);
        addForm.reset();
        toast.success(`${data.name} added to ${selectedDept}`);
      }
    } catch {
      toast.error('Failed to add category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    editForm.setValue('name', category.name);
    editForm.setValue('department', category.department);
    editForm.setValue('description', category.description || '');
  };

  const onEditCategory = async (data: CategoryForm) => {
    if (!editingCategory) return;
    setIsSubmitting(true);
    try {
      // Check if new name already exists in this department
      const existing = categories.find(
        (c) =>
          c.name.toLowerCase() === data.name.toLowerCase() &&
          c.department === editingCategory.department &&
          c.id !== editingCategory.id
      );

      if (existing) {
        toast.error('A category with this name already exists in this department');
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from('categories')
        .update({
          name: data.name,
          department: data.department,
          description: data.description || null,
        })
        .eq('id', editingCategory.id);

      if (error) {
        toast.error('Failed to update category');
      } else {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id
              ? {
                  ...c,
                  name: data.name,
                  department: data.department,
                  description: data.description,
                }
              : c
          )
        );
        setEditingCategory(null);
        editForm.reset();
        toast.success(`${data.name} updated successfully`);
      }
    } catch {
      toast.error('Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              placeholder="Search categories..."
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
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={`dept-filter-${d}`} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <span className="text-sm text-muted-foreground">
            {filtered.length} categor{filtered.length === 1 ? 'y' : 'ies'}
          </span>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 h-9 text-sm"
        >
          <Plus size={15} />
          Add Category
        </button>
      </div>

      {/* Categories by Department */}
      <div className="space-y-5">
        {departments.map((dept) => {
          const deptCategories = groupedByDept[dept];
          const shouldShow = deptFilter === 'all' || deptFilter === dept;

          if (!shouldShow) return null;

          return (
            <div key={`dept-section-${dept}`} className="card-base overflow-hidden">
              {/* Department Header */}
              <div className="bg-muted/50 border-b border-border px-6 py-4 flex items-center justify-between">
                <h3 className="font-bold text-base text-foreground">{dept}</h3>
                <span className="text-sm font-semibold text-muted-foreground">
                  {deptCategories.length} categor{deptCategories.length === 1 ? 'y' : 'ies'}
                </span>
              </div>

              {/* Categories List */}
              {deptCategories.length > 0 ? (
                <div className="divide-y divide-border">
                  {deptCategories.map((category) => (
                    <div
                      key={category.id}
                      className="px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors group"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-foreground">{category.name}</h4>
                        {category.description && (
                          <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(category)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                          title="Edit category"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingId(category.id)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-accent"
                          title="Delete category"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                  No categories in this department
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && search && (
        <div className="card-base p-10 text-center">
          <p className="text-sm text-muted-foreground">No categories found matching your search.</p>
        </div>
      )}

      {/* Delete confirm modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in">
          <div className="card-base shadow-2xl p-6 max-w-sm w-full mx-4 animate-scale-in">
            <h3 className="font-bold text-foreground mb-2">Delete Category?</h3>
            <p className="text-sm text-muted-foreground mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-accent text-accent-foreground rounded-xl py-2.5 text-sm font-semibold hover:bg-accent/90 transition-colors"
              >
                Delete
              </button>
              <button onClick={() => setDeletingId(null)} className="flex-1 btn-outline text-sm py-2.5">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in">
          <div className="card-base shadow-2xl p-6 max-w-md w-full mx-4 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-foreground">Add New Category</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedDept(null);
                  addForm.reset();
                }}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={addForm.handleSubmit(onAddCategory)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Department *</label>
                <select
                  value={selectedDept || ''}
                  onChange={(e) => setSelectedDept(e.target.value || null)}
                  className="input-field w-full"
                >
                  <option value="">Select a department...</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {!selectedDept && showAddModal && (
                  <p className="text-xs text-accent mt-1">Please select a department</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Category Name *</label>
                <input
                  type="text"
                  {...addForm.register('name', { required: 'Category name is required' })}
                  placeholder="e.g. Breakfast, Cakes, Fresh Juices"
                  className="input-field w-full"
                />
                {addForm.formState.errors.name && (
                  <p className="text-xs text-accent mt-1">{addForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Description</label>
                <textarea
                  {...addForm.register('description')}
                  placeholder="Brief category description (optional)..."
                  rows={2}
                  className="input-field w-full resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedDept}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Add Category'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedDept(null);
                    addForm.reset();
                  }}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in">
          <div className="card-base shadow-2xl p-6 max-w-md w-full mx-4 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-foreground">Edit Category</h3>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  editForm.reset();
                }}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={editForm.handleSubmit(onEditCategory)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Department</label>
                <input
                  type="text"
                  value={editingCategory.department}
                  disabled
                  className="input-field w-full bg-muted/50 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">Department cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Category Name *</label>
                <input
                  type="text"
                  {...editForm.register('name', { required: 'Category name is required' })}
                  className="input-field w-full"
                />
                {editForm.formState.errors.name && (
                  <p className="text-xs text-accent mt-1">{editForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Description</label>
                <textarea
                  {...editForm.register('description')}
                  rows={2}
                  className="input-field w-full resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    editForm.reset();
                  }}
                  className="flex-1 btn-outline"
                >
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

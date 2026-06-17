'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, X, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AppImage from '@/components/ui/AppImage';
import { createClient } from '@/lib/supabase/client';
import ImageUploadField from './ImageUploadField';

interface MarketSpecial {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  discount_label: string | null;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
  product_id: string | null;
}

type SpecialForm = {
  title: string;
  description: string;
  image_url: string;
  discount_label: string;
  link_url: string;
  sort_order: number;
  is_active: boolean;
};

export default function AdminMarketSpecials() {
  const [specials, setSpecials] = useState<MarketSpecial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSpecial, setEditingSpecial] = useState<MarketSpecial | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [specialImageUrl, setSpecialImageUrl] = useState('');
  const supabase = createClient();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SpecialForm>();

  const fetchSpecials = async () => {
    try {
      const { data, error } = await supabase
        .from('market_specials')
        .select('id, title, description, image_url, discount_label, link_url, is_active, sort_order, product_id')
        .order('sort_order', { ascending: true });

      if (!error && data) {
        setSpecials(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecials();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAdd = () => {
    setEditingSpecial(null);
    reset({ title: '', description: '', image_url: '', discount_label: '', link_url: '#market', sort_order: specials.length + 1, is_active: true });
    setSpecialImageUrl('');
    setShowModal(true);
  };

  const openEdit = (special: MarketSpecial) => {
    setEditingSpecial(special);
    setValue('title', special.title);
    setValue('description', special.description || '');
    setValue('image_url', special.image_url || '');
    setValue('discount_label', special.discount_label || '');
    setValue('link_url', special.link_url || '#market');
    setValue('sort_order', special.sort_order);
    setValue('is_active', special.is_active);
    setSpecialImageUrl(special.image_url || '');
    setShowModal(true);
  };

  const onSubmit = async (data: SpecialForm) => {
    setIsSubmitting(true);
    try {
      if (editingSpecial) {
        const { error } = await supabase
          .from('market_specials')
          .update({
            title: data.title,
            description: data.description || null,
            image_url: data.image_url || null,
            discount_label: data.discount_label || null,
            link_url: data.link_url || null,
            sort_order: Number(data.sort_order),
            is_active: data.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingSpecial.id);

        if (error) {
          toast.error('Failed to update special');
        } else {
          toast.success('Market special updated');
          setShowModal(false);
          reset();
          setSpecialImageUrl('');
          setEditingSpecial(null);
          fetchSpecials();
        }
      } else {
        const { error } = await supabase
          .from('market_specials')
          .insert({
            title: data.title,
            description: data.description || null,
            image_url: data.image_url || null,
            discount_label: data.discount_label || null,
            link_url: data.link_url || null,
            sort_order: Number(data.sort_order),
            is_active: data.is_active,
          });

        if (error) {
          toast.error('Failed to create special');
        } else {
          toast.success(`"${data.title}" added to Market Specials`);
          setShowModal(false);
          reset();
          setSpecialImageUrl('');
          fetchSpecials();
        }
      }
    } catch {
      toast.error('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const { error } = await supabase.from('market_specials').delete().eq('id', deletingId);
      if (error) {
        toast.error('Failed to delete special');
      } else {
        setSpecials((prev) => prev.filter((s) => s.id !== deletingId));
        toast.success('Market special deleted');
      }
    } catch {
      toast.error('Failed to delete special');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from('market_specials')
        .update({ is_active: !current, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) {
        toast.error('Failed to update status');
      } else {
        setSpecials((prev) => prev.map((s) => (s.id === id ? { ...s, is_active: !current } : s)));
        toast.success(`Special ${!current ? 'activated' : 'deactivated'}`);
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = specials.filter((s) =>
    s.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
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
              placeholder="Search specials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 w-56 h-9 text-sm"
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {filtered.length} special{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={openAdd}
          className="btn-primary flex items-center gap-2 h-9 text-sm"
        >
          <Plus size={15} />
          Add Special
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((special) => (
          <div
            key={special.id}
            className={`card-base overflow-hidden group transition-all ${!special.is_active ? 'opacity-60' : ''}`}
          >
            {/* Image */}
            <div className="relative h-40 bg-muted overflow-hidden">
              <AppImage
                src={special.image_url || ''}
                alt={special.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {special.discount_label && (
                <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                  {special.discount_label}
                </span>
              )}
              <span
                className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  special.is_active
                    ? 'bg-green-100 text-green-800' :'bg-red-100 text-red-800'
                }`}
              >
                {special.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            {/* Info */}
            <div className="p-4">
              <h3 className="font-bold text-sm text-foreground line-clamp-1">{special.title}</h3>
              {special.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{special.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Order: {special.sort_order}</p>
              {/* Actions */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => openEdit(special)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <Edit2 size={12} />
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(special.id, special.is_active)}
                  className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
                  title={special.is_active ? 'Deactivate' : 'Activate'}
                >
                  {special.is_active ? (
                    <ToggleRight size={16} className="text-green-600" />
                  ) : (
                    <ToggleLeft size={16} className="text-muted-foreground" />
                  )}
                </button>
                <button
                  onClick={() => setDeletingId(special.id)}
                  className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-accent"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full card-base p-10 text-center text-sm text-muted-foreground">
            No market specials found. Click &quot;Add Special&quot; to create one.
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in">
          <div className="card-base shadow-2xl p-6 max-w-sm w-full mx-4 animate-scale-in">
            <h3 className="font-bold text-foreground mb-2">Delete Special?</h3>
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in">
          <div className="card-base shadow-2xl p-6 max-w-md w-full mx-4 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-foreground">
                {editingSpecial ? 'Edit Market Special' : 'Add Market Special'}
              </h3>
              <button
                onClick={() => { setShowModal(false); reset(); setEditingSpecial(null); setSpecialImageUrl(''); }}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Title *</label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  placeholder="e.g. Rice Bundle Deal"
                  className="input-field w-full"
                />
                {errors.title && <p className="text-xs text-accent mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Description</label>
                <textarea
                  {...register('description')}
                  placeholder="Brief description of the special..."
                  rows={2}
                  className="input-field w-full resize-none"
                />
              </div>
              <ImageUploadField
                label="Special Image"
                required
                value={specialImageUrl}
                onChange={(url) => { setSpecialImageUrl(url); setValue('image_url', url); }}
                error={errors.image_url?.message}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Discount Label</label>
                  <input
                    type="text"
                    {...register('discount_label')}
                    placeholder="e.g. 20% OFF"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Sort Order</label>
                  <input
                    type="number"
                    {...register('sort_order', { min: 0 })}
                    className="input-field w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Link URL</label>
                <input
                  type="text"
                  {...register('link_url')}
                  placeholder="#market or /product-page"
                  className="input-field w-full"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('is_active')} className="accent-primary" />
                <span className="text-sm text-foreground">Active (visible on home page)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : editingSpecial ? 'Save Changes' : 'Add Special'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); reset(); setEditingSpecial(null); setSpecialImageUrl(''); }}
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

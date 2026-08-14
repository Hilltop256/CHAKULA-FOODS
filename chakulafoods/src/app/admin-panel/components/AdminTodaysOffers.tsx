'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, X, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AppImage from '@/components/ui/AppImage';
import { createClient } from '@/lib/supabase/client';
import ImageUploadField from './ImageUploadField';

interface Offer {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
}

type OfferForm = {
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  sort_order: number;
  is_active: boolean;
};

export default function AdminTodaysOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [offerImageUrl, setOfferImageUrl] = useState('');
  const supabase = createClient();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<OfferForm>();

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('todays_offers')
        .select('id, title, description, image_url, link_url, is_active, sort_order')
        .order('sort_order', { ascending: true });

      if (!error && data) setOffers(data as Offer[]);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAdd = () => {
    setEditingOffer(null);
    reset({ title: '', description: '', image_url: '', link_url: '#', sort_order: offers.length + 1, is_active: true });
    setOfferImageUrl('');
    setShowModal(true);
  };

  const openEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setValue('title', offer.title);
    setValue('description', offer.description || '');
    setValue('image_url', offer.image_url || '');
    setValue('link_url', offer.link_url || '#');
    setValue('sort_order', offer.sort_order);
    setValue('is_active', offer.is_active);
    setOfferImageUrl(offer.image_url || '');
    setShowModal(true);
  };

  const onSubmit = async (data: OfferForm) => {
    setIsSubmitting(true);
    try {
      if (editingOffer) {
        const { error } = await supabase
          .from('todays_offers')
          .update({
            title: data.title,
            description: data.description || null,
            image_url: data.image_url || null,
            link_url: data.link_url || null,
            sort_order: Number(data.sort_order),
            is_active: data.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingOffer.id);

        if (error) {
          toast.error('Failed to update offer');
        } else {
          toast.success('Offer updated');
          setShowModal(false);
          reset();
          setOfferImageUrl('');
          setEditingOffer(null);
          fetchOffers();
        }
      } else {
        const { error } = await supabase
          .from('todays_offers')
          .insert({
            title: data.title,
            description: data.description || null,
            image_url: data.image_url || null,
            link_url: data.link_url || null,
            sort_order: Number(data.sort_order),
            is_active: data.is_active,
          });

        if (error) {
          toast.error('Failed to create offer');
        } else {
          toast.success(`"${data.title}" added to Today's Offers`);
          setShowModal(false);
          reset();
          setOfferImageUrl('');
          fetchOffers();
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
      const { error } = await supabase.from('todays_offers').delete().eq('id', deletingId);
      if (error) {
        toast.error('Failed to delete offer');
      } else {
        setOffers((prev) => prev.filter((s) => s.id !== deletingId));
        toast.success('Offer deleted');
      }
    } catch {
      toast.error('Failed to delete offer');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from('todays_offers')
        .update({ is_active: !current, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) {
        toast.error('Failed to update status');
      } else {
        setOffers((prev) => prev.map((s) => (s.id === id ? { ...s, is_active: !current } : s)));
        toast.success(`Offer ${!current ? 'activated' : 'deactivated'}`);
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = offers.filter((s) => s.title?.toLowerCase().includes(search.toLowerCase()));

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
              placeholder="Search offers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 w-56 h-9 text-sm"
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {filtered.length} offer{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 h-9 text-sm">
          <Plus size={15} />
          Add Offer
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((offer) => (
          <div key={offer.id} className={`card-base overflow-hidden group transition-all ${!offer.is_active ? 'opacity-60' : ''}`}>
            <div className="relative h-40 bg-muted overflow-hidden">
              <AppImage src={offer.image_url || ''} alt={offer.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full ${offer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{offer.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-sm text-foreground line-clamp-1">{offer.title}</h3>
              {offer.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{offer.description}</p>}
              <p className="text-xs text-muted-foreground mt-1">Order: {offer.sort_order}</p>
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => openEdit(offer)} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">
                  <Edit2 size={12} />
                  Edit
                </button>
                <button onClick={() => toggleActive(offer.id, offer.is_active)} className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors" title={offer.is_active ? 'Deactivate' : 'Activate'}>
                  {offer.is_active ? <ToggleRight size={16} className="text-green-600" /> : <ToggleLeft size={16} className="text-muted-foreground" />}
                </button>
                <button onClick={() => setDeletingId(offer.id)} className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-accent" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full card-base p-10 text-center text-sm text-muted-foreground">No offers found. Click "Add Offer" to create one.</div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in">
          <div className="card-base shadow-2xl p-6 max-w-sm w-full mx-4 animate-scale-in">
            <h3 className="font-bold text-foreground mb-2">Delete Offer?</h3>
            <p className="text-sm text-muted-foreground mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={confirmDelete} className="flex-1 bg-accent text-accent-foreground rounded-xl py-2.5 text-sm font-semibold hover:bg-accent/90 transition-colors">Delete</button>
              <button onClick={() => setDeletingId(null)} className="flex-1 btn-outline text-sm py-2.5">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in">
          <div className="card-base shadow-2xl p-6 max-w-md w-full mx-4 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-foreground">{editingOffer ? 'Edit Offer' : 'Add Offer'}</h3>
              <button onClick={() => { setShowModal(false); reset(); setEditingOffer(null); setOfferImageUrl(''); }} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Title *</label>
                <input type="text" {...register('title', { required: 'Title is required' })} placeholder="e.g. Rice Bundle Deal" className="input-field w-full" />
                {errors.title && <p className="text-xs text-accent mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Description</label>
                <textarea {...register('description')} placeholder="Brief description of the offer..." rows={2} className="input-field w-full resize-none" />
              </div>
              <ImageUploadField label="Offer Image" required value={offerImageUrl} onChange={(url) => { setOfferImageUrl(url); setValue('image_url', url); }} error={errors.image_url?.message} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Sort Order</label>
                  <input type="number" {...register('sort_order', { min: 0 })} className="input-field w-full" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Link URL</label>
                  <input type="text" {...register('link_url')} placeholder="# or /product-page" className="input-field w-full" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...register('is_active')} className="accent-primary" /><span className="text-sm text-foreground">Active (visible on home page)</span></label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary flex items-center justify-center gap-2">{isSubmitting ? <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : editingOffer ? 'Save Changes' : 'Add Offer'}</button>
                <button type="button" onClick={() => { setShowModal(false); reset(); setEditingOffer(null); setOfferImageUrl(''); }} className="flex-1 btn-outline">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

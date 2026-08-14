"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, Trash2, X, Edit2, ToggleLeft, ToggleRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import AppImage from "@/components/ui/AppImage";
import { createClient } from "@/lib/supabase/client";
import ImageUploadField from "./ImageUploadField";

interface Offer {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
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
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<OfferForm>();

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from("offers")
        .select("id, title, description, image_url, link_url, is_active, sort_order, created_at")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOffers((data || []) as Offer[]);
    } catch (error) {
      console.error("Offers load error:", error);
      toast.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setEditingOffer(null);
    setImageUrl("");
    reset();
  };

  const openAdd = () => {
    setEditingOffer(null);
    setImageUrl("");
    reset({
      title: "",
      description: "",
      image_url: "",
      link_url: "#",
      sort_order: offers.length + 1,
      is_active: true,
    });
    setShowModal(true);
  };

  const openEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setImageUrl(offer.image_url || "");
    reset({
      title: offer.title,
      description: offer.description || "",
      image_url: offer.image_url || "",
      link_url: offer.link_url || "#",
      sort_order: offer.sort_order,
      is_active: offer.is_active,
    });
    setShowModal(true);
  };

  const onSubmit = async (data: OfferForm) => {
    setIsSubmitting(true);
    try {
      const payload = {
        title: data.title.trim(),
        description: data.description.trim() || null,
        image_url: data.image_url || null,
        link_url: data.link_url.trim() || null,
        sort_order: Number(data.sort_order) || 0,
        is_active: data.is_active,
        updated_at: new Date().toISOString(),
      };

      if (editingOffer) {
        const { error } = await supabase
          .from("offers")
          .update(payload)
          .eq("id", editingOffer.id);
        if (error) throw error;
        toast.success("Offer updated");
      } else {
        const { error } = await supabase.from("offers").insert(payload);
        if (error) throw error;
        toast.success(`"${data.title}" added to Today's Offers`);
      }

      closeModal();
      await fetchOffers();
    } catch (error) {
      console.error("Offer save error:", error);
      toast.error(editingOffer ? "Failed to update offer" : "Failed to create offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const { error } = await supabase.from("offers").delete().eq("id", deletingId);
      if (error) throw error;
      setOffers((current) => current.filter((offer) => offer.id !== deletingId));
      toast.success("Offer deleted");
    } catch (error) {
      console.error("Offer delete error:", error);
      toast.error("Failed to delete offer");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (offer: Offer) => {
    try {
      const { error } = await supabase
        .from("offers")
        .update({ is_active: !offer.is_active, updated_at: new Date().toISOString() })
        .eq("id", offer.id);
      if (error) throw error;

      setOffers((current) =>
        current.map((item) =>
          item.id === offer.id ? { ...item, is_active: !offer.is_active } : item
        )
      );
      toast.success(`Offer ${offer.is_active ? "deactivated" : "activated"}`);
    } catch (error) {
      console.error("Offer status error:", error);
      toast.error("Failed to update offer status");
    }
  };

  const filtered = offers.filter((offer) =>
    offer.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="card-base p-10 text-center animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-screen-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Today&apos;s Offers</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the long banner offers shown below the home page banner.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search offers..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="input-field pl-9 w-56 h-9 text-sm"
            />
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2 h-9 text-sm">
            <Plus size={15} />
            Add Offer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((offer) => (
          <div
            key={offer.id}
            className={`card-base overflow-hidden transition-all ${!offer.is_active ? "opacity-60" : ""}`}
          >
            <div className="relative h-40 bg-muted overflow-hidden">
              {offer.image_url ? (
                <AppImage src={offer.image_url} alt={offer.title} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                  No image
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              <span
                className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  offer.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {offer.is_active ? "Active" : "Inactive"}
              </span>
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <h3 className="font-bold text-lg line-clamp-1">{offer.title}</h3>
                {offer.description && (
                  <p className="text-xs text-white/80 line-clamp-1 mt-1">{offer.description}</p>
                )}
              </div>
            </div>
            <div className="p-4 flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">Display order: {offer.sort_order}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(offer)}
                  className="flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  onClick={() => toggleActive(offer)}
                  className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
                  title={offer.is_active ? "Deactivate" : "Activate"}
                >
                  {offer.is_active ? <ToggleRight size={16} className="text-green-600" /> : <ToggleLeft size={16} />}
                </button>
                <button
                  onClick={() => setDeletingId(offer.id)}
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
            No offers found. Click &quot;Add Offer&quot; to create the first one.
          </div>
        )}
      </div>

      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm">
          <div className="card-base shadow-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-foreground mb-2">Delete Offer?</h3>
            <p className="text-sm text-muted-foreground mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={confirmDelete} className="flex-1 bg-accent text-accent-foreground rounded-xl py-2.5 text-sm font-semibold">
                Delete
              </button>
              <button onClick={() => setDeletingId(null)} className="flex-1 btn-outline text-sm py-2.5">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm">
          <div className="card-base shadow-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-foreground text-lg">
                  {editingOffer ? "Edit Today's Offer" : "Add Today's Offer"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Use a wide image for the best banner result.</p>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Title *</label>
                <input
                  type="text"
                  {...register("title", { required: "Title is required" })}
                  placeholder="e.g. Weekend Family Meal Deal"
                  className="input-field w-full"
                />
                {errors.title && <p className="text-xs text-accent mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Description</label>
                <textarea
                  {...register("description")}
                  placeholder="Short offer description..."
                  rows={2}
                  className="input-field w-full resize-none"
                />
              </div>

              <ImageUploadField
                label="Offer Banner Image"
                value={imageUrl}
                onChange={(url) => {
                  setImageUrl(url);
                  setValue("image_url", url);
                }}
              />

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Link URL</label>
                <input
                  type="text"
                  {...register("link_url")}
                  placeholder="/restaurant-page or https://..."
                  className="input-field w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Display order</label>
                  <input
                    type="number"
                    min={0}
                    {...register("sort_order", { valueAsNumber: true })}
                    className="input-field w-full"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground pt-7">
                  <input type="checkbox" {...register("is_active")} className="rounded border-border" />
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 disabled:opacity-50">
                  {isSubmitting ? "Saving..." : editingOffer ? "Save Changes" : "Add Offer"}
                </button>
                <button type="button" onClick={closeModal} className="btn-outline px-5" disabled={isSubmitting}>
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

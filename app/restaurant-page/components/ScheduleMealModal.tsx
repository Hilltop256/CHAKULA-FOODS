'use client';

import React, { useState } from 'react';
import { X, Calendar, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type ScheduleForm = {
  date: string;
  time: string;
  guests: number;
  notes: string;
  recurring: string;
};

interface ScheduleMealModalProps {
  item: { id: string; name: string; price: number };
  onClose: () => void;
}

export default function ScheduleMealModal({ item, onClose }: ScheduleMealModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ScheduleForm>({
    defaultValues: { guests: 1, recurring: 'once' },
  });

  const onSubmit = (data: ScheduleForm) => {
    setIsSubmitting(true);
    // Backend integration point: POST /api/orders/scheduled with { productId: item.id, ...data }
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`${item.name} scheduled for ${data.date} at ${data.time}`);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in">
      <div className="card-base shadow-2xl w-full max-w-md mx-4 animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            <h3 className="font-bold text-foreground">Schedule Order</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-2 bg-muted/30 border-b border-border">
          <p className="text-sm font-semibold text-foreground">{item.name}</p>
          <p className="text-xs text-muted-foreground tabular-nums">UGX {item.price.toLocaleString()}</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Delivery Date
              </label>
              <input
                type="date"
                {...register('date', { required: 'Select a date' })}
                className="input-field"
              />
              {errors.date && <p className="text-xs text-accent mt-1">{errors.date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Delivery Time
              </label>
              <input
                type="time"
                {...register('time', { required: 'Select a time' })}
                className="input-field"
              />
              {errors.time && <p className="text-xs text-accent mt-1">{errors.time.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Number of People
            </label>
            <div className="relative">
              <Users size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="number"
                {...register('guests', { min: { value: 1, message: 'Minimum 1 person' } })}
                min={1}
                className="input-field pl-9"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Recurring Schedule
            </label>
            <select {...register('recurring')} className="input-field">
              <option value="once">One-time order</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="weekdays">Weekdays only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Special Instructions
            </label>
            <textarea
              {...register('notes')}
              placeholder="Dietary requirements, delivery notes..."
              rows={3}
              className="input-field resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-outline text-sm">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary text-sm flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar size={14} />
                  Schedule Order
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
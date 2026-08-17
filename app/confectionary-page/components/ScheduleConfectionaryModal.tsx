'use client';

import React, { useState } from 'react';
import { X, Calendar, Gift, MessageSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type ScheduleForm = {
  eventType: string;
  eventDate: string;
  deliveryTime: string;
  recipientName: string;
  customMessage: string;
  recurring: string;
};

interface ScheduleConfectionaryModalProps {
  item: { id: string; name: string; price: number; leadTime: string };
  onClose: () => void;
}

const eventTypes = ['Birthday', 'Wedding', 'Anniversary', 'Corporate Event', 'Baby Shower', 'Graduation', 'Weekly Subscription', 'Other'];

export default function ScheduleConfectionaryModal({ item, onClose }: ScheduleConfectionaryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ScheduleForm>({
    defaultValues: { eventType: 'Birthday', recurring: 'once' },
  });

  const eventType = watch('eventType');

  const onSubmit = (data: ScheduleForm) => {
    setIsSubmitting(true);
    // Backend integration point: POST /api/orders/scheduled { productId: item.id, type: 'confectionary', ...data }
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`${item.name} scheduled for ${data.eventType} on ${data.eventDate}!`);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in">
      <div className="card-base shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Gift size={18} className="text-secondary" />
            <h3 className="font-bold text-foreground">Schedule Order</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-2 bg-secondary/5 border-b border-border">
          <p className="text-sm font-semibold text-foreground">{item.name}</p>
          <p className="text-xs text-muted-foreground">Lead time: {item.leadTime} · UGX {item.price.toLocaleString()}</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Event Type</label>
            <select {...register('eventType', { required: 'Select event type' })} className="input-field">
              {eventTypes.map((e) => (
                <option key={`event-${e}`} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Event Date</label>
              <input type="date" {...register('eventDate', { required: 'Select event date' })} className="input-field" />
              {errors.eventDate && <p className="text-xs text-accent mt-1">{errors.eventDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Delivery Time</label>
              <input type="time" {...register('deliveryTime', { required: 'Select time' })} className="input-field" />
              {errors.deliveryTime && <p className="text-xs text-accent mt-1">{errors.deliveryTime.message}</p>}
            </div>
          </div>
          {(eventType === 'Birthday' || eventType === 'Anniversary') && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Recipient Name</label>
              <p className="text-xs text-muted-foreground mb-1.5">Name to be written on the cake</p>
              <input
                type="text"
                {...register('recipientName')}
                placeholder="e.g. Happy Birthday Sarah!"
                className="input-field"
              />
            </div>
          )}
          {eventType === 'Weekly Subscription' && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Recurring</label>
              <select {...register('recurring')} className="input-field">
                <option value="weekly">Every week</option>
                <option value="biweekly">Every 2 weeks</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Special Instructions
            </label>
            <div className="relative">
              <MessageSquare size={14} className="absolute left-3 top-3 text-muted-foreground" />
              <textarea
                {...register('customMessage')}
                placeholder="Dietary restrictions, design preferences, allergies..."
                rows={3}
                className="input-field pl-9 resize-none"
              />
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            <strong>Note:</strong> This item requires {item.leadTime} advance notice. 
            We will confirm your order via SMS/WhatsApp within 2 hours of placing it.
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 btn-outline text-sm">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2">
              {isSubmitting ? (
                <><span className="w-4 h-4 border-2 border-secondary-foreground border-t-transparent rounded-full animate-spin" />Scheduling...</>
              ) : (
                <><Calendar size={14} />Schedule Order</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
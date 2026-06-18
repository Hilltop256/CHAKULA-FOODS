'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Bike, Phone, CheckCircle, Truck, Package, User, Clock, MapPin, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string | null;
  delivery_address: string | null;
  total_amount: number;
  status: string;
  department: string | null;
  created_at: string;
}

interface Rider {
  id: string;
  name: string;
  phone: string | null;
  vehicle_type: string | null;
  vehicle_plate: string | null;
  status: string;
}

interface Dispatch {
  id: string;
  order_id: string;
  rider_id: string | null;
  status: string;
  assigned_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  notes: string | null;
}

interface AdminOrderDispatchProps {
  orderId: string;
  onBack: () => void;
}

const dispatchStatusLabel: Record<string, string> = {
  pending: 'Pending Assignment',
  rider_assigned: 'Rider Assigned',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

const dispatchStatusBadge: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  rider_assigned: 'bg-blue-100 text-blue-800 border border-blue-200',
  out_for_delivery: 'bg-orange-100 text-orange-800 border border-orange-200',
  delivered: 'bg-green-100 text-green-800 border border-green-200',
};

const riderStatusBadge: Record<string, string> = {
  available: 'bg-green-100 text-green-700 border border-green-200',
  on_delivery: 'bg-orange-100 text-orange-700 border border-orange-200',
  offline: 'bg-gray-100 text-gray-500 border border-gray-200',
};

const DISPATCH_STEPS = [
  { key: 'pending', label: 'Pending', icon: Package },
  { key: 'rider_assigned', label: 'Rider Assigned', icon: User },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function AdminOrderDispatch({ orderId, onBack }: AdminOrderDispatchProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [dispatch, setDispatch] = useState<Dispatch | null>(null);
  const [selectedRiderId, setSelectedRiderId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch order
      const { data: orderData } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, customer_phone, delivery_address, total_amount, status, department, created_at')
        .eq('id', orderId)
        .single();

      if (orderData) setOrder(orderData);

      // Fetch all active riders
      const { data: ridersData } = await supabase
        .from('riders')
        .select('id, name, phone, vehicle_type, vehicle_plate, status')
        .eq('is_active', true)
        .order('name');

      if (ridersData) setRiders(ridersData);

      // Fetch existing dispatch record
      const { data: dispatchData } = await supabase
        .from('order_dispatch')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (dispatchData) {
        setDispatch(dispatchData);
        if (dispatchData.rider_id) setSelectedRiderId(dispatchData.rider_id);
      }
    } catch {
      toast.error('Failed to load dispatch data');
    } finally {
      setLoading(false);
    }
  }, [orderId, supabase]);

  useEffect(() => {
    fetchData();

    // Real-time subscription for dispatch updates
    const channel = supabase
      .channel(`dispatch_${orderId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_dispatch', filter: `order_id=eq.${orderId}` }, (payload) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          setDispatch(payload.new as Dispatch);
          if ((payload.new as Dispatch).rider_id) {
            setSelectedRiderId((payload.new as Dispatch).rider_id!);
          }
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, (payload) => {
        setOrder(payload.new as Order);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId, fetchData, supabase]);

  const handleAssignRider = async () => {
    if (!selectedRiderId) {
      toast.error('Please select a rider first');
      return;
    }
    setUpdating(true);
    try {
      const now = new Date().toISOString();

      if (dispatch) {
        // Update existing dispatch
        const { error } = await supabase
          .from('order_dispatch')
          .update({ rider_id: selectedRiderId, status: 'rider_assigned', assigned_at: now })
          .eq('id', dispatch.id);
        if (error) throw error;
      } else {
        // Create new dispatch record
        const { error } = await supabase
          .from('order_dispatch')
          .insert({ order_id: orderId, rider_id: selectedRiderId, status: 'rider_assigned', assigned_at: now });
        if (error) throw error;
      }

      // Update rider status to on_delivery
      await supabase.from('riders').update({ status: 'on_delivery' }).eq('id', selectedRiderId);

      toast.success('Rider assigned successfully!');
      fetchData();
    } catch (err: unknown) {
      toast.error('Failed to assign rider');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateDispatchStatus = async (newStatus: string) => {
    if (!dispatch) return;
    setUpdating(true);
    try {
      const now = new Date().toISOString();
      const updates: Record<string, string> = { status: newStatus };

      if (newStatus === 'out_for_delivery') updates.picked_up_at = now;
      if (newStatus === 'delivered') {
        updates.delivered_at = now;
        // Free up the rider
        if (dispatch.rider_id) {
          await supabase.from('riders').update({ status: 'available' }).eq('id', dispatch.rider_id);
        }
      }

      const { error } = await supabase
        .from('order_dispatch')
        .update(updates)
        .eq('id', dispatch.id);

      if (error) throw error;
      toast.success(`Status updated to "${dispatchStatusLabel[newStatus]}"`);
      fetchData();
    } catch {
      toast.error('Failed to update dispatch status');
    } finally {
      setUpdating(false);
    }
  };

  const availableRiders = riders.filter((r) => r.status === 'available');
  const currentStepIndex = DISPATCH_STEPS.findIndex((s) => s.key === (dispatch?.status || 'pending'));

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-base p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-3" />
              <div className="h-8 bg-muted rounded mb-2" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Order not found.</p>
        <button onClick={onBack} className="btn-primary mt-4">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-screen-xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Order Dispatch</h2>
          <p className="text-sm text-muted-foreground">
            Order <span className="font-mono font-semibold text-primary">#{order.order_number}</span> — {order.customer_name}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="ml-auto p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Progress Steps */}
      <div className="card-base p-5">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Dispatch Progress</h3>
        <div className="flex items-center gap-0">
          {DISPATCH_STEPS.map((step, idx) => {
            const StepIcon = step.icon;
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : isCurrent
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-muted border-border text-muted-foreground'
                    }`}
                  >
                    <StepIcon size={18} />
                  </div>
                  <span className={`text-xs font-medium text-center leading-tight ${isCurrent ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
                {idx < DISPATCH_STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mb-5 transition-all ${idx < currentStepIndex ? 'bg-green-400' : 'bg-border'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="card-base p-5 space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Order Details</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <User size={14} className="text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Customer</p>
                <p className="text-sm font-semibold text-foreground">{order.customer_name}</p>
              </div>
            </div>
            {order.customer_phone && (
              <div className="flex items-start gap-2">
                <Phone size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium text-foreground">{order.customer_phone}</p>
                </div>
              </div>
            )}
            {order.delivery_address && (
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Delivery Address</p>
                  <p className="text-sm font-medium text-foreground">{order.delivery_address}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <Clock size={14} className="text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Order Time</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(order.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Amount</span>
                <span className="text-base font-bold text-foreground">UGX {order.total_amount?.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Current Status</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${dispatchStatusBadge[dispatch?.status || 'pending']}`}>
                {dispatchStatusLabel[dispatch?.status || 'pending']}
              </span>
            </div>
          </div>
        </div>

        {/* Rider Assignment */}
        <div className="card-base p-5 space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Assign Rider</h3>

          {dispatch?.status && dispatch.status !== 'pending' ? (
            // Show assigned rider info
            <div>
              {dispatch.rider_id && (() => {
                const assignedRider = riders.find((r) => r.id === dispatch.rider_id);
                return assignedRider ? (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Bike size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{assignedRider.name}</p>
                        <p className="text-xs text-muted-foreground">{assignedRider.vehicle_type} · {assignedRider.vehicle_plate || 'N/A'}</p>
                      </div>
                    </div>
                    {assignedRider.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone size={13} />
                        <span>{assignedRider.phone}</span>
                      </div>
                    )}
                    <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full ${riderStatusBadge[assignedRider.status]}`}>
                      {assignedRider.status === 'on_delivery' ? 'On Delivery' : assignedRider.status === 'available' ? 'Available' : 'Offline'}
                    </span>
                  </div>
                ) : null;
              })()}
            </div>
          ) : (
            // Rider selection
            <div className="space-y-3">
              {availableRiders.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <Bike size={28} className="mx-auto mb-2 opacity-40" />
                  No riders available right now
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {availableRiders.map((rider) => (
                    <label
                      key={rider.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedRiderId === rider.id
                          ? 'border-primary bg-primary/5' :'border-border hover:border-primary/40 hover:bg-muted/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="rider"
                        value={rider.id}
                        checked={selectedRiderId === rider.id}
                        onChange={() => setSelectedRiderId(rider.id)}
                        className="sr-only"
                      />
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bike size={16} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{rider.name}</p>
                        <p className="text-xs text-muted-foreground">{rider.vehicle_type} · {rider.vehicle_plate || 'N/A'}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${riderStatusBadge[rider.status]}`}>
                        Available
                      </span>
                    </label>
                  ))}
                </div>
              )}
              <button
                onClick={handleAssignRider}
                disabled={!selectedRiderId || updating || availableRiders.length === 0}
                className="w-full btn-primary py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updating ? (
                  <><RefreshCw size={15} className="animate-spin" /> Assigning...</>
                ) : (
                  <><Bike size={15} /> Assign Rider</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Dispatch Actions */}
        <div className="card-base p-5 space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Update Status</h3>

          <div className="space-y-3">
            {/* Out for Delivery */}
            <div className={`p-4 rounded-xl border-2 transition-all ${
              dispatch?.status === 'rider_assigned' ?'border-orange-300 bg-orange-50'
                : dispatch?.status === 'out_for_delivery'|| dispatch?.status === 'delivered' ?'border-green-200 bg-green-50 opacity-60' :'border-border bg-muted/20 opacity-40'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <Truck size={18} className={dispatch?.status === 'rider_assigned' ? 'text-orange-600' : 'text-muted-foreground'} />
                <div>
                  <p className="text-sm font-semibold text-foreground">Out for Delivery</p>
                  <p className="text-xs text-muted-foreground">Rider is on the way</p>
                </div>
              </div>
              <button
                onClick={() => handleUpdateDispatchStatus('out_for_delivery')}
                disabled={dispatch?.status !== 'rider_assigned' || updating}
                className="w-full py-2 rounded-lg text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Mark Out for Delivery
              </button>
            </div>

            {/* Delivered */}
            <div className={`p-4 rounded-xl border-2 transition-all ${
              dispatch?.status === 'out_for_delivery'
                ? 'border-green-400 bg-green-50'
                : dispatch?.status === 'delivered' ?'border-green-200 bg-green-50 opacity-60' :'border-border bg-muted/20 opacity-40'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle size={18} className={dispatch?.status === 'out_for_delivery' ? 'text-green-600' : 'text-muted-foreground'} />
                <div>
                  <p className="text-sm font-semibold text-foreground">Delivered</p>
                  <p className="text-xs text-muted-foreground">Order successfully delivered</p>
                </div>
              </div>
              <button
                onClick={() => handleUpdateDispatchStatus('delivered')}
                disabled={dispatch?.status !== 'out_for_delivery' || updating}
                className="w-full py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Mark as Delivered
              </button>
            </div>

            {dispatch?.status === 'delivered' && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700">
                <CheckCircle size={16} />
                <span className="text-sm font-semibold">Order successfully delivered!</span>
              </div>
            )}
          </div>

          {/* Timestamps */}
          {dispatch && (
            <div className="pt-3 border-t border-border space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Timeline</p>
              {dispatch.assigned_at && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Rider Assigned</span>
                  <span className="font-medium text-foreground">{new Date(dispatch.assigned_at).toLocaleTimeString('en-GB', { timeStyle: 'short' })}</span>
                </div>
              )}
              {dispatch.picked_up_at && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Out for Delivery</span>
                  <span className="font-medium text-foreground">{new Date(dispatch.picked_up_at).toLocaleTimeString('en-GB', { timeStyle: 'short' })}</span>
                </div>
              )}
              {dispatch.delivered_at && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Delivered</span>
                  <span className="font-medium text-foreground">{new Date(dispatch.delivered_at).toLocaleTimeString('en-GB', { timeStyle: 'short' })}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* All Riders Overview */}
      <div className="card-base p-5">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">All Riders</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {riders.map((rider) => (
            <div key={rider.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bike size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{rider.name}</p>
                <p className="text-xs text-muted-foreground truncate">{rider.vehicle_type}</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${riderStatusBadge[rider.status]}`}>
                {rider.status === 'available' ? 'Available' : rider.status === 'on_delivery' ? 'On Delivery' : 'Offline'}
              </span>
            </div>
          ))}
          {riders.length === 0 && (
            <div className="col-span-4 text-center py-6 text-sm text-muted-foreground">No riders found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

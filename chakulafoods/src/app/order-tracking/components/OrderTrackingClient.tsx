'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ChevronLeft,
  MapPin,
  Clock,
  CheckCircle,
  Circle,
  Loader2,
  Package,
  Bike,
  ShoppingBag,
  Phone,
  RefreshCw,
  Navigation,
  MessageCircle,
  Star,
  AlertCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { loadGoogleMaps } from '@/lib/googleMapsLoader';
import TopNav from '@/components/TopNav';
import { useAuth } from '@/contexts/AuthContext';



// Chakula Foods Naalya store location
const STORE_LOCATION = { lat: 0.3476, lng: 32.6252 };

// Simulated rider location (slightly offset from store, moves toward customer)
function getRiderLocation(
  storeLocation: { lat: number; lng: number },
  customerLocation: { lat: number; lng: number } | null,
  progress: number // 0-1
) {
  if (!customerLocation) return storeLocation;
  return {
    lat: storeLocation.lat + (customerLocation.lat - storeLocation.lat) * progress,
    lng: storeLocation.lng + (customerLocation.lng - storeLocation.lng) * progress,
  };
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string | null;
  status: string;
  total_amount: number;
  delivery_address: string | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
  created_at: string;
  department: string | null;
  customer_id: string;
}

const STATUS_STEPS = [
  { key: 'new_order', label: 'Order Placed', icon: ShoppingBag, description: 'Your order has been received' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, description: 'Restaurant confirmed your order' },
  { key: 'preparing', label: 'Preparing', icon: Package, description: 'Your food is being prepared' },
  { key: 'rider_assigned', label: 'Rider Assigned', icon: Bike, description: 'A rider has been assigned' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Navigation, description: 'Rider is on the way' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, description: 'Order delivered successfully' },
];

const STATUS_ORDER = ['new_order', 'confirmed', 'preparing', 'rider_assigned', 'out_for_delivery', 'delivered'];

function getStepIndex(status: string) {
  return STATUS_ORDER.indexOf(status);
}

// Returns remaining minutes based on order status
function getRemainingMinutes(order: Order): number {
  const minutesMap: Record<string, number> = {
    new_order: 45,
    confirmed: 40,
    preparing: 25,
    rider_assigned: 20,
    out_for_delivery: 15,
    delivered: 0,
  };
  return minutesMap[order.status] ?? 45;
}

function getEstimatedDelivery(order: Order, now: Date): string {
  if (order.status === 'delivered') return 'Delivered';
  const remaining = getRemainingMinutes(order);
  const eta = new Date(now.getTime() + remaining * 60 * 1000);
  return eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getRemainingLabel(order: Order): string {
  if (order.status === 'delivered') return 'Delivered';
  const mins = getRemainingMinutes(order);
  if (mins === 0) return 'Arriving now';
  return `~${mins} min away`;
}

// Simulated rider info (in a real app this would come from DB)
const RIDER_INFO = {
  name: 'David K.',
  phone: '+256 701 234 567',
  rating: 4.8,
  trips: 312,
  vehicle: 'Boda Boda · UG 123X',
};

declare global {
  interface Window {
    google: any;
    initOrderTrackingMap: () => void;
  }
}

export default function OrderTrackingClient() {
  const { user, profile } = useAuth();
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get('order_id');

  const supabase = createClient();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const riderMarkerRef = useRef<any>(null);
  const storeMarkerRef = useRef<any>(null);
  const customerMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapApiLoaded, setMapApiLoaded] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [riderProgress, setRiderProgress] = useState(0.1);
  const [refreshing, setRefreshing] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  // Live clock for ETA countdown
  const [now, setNow] = useState<Date>(new Date());

  // Tick every 30 seconds to refresh ETA display
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  // Fetch user orders — uses customer_id (correct schema column)
  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, customer_phone, status, total_amount, delivery_address, delivery_lat, delivery_lng, created_at, department, customer_id')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setOrders(data);
        if (orderIdParam) {
          const found = data.find((o) => o.id === orderIdParam || o.order_number === orderIdParam);
          if (found) setSelectedOrder(found);
          else if (data.length > 0) setSelectedOrder(data[0]);
        } else if (data.length > 0) {
          setSelectedOrder((prev) => {
            // Keep selected order in sync if it was already selected
            if (prev) {
              const refreshed = data.find((o) => o.id === prev.id);
              return refreshed ?? data[0];
            }
            return data[0];
          });
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user, orderIdParam]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Real-time order updates — scoped to this user's orders via filter
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`order_tracking_user_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `customer_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as Order;
          setOrders((prev) =>
            prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
          );
          setSelectedOrder((prev) =>
            prev?.id === updated.id ? { ...prev, ...updated } : prev
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `customer_id=eq.${user.id}`,
        },
        (payload) => {
          const newOrder = payload.new as Order;
          setOrders((prev) => [newOrder, ...prev]);
          // Auto-select new order if none selected
          setSelectedOrder((prev) => prev ?? newOrder);
        }
      )
      .subscribe((status) => {
        setRealtimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
      setRealtimeConnected(false);
    };
  }, [user]);

  // Animate rider progress for out_for_delivery
  useEffect(() => {
    if (selectedOrder?.status !== 'out_for_delivery') {
      setRiderProgress(selectedOrder?.status === 'delivered' ? 1 : 0.1);
      return;
    }
    const interval = setInterval(() => {
      setRiderProgress((prev) => {
        const next = prev + 0.005;
        return next >= 0.95 ? 0.95 : next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedOrder?.status]);

  // Load Google Maps
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === 'your-google-maps-api-key-here') return;

    loadGoogleMaps(apiKey, () => {
      setMapApiLoaded(true);
    });
  }, []);

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google || !selectedOrder) return;

    const customerLocation =
      selectedOrder.delivery_lat && selectedOrder.delivery_lng
        ? { lat: selectedOrder.delivery_lat, lng: selectedOrder.delivery_lng }
        : null;

    const center = customerLocation || STORE_LOCATION;

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
      ],
    });

    mapInstanceRef.current = map;

    // Store marker
    storeMarkerRef.current = new window.google.maps.Marker({
      position: STORE_LOCATION,
      map,
      title: 'Chakula Foods Naalya',
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
        scaledSize: new window.google.maps.Size(36, 36),
      },
      label: { text: '🏪', fontSize: '18px' },
    });

    // Customer marker
    if (customerLocation) {
      customerMarkerRef.current = new window.google.maps.Marker({
        position: customerLocation,
        map,
        title: 'Delivery Location',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new window.google.maps.Size(36, 36),
        },
        label: { text: '📍', fontSize: '18px' },
      });

      // Route line
      routeLineRef.current = new window.google.maps.Polyline({
        path: [STORE_LOCATION, customerLocation],
        geodesic: true,
        strokeColor: '#1B5E38',
        strokeOpacity: 0.6,
        strokeWeight: 3,
        map,
      });

      // Rider marker
      const riderPos = getRiderLocation(STORE_LOCATION, customerLocation, riderProgress);
      riderMarkerRef.current = new window.google.maps.Marker({
        position: riderPos,
        map,
        title: 'Rider',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new window.google.maps.Size(40, 40),
        },
        label: { text: '🛵', fontSize: '20px' },
      });

      // Fit bounds
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(STORE_LOCATION);
      bounds.extend(customerLocation);
      map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
    }

    setMapLoaded(true);
  }, [selectedOrder, riderProgress]);

  useEffect(() => {
    if (mapApiLoaded && mapRef.current && selectedOrder) {
      initMap();
    }
  }, [mapApiLoaded, selectedOrder?.id]);

  // Update rider marker position
  useEffect(() => {
    if (!riderMarkerRef.current || !selectedOrder?.delivery_lat || !selectedOrder?.delivery_lng) return;
    const customerLocation = { lat: selectedOrder.delivery_lat, lng: selectedOrder.delivery_lng };
    const riderPos = getRiderLocation(STORE_LOCATION, customerLocation, riderProgress);
    riderMarkerRef.current.setPosition(riderPos);
  }, [riderProgress, selectedOrder]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const activeStatus = selectedOrder?.status ?? 'new_order';
  const currentStepIdx = getStepIndex(activeStatus);
  const isCancelled = activeStatus === 'cancelled';
  const isDelivered = activeStatus === 'delivered';
  const isOutForDelivery = activeStatus === 'out_for_delivery';
  const isRiderAssigned = activeStatus === 'rider_assigned' || isOutForDelivery;
  const showMap = ['rider_assigned', 'out_for_delivery', 'delivered'].includes(activeStatus);
  const apiKeyMissing =
    !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'your-google-maps-api-key-here';

  return (
    <div className="min-h-screen bg-background">
      <TopNav isLoggedIn={!!user} userName={profile?.full_name || ''} userRole={profile?.role as any} />

      <div className="max-w-screen-xl mx-auto px-4 py-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ChevronLeft size={20} className="text-foreground" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Track Your Order</h1>
            <p className="text-sm text-muted-foreground">Real-time delivery updates</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {/* Real-time connection indicator */}
            {user && !loading && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  realtimeConnected
                    ? 'bg-green-50 text-green-700 border border-green-200' :'bg-muted text-muted-foreground border border-border'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    realtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'
                  }`}
                />
                {realtimeConnected ? 'Live' : 'Connecting…'}
              </div>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Refresh"
            >
              <RefreshCw size={18} className={`text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : !user ? (
          <div className="card-base p-10 text-center">
            <ShoppingBag size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-foreground font-semibold mb-1">Sign in to track your orders</p>
            <p className="text-sm text-muted-foreground mb-4">You need to be logged in to view your order status.</p>
            <Link href="/sign-up-login-screen" className="btn-primary inline-block">Sign In</Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="card-base p-10 text-center">
            <Package size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-foreground font-semibold mb-1">No orders yet</p>
            <p className="text-sm text-muted-foreground mb-4">Place an order to start tracking it here.</p>
            <Link href="/" className="btn-primary inline-block">Browse Menu</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Order selector + status timeline */}
            <div className="lg:col-span-1 space-y-4">
              {/* Order selector */}
              {orders.length > 1 && (
                <div className="card-base p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Your Orders</p>
                  <div className="space-y-2">
                    {orders.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setSelectedOrder(o)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all text-sm ${
                          selectedOrder?.id === o.id
                            ? 'border-primary bg-primary/5 text-primary font-semibold' :'border-border hover:bg-muted text-foreground'
                        }`}
                      >
                        <span className="font-mono">#{o.order_number}</span>
                        <span className="ml-2 text-xs text-muted-foreground capitalize">{o.status.replace(/_/g, ' ')}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedOrder && (
                <>
                  {/* Order summary card */}
                  <div className="card-base p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Order</p>
                        <p className="font-bold text-foreground font-mono">#{selectedOrder.order_number}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground font-medium">Total</p>
                        <p className="font-bold text-foreground">UGX {selectedOrder.total_amount.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* ETA — updates live via now ticker */}
                    {!isCancelled && (
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDelivered ? 'bg-green-50 border border-green-200' : 'bg-secondary/10 border border-secondary/20'}`}>
                        <Clock size={16} className={isDelivered ? 'text-green-700' : 'text-secondary'} />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {isDelivered ? 'Delivered at' : 'Estimated Delivery'}
                          </p>
                          <p className={`text-sm font-bold ${isDelivered ? 'text-green-700' : 'text-secondary'}`}>
                            {getEstimatedDelivery(selectedOrder, now)}
                          </p>
                          {!isDelivered && (
                            <p className="text-xs text-muted-foreground">{getRemainingLabel(selectedOrder)}</p>
                          )}
                        </div>
                        {!isDelivered && realtimeConnected && (
                          <span className="ml-auto flex items-center gap-1 text-xs text-green-600 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Live
                          </span>
                        )}
                      </div>
                    )}

                    {/* Delivery address */}
                    {selectedOrder.delivery_address && (
                      <div className="flex items-start gap-2">
                        <MapPin size={15} className="text-muted-foreground mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground leading-snug">{selectedOrder.delivery_address}</p>
                      </div>
                    )}

                    {/* Phone */}
                    {selectedOrder.customer_phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={15} className="text-muted-foreground shrink-0" />
                        <p className="text-sm text-muted-foreground">{selectedOrder.customer_phone}</p>
                      </div>
                    )}
                  </div>

                  {/* Rider Card — shown when rider is assigned or out for delivery */}
                  {isRiderAssigned && !isDelivered && (
                    <div className="card-base p-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Your Rider</p>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                          🛵
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground">{RIDER_INFO.name}</p>
                          <p className="text-xs text-muted-foreground">{RIDER_INFO.vehicle}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star size={11} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-semibold text-foreground">{RIDER_INFO.rating}</span>
                            <span className="text-xs text-muted-foreground">· {RIDER_INFO.trips} trips</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={`tel:${RIDER_INFO.phone}`}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-sm font-semibold text-primary"
                        >
                          <Phone size={14} />
                          Call
                        </a>
                        <a
                          href={`sms:${RIDER_INFO.phone}`}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-semibold text-foreground"
                        >
                          <MessageCircle size={14} />
                          Message
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Delivered celebration */}
                  {isDelivered && (
                    <div className="card-base p-4 bg-green-50 border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl shrink-0">
                          🎉
                        </div>
                        <div>
                          <p className="font-bold text-green-800">Order Delivered!</p>
                          <p className="text-xs text-green-700">Enjoy your meal. Rate your experience below.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-3 justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} className="p-1 hover:scale-110 transition-transform">
                            <Star size={22} className="text-yellow-400 fill-yellow-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status timeline */}
                  <div className="card-base p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Order Progress</p>
                    {isCancelled ? (
                      <div className="flex items-center gap-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                          <AlertCircle size={16} className="text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-red-600">Order Cancelled</p>
                          <p className="text-xs text-muted-foreground">This order has been cancelled</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-0">
                        {STATUS_STEPS.map((step, idx) => {
                          const isCompleted = idx < currentStepIdx;
                          const isActive = idx === currentStepIdx;
                          const StepIcon = step.icon;
                          const isLast = idx === STATUS_STEPS.length - 1;

                          return (
                            <div key={step.key} className="flex gap-3">
                              {/* Connector column */}
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                    isCompleted
                                      ? 'bg-primary text-primary-foreground'
                                      : isActive
                                      ? 'bg-secondary text-secondary-foreground ring-4 ring-secondary/20'
                                      : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  {isCompleted ? (
                                    <CheckCircle size={16} />
                                  ) : isActive ? (
                                    <StepIcon size={15} />
                                  ) : (
                                    <Circle size={14} />
                                  )}
                                </div>
                                {!isLast && (
                                  <div
                                    className={`w-0.5 flex-1 my-1 min-h-[20px] transition-colors ${
                                      isCompleted ? 'bg-primary' : 'bg-border'
                                    }`}
                                  />
                                )}
                              </div>

                              {/* Content */}
                              <div className={`pb-4 ${isLast ? 'pb-0' : ''}`}>
                                <p
                                  className={`text-sm font-semibold leading-tight ${
                                    isActive ? 'text-secondary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                                  }`}
                                >
                                  {step.label}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                                {isActive && (
                                  <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-secondary">
                                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                                    In progress
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Right: Map */}
            <div className="lg:col-span-2">
              <div className="card-base overflow-hidden h-full min-h-[420px] flex flex-col">
                {/* Map header */}
                <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Bike size={18} className="text-primary" />
                    <p className="font-semibold text-foreground text-sm">Live Rider Tracking</p>
                  </div>
                  {showMap && !apiKeyMissing && (
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Store
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Rider
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> You
                      </span>
                    </div>
                  )}
                </div>

                {/* Map area */}
                <div className="flex-1">
                  {apiKeyMissing ? (
                    <div className="flex flex-col items-center justify-center h-80 bg-muted/30 gap-3 px-6 text-center">
                      <MapPin size={36} className="text-muted-foreground" />
                      <p className="text-sm font-semibold text-foreground">Google Maps not configured</p>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Add your <code className="bg-muted px-1 rounded text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to enable live rider tracking on the map.
                      </p>
                      {selectedOrder?.delivery_lat && selectedOrder?.delivery_lng && (
                        <a
                          href={`https://www.google.com/maps?q=${selectedOrder.delivery_lat},${selectedOrder.delivery_lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline text-xs py-1.5 px-3 mt-1"
                        >
                          View on Google Maps ↗
                        </a>
                      )}
                    </div>
                  ) : !showMap ? (
                    <div className="flex flex-col items-center justify-center h-80 bg-muted/20 gap-3 px-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Package size={28} className="text-primary" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Map activates when rider is assigned</p>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Once your order is picked up, you'll see the rider's live location here.
                      </p>
                      {/* Progress bar */}
                      {selectedOrder && !isCancelled && (
                        <div className="w-full max-w-xs mt-2">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{Math.round((currentStepIdx / (STATUS_STEPS.length - 1)) * 100)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-700"
                              style={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative h-full min-h-[420px]">
                      <div ref={mapRef} className="w-full h-full min-h-[420px]" />
                      {!mapLoaded && (
                        <div className="absolute inset-0 bg-muted/50 flex items-center justify-center">
                          <Loader2 size={28} className="animate-spin text-primary" />
                        </div>
                      )}

                      {/* Rider info overlay — out for delivery */}
                      {isOutForDelivery && (
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl px-4 py-3 shadow-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xl">
                                🛵
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-foreground">{RIDER_INFO.name} is on the way</p>
                                <p className="text-xs text-muted-foreground">
                                  ETA: {selectedOrder ? getEstimatedDelivery(selectedOrder, now) : '—'} · {selectedOrder ? getRemainingLabel(selectedOrder) : ''}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <a
                                  href={`tel:${RIDER_INFO.phone}`}
                                  className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                                  title="Call rider"
                                >
                                  <Phone size={15} className="text-primary" />
                                </a>
                                <div className="flex items-center gap-1 text-xs text-secondary font-semibold">
                                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                                  Live
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Delivered overlay */}
                      {isDelivered && (
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
                            <CheckCircle size={20} className="text-green-600 shrink-0" />
                            <p className="text-sm font-semibold text-green-700">Order Delivered! Enjoy your meal 🎉</p>
                          </div>
                        </div>
                      )}

                      {/* Rider assigned overlay */}
                      {activeStatus === 'rider_assigned' && (
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                              <Bike size={18} className="text-secondary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-foreground">Rider assigned</p>
                              <p className="text-xs text-muted-foreground">{RIDER_INFO.name} is heading to pick up your order</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

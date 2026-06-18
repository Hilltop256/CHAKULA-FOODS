'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Truck,
  ShoppingBag,
  ChevronLeft,
  CheckCircle,
  Loader2,
  Navigation,
  Phone,
  User,
  FileText,
  AlertCircle,
  Plus,
  X,
  Home,
  Briefcase,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import AppImage from '@/components/ui/AppImage';
import TopNav from '@/components/TopNav';
import { loadGoogleMaps } from '@/lib/googleMapsLoader';

interface DeliveryLocation {
  lat: number;
  lng: number;
  address: string;
}

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  is_default: boolean;
}

// Chakula Foods Naalya coordinates (default center)
const STORE_LOCATION = { lat: 0.3476, lng: 32.6252 };

declare global {
  interface Window {
    google: any;
    initCheckoutMap: () => void;
  }
}

export default function CheckoutPageClient() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { user, profile } = useAuth();

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [mapApiLoaded, setMapApiLoaded] = useState(false);

  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddNew, setShowAddNew] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState('');
  const [newAddressText, setNewAddressText] = useState('');
  const [newAddressError, setNewAddressError] = useState('');
  const [savingNewAddress, setSavingNewAddress] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  // Determine primary department from cart
  const primaryDepartment = items.length > 0 ? items[0].department : null;

  // Load saved addresses from localStorage
  useEffect(() => {
    if (user) {
      try {
        const stored = localStorage.getItem(`chakula_addresses_${user.id}`);
        if (stored) {
          const parsed: SavedAddress[] = JSON.parse(stored);
          setSavedAddresses(parsed);
          // Auto-select default address
          const defaultAddr = parsed.find((a) => a.is_default) || parsed[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            setDeliveryLocation({ lat: 0, lng: 0, address: defaultAddr.address });
          }
        }
      } catch {
        // ignore
      }
    }
  }, [user]);

  const persistAddresses = (updated: SavedAddress[]) => {
    if (user) {
      try {
        localStorage.setItem(`chakula_addresses_${user.id}`, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    setSavedAddresses(updated);
  };

  const handleSelectAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setDeliveryLocation({ lat: 0, lng: 0, address: addr.address });
    setLocationError('');
    setShowAddNew(false);
  };

  const handleAddNewAddress = () => {
    if (!newAddressLabel.trim() || !newAddressText.trim()) {
      setNewAddressError('Please fill in both label and address.');
      return;
    }
    setSavingNewAddress(true);
    setNewAddressError('');
    const entry: SavedAddress = {
      id: `addr_${Date.now()}`,
      label: newAddressLabel.trim(),
      address: newAddressText.trim(),
      is_default: savedAddresses.length === 0,
    };
    const updated = [...savedAddresses, entry];
    persistAddresses(updated);
    setSelectedAddressId(entry.id);
    setDeliveryLocation({ lat: 0, lng: 0, address: entry.address });
    setNewAddressLabel('');
    setNewAddressText('');
    setShowAddNew(false);
    setSavingNewAddress(false);
  };

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google) return;

    const center = deliveryLocation && deliveryLocation.lat !== 0
      ? { lat: deliveryLocation.lat, lng: deliveryLocation.lng }
      : STORE_LOCATION;

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      ],
    });

    mapInstanceRef.current = map;
    geocoderRef.current = new window.google.maps.Geocoder();

    const marker = new window.google.maps.Marker({
      map,
      draggable: true,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        scaledSize: new window.google.maps.Size(40, 40),
      },
      title: 'Delivery Location',
    });

    if (deliveryLocation && deliveryLocation.lat !== 0) {
      marker.setPosition({ lat: deliveryLocation.lat, lng: deliveryLocation.lng });
    }

    markerRef.current = marker;

    // Click on map to set delivery location
    map.addListener('click', (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      marker.setPosition({ lat, lng });
      reverseGeocode(lat, lng);
      setSelectedAddressId(null); // deselect saved address when map is clicked
    });

    // Drag marker to set location
    marker.addListener('dragend', () => {
      const pos = marker.getPosition();
      if (pos) {
        reverseGeocode(pos.lat(), pos.lng());
        setSelectedAddressId(null);
      }
    });

    setMapLoaded(true);
  }, [deliveryLocation]);

  const reverseGeocode = (lat: number, lng: number) => {
    if (!geocoderRef.current) return;
    geocoderRef.current.geocode(
      { location: { lat, lng } },
      (results: any[], status: string) => {
        const address =
          status === 'OK' && results[0]
            ? results[0].formatted_address
            : `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setDeliveryLocation({ lat, lng, address });
        setLocationError('');
      }
    );
  };

  // Load Google Maps script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === 'your-google-maps-api-key-here') {
      setLocationError('Google Maps API key not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.');
      return;
    }

    loadGoogleMaps(apiKey, () => {
      setMapApiLoaded(true);
    });
  }, []);

  // Init map once API is loaded
  useEffect(() => {
    if (mapApiLoaded && mapRef.current) {
      initMap();
    }
  }, [mapApiLoaded, initMap]);

  // Use device GPS to locate customer
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocating(false);
        setSelectedAddressId(null);

        if (mapInstanceRef.current && markerRef.current) {
          const pos = { lat, lng };
          mapInstanceRef.current.setCenter(pos);
          mapInstanceRef.current.setZoom(17);
          markerRef.current.setPosition(pos);
          reverseGeocode(lat, lng);
        } else {
          reverseGeocode(lat, lng);
        }
      },
      (err) => {
        setLocating(false);
        setLocationError(
          err.code === 1
            ? 'Location access denied. Please allow location access or click on the map to set your delivery address.' :'Unable to retrieve your location. Please click on the map to set your delivery address.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      router.push('/sign-up-login-screen');
      return;
    }
    if (!deliveryLocation || !deliveryLocation.address) {
      setSubmitError('Please set your delivery location.');
      return;
    }
    if (!phone.trim()) {
      setSubmitError('Please enter your phone number.');
      return;
    }
    if (items.length === 0) {
      setSubmitError('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const supabase = createClient();

      // Generate order number
      const orderNumber = `CHK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Insert order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_id: user.id,
          customer_name: profile?.full_name || user.email || 'Customer',
          customer_phone: phone.trim(),
          department: primaryDepartment as any,
          status: 'new_order',
          total_amount: total,
          delivery_address: deliveryLocation.address,
          delivery_lat: deliveryLocation.lat || null,
          delivery_lng: deliveryLocation.lng || null,
          payment_method: 'cash_on_delivery',
          notes: notes.trim() || null,
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order insert error:', JSON.stringify(orderError));
        setSubmitError(orderError.message || 'Failed to place order. Please try again.');
        setSubmitting(false);
        return;
      }

      // Insert order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

      if (itemsError) {
        console.error('Order items insert error:', JSON.stringify(itemsError));
        setSubmitError(itemsError.message || 'Order placed but items could not be saved. Please contact support.');
        setSubmitting(false);
        return;
      }

      // Clear cart and show success
      clearCart();
      setOrderSuccess(orderNumber);
      // Redirect to dedicated confirmation page
      router.push(`/order-confirmation?order=${encodeURIComponent(orderNumber)}&id=${order.id}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setSubmitError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav isLoggedIn={false} />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <ShoppingBag size={48} className="text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Sign in to checkout</h2>
          <p className="text-muted-foreground mb-6">You need to be signed in to place an order.</p>
          <Link href="/sign-up-login-screen" className="btn-primary px-8 py-3 font-bold">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Order success screen
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav isLoggedIn={!!user} userName={profile?.full_name || user?.email} userRole={profile?.role} />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground mb-2">Order Placed!</h1>
          <p className="text-muted-foreground mb-1">Your order has been confirmed.</p>
          <p className="text-sm font-semibold text-primary mb-6">Order #{orderSuccess}</p>
          <div className="card-base p-5 mb-6 text-left space-y-3">
            <div className="flex items-center gap-3">
              <Truck size={18} className="text-primary shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Cash on Delivery</p>
                <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">Delivery Address</p>
                <p className="text-xs text-muted-foreground">{deliveryLocation?.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShoppingBag size={18} className="text-primary shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Total Amount</p>
                <p className="text-xs text-muted-foreground">UGX {total.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <Link href="/" className="btn-primary px-8 py-3 font-bold inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const isDeliveryReady = deliveryLocation && deliveryLocation.address;

  return (
    <div className="min-h-screen bg-background">
      <TopNav
        isLoggedIn={!!user}
        userName={profile?.full_name || user?.email}
        userRole={profile?.role}
      />

      <div className="max-w-screen-lg mx-auto px-4 py-6 lg:py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Checkout</h1>
            <p className="text-sm text-muted-foreground">{totalItems} item{totalItems !== 1 ? 's' : ''} · UGX {total.toLocaleString()}</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add items to your cart before checking out.</p>
            <Link href="/" className="btn-primary px-8 py-3 font-bold">
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Addresses + Map + Details */}
            <div className="lg:col-span-3 space-y-5">

              {/* ── Saved Addresses ── */}
              <div className="card-base p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-primary" />
                    <h2 className="font-bold text-foreground">Delivery Address</h2>
                  </div>
                  <Link
                    href="/account"
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Manage addresses
                  </Link>
                </div>

                {savedAddresses.length > 0 ? (
                  <div className="space-y-2 mb-3">
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        onClick={() => handleSelectAddress(addr)}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all duration-150 ${
                          selectedAddressId === addr.id
                            ? 'border-primary bg-primary/5' :'border-border bg-background hover:border-primary/40'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          selectedAddressId === addr.id ? 'bg-primary/10' : 'bg-muted'
                        }`}>
                          {addr.label.toLowerCase().includes('work') || addr.label.toLowerCase().includes('office') ? (
                            <Briefcase size={14} className={selectedAddressId === addr.id ? 'text-primary' : 'text-muted-foreground'} />
                          ) : (
                            <Home size={14} className={selectedAddressId === addr.id ? 'text-primary' : 'text-muted-foreground'} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">{addr.label}</p>
                            {addr.is_default && (
                              <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{addr.address}</p>
                        </div>
                        {selectedAddressId === addr.id && (
                          <CheckCircle size={16} className="text-primary shrink-0 mt-1" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mb-3">
                    No saved addresses yet. Add one below or use the map to set your location.
                  </p>
                )}

                {/* Add new address inline */}
                {!showAddNew ? (
                  <button
                    onClick={() => { setShowAddNew(true); setSelectedAddressId(null); }}
                    className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus size={15} />
                    Add new address
                  </button>
                ) : (
                  <div className="mt-3 p-4 rounded-xl border border-border bg-muted/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">New Address</p>
                      <button
                        onClick={() => { setShowAddNew(false); setNewAddressLabel(''); setNewAddressText(''); setNewAddressError(''); }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                        Label (e.g. Home, Work)
                      </label>
                      <input
                        type="text"
                        value={newAddressLabel}
                        onChange={(e) => setNewAddressLabel(e.target.value)}
                        placeholder="Home"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                        Full Address
                      </label>
                      <input
                        type="text"
                        value={newAddressText}
                        onChange={(e) => setNewAddressText(e.target.value)}
                        placeholder="e.g. Plot 12, Naalya Estate, Kampala"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      />
                    </div>
                    {newAddressError && (
                      <p className="text-xs text-accent">{newAddressError}</p>
                    )}
                    <button
                      onClick={handleAddNewAddress}
                      disabled={savingNewAddress}
                      className="btn-primary w-full py-2 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {savingNewAddress ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                      Save & Use This Address
                    </button>
                  </div>
                )}
              </div>

              {/* Delivery Location (Map) — shown when no saved address is selected */}
              <div className="card-base p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Navigation size={18} className="text-primary" />
                    <h2 className="font-bold text-foreground">Pin on Map</h2>
                    <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                  </div>
                  <button
                    onClick={handleLocateMe}
                    disabled={locating || !mapApiLoaded}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                  >
                    {locating ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Navigation size={13} />
                    )}
                    {locating ? 'Locating…' : 'Use My Location'}
                  </button>
                </div>

                {/* Map */}
                <div className="relative rounded-xl overflow-hidden border border-border mb-3" style={{ height: 260 }}>
                  {!mapApiLoaded && !locationError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/60 z-10">
                      <Loader2 size={28} className="animate-spin text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Loading map…</p>
                    </div>
                  )}
                  {locationError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/60 z-10 px-6 text-center">
                      <AlertCircle size={28} className="text-accent mb-2" />
                      <p className="text-sm text-muted-foreground">{locationError}</p>
                    </div>
                  )}
                  <div ref={mapRef} className="w-full h-full" />
                </div>

                {deliveryLocation && deliveryLocation.lat !== 0 ? (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">{deliveryLocation.address}</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center">
                    Click on the map or use &quot;Use My Location&quot; to pin your exact delivery spot
                  </p>
                )}
              </div>

              {/* Contact Details */}
              <div className="card-base p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <User size={18} className="text-primary" />
                  <h2 className="font-bold text-foreground">Contact Details</h2>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                    Full Name
                  </label>
                  <div className="px-3 py-2.5 rounded-lg bg-muted/50 border border-border text-sm text-foreground">
                    {profile?.full_name || user?.email || 'Customer'}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                    Phone Number <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+256 700 000 000"
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                    Order Notes (optional)
                  </label>
                  <div className="relative">
                    <FileText size={14} className="absolute left-3 top-3 text-muted-foreground" />
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special instructions, gate code, landmark…"
                      rows={3}
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-2 space-y-5">
              {/* Items */}
              <div className="card-base p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingBag size={18} className="text-primary" />
                  <h2 className="font-bold text-foreground">Order Summary</h2>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={`checkout-item-${item.id}`} className="flex gap-3">
                      <AppImage
                        src={item.image}
                        alt={item.name}
                        width={44}
                        height={44}
                        className="rounded-lg object-cover w-11 h-11 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.department}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-primary tabular-nums shrink-0">
                        UGX {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border mt-4 pt-3 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold tabular-nums">UGX {total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-green-600 font-semibold text-xs">Calculated on arrival</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-1 border-t border-border">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary tabular-nums">UGX {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Selected delivery address summary */}
              {isDeliveryReady && (
                <div className="card-base p-4">
                  <div className="flex items-start gap-2">
                    <MapPin size={15} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Delivering to</p>
                      <p className="text-sm text-foreground">{deliveryLocation?.address}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="card-base p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Truck size={18} className="text-primary" />
                  <h2 className="font-bold text-foreground">Payment Method</h2>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-primary bg-primary/5">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Truck size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Cash on Delivery</p>
                    <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
                  </div>
                  <CheckCircle size={16} className="text-primary ml-auto shrink-0" />
                </div>
              </div>

              {/* Error */}
              {submitError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/10 border border-accent/30">
                  <AlertCircle size={15} className="text-accent shrink-0 mt-0.5" />
                  <p className="text-sm text-accent">{submitError}</p>
                </div>
              )}

              {/* Place Order */}
              <button
                onClick={handlePlaceOrder}
                disabled={submitting || !isDeliveryReady || !phone.trim()}
                className="btn-primary w-full py-4 font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Placing Order…
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Place Order · UGX {total.toLocaleString()}
                  </>
                )}
              </button>
              <p className="text-xs text-muted-foreground text-center">
                By placing this order you agree to our terms of service
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

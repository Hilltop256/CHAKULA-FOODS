'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  MapPin,
  Settings,
  ChevronLeft,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Phone,
  Mail,
  Shield,
  Bell,
  LogOut,
  CheckCircle,
  Loader2,
  Package,
} from 'lucide-react';
import TopNav from '@/components/TopNav';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';


interface SavedAddress {
  id: string;
  label: string;
  address: string;
  is_default: boolean;
}

type TabKey = 'profile' | 'addresses' | 'settings';

export default function AccountPageClient() {
  const router = useRouter();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<TabKey>('profile');

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Addresses state
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [addingAddress, setAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', address: '' });
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Settings state
  const [signingOut, setSigningOut] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !profile) {
      const timer = setTimeout(() => {
        router.push('/sign-up-login-screen');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, profile, router]);

  // Populate profile form when profile loads
  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  // Load saved addresses from localStorage (no dedicated table, so we persist locally)
  useEffect(() => {
    if (user) {
      try {
        const stored = localStorage.getItem(`chakula_addresses_${user.id}`);
        if (stored) {
          setAddresses(JSON.parse(stored));
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
    setAddresses(updated);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setProfileSaving(true);
    setProfileError('');
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: profileForm.full_name.trim(),
          phone: profileForm.phone.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      if (error) throw error;
      await refreshProfile();
      setEditingProfile(false);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to save profile. Please try again.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddAddress = () => {
    if (!newAddress.label.trim() || !newAddress.address.trim()) {
      setAddressError('Please fill in both label and address.');
      return;
    }
    setAddressSaving(true);
    setAddressError('');
    const entry: SavedAddress = {
      id: `addr_${Date.now()}`,
      label: newAddress.label.trim(),
      address: newAddress.address.trim(),
      is_default: addresses.length === 0,
    };
    const updated = [...addresses, entry];
    persistAddresses(updated);
    setNewAddress({ label: '', address: '' });
    setAddingAddress(false);
    setAddressSaving(false);
  };

  const handleDeleteAddress = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    // If we deleted the default, make the first one default
    if (updated.length > 0 && !updated.some((a) => a.is_default)) {
      updated[0].is_default = true;
    }
    persistAddresses(updated);
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map((a) => ({ ...a, is_default: a.id === id }));
    persistAddresses(updated);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    router.push('/');
  };

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'addresses', label: 'Addresses', icon: MapPin },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav isLoggedIn={false} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 size={32} className="text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Redirecting to sign in…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav
        isLoggedIn={!!user}
        userName={profile?.full_name || user?.email || ''}
        userRole={profile?.role || 'customer'}
        onSignOut={handleSignOut}
      />

      <main className="max-w-4xl mx-auto px-4 py-8 lg:px-8">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft size={16} />
          Back to Home
        </Link>

        {/* Page header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User size={26} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {profile?.full_name || 'My Account'}
            </h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-8 w-fit">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ── */}
        {activeTab === 'profile' && (
          <div className="card-base p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>
              {!editingProfile && (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  <Edit3 size={14} />
                  Edit
                </button>
              )}
            </div>

            {profileSuccess && (
              <div className="flex items-center gap-2 text-sm text-success bg-success/10 border border-success/20 rounded-lg px-4 py-3">
                <CheckCircle size={16} />
                Profile updated successfully!
              </div>
            )}

            {profileError && (
              <div className="text-sm text-accent bg-accent/10 border border-accent/20 rounded-lg px-4 py-3">
                {profileError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Full Name
                </label>
                {editingProfile ? (
                  <input
                    type="text"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, full_name: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Your full name"
                  />
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted text-sm text-foreground">
                    <User size={14} className="text-muted-foreground shrink-0" />
                    {profile?.full_name || <span className="text-muted-foreground italic">Not set</span>}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Phone Number
                </label>
                {editingProfile ? (
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="+256 700 000 000"
                  />
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted text-sm text-foreground">
                    <Phone size={14} className="text-muted-foreground shrink-0" />
                    {profile?.phone || <span className="text-muted-foreground italic">Not set</span>}
                  </div>
                )}
              </div>

              {/* Email (read-only) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Email Address
                </label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted text-sm text-foreground">
                  <Mail size={14} className="text-muted-foreground shrink-0" />
                  {user?.email}
                </div>
              </div>

              {/* Role (read-only) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Account Type
                </label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted text-sm text-foreground">
                  <Shield size={14} className="text-muted-foreground shrink-0" />
                  <span className="capitalize">{profile?.role || 'Customer'}</span>
                </div>
              </div>
            </div>

            {editingProfile && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={profileSaving}
                  className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5"
                >
                  {profileSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  {profileSaving ? 'Saving…' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setEditingProfile(false);
                    setProfileError('');
                    setProfileForm({
                      full_name: profile?.full_name || '',
                      phone: profile?.phone || '',
                    });
                  }}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2.5"
                >
                  <X size={14} />
                  Cancel
                </button>
              </div>
            )}

            {/* Quick links */}
            <div className="border-t border-border pt-5 mt-2">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Quick Links</h3>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/order-tracking"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm text-foreground"
                >
                  <Package size={15} className="text-primary" />
                  My Orders
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── ADDRESSES TAB ── */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Saved Delivery Addresses</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Save addresses for faster checkout
                </p>
              </div>
              {!addingAddress && (
                <button
                  onClick={() => setAddingAddress(true)}
                  className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
                >
                  <Plus size={15} />
                  Add Address
                </button>
              )}
            </div>

            {/* Add address form */}
            {addingAddress && (
              <div className="card-base p-5 border-2 border-primary/20 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">New Address</h3>
                {addressError && (
                  <p className="text-sm text-accent">{addressError}</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Label
                    </label>
                    <input
                      type="text"
                      value={newAddress.label}
                      onChange={(e) => setNewAddress((p) => ({ ...p, label: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="e.g. Home, Office, Gym"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Full Address
                    </label>
                    <input
                      type="text"
                      value={newAddress.address}
                      onChange={(e) => setNewAddress((p) => ({ ...p, address: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Street, area, landmark"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAddAddress}
                    disabled={addressSaving}
                    className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5"
                  >
                    {addressSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save Address
                  </button>
                  <button
                    onClick={() => {
                      setAddingAddress(false);
                      setNewAddress({ label: '', address: '' });
                      setAddressError('');
                    }}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2.5"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Address list */}
            {addresses.length === 0 && !addingAddress ? (
              <div className="card-base p-10 flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <MapPin size={22} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No saved addresses yet</p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Add a delivery address to speed up your checkout experience.
                </p>
                <button
                  onClick={() => setAddingAddress(true)}
                  className="btn-primary flex items-center gap-2 text-sm py-2 px-4 mt-1"
                >
                  <Plus size={15} />
                  Add Your First Address
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`card-base p-4 flex items-start justify-between gap-4 transition-all ${
                      addr.is_default ? 'border-2 border-primary/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${addr.is_default ? 'bg-primary/10' : 'bg-muted'}`}>
                        <MapPin size={16} className={addr.is_default ? 'text-primary' : 'text-muted-foreground'} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-foreground">{addr.label}</span>
                          {addr.is_default && (
                            <span className="text-[10px] font-bold uppercase tracking-wide bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 truncate">{addr.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!addr.is_default && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          className="text-xs text-primary hover:text-primary/80 font-medium px-2 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
                        >
                          Set default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/5 transition-colors"
                        aria-label="Delete address"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Account Settings</h2>

            {/* Account info card */}
            <div className="card-base p-5 space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Account Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Mail size={15} className="text-muted-foreground" />
                    Email
                  </div>
                  <span className="text-sm text-muted-foreground">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Shield size={15} className="text-muted-foreground" />
                    Account Type
                  </div>
                  <span className="text-sm text-muted-foreground capitalize">{profile?.role || 'Customer'}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle size={15} className="text-muted-foreground" />
                    Email Verified
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${user?.email_confirmed_at ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {user?.email_confirmed_at ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notifications card */}
            <div className="card-base p-5 space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Notifications
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Order Updates</p>
                    <p className="text-xs text-muted-foreground">Get notified about your order status</p>
                  </div>
                </div>
                <div className="w-10 h-5 bg-primary rounded-full relative cursor-default">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div className="card-base p-5 border border-accent/20 space-y-4">
              <h3 className="text-sm font-semibold text-accent uppercase tracking-wide">
                Sign Out
              </h3>
              <p className="text-sm text-muted-foreground">
                You will be signed out of your account on this device.
              </p>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-accent/30 text-accent hover:bg-accent/5 transition-colors text-sm font-medium"
              >
                {signingOut ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <LogOut size={15} />
                )}
                {signingOut ? 'Signing out…' : 'Sign Out'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

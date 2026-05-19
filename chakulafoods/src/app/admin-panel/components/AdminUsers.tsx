'use client';

import React, { useState, useEffect } from 'react';
import { Search, Shield, User, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const roleIcon = (role: string) => {
  if (role === 'admin') return <Shield size={13} className="text-secondary" />;
  if (role === 'delivery') return <Truck size={13} className="text-primary" />;
  return <User size={13} className="text-muted-foreground" />;
};

const roleBadge = (role: string) => {
  if (role === 'admin') return 'bg-secondary/10 text-secondary';
  if (role === 'delivery') return 'bg-primary/10 text-primary';
  return 'bg-muted text-muted-foreground';
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const supabase = createClient();

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, role, is_active, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Users fetch error:', error.message);
      } else {
        setUsers(data || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        toast.error('Failed to update role');
      } else {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
        toast.success('User role updated');
        setEditingUser(null);
      }
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: newStatus })
        .eq('id', userId);

      if (error) {
        toast.error('Failed to update status');
      } else {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_active: newStatus } : u)));
        toast.success(`User ${newStatus ? 'reactivated' : 'suspended'}`);
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-screen-2xl">
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`skel-${i}`} className="card-base p-4 animate-pulse">
              <div className="h-8 bg-muted rounded mb-1" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-screen-2xl">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Customers', count: users.filter((u) => u.role === 'customer').length, color: 'text-foreground' },
          { label: 'Admins', count: users.filter((u) => u.role === 'admin').length, color: 'text-secondary' },
          { label: 'Delivery Riders', count: users.filter((u) => u.role === 'delivery').length, color: 'text-primary' },
        ].map((s) => (
          <div key={`user-sum-${s.label}`} className="card-base p-4">
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 w-56 h-9 text-sm"
          />
        </div>
        <div className="flex gap-1.5">
          {['all', 'customer', 'admin', 'delivery'].map((r) => (
            <button
              key={`role-filter-${r}`}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                roleFilter === r
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {r === 'all' ? 'All Roles' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                {['User', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map((h) => (
                  <th key={`uh-${h}`} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {user.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{user.email}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${roleBadge(user.role)}`}>
                      {roleIcon(user.role)}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggleStatus(user.id, user.is_active)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                        user.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' :'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {user.is_active ? 'Active' : 'Suspended'}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="px-2 py-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                      >
                        Change Role
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role edit modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in">
          <div className="card-base shadow-2xl p-6 max-w-sm w-full mx-4 animate-scale-in">
            <h3 className="font-bold text-foreground mb-1">Change User Role</h3>
            <p className="text-sm text-muted-foreground mb-5">{editingUser.full_name}</p>
            <div className="space-y-2">
              {['customer', 'admin', 'delivery'].map((r) => (
                <button
                  key={`role-opt-${r}`}
                  onClick={() => handleRoleChange(editingUser.id, r)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-sm font-semibold capitalize ${
                    editingUser.role === r
                      ? 'border-primary bg-primary/5 text-primary' :'border-border hover:border-primary/50 hover:bg-muted/50 text-foreground'
                  }`}
                >
                  {roleIcon(r)}
                  {r}
                  {editingUser.role === r && <span className="ml-auto text-xs text-primary">Current</span>}
                </button>
              ))}
            </div>
            <button
              onClick={() => setEditingUser(null)}
              className="mt-4 w-full btn-outline text-sm py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
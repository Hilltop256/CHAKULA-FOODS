'use client';

import React, { useState } from 'react';
import { Search, Edit2, Shield, User, Truck } from 'lucide-react';
import { toast } from 'sonner';

// Backend integration point: replace with GET /api/users
const initialUsers = [
  { id: 'user-001', name: 'Amara Nakato', email: 'amara.nakato@chakulafoods.ug', role: 'customer', orders: 14, joined: '2026-01-12', status: 'active' },
  { id: 'user-002', name: 'Tendo Mugisha', email: 'admin@chakulafoods.ug', role: 'admin', orders: 0, joined: '2025-11-01', status: 'active' },
  { id: 'user-003', name: 'Okello Patrick', email: 'rider.okello@chakulafoods.ug', role: 'delivery', orders: 0, joined: '2026-02-14', status: 'active' },
  { id: 'user-004', name: 'Julius Ssebunya', email: 'julius.ssebunya@gmail.com', role: 'customer', orders: 8, joined: '2026-03-05', status: 'active' },
  { id: 'user-005', name: 'Grace Achieng', email: 'grace.achieng@outlook.com', role: 'customer', orders: 22, joined: '2026-01-28', status: 'active' },
  { id: 'user-006', name: 'Robert Kato', email: 'robert.kato@gmail.com', role: 'customer', orders: 5, joined: '2026-04-10', status: 'suspended' },
  { id: 'user-007', name: 'Fatuma Namutebi', email: 'fatuma.n@yahoo.com', role: 'customer', orders: 31, joined: '2025-12-18', status: 'active' },
  { id: 'user-008', name: 'David Okello', email: 'david.okello@gmail.com', role: 'customer', orders: 7, joined: '2026-02-22', status: 'active' },
  { id: 'user-009', name: 'Esther Namukasa', email: 'esther.namukasa@gmail.com', role: 'customer', orders: 19, joined: '2026-01-05', status: 'active' },
  { id: 'user-010', name: 'Brian Ssekandi', email: 'brian.ssekandi@gmail.com', role: 'delivery', orders: 0, joined: '2026-03-20', status: 'active' },
];

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
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState<typeof initialUsers[0] | null>(null);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleRoleChange = (userId: string, newRole: string) => {
    // Backend integration point: PATCH /api/users/:id { role: newRole }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    toast.success('User role updated');
    setEditingUser(null);
  };

  const handleToggleStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
    toast.success(`User ${newStatus === 'active' ? 'reactivated' : 'suspended'}`);
  };

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
                {['User', 'Email', 'Role', 'Orders', 'Joined', 'Status', 'Actions'].map((h) => (
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
                          {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{user.email}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${roleBadge(user.role)}`}>
                      {roleIcon(user.role)}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-foreground tabular-nums">{user.orders}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {new Date(user.joined).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggleStatus(user.id, user.status)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                        user.status === 'active' ?'bg-green-100 text-green-800 hover:bg-green-200' :'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {user.status === 'active' ? 'Active' : 'Suspended'}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                        title="Change role"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role edit modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in">
          <div className="card-base shadow-2xl p-6 max-w-sm w-full mx-4 animate-scale-in">
            <h3 className="font-bold text-foreground mb-1">Change User Role</h3>
            <p className="text-sm text-muted-foreground mb-5">{editingUser.name}</p>
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
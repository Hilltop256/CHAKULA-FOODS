'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ProductOptionGroup } from '@/types/product-options';

interface ProductOptionsEditorProps {
  value: ProductOptionGroup[];
  onChange: (groups: ProductOptionGroup[]) => void;
}

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function ProductOptionsEditor({ value, onChange }: ProductOptionsEditorProps) {
  const updateGroup = (groupId: string, patch: Partial<ProductOptionGroup>) => {
    onChange(value.map((group) => group.id === groupId ? { ...group, ...patch } : group));
  };

  const addGroup = () => {
    onChange([
      ...value,
      {
        id: createId('group'),
        name: '',
        type: 'single',
        required: false,
        options: [{ id: createId('option'), name: '', price: 0 }],
      },
    ]);
  };

  const removeGroup = (groupId: string) => {
    onChange(value.filter((group) => group.id !== groupId));
  };

  const addOption = (groupId: string) => {
    onChange(value.map((group) => group.id === groupId
      ? { ...group, options: [...group.options, { id: createId('option'), name: '', price: 0 }] }
      : group));
  };

  const updateOption = (groupId: string, optionId: string, patch: { name?: string; price?: number }) => {
    onChange(value.map((group) => group.id === groupId
      ? {
          ...group,
          options: group.options.map((option) => option.id === optionId ? { ...option, ...patch } : option),
        }
      : group));
  };

  const removeOption = (groupId: string, optionId: string) => {
    onChange(value.map((group) => group.id === groupId
      ? { ...group, options: group.options.filter((option) => option.id !== optionId) }
      : group));
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-foreground">Product options</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add sides, drink types, weight choices, flavours, sizes, or other paid extras.
          </p>
        </div>
        <button type="button" onClick={addGroup} className="shrink-0 flex items-center gap-1 rounded-lg border border-primary px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/5">
          <Plus size={13} /> Group
        </button>
      </div>

      {value.length === 0 && (
        <div className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
          No options added. Customers will order this product at its base price.
        </div>
      )}

      {value.map((group, groupIndex) => (
        <div key={group.id} className="rounded-xl border border-border bg-card p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Option group {groupIndex + 1}</span>
            <button type="button" onClick={() => removeGroup(group.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/10" aria-label="Remove option group">
              <Trash2 size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Group name</label>
              <input
                type="text"
                value={group.name}
                onChange={(event) => updateGroup(group.id, { name: event.target.value })}
                placeholder="e.g. Side dish or Weight"
                className="input-field w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Selection rule</label>
              <select
                value={group.type}
                onChange={(event) => updateGroup(group.id, { type: event.target.value === 'multiple' ? 'multiple' : 'single' })}
                className="input-field w-full text-sm"
              >
                <option value="single">Choose one</option>
                <option value="multiple">Choose multiple</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={group.required}
              onChange={(event) => updateGroup(group.id, { required: event.target.checked })}
              className="accent-primary"
            />
            <span className="text-xs font-semibold text-foreground">Customer must select from this group</span>
          </label>

          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_120px_32px] gap-2 px-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              <span>Option</span>
              <span>Extra price (UGX)</span>
              <span />
            </div>
            {group.options.map((option) => (
              <div key={option.id} className="grid grid-cols-[1fr_120px_32px] gap-2 items-center">
                <input
                  type="text"
                  value={option.name}
                  onChange={(event) => updateOption(group.id, option.id, { name: event.target.value })}
                  placeholder="e.g. Steamed cassava"
                  className="input-field w-full text-sm"
                />
                <input
                  type="number"
                  min={0}
                  value={option.price}
                  onChange={(event) => updateOption(group.id, option.id, { price: Math.max(0, Number(event.target.value) || 0) })}
                  className="input-field w-full text-sm"
                />
                <button type="button" onClick={() => removeOption(group.id, option.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/10" aria-label="Remove option">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addOption(group.id)} className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
              <Plus size={12} /> Add option
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

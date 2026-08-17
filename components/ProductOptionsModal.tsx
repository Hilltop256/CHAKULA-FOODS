'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Check, Minus, Plus, ShoppingCart, X, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AppImage from '@/components/ui/AppImage';
import { useCart } from '@/contexts/CartContext';
import {
  normalizeProductOptionGroups,
  ProductOptionGroup,
  PurchasableProduct,
  SelectedProductOption,
} from '@/types/product-options';

interface ProductOptionsModalProps {
  product: PurchasableProduct | null;
  open: boolean;
  onClose: () => void;
  initialAction?: 'cart' | 'order';
}

export default function ProductOptionsModal({
  product,
  open,
  onClose,
  initialAction = 'cart',
}: ProductOptionsModalProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [selection, setSelection] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [validationError, setValidationError] = useState('');

  const groups = useMemo(
    () => normalizeProductOptionGroups(product?.product_options),
    [product?.product_options]
  );

  useEffect(() => {
    if (!open) return;
    const defaults: Record<string, string[]> = {};
    groups.forEach((group) => {
      defaults[group.id] = [];
    });
    setSelection(defaults);
    setQuantity(1);
    setValidationError('');
  }, [open, product?.id, groups]);

  if (!open || !product) return null;

  const selectedOptions: SelectedProductOption[] = groups.flatMap((group) =>
    (selection[group.id] || []).flatMap((optionId) => {
      const option = group.options.find((item) => item.id === optionId);
      return option
        ? [{
            group_id: group.id,
            group_name: group.name,
            option_id: option.id,
            option_name: option.name,
            additional_price: option.price,
          }]
        : [];
    })
  );

  const optionsTotal = selectedOptions.reduce((sum, option) => sum + option.additional_price, 0);
  const unitPrice = product.price + optionsTotal;
  const total = unitPrice * quantity;

  const toggleOption = (group: ProductOptionGroup, optionId: string) => {
    setValidationError('');
    setSelection((current) => {
      const selected = current[group.id] || [];
      if (group.type === 'single') {
        return { ...current, [group.id]: selected.includes(optionId) ? [] : [optionId] };
      }
      return {
        ...current,
        [group.id]: selected.includes(optionId)
          ? selected.filter((id) => id !== optionId)
          : [...selected, optionId],
      };
    });
  };

  const validate = () => {
    const missing = groups.find((group) => group.required && (selection[group.id] || []).length === 0);
    if (missing) {
      setValidationError(`Please select an option for ${missing.name}.`);
      return false;
    }
    return true;
  };

  const addConfiguredItem = (action: 'cart' | 'order') => {
    if (!validate()) return;

    const added = addToCart({
      id: product.id,
      name: product.name,
      price: unitPrice,
      basePrice: product.price,
      image: product.image,
      department: product.department,
      selectedOptions,
    }, quantity);

    if (!added) return;
    onClose();
    if (action === 'order') router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start sm:items-center justify-center bg-foreground/45 backdrop-blur-sm p-2 sm:p-4 overflow-hidden" onMouseDown={onClose}>
      <div className="card-base w-full max-w-2xl max-h-[calc(100dvh-1rem)] sm:max-h-[92dvh] flex flex-col overflow-hidden shadow-2xl animate-scale-in" onMouseDown={(event) => event.stopPropagation()}>
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#C41230]">Customise your order</p>
            <h2 className="text-lg font-extrabold text-foreground">{product.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted" aria-label="Close product options">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="grid md:grid-cols-[220px_1fr] gap-5 p-5">
            <div>
              <AppImage src={product.image} alt={product.name} width={440} height={320} className="w-full h-48 md:h-44 object-cover rounded-xl" />
              {product.description && <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{product.description}</p>}
              <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
                <span className="text-sm text-muted-foreground">Base price</span>
                <span className="font-bold">UGX {product.price.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-5">
              {groups.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                  This product has no extra options. You can add it directly to your cart or order it now.
                </div>
              ) : groups.map((group) => (
                <div key={group.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{group.name}</h3>
                      <p className="text-xs text-muted-foreground">{group.type === 'single' ? 'Choose one' : 'Choose one or more'}</p>
                    </div>
                    {group.required && <span className="text-[10px] font-bold uppercase rounded-full bg-[#C41230]/10 text-[#C41230] px-2 py-1">Required</span>}
                  </div>
                  <div className="space-y-2">
                    {group.options.map((option) => {
                      const checked = (selection[group.id] || []).includes(option.id);
                      return (
                        <button type="button" key={option.id} onClick={() => toggleOption(group, option.id)} className={`w-full flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${checked ? 'border-[#C41230] bg-[#C41230]/5' : 'border-border hover:border-[#C41230]/50 hover:bg-muted/30'}`}>
                          <span className="flex items-center gap-2 min-w-0">
                            <span className={`w-5 h-5 shrink-0 flex items-center justify-center border ${group.type === 'single' ? 'rounded-full' : 'rounded-md'} ${checked ? 'bg-[#C41230] border-[#C41230] text-white' : 'border-border'}`}>{checked && <Check size={12} />}</span>
                            <span className="text-sm font-medium truncate">{option.name}</span>
                          </span>
                          <span className="text-xs font-bold text-[#C41230] shrink-0">{option.price > 0 ? `+ UGX ${option.price.toLocaleString()}` : 'Included'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <span className="text-sm font-semibold">Quantity</span>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted" aria-label="Decrease quantity"><Minus size={14} /></button>
                  <span className="w-6 text-center font-bold tabular-nums">{quantity}</span>
                  <button type="button" onClick={() => setQuantity((value) => value + 1)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted" aria-label="Increase quantity"><Plus size={14} /></button>
                </div>
              </div>
              {validationError && <p className="text-sm font-semibold text-[#C41230]">{validationError}</p>}
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-border p-4 bg-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-lg font-extrabold text-[#C41230]">UGX {total.toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => addConfiguredItem('cart')} className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-colors ${initialAction === 'cart' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border border-primary text-primary hover:bg-primary/5'}`}>
              <ShoppingCart size={17} /> Add to Cart
            </button>
            <button type="button" onClick={() => addConfiguredItem('order')} className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-[#C41230] text-white hover:bg-[#A90F29] transition-colors ${initialAction === 'order' ? 'ring-2 ring-[#C41230]/30 ring-offset-2' : ''}`}>
              <Zap size={17} /> Order Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

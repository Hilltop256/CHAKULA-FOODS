export type ProductOptionSelectionType = 'single' | 'multiple';

export interface ProductOptionChoice {
  id: string;
  name: string;
  price: number;
}

export interface ProductOptionGroup {
  id: string;
  name: string;
  type: ProductOptionSelectionType;
  required: boolean;
  options: ProductOptionChoice[];
}

export interface SelectedProductOption {
  group_id: string;
  group_name: string;
  option_id: string;
  option_name: string;
  additional_price: number;
}

export interface PurchasableProduct {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image: string;
  department: string;
  product_options?: ProductOptionGroup[] | null;
}

export function normalizeProductOptionGroups(value: unknown): ProductOptionGroup[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((group): group is Record<string, unknown> => Boolean(group && typeof group === 'object'))
    .map((group, groupIndex): ProductOptionGroup => ({
      id: String(group.id || `group-${groupIndex + 1}`),
      name: String(group.name || '').trim(),
      type: group.type === 'multiple' ? 'multiple' : 'single',
      required: Boolean(group.required),
      options: Array.isArray(group.options)
        ? group.options
            .filter((option): option is Record<string, unknown> => Boolean(option && typeof option === 'object'))
            .map((option, optionIndex) => ({
              id: String(option.id || `option-${groupIndex + 1}-${optionIndex + 1}`),
              name: String(option.name || '').trim(),
              price: Math.max(0, Number(option.price) || 0),
            }))
            .filter((option) => option.name.length > 0)
        : [],
    }))
    .filter((group) => group.name.length > 0 && group.options.length > 0);
}

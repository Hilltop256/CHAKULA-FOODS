export interface OptionTag {
  label: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

export interface OptionGroup {
  title: string;
  tags: OptionTag[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  priceRange?: string;
  priceLabel?: string;
  image?: string;
  badge?: string;
  badgeColor?: string;
  featured?: boolean;
  optionGroups?: OptionGroup[];
}

export interface MenuSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconBg: string;
  items: MenuItem[];
}

export const NAV_LINKS = [
  { href: "#wraps", label: "Shawarma / Wraps / Rolex / Burgers" },
  { href: "#bowls", label: "Bowl Meals" },
  { href: "#pizza", label: "Pizza" },
  { href: "#roasts", label: "Roasts & Grills" },
  { href: "#specials", label: "Specials & Toppings" },
  { href: "#bakery", label: "Bakery & Breakfast" },
  { href: "#platters", label: "Party & Group Platters" },
  { href: "#drinks", label: "Drinks" },
];

export const HERO_TAGS = ["Dine In", "Delivery", "WhatsApp Orders", "Subscription"];

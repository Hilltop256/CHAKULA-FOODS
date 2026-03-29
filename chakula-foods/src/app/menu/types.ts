export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  badge?: string;
  badgeColor?: string;
  featured?: boolean;
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
  { href: "#wraps", label: "Wraps" },
  { href: "#bowls-pizza", label: "Bowls & Pizza" },
  { href: "#roasts", label: "Roasts" },
  { href: "#specials", label: "Specials & Bakery" },
  { href: "#platters", label: "Platters" },
  { href: "#drinks", label: "Drinks" },
];

export const HERO_TAGS = [
  "FRESH DAILY",
  "FAST DELIVERY",
  "KAMPALA'S FINEST",
  "100% LOCAL",
];

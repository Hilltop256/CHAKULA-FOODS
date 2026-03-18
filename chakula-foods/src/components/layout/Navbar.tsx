"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/menu?category=BAKERY", label: "Bakery" },
  { href: "/menu?category=JUICE_BAR", label: "Juice Bar" },
  { href: "/menu?category=FRESH_MARKET", label: "Fresh Market" },
  { href: "/subscriptions", label: "Subscriptions" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-orange-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold flex items-center gap-2">
            🍔 Chakula Foods
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-orange-200 transition ${pathname === link.href ? "font-bold border-b-2 border-white" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative p-2 hover:bg-orange-700 rounded-lg transition">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <Link href={user.role === "ADMIN" ? "/admin" : "/account"} className="flex items-center gap-2 hover:bg-orange-700 px-3 py-2 rounded-lg">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">{user.name}</span>
                </Link>
                <button onClick={() => logout()} className="text-sm hover:text-orange-200">Logout</button>
              </div>
            ) : (
              <Link href="/login" className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-100 transition">
                Login
              </Link>
            )}

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-orange-500">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 hover:bg-orange-700 px-2 rounded"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Menu, X, ChefHat } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/menu?group=restaurant", label: "Restaurant" },
  { href: "/menu?category=BAKERY", label: "Bakery" },
  { href: "/menu?group=market", label: "Market" },
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
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold flex items-center gap-2 hover:opacity-90 transition"
          >
            <ChefHat className="w-7 h-7" />
            Chakula Foods
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium hover:text-orange-200 transition ${
                  pathname === link.href
                    ? "border-b-2 border-white pb-0.5"
                    : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="relative p-2 hover:bg-orange-700 rounded-lg transition"
              aria-label="Cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={user.role === "ADMIN" ? "/admin" : "/account"}
                  className="flex items-center gap-2 hover:bg-orange-700 px-3 py-2 rounded-lg transition text-sm"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline max-w-[120px] truncate">
                    {user.name}
                  </span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="text-sm hover:text-orange-200 transition px-2 py-1 hidden sm:block"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-orange-100 transition"
              >
                Login
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 hover:bg-orange-700 rounded-lg transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-orange-500 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded hover:bg-orange-700 transition text-sm"
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="block w-full text-left py-2 px-3 rounded hover:bg-orange-700 transition text-sm"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/store/auth";
import { CartProvider } from "@/store/cart";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chakula Foods - Uganda's Best Fast Food & Fresh Market",
  description:
    "Fresh fast food, bakery, juice bar, and fresh market. Order online or subscribe for daily meals in Uganda.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-50 flex flex-col`} style={{ fontFamily: playfair.style.fontFamily }}>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="bg-gray-900 text-white py-10 mt-12">
              <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-3">🍔 Chakula Foods</h3>
                  <p className="text-gray-400 text-sm">
                    Fresh fast food, bakery items, juices, and fresh market
                    produce in Uganda.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Quick Links</h4>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li>
                      <Link href="/menu" className="hover:text-white transition">
                        Menu
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/subscriptions"
                        className="hover:text-white transition"
                      >
                        Subscriptions
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/account"
                        className="hover:text-white transition"
                      >
                        My Account
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Contact Us</h4>
                  <p className="text-gray-400 text-sm">📍 Kampala, Uganda</p>
                  <p className="text-gray-400 text-sm">
                    📞 +256 753 300 613
                  </p>
                  <p className="text-gray-400 text-sm">
                    ✉️ info@chakulafoods.ug
                  </p>
                </div>
              </div>
              <div className="max-w-7xl mx-auto px-4 mt-8 pt-4 border-t border-gray-800 text-center text-gray-500 text-sm">
                © {new Date().getFullYear()} Chakula Foods powered by Fund Trust Uganda. All rights
                reserved.
              </div>
            </footer>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

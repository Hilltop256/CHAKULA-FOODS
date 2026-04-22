import Link from "next/link";
import { ArrowRight } from "lucide-react";

const serviceGroups = [
  {
    name: "Restaurant",
    emoji: "🍽️",
    color: "bg-red-600",
    href: "/menu?group=restaurant",
    subcategories: ["Fast Foods", "Breakfast Treats", "Roasts & Grills", "Party Platters", "Specials & Toppings"],
  },
  {
    name: "Bakery / Confectionary",
    emoji: "🥐",
    color: "bg-amber-600",
    href: "/menu?category=BAKERY",
    subcategories: ["Bread", "Cakes", "Pastries", "Cookies", "Doughnuts"],
  },
  {
    name: "Drinks & Beverages",
    emoji: "🧃",
    color: "bg-green-600",
    href: "/menu?group=drinks",
    subcategories: ["Juice Bar", "Smoothies", "Coffee", "Tea", "Mocktails & Cocktails"],
  },
  {
    name: "Market Special",
    emoji: "🥬",
    color: "bg-green-700",
    href: "/menu?group=market",
    subcategories: ["Fresh Produce", "Dry Goods", "Fruits"],
  },
  {
    name: "Wines & Spirits Shop",
    emoji: "🍷",
    color: "bg-purple-700",
    href: "/menu?group=wines",
    subcategories: ["Wine", "Spirits", "Beer", "Champagne"],
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-orange-600 to-orange-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="max-w-7xl mx-auto px-4 py-24 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Fresh Food,<br />Delivered Daily 🍔
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Uganda&apos;s favourite fast food restaurant with bakery, juice
              bar, and fresh market. Order online or subscribe for convenient
              daily meals.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/menu"
                className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-100 transition flex items-center gap-2"
              >
                Order Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/subscriptions"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition"
              >
                View Subscriptions
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Categories */}
      <section className="bg-orange-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Browse our Services by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {serviceGroups.map((group) => (
              <Link
                key={group.name}
                href={group.href}
                className={`${group.color} text-white p-6 rounded-2xl hover:scale-105 transition shadow-lg flex flex-col`}
              >
                <div className="text-5xl mb-3">{group.emoji}</div>
                <h3 className="font-bold text-xl mb-3">{group.name}</h3>
                <ul className="text-sm opacity-90 space-y-1">
                  {group.subcategories.map((sub) => (
                    <li key={sub} className="flex items-center gap-1">
                      <span className="w-1 h-1 bg-white rounded-full shrink-0" />
                      {sub}
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">
          Why Choose Chakula Foods?
        </h2>
        <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
          We combine quality, convenience, and great taste to serve Uganda the
          best food experience.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              emoji: "🌿",
              color: "bg-green-100",
              title: "Fresh Ingredients",
              desc: "We source the freshest local produce for all our meals.",
            },
            {
              emoji: "🚚",
              color: "bg-orange-100",
              title: "Fast Delivery",
              desc: "Quick delivery across Kampala and surrounding areas.",
            },
            {
              emoji: "💳",
              color: "bg-purple-100",
              title: "Easy Payments",
              desc: "Pay with MTN MoMo, Airtel Money, or Card.",
            },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <div
                className={`w-20 h-20 ${item.color} rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                <span className="text-4xl">{item.emoji}</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe &amp; Save</h2>
          <p className="text-xl mb-8 opacity-90">
            Get fresh meals delivered daily, weekly or monthly. Perfect for
            busy professionals and families.
          </p>
          <Link
            href="/subscriptions"
            className="bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-700 transition inline-block"
          >
            View Subscription Plans
          </Link>
        </div>
      </section>

      {/* Admin */}
      <section className="bg-gray-100 py-8 text-center">
        <Link
          href="/admin"
          className="text-gray-400 text-sm hover:text-gray-600 transition"
        >
          Admin Panel
        </Link>
      </section>
    </div>
  );
}

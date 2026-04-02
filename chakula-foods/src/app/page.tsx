import Link from "next/link";
import { ArrowRight } from "lucide-react";

const categories = [
  { name: "Fast Food", category: "FAST_FOOD", color: "bg-orange-500", emoji: "🍔" },
  { name: "Bakery", category: "BAKERY", color: "bg-amber-600", emoji: "🥐" },
  { name: "Juice Bar", category: "JUICE_BAR", color: "bg-green-500", emoji: "🧃" },
  { name: "Fresh Market", category: "FRESH_MARKET", color: "bg-green-700", emoji: "🥬" },
  { name: "Dry Market", category: "DRY_MARKET", color: "bg-yellow-600", emoji: "🌾" },
  { name: "Roasts & Grills", category: "ROASTS", color: "bg-red-500", emoji: "🔥" },
  { name: "Specials & Toppings", category: "SPECIALS", color: "bg-green-600", emoji: "⭐" },
  { name: "Bakery & Breakfast", category: "BREAKFAST", color: "bg-amber-500", emoji: "☕" },
  { name: "Party Platters", category: "PLATTERS", color: "bg-pink-500", emoji: "🎉" },
  { name: "Drinks & Beverages", category: "DRINKS", color: "bg-teal-500", emoji: "🥤" },
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.category}
                href={`/menu?category=${cat.category}`}
                className={`${cat.color} text-white p-6 rounded-2xl text-center hover:scale-105 transition shadow-lg`}
              >
                <div className="text-4xl mb-2">{cat.emoji}</div>
                <h3 className="font-bold text-lg">{cat.name}</h3>
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
    </div>
  );
}

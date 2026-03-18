import Link from "next/link";
import { ArrowRight, Coffee, Utensils, ShoppingBag, Calendar } from "lucide-react";

const features = [
  { icon: Utensils, title: "Fast Food", desc: "Delicious burgers, pizzas, chicken & more", href: "/menu?category=FAST_FOOD" },
  { icon: Coffee, title: "Fresh Bakery", desc: "Bread, pastries, cakes & baked daily", href: "/menu?category=BAKERY" },
  { icon: ShoppingBag, title: "Fresh Market", desc: "Fruits, vegetables & groceries", href: "/menu?category=FRESH_MARKET" },
  { icon: Calendar, title: "Subscriptions", desc: "Daily, weekly & monthly meal plans", href: "/subscriptions" },
];

const categories = [
  { name: "Fast Food", category: "FAST_FOOD", color: "bg-orange-500", emoji: "🍔" },
  { name: "Bakery", category: "BAKERY", color: "bg-amber-600", emoji: "🥐" },
  { name: "Juice Bar", category: "JUICE_BAR", color: "bg-green-500", emoji: "🧃" },
  { name: "Fresh Market", category: "FRESH_MARKET", color: "bg-green-700", emoji: "🥬" },
  { name: "Dry Market", category: "DRY_MARKET", color: "bg-yellow-600", emoji: "🌾" },
];

export default function Home() {
  return (
    <div>
      <section className="relative bg-gradient-to-br from-orange-600 to-orange-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 py-24 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Fresh Food, Delivered Daily 🍔
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Uganda&apos;s favorite fast food restaurant with bakery, juice bar, and fresh market. 
              Order online or subscribe for convenient daily meals.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/menu" className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-100 transition flex items-center gap-2">
                Order Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/subscriptions" className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition">
                View Subscriptions
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Link key={feature.title} href={feature.href} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition group">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-600 group-hover:text-white transition">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-orange-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link key={cat.category} href={`/menu?category=${cat.category}`} className={`${cat.color} text-white p-6 rounded-2xl text-center hover:scale-105 transition shadow-lg`}>
                <div className="text-4xl mb-2">{cat.emoji}</div>
                <h3 className="font-bold text-lg">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Why Choose Chakula Foods?</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          We combine quality, convenience, and great taste to serve Uganda the best food experience.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🌿</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Fresh Ingredients</h3>
            <p className="text-gray-600">We source the freshest local produce for all our meals.</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🚚</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
            <p className="text-gray-600">Quick delivery across Kampala and surrounding areas.</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">💳</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Easy Payments</h3>
            <p className="text-gray-600">Pay with MTN MoMo, Airtel Money, or Card.</p>
          </div>
        </div>
      </section>

      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe & Save</h2>
          <p className="text-xl mb-8 opacity-90">
            Get fresh meals delivered daily, weekly or monthly. Perfect for busy professionals and families.
          </p>
          <Link href="/subscriptions" className="bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-700 transition inline-block">
            View Subscription Plans
          </Link>
        </div>
      </section>
    </div>
  );
}

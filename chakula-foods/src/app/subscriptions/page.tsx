"use client";
import { useState, useEffect } from "react";
import { Check, Calendar } from "lucide-react";
import { useAuth } from "@/store/auth";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

const plans = [
  {
    id: "DAILY",
    name: "Daily Plan",
    price: 35000,
    period: "day",
    description: "Perfect for trying us out",
    features: [
      "One meal per day",
      "Flexible delivery time",
      "Choose from full menu",
      "Cancel anytime",
    ],
  },
  {
    id: "WEEKLY",
    name: "Weekly Plan",
    price: 200000,
    period: "week",
    popular: true,
    description: "Best value for regular customers",
    features: [
      "7 days of meals",
      "Lunch & dinner included",
      "10% discount",
      "Free delivery",
      "Priority support",
    ],
  },
  {
    id: "MONTHLY",
    name: "Monthly Plan",
    price: 750000,
    period: "month",
    description: "Full month of delicious meals",
    features: [
      "30 days of meals",
      "All meals included",
      "15% discount",
      "Free delivery",
      "Dedicated account manager",
      "Special menu requests",
    ],
  },
];

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<
    { productId: string; quantity: number }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/products?featured=true")
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, []);

  const toggleItem = (productId: string) => {
    const exists = selectedItems.find((i) => i.productId === productId);
    if (exists) {
      setSelectedItems(selectedItems.filter((i) => i.productId !== productId));
    } else {
      setSelectedItems([...selectedItems, { productId, quantity: 1 }]);
    }
  };

  const handleSubscribe = async () => {
    if (!user) return;
    if (!selectedPlan || selectedItems.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          items: selectedItems,
          deliveryTime: "08:00",
          deliveryDays: ["MON", "TUE", "WED", "THU", "FRI"],
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create subscription");
      }
      setSuccess(true);
      setSelectedPlan(null);
      setSelectedItems([]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-8">
          ✅ Subscription created successfully! Check your{" "}
          <Link href="/account" className="font-semibold underline">
            account
          </Link>{" "}
          for details.
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Subscription Plans</h1>
        <p className="text-xl text-gray-500">
          Fresh meals delivered to you. Save more with longer plans!
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl p-8 shadow-lg relative border-2 ${
              selectedPlan === plan.id
                ? "border-orange-600"
                : plan.popular
                ? "border-orange-200"
                : "border-gray-100"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
                Most Popular
              </div>
            )}
            <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
            <div className="mb-4">
              <span className="text-4xl font-bold text-orange-600">
                {formatCurrency(plan.price)}
              </span>
              <span className="text-gray-400">/{plan.period}</span>
            </div>
            <p className="text-gray-500 mb-6 text-sm">{plan.description}</p>
            <ul className="space-y-2 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setSelectedPlan(plan.id)}
              className={`w-full py-3 rounded-lg font-bold transition ${
                selectedPlan === plan.id
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {selectedPlan === plan.id ? "✓ Selected" : "Choose Plan"}
            </button>
          </div>
        ))}
      </div>

      {/* Meal selection */}
      {selectedPlan && (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-orange-600" /> Select Your Meals
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Choose the items you want included in your subscription.
          </p>

          {products.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No featured products available.
            </p>
          ) : (
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              {products.slice(0, 12).map((product) => {
                const isSelected = !!selectedItems.find(
                  (i) => i.productId === product.id
                );
                return (
                  <button
                    key={product.id}
                    onClick={() => toggleItem(product.id)}
                    className={`p-4 border-2 rounded-xl text-left transition ${
                      isSelected
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-semibold text-sm">{product.name}</p>
                    <p className="text-orange-600 font-bold text-sm mt-1">
                      {formatCurrency(product.price)}
                    </p>
                    {isSelected && (
                      <span className="text-xs text-orange-600 font-medium">
                        ✓ Added
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {!user ? (
            <div className="text-center">
              <p className="text-gray-500 mb-3">
                You need to be signed in to subscribe.
              </p>
              <Link
                href="/login?redirect=/subscriptions"
                className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition inline-block"
              >
                Sign In
              </Link>
            </div>
          ) : selectedItems.length > 0 ? (
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : `Subscribe to ${
                    plans.find((p) => p.id === selectedPlan)?.name
                  } — ${formatCurrency(
                    plans.find((p) => p.id === selectedPlan)?.price ?? 0
                  )}`}
            </button>
          ) : (
            <p className="text-center text-gray-400 text-sm">
              Select at least one meal option to continue.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

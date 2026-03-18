"use client";
import { useState, useEffect } from "react";
import { Check, Calendar } from "lucide-react";
import { useAuth } from "@/store/auth";
import { formatCurrency } from "@/lib/utils";

const plans = [
  {
    id: "DAILY",
    name: "Daily Plan",
    price: 35000,
    period: "day",
    description: "Perfect for trying us out",
    features: ["One meal per day", "Flexible delivery time", "Choose from full menu", "Cancel anytime"],
  },
  {
    id: "WEEKLY",
    name: "Weekly Plan",
    price: 200000,
    period: "week",
    popular: true,
    description: "Best value for regular customers",
    features: ["7 days of meals", "Lunch & dinner included", "10% discount", "Free delivery", "Priority support"],
  },
  {
    id: "MONTHLY",
    name: "Monthly Plan",
    price: 750000,
    period: "month",
    description: "Full month of delicious meals",
    features: ["30 days of meals", "All meals included", "15% discount", "Free delivery", "Dedicated account manager", "Special menu requests"],
  },
];

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [products, setProducts] = useState<{ id: string; name: string; price: number; category: string }[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/products?featured=true").then((r) => r.json()).then(setProducts).catch(console.error);
  }, []);

  const handleSubscribe = async () => {
    if (!user || !selectedPlan || selectedItems.length === 0) return;
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
      if (res.ok) {
        alert("Subscription created successfully!");
        setSelectedPlan(null);
        setSelectedItems([]);
      }
    } catch {
      alert("Failed to create subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Subscription Plans</h1>
        <p className="text-xl text-gray-600">Fresh meals delivered to you. Save more with longer plans!</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan) => (
          <div key={plan.id} className={`bg-white rounded-2xl p-8 shadow-lg relative ${plan.popular ? "ring-2 ring-orange-500" : ""}`}>
            {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</div>}
            <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
            <div className="mb-4">
              <span className="text-4xl font-bold text-orange-600">{formatCurrency(plan.price)}</span>
              <span className="text-gray-500">/{plan.period}</span>
            </div>
            <p className="text-gray-600 mb-6">{plan.description}</p>
            <ul className="space-y-3 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" /> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setSelectedPlan(plan.id)}
              className={`w-full py-3 rounded-lg font-bold transition ${selectedPlan === plan.id ? "bg-orange-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
            >
              {selectedPlan === plan.id ? "Selected" : "Choose Plan"}
            </button>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6" /> Select Your Meals
          </h2>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            {products.slice(0, 8).map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  const exists = selectedItems.find((i) => i.productId === product.id);
                  if (exists) {
                    setSelectedItems(selectedItems.filter((i) => i.productId !== product.id));
                  } else {
                    setSelectedItems([...selectedItems, { productId: product.id, quantity: 1 }]);
                  }
                }}
                className={`p-4 border rounded-lg text-left transition ${selectedItems.find((i) => i.productId === product.id) ? "border-orange-500 bg-orange-50" : "hover:border-gray-300"}`}
              >
                <p className="font-medium">{product.name}</p>
                <p className="text-orange-600 font-bold">{formatCurrency(product.price)}</p>
              </button>
            ))}
          </div>
          {selectedItems.length > 0 ? (
            <button onClick={handleSubscribe} disabled={loading} className="w-full bg-orange-600 text-white py-4 rounded-lg font-bold hover:bg-orange-700 transition disabled:opacity-50">
              {loading ? "Processing..." : `Subscribe to ${plans.find((p) => p.id === selectedPlan)?.name} - ${formatCurrency((plans.find((p) => p.id === selectedPlan)?.price || 0) * selectedItems.length)}`}
            </button>
          ) : (
            <p className="text-center text-gray-500">Select at least one meal option</p>
          )}
        </div>
      )}
    </div>
  );
}

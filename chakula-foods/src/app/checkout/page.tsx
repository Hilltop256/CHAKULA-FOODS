"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKEAWAY" | "DELIVERY">("TAKEAWAY");
  const [paymentMethod, setPaymentMethod] = useState<"MTN_MOMO" | "AIRTEL_MONEY" | "VISA_MASTERCARD" | "CASH">("MTN_MOMO");
  const [phone, setPhone] = useState(user?.phone || "");
  const [notes, setNotes] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [address, setAddress] = useState("");

  const deliveryFee = orderType === "DELIVERY" ? 5000 : 0;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, notes: i.notes })),
          type: orderType,
          tableNumber: orderType === "DINE_IN" ? tableNumber : undefined,
          deliveryAddress: orderType === "DELIVERY" ? address : undefined,
          notes,
        }),
      });
      if (!res.ok) throw new Error("Order failed");
      const order = await res.json();

      if (paymentMethod !== "CASH") {
        const payRes = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.id,
            amount: total,
            method: paymentMethod,
            phone,
          }),
        });
        const payData = await payRes.json();
        if (payData.paymentLink) {
          window.location.href = payData.paymentLink;
          return;
        }
      }

      clearCart();
      router.push(`/account?order=${order.orderNumber}`);
    } catch (err) {
      alert("Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-8">Your cart is empty</p>
        <Link href="/menu" className="bg-orange-600 text-white px-8 py-3 rounded-full font-bold">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-xl mb-4">Order Type</h2>
          <div className="grid grid-cols-3 gap-3">
            {(["DINE_IN", "TAKEAWAY", "DELIVERY"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setOrderType(type)}
                className={`py-3 rounded-lg font-medium border-2 transition ${
                  orderType === type ? "border-orange-600 bg-orange-50 text-orange-600" : "border-gray-200"
                }`}
              >
                {type === "DINE_IN" ? "🍽️ Dine In" : type === "TAKEAWAY" ? "🥡 Takeaway" : "🚚 Delivery"}
              </button>
            ))}
          </div>
          {orderType === "DINE_IN" && (
            <input type="text" placeholder="Table Number" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} className="w-full mt-4 p-3 border rounded-lg" />
          )}
          {orderType === "DELIVERY" && (
            <input type="text" placeholder="Delivery Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full mt-4 p-3 border rounded-lg" required />
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-xl mb-4">Payment Method</h2>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: "MTN_MOMO", label: "MTN MoMo", emoji: "📱" },
              { value: "AIRTEL_MONEY", label: "Airtel Money", emoji: "📱" },
              { value: "VISA_MASTERCARD", label: "Card", emoji: "💳" },
              { value: "CASH", label: "Cash on Delivery", emoji: "💵" },
            ] as const).map((method) => (
              <button
                key={method.value}
                type="button"
                onClick={() => setPaymentMethod(method.value)}
                className={`py-3 rounded-lg font-medium border-2 transition ${
                  paymentMethod === method.value ? "border-orange-600 bg-orange-50 text-orange-600" : "border-gray-200"
                }`}
              >
                {method.emoji} {method.label}
              </button>
            ))}
          </div>
          {(paymentMethod === "MTN_MOMO" || paymentMethod === "AIRTEL_MONEY") && (
            <input type="tel" placeholder="Phone Number (e.g., 0771234567)" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full mt-4 p-3 border rounded-lg" required />
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-xl mb-4">Order Notes</h2>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions..." className="w-full p-3 border rounded-lg h-24 resize-none" />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="space-y-3 border-b pb-4 mb-4">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            {deliveryFee > 0 && <div className="flex justify-between"><span>Delivery</span><span>{formatCurrency(deliveryFee)}</span></div>}
          </div>
          <div className="flex justify-between font-bold text-xl mb-6"><span>Total</span><span>{formatCurrency(total)}</span></div>
          <button type="submit" disabled={loading} className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition disabled:opacity-50">
            {loading ? "Processing..." : `Pay ${formatCurrency(total)}`}
          </button>
        </div>
      </form>
    </div>
  );
}

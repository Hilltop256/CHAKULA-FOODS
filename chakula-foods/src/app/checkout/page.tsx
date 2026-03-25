"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

type OrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";
type PaymentMethod = "MTN_MOMO" | "AIRTEL_MONEY" | "VISA_MASTERCARD" | "CASH";

const ORDER_TYPES: { value: OrderType; label: string; emoji: string }[] = [
  { value: "DINE_IN", label: "Dine In", emoji: "🍽️" },
  { value: "TAKEAWAY", label: "Takeaway", emoji: "🥡" },
  { value: "DELIVERY", label: "Delivery", emoji: "🚚" },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string; emoji: string }[] = [
  { value: "MTN_MOMO", label: "MTN MoMo", emoji: "📱" },
  { value: "AIRTEL_MONEY", label: "Airtel Money", emoji: "📱" },
  { value: "VISA_MASTERCARD", label: "Card", emoji: "💳" },
  { value: "CASH", label: "Cash", emoji: "💵" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("TAKEAWAY");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MTN_MOMO");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [notes, setNotes] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [address, setAddress] = useState("");

  const deliveryFee = orderType === "DELIVERY" ? 5000 : 0;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }

    setLoading(true);
    try {
      // Create order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            notes: i.notes,
          })),
          type: orderType,
          tableNumber: orderType === "DINE_IN" ? tableNumber : undefined,
          deliveryAddress: orderType === "DELIVERY" ? address : undefined,
          notes,
        }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json();
        throw new Error(data.error ?? "Failed to place order");
      }

      const order = await orderRes.json();

      // Process payment
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

        if (!payRes.ok) {
          throw new Error(payData.error ?? "Payment failed");
        }

        // Flutterwave redirect
        if (payData.paymentLink) {
          clearCart();
          window.location.href = payData.paymentLink;
          return;
        }
      }

      clearCart();
      router.push(`/account?order=${order.orderNumber}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-6">Your cart is empty</p>
        <Link
          href="/menu"
          className="bg-orange-600 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-700 transition"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {!user && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-6 text-sm">
          Please{" "}
          <Link href="/login?redirect=/checkout" className="font-semibold underline">
            sign in
          </Link>{" "}
          to complete your order.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Type */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-lg mb-4">Order Type</h2>
          <div className="grid grid-cols-3 gap-3">
            {ORDER_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setOrderType(type.value)}
                className={`py-3 rounded-lg font-medium border-2 transition text-sm ${
                  orderType === type.value
                    ? "border-orange-600 bg-orange-50 text-orange-600"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {type.emoji} {type.label}
              </button>
            ))}
          </div>
          {orderType === "DINE_IN" && (
            <input
              type="text"
              placeholder="Table Number"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full mt-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          )}
          {orderType === "DELIVERY" && (
            <input
              type="text"
              placeholder="Delivery Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full mt-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          )}
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-lg mb-4">Payment Method</h2>
          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.value}
                type="button"
                onClick={() => setPaymentMethod(method.value)}
                className={`py-3 rounded-lg font-medium border-2 transition text-sm ${
                  paymentMethod === method.value
                    ? "border-orange-600 bg-orange-50 text-orange-600"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {method.emoji} {method.label}
              </button>
            ))}
          </div>
          {(paymentMethod === "MTN_MOMO" ||
            paymentMethod === "AIRTEL_MONEY") && (
            <input
              type="tel"
              placeholder="Phone Number (e.g., 0771234567)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mt-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          )}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-lg mb-4">Order Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special instructions? (optional)"
            className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm text-gray-600 border-b pb-4 mb-4">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between">
                <span>
                  {item.quantity}× {item.name}
                </span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between font-bold text-xl mb-6">
            <span>Total</span>
            <span className="text-orange-600">{formatCurrency(total)}</span>
          </div>
          <button
            type="submit"
            disabled={loading || !user}
            className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Processing..."
              : !user
              ? "Sign in to Continue"
              : `Pay ${formatCurrency(total)}`}
          </button>
        </div>
      </form>
    </div>
  );
}

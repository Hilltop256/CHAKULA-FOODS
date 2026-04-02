"use client";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";

const DELIVERY_FEE = 5000;

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">
          Add some delicious food to get started!
        </p>
        <Link
          href="/menu"
          className="bg-orange-600 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-700 transition inline-block"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden relative">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded-lg"
                    sizes="96px"
                  />
                ) : (
                  <span className="text-3xl">🍽️</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base truncate">{item.name}</h3>
                <p className="text-orange-600 font-semibold">
                  {formatCurrency(item.price)}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="p-1.5 hover:bg-gray-100 rounded-l-lg transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      className="p-1.5 hover:bg-gray-100 rounded-r-lg transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-base">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
          <button
            onClick={clearCart}
            className="text-red-500 text-sm hover:underline"
          >
            Clear cart
          </button>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-fit sticky top-24">
          <h2 className="font-bold text-xl mb-4">Order Summary</h2>
          <div className="space-y-3 border-b pb-4 mb-4 text-sm">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-gray-600">
                <span className="truncate mr-2">
                  {item.quantity}× {item.name}
                </span>
                <span className="shrink-0">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between text-gray-600 pt-2 border-t">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery (if applicable)</span>
              <span>{formatCurrency(DELIVERY_FEE)}</span>
            </div>
          </div>
          <div className="flex justify-between font-bold text-xl mb-6">
            <span>Est. Total</span>
            <span>{formatCurrency(subtotal + DELIVERY_FEE)}</span>
          </div>
          <Link
            href="/checkout"
            className="flex w-full bg-orange-600 text-white text-center py-4 rounded-xl font-bold hover:bg-orange-700 transition items-center justify-center gap-2"
          >
            Checkout <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/menu"
            className="block text-center text-sm text-orange-600 hover:underline mt-3"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

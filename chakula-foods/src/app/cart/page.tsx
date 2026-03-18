"use client";
import { useState } from "react";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const deliveryFee = 5000;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Add some delicious food to get started!</p>
        <Link href="/menu" className="bg-orange-600 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-700 transition">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="bg-white rounded-xl p-4 shadow-sm flex gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" /> : <span className="text-3xl">🍽️</span>}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-orange-600 font-bold">{formatCurrency(item.price)}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border rounded-lg">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-2 hover:bg-gray-100">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-2 hover:bg-gray-100">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
          <button onClick={clearCart} className="text-red-500 text-sm hover:underline">Clear cart</button>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm h-fit">
          <h2 className="font-bold text-xl mb-4">Order Summary</h2>
          <div className="space-y-3 border-b pb-4 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{formatCurrency(deliveryFee)}</span>
            </div>
          </div>
          <div className="flex justify-between font-bold text-xl mb-6">
            <span>Total</span>
            <span>{formatCurrency(subtotal + deliveryFee)}</span>
          </div>
          <Link href="/checkout" className="block w-full bg-orange-600 text-white text-center py-4 rounded-xl font-bold hover:bg-orange-700 transition flex items-center justify-center gap-2">
            Checkout <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

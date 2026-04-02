"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

function CallbackContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const ref = searchParams.get("ref");

  if (status === "success") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-500 mb-2">
          Your payment has been confirmed and your order is being processed.
        </p>
        {ref && (
          <p className="text-sm text-gray-400 mb-6">Reference: {ref}</p>
        )}
        <div className="flex flex-col gap-3">
          <Link
            href="/account"
            className="bg-orange-600 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-700 transition"
          >
            View My Orders
          </Link>
          <Link
            href="/menu"
            className="text-orange-600 hover:underline text-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (status === "failed" || status === "error") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
        <p className="text-gray-500 mb-6">
          Your payment could not be processed. Please try again or use a
          different payment method.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/checkout"
            className="bg-orange-600 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-700 transition"
          >
            Try Again
          </Link>
          <Link href="/" className="text-orange-600 hover:underline text-sm">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <AlertCircle className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">Payment Processing</h1>
      <p className="text-gray-500 mb-6">
        Your payment is being processed. You will receive an SMS confirmation
        shortly.
      </p>
      <Link
        href="/account"
        className="bg-orange-600 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-700 transition inline-block"
      >
        View My Orders
      </Link>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-16 text-gray-500">Loading...</div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}

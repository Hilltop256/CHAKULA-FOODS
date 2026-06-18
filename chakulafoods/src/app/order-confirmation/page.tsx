import { Suspense } from 'react';
import OrderConfirmationClient from './components/OrderConfirmationClient';

export const metadata = {
  title: 'Order Confirmed | Chakula Foods',
  description: 'Your order has been placed successfully.',
};

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>}>
      <OrderConfirmationClient />
    </Suspense>
  );
}

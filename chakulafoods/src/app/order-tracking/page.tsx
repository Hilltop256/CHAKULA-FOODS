import { Suspense } from 'react';
import OrderTrackingClient from './components/OrderTrackingClient';

export const metadata = {
  title: 'Track Your Order | Chakula Foods',
  description: 'Track your order in real-time with live rider location and delivery updates.',
};

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>}>
      <OrderTrackingClient />
    </Suspense>
  );
}

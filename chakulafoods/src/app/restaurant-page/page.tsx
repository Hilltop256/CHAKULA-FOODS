import React from 'react';
import RestaurantPageWrapper from '@/app/restaurant-page/components/RestaurantPageWrapper';
// CRITICAL: Adjust this import path to point exactly to your `server.ts` file location
import { createClient } from '@/lib/supabase/server'; 

interface DbOrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface DbOrder {
  id: string;
  created_at: string;
  total_price: number;
  order_items: DbOrderItem[];
}

async function getRestaurantData() {
  const supabase = await createClient();

  // 1. Fetch active products directly from your Supabase database table
  const { data: items, error: itemsError } = await supabase
    .from('restaurant_items') // Matches your schema table for restaurant dishes
    .select('*')
    .eq('available', true);

  if (itemsError) {
    console.error('Error fetching database restaurant items:', itemsError);
  }

  // 2. Fetch the authenticated user's session to retrieve historical order tracking
  const { data: { user } } = await supabase.auth.getUser();
  let lastOrder = null;

  if (user) {
    const { data: orderData, error: orderError } = await supabase
      .from('orders') // Matches your orders table
      .select(`
        id,
        created_at,
        total_price,
        order_items (
          name,
          quantity,
          price
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (orderError) {
      console.error('Error pulling historical order data:', orderError);
    }

    // Transform database layout to match the UI interface structure expected by RestaurantPageClient
    if (orderData) {
      const typedOrder = orderData as unknown as DbOrder;
      lastOrder = {
        id: typedOrder.id.slice(0, 8).toUpperCase(), 
        date: new Date(typedOrder.created_at).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        items: (typedOrder.order_items || []).map((oi) => ({
          name: oi.name,
          qty: oi.quantity,
          price: oi.price,
        })),
        total: typedOrder.total_price,
      };
    }
  }

  return {
    items: items || [],
    lastOrder,
  };
}

export default async function RestaurantPage() {
  const { items, lastOrder } = await getRestaurantData();

  return <RestaurantPageWrapper items={items} lastOrder={lastOrder} />;
}

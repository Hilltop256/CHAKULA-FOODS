import React from 'react';
import RestaurantPageWrapper from '@/app/restaurant-page/components/RestaurantPageWrapper';
// Import your Supabase server client or database utility here
// import { createClient } from '@/utils/supabase/server';

async function getRestaurantData() {
  try {
    // Example Supabase fetching logic:
    // const supabase = await createClient();
    // 
    // Fetch active menu items
    // const { data: items } = await supabase
    //   .from('restaurant_items')
    //   .select('*')
    //   .eq('available', true);
    //
    // Fetch user's last order if authenticated
    // const { data: lastOrder } = await supabase
    //   .from('orders')
    //   .select('id, created_at, order_items(name, quantity, price), total_price')
    //   .order('created_at', { ascending: false })
    //   .limit(1)
    //   .single();

    return {
      items: [], // Replace with your fetched items array
      lastOrder: null // Replace with your fetched last order object or null
    };
  } catch (error) {
    console.error('Error loading restaurant data:', error);
    return { items: [], lastOrder: null };
  }
}

export default async function RestaurantPage() {
  const { items, lastOrder } = await getRestaurantData();

  return <RestaurantPageWrapper items={items} lastOrder={lastOrder} />;
}

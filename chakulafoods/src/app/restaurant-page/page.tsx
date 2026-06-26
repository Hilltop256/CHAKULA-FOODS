import React from 'react';
import RestaurantPageWrapper from '@/app/restaurant-page/components/RestaurantPageWrapper';
import { createClient } from '@/lib/supabase/server'; // Adjust this import based on your setup

export default async function RestaurantPage() {
  // 1. Initialize the Supabase server client
  const supabase = createClient();

  // 2. Fetch the products from the database
  // We filter by department to only get Restaurant items, if applicable.
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('department', 'Restaurant') 
    .order('orders_count', { ascending: false });

  if (error) {
    console.error('Failed to fetch restaurant products:', error.message);
  }

  // 3. Pass the fetched products down as a prop
  return <RestaurantPageWrapper products={products || []} />;
}

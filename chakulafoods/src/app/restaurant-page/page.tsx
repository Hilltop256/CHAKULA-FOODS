import React from 'react';
import { createClient } from '@/utils/supabase/server'; // Adjust this path based on your Supabase initialization helper
import RestaurantPageWrapper from '@/app/restaurant-page/components/RestaurantPageWrapper';

// Define the type matching your DB schema
export interface RestaurantItem {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  rating: number;
  prepTime: string;
  image: string;
  tag: string;
  available: boolean;
  description: string;
}

export default async function RestaurantPage() {
  const supabase = createClient();
  
  // Fetching live items from the database table
  const { data: databaseItems, error } = await supabase
    .from('restaurant_items') // Your database table name
    .select('*')
    .eq('available', true);

  if (error) {
    console.error('Error fetching restaurant items:', error);
  }

  return <RestaurantPageWrapper initialItems={databaseItems || []} />;
}

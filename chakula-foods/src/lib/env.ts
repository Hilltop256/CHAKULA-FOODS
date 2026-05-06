/**
 * Centralized environment variables
 */
export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || "",

  // App
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",

  // Supabase
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET || "media",

  // Payment (optional)
  MTN_MOMO_BASE_URL: process.env.MTN_MOMO_BASE_URL || "",
  MTN_SUBSCRIPTION_KEY: process.env.MTN_SUBSCRIPTION_KEY || "",
  MTN_API_USER: process.env.MTN_API_USER || "",
  MTN_API_KEY: process.env.MTN_API_KEY || "",
  MTN_ENVIRONMENT: process.env.MTN_ENVIRONMENT || "sandbox",
  AIRTEL_BASE_URL: process.env.AIRTEL_BASE_URL || "",
  AIRTEL_CLIENT_ID: process.env.AIRTEL_CLIENT_ID || "",
  AIRTEL_CLIENT_SECRET: process.env.AIRTEL_CLIENT_SECRET || "",
  FLUTTERWAVE_SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY || "",

  // SMS
  AFRICASTALKING_API_KEY: process.env.AFRICASTALKING_API_KEY || "",
  AFRICASTALKING_USERNAME: process.env.AFRICASTALKING_USERNAME || "sandbox",
  AFRICASTALKING_SENDER_ID: process.env.AFRICASTALKING_SENDER_ID || "CHAKULA",
} as const;

export function isStorageConfigured():boolean {
  return !!(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

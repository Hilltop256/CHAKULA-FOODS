-- Migration: add-scheduling-variants
-- Created at: 2025-04-21
-- Description: Add scheduling fields to Product and create ProductVariant table

-- Add scheduling columns to Product table
ALTER TABLE "Product" ADD COLUMN "availableFrom" TEXT;
ALTER TABLE "Product" ADD COLUMN "availableTo" TEXT;
ALTER TABLE "Product" ADD COLUMN "availableDays" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create ProductVariant table
CREATE TABLE IF NOT EXISTS "ProductVariant" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "productId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "price" DOUBLE PRECISION,
  "stock" INTEGER,
  "isActive" BOOLEAN NOT NULL DEFAULT true,

  CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProductVariant_productId_name_key" UNIQUE ("productId", "name"),
  CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create index on ProductVariant.productId for faster lookups
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

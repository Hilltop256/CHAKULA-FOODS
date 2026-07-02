import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  UtensilsCrossed,
  Cake,
  Leaf,
  Wine,
  ShoppingBasket,
  Repeat,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const departmentDefinitions = [
  {
    id: "dept-restaurant",
    databaseName: "Restaurant",
    name: "Restaurant",
    description: "Meals, combos, breakfast, lunch & dinner",
    icon: UtensilsCrossed,
    href: "/restaurant-page",
    colorClass: "dept-card-restaurant",
    badge: "Most Popular",
  },
  {
    id: "dept-confectionary",
    databaseName: "Confectionary",
    name: "Confectionary",
    description: "Cakes, pastries & birthday packages",
    icon: Cake,
    href: "/confectionary-page",
    colorClass: "dept-card-confectionary",
    badge: "Order Ahead",
  },
  {
    id: "dept-juice",
    databaseName: "Juice Bar",
    name: "Juice Bar",
    description: "Smoothies, detox plans & fresh juices",
    icon: Leaf,
    href: "/juice-bar-page",
    colorClass: "dept-card-juice",
    badge: "Daily Delivery",
  },
  {
    id: "dept-wine",
    databaseName: "Wine & Liquor",
    name: "Wine & Liquor",
    description: "Wines, whiskey, champagne & party bundles",
    icon: Wine,
    href: "/wine-liquor-page",
    colorClass: "dept-card-wine",
    badge: "18+ Only",
  },
  {
    id: "dept-market",
    databaseName: "Market Specials",
    name: "Market Specials",
    description: "Rice, sugar, cooking oil & bundle packs",
    icon: ShoppingBasket,
    href: "/market-specials",
    colorClass: "dept-card-market",
    badge: "Best Value",
  },
  {
    id: "dept-subscriptions",
    databaseName: null,
    name: "Subscriptions",
    description: "Weekly wellness & meal plans",
    icon: Repeat,
    href: "#subscriptions",
    colorClass: "dept-card-subscription",
    badge: "Coming Soon",
  },
];

export default async function DepartmentCards() {
  const counts: Record<string, number> = {};

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("department");

    if (error) throw error;

    for (const product of data || []) {
      const department = product.department as string;
      counts[department] = (counts[department] || 0) + 1;
    }
  } catch (error) {
    console.error("Department product count error:", error);
  }

  const departments = departmentDefinitions.map((department) => ({
    ...department,
    itemCount: department.databaseName
      ? counts[department.databaseName] || 0
      : 0,
  }));

  return (
    <section className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent mb-3">
          Our Departments
        </h2>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Fresh meals, premium groceries, beverages and subscriptions — all
          thoughtfully curated in one place.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-6 max-w-5xl mx-auto">
        {departments.map((department) => {
          const DepartmentIcon = department.icon;
          return (
            <Link
              key={department.id}
              href={department.href}
              className={`${department.colorClass} rounded-3xl p-8 text-white card-hover cursor-pointer block relative overflow-hidden min-h-[220px]`}
            >
              <div className="absolute top-3 right-3">
                <span className="text-xs font-semibold bg-white/20 rounded-full px-2 py-0.5 leading-none">
                  {department.badge}
                </span>
              </div>

              <DepartmentIcon size={42} className="mb-5 opacity-90" />

              <h3 className="font-bold text-xl leading-tight mb-2">
                {department.name}
              </h3>

              <p className="text-sm opacity-80 leading-relaxed mb-5">
                {department.description}
              </p>

              <div className="flex items-center justify-between">
                {department.databaseName ? (
                  <span className="text-sm opacity-90">
                    {department.itemCount} item
                    {department.itemCount !== 1 ? "s" : ""}
                  </span>
                ) : (
                  <span className="text-sm opacity-75">Coming soon</span>
                )}

                <ArrowRight size={20} className="opacity-70 ml-auto" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

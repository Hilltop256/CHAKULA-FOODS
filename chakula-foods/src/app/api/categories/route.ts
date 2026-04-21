import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminOrTestUser } from "@/lib/test-mode";
import { supabaseQuery } from "@/lib/supabase";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(categories);
  } catch {
    // Fallback: Supabase REST API
    try {
      const categories = await supabaseQuery("Category", {
        isActive: "eq.true",
        order: "sortOrder.asc",
      });
      return NextResponse.json(categories);
    } catch (restError) {
      const msg = restError instanceof Error ? restError.message : "Unknown error";
      console.error("Categories fetch error:", msg);
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: 500 }
      );
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAdminOrTestUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const category = await prisma.category.create({ data: body });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Category create error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

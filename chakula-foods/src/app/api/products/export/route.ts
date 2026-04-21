import { NextRequest, NextResponse } from "next/server";
import { getAdminOrTestUser } from "@/lib/test-mode";

export async function GET(req: NextRequest) {
  try {
    const user = await getAdminOrTestUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "csv";

    const { prisma } = await import("@/lib/prisma");
    const products = await prisma.product.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    if (format === "json") {
      return NextResponse.json(products);
    }

    // CSV format
    const headers = [
      "name",
      "description",
      "price",
      "category",
      "unit",
      "preparationTime",
      "isAvailable",
      "isFeatured",
      "image",
      "allergens",
      "tags",
      "calories",
      "availableFrom",
      "availableTo",
      "availableDays",
    ];

    const rows = products.map((p) => ({
      name: p.name,
      description: p.description || "",
      price: p.price.toString(),
      category: p.category,
      unit: p.unit || "",
      preparationTime: p.preparationTime?.toString() || "",
      isAvailable: p.isAvailable ? "true" : "false",
      isFeatured: p.isFeatured ? "true" : "false",
      image: p.image || "",
      allergens: (p.allergens || []).join(";"),
      tags: (p.tags || []).join(";"),
      calories: p.calories?.toString() || "",
      availableFrom: p.availableFrom || "",
      availableTo: p.availableTo || "",
      availableDays: (p.availableDays || []).join(";"),
    }));

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers.map((h) => `"${row[h as keyof typeof row]}"`).join(",")
      ),
    ].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="products.csv"',
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

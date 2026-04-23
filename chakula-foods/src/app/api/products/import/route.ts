import { NextRequest, NextResponse } from "next/server";
import { getAdminOrTestUser } from "@/lib/test-mode";
import { ProductCategory, Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const user = await getAdminOrTestUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV file is empty or invalid" }, { status: 400 });
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const results = { created: 0, updated: 0, errors: [] as string[] };

    const { prisma } = await import("@/lib/prisma");

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        const data: Record<string, unknown> = {};

        headers.forEach((header, index) => {
          const value = values[index]?.trim() || "";
          switch (header) {
            case "name":
              data.name = value;
              break;
            case "description":
              data.description = value || null;
              break;
            case "price":
              data.price = parseFloat(value) || 0;
              break;
            case "category":
              if (Object.values(ProductCategory).includes(value as ProductCategory)) {
                data.category = value as ProductCategory;
              } else {
                throw new Error(`Invalid category: ${value}`);
              }
              break;
            case "unit":
              data.unit = value || null;
              break;
            case "preparationTime":
              data.preparationTime = value ? parseInt(value) : null;
              break;
            case "isAvailable":
              data.isAvailable = value.toLowerCase() === "true";
              break;
            case "isFeatured":
              data.isFeatured = value.toLowerCase() === "true";
              break;
            case "image":
              data.image = value || null;
              break;
            case "allergens":
              data.allergens = value ? value.split(";").map((s) => s.trim()) : [];
              break;
            case "tags":
              data.tags = value ? value.split(";").map((s) => s.trim()) : [];
              break;
            case "calories":
              data.calories = value ? parseInt(value) : null;
              break;
            case "availableFrom":
              data.availableFrom = value || null;
              break;
            case "availableTo":
              data.availableTo = value || null;
              break;
            case "availableDays":
              data.availableDays = value ? value.split(";").map((d) => d.trim().toLowerCase()) : [];
              break;
          }
        });

        if (!data.name || !data.price || !data.category) {
          throw new Error("Missing required fields (name, price, or category)");
        }

        // Check if product exists by name (case-insensitive) for update
        const existing = await prisma.product.findFirst({
          where: { name: { equals: data.name as string, mode: "insensitive" } },
        });

        if (existing) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
           await prisma.product.update({
             where: { id: existing.id },
             data: data as Prisma.ProductCreateInput,
           });
           results.updated++;
         } else {
           await prisma.product.create({ data: data as Prisma.ProductCreateInput });
           results.created++;
         }
      } catch (err) {
        results.errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    return NextResponse.json({
      message: `Import complete: ${results.created} created, ${results.updated} updated`,
      results,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);

  return result;
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const active = searchParams.get("active");

    const where: Record<string, unknown> = {};
    if (active !== null) {
      where.isActive = active === "true";
    }

    const tables = await prisma.table.findMany({
      where,
      orderBy: { number: "asc" },
    });

    const tablesWithOrders = await Promise.all(
      tables.map(async (table) => {
        const activeOrder = await prisma.order.findFirst({
          where: {
            tableNumber: table.number,
            status: { in: ["PENDING", "CONFIRMED", "PREPARING", "READY"] },
          },
          select: { id: true, orderNumber: true, status: true, total: true },
        });

        return {
          ...table,
          occupied: !!activeOrder,
          activeOrder,
        };
      })
    );

    return NextResponse.json(tablesWithOrders);
  } catch (error) {
    console.error("Tables fetch error:", error);
    return NextResponse.json([]);
  }
}
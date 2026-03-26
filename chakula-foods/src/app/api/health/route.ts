import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check environment
    const hasDbUrl = !!process.env.DATABASE_URL;
    const dbUrlPrefix = process.env.DATABASE_URL
      ? process.env.DATABASE_URL.substring(0, 30) + "..."
      : "NOT SET";

    // Try database connection
    let dbStatus = "unknown";
    let productCount = 0;
    let dbError = "";
    try {
      productCount = await prisma.product.count();
      dbStatus = "connected";
    } catch (e) {
      dbStatus = "failed";
      dbError = e instanceof Error ? e.message : String(e);
    }

    return NextResponse.json({
      status: "ok",
      database: {
        hasUrl: hasDbUrl,
        urlPrefix: dbUrlPrefix,
        connection: dbStatus,
        error: dbError || null,
        productCount,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasPublicBaseUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

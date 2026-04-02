import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseCount } from "@/lib/supabase";

export async function GET() {
  try {
    const hasDbUrl = !!process.env.DATABASE_URL;
    const dbUrlPrefix = process.env.DATABASE_URL
      ? process.env.DATABASE_URL.substring(0, 30) + "..."
      : "NOT SET";

    // Try Prisma connection
    let prismaStatus = "unknown";
    let prismaCount = 0;
    let prismaError = "";
    try {
      prismaCount = await prisma.product.count();
      prismaStatus = "connected";
    } catch (e) {
      prismaStatus = "failed";
      prismaError = e instanceof Error ? e.message : String(e);
    }

    // Try Supabase REST API fallback
    let restStatus = "unknown";
    let restCount = 0;
    let restError = "";
    try {
      restCount = await supabaseCount("Product");
      restStatus = "connected";
    } catch (e) {
      restStatus = "failed";
      restError = e instanceof Error ? e.message : String(e);
    }

    const overallStatus =
      prismaStatus === "connected" || restStatus === "connected"
        ? "ok"
        : "degraded";

    return NextResponse.json({
      status: overallStatus,
      database: {
        hasUrl: hasDbUrl,
        urlPrefix: dbUrlPrefix,
        prisma: { connection: prismaStatus, error: prismaError || null, count: prismaCount },
        restApi: { connection: restStatus, error: restError || null, count: restCount },
        productCount: prismaCount || restCount,
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

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const dbUrl = process.env.DATABASE_URL || "";
const hasDatabase = dbUrl.length > 20 && (dbUrl.startsWith("postgresql") || dbUrl.startsWith("postgres"));

export async function GET() {
  if (!hasDatabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        avatar: user.avatar,
        latitude: user.latitude,
        longitude: user.longitude,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get account error:", error);
    return NextResponse.json({ error: "Failed to get account" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!hasDatabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, address, latitude, longitude } = body;

    // Check if phone is taken by another user
    if (phone && phone !== user.phone) {
      const existing = await prisma.user.findFirst({
        where: { phone, id: { not: user.id } },
      });

      if (existing) {
        return NextResponse.json({ error: "Phone number already in use" }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name || user.name,
        phone: phone || user.phone,
        address: address !== undefined ? address : user.address,
        latitude: latitude !== undefined ? latitude : user.latitude,
        longitude: longitude !== undefined ? longitude : user.longitude,
      },
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        address: updatedUser.address,
        avatar: updatedUser.avatar,
        latitude: updatedUser.latitude,
        longitude: updatedUser.longitude,
      },
      message: "Account updated successfully",
    });
  } catch (error) {
    console.error("Update account error:", error);
    return NextResponse.json({ error: "Failed to update account" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!hasDatabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    // Delete user and all related data
    await prisma.user.delete({
      where: { id: user.id },
    });

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
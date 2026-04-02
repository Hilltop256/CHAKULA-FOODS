import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, phone, role } = await req.json();

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: await hashPassword(password || "admin123"),
        name: name || "Admin",
        phone: phone || "0700000001",
        role: role || "ADMIN",
      },
    });

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, email: user.email, role: user.role } 
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Setup failed" }, { status: 500 });
  }
}

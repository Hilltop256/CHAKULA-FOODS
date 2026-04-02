import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  createSession,
  getCurrentUser,
} from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  console.log("[LOGIN] Request received");
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    console.log("[LOGIN] Attempt for email:", email);
    console.log("[LOGIN] User found:", !!user);
    if (user) {
      console.log("[LOGIN] User role:", user.role);
    }

    if (!user) {
      console.log("[LOGIN] No user found with email");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password);
    console.log("[LOGIN] Password valid:", isValid);

    if (!isValid) {
      console.log("[LOGIN] Invalid password");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = await createSession(user.id);

    const cookieStore = await cookies();
    cookieStore.set("chakula_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json({ error: error.message || "Login failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}

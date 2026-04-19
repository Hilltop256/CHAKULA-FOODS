import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession, deleteSession } from "@/lib/auth";
import { cookies } from "next/headers";

const dbUrl = process.env.DATABASE_URL || "";
const hasDatabase = dbUrl.length > 20 && (dbUrl.startsWith("postgresql") || dbUrl.startsWith("postgres"));

export async function POST(req: NextRequest) {
  if (!hasDatabase) {
    return NextResponse.json(
      { error: "Registration unavailable. Please contact support." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { name, email, phone, password, referralCode } = body;

    if (!email || !password || !name || !phone) {
      return NextResponse.json(
        { error: "Name, email, phone and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check valid phone (Uganda format)
    const phoneClean = phone.replace(/[\s-]/g, "");
    if (!phoneClean.match(/^(\+256|0)[7-9][0-9]{8}$/)) {
      return NextResponse.json(
        { error: "Enter valid Uganda phone (e.g., 0771234567 or +256771234567)" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { phone }] },
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return NextResponse.json({ error: "Email already registered" }, { status: 400 });
      }
      return NextResponse.json({ error: "Phone number already registered" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        password: hashedPassword,
      },
    });

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
      },
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
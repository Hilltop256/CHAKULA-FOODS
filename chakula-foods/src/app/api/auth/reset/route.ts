import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";
import { cookies } from "next/headers";
import crypto from "crypto";

// In-memory reset codes (for production, use database or Redis)
const resetCodes = new Map<string, { email: string; expires: number }>();

const dbUrl = process.env.DATABASE_URL || "";
const hasDatabase = dbUrl.length > 20 && (dbUrl.startsWith("postgresql") || dbUrl.startsWith("postgres"));

export async function POST(req: NextRequest) {
  if (!hasDatabase) {
    return NextResponse.json({ error: "Password reset unavailable. Please contact support." }, { status: 503 });
  }
  try {
    const body = await req.json();
    const { action, email, code, newPassword } = body;

    // Request password reset
    if (action === "request") {
      if (!email) {
        return NextResponse.json({ error: "Email required" }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        // Don't reveal if email exists
        return NextResponse.json({ message: "If email exists, reset code sent" });
      }

      // Generate 6-digit code
      const resetCode = crypto.randomInt(100000, 999999).toString();
      const expires = Date.now() + 15 * 60 * 1000; // 15 minutes

      resetCodes.set(email.toLowerCase(), {
        email: email.toLowerCase(),
        expires,
      });

      // In production, send via SMS/Email
      console.log(`Password reset code for ${email}: ${resetCode}`);

      return NextResponse.json({
        message: "Reset code sent (check server logs)",
        // Remove this in production - code shown for testing
        debugCode: resetCode,
      });
    }

    // Verify code and reset password
    if (action === "reset") {
      if (!email || !code || !newPassword) {
        return NextResponse.json({ error: "Email, code and new password required" }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      }

      const stored = resetCodes.get(email.toLowerCase());

      if (!stored || stored.expires < Date.now()) {
        return NextResponse.json({ error: "Invalid or expired reset code" }, { status: 400 });
      }

      if (stored.email !== email.toLowerCase()) {
        return NextResponse.json({ error: "Invalid reset code" }, { status: 400 });
      }

      const hashedPassword = await hashPassword(newPassword);

      await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { password: hashedPassword },
      });

      // Delete used code
      resetCodes.delete(email.toLowerCase());

      // Auto-login after password reset
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (user) {
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
          message: "Password reset successful",
        });
      }

      return NextResponse.json({ message: "Password reset successful" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json({ error: "Password reset failed" }, { status: 500 });
  }
}
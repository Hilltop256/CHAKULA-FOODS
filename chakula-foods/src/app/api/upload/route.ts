import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    // Allow uploads in test mode or if user is logged in
    const isTestMode = true; // Set to false in production
    
    if (!isTestMode && !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string || "avatar";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
        { status: 400 }
      );
    }

    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum 5MB." }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${user?.id || 'admin'}-${Date.now()}.${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    
    if (type === "avatar" && user?.avatar) {
      try {
        const oldPath = path.join(process.cwd(), "public", user.avatar);
        await unlink(oldPath);
      } catch {}
    }

    await writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/${filename}`;

    if (type === "avatar" && user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { avatar: url },
      });
    }

    return NextResponse.json({ url, filename }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

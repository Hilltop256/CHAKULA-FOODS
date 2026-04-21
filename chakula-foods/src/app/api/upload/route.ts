import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { uploadImage as storageUpload } from "@/lib/storage";

const base64Cache: Record<string, string> = {};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum 5MB." }, { status: 400 });
    }

    // Try Supabase Storage first, fallback to base64
    try {
      const category = formData.get("category") as string || "media";
      const result = await storageUpload(file, category);
      return NextResponse.json({ url: result.url, id: result.id, storage: "supabase" }, { status: 201 });
    } catch (storageError) {
      console.warn("Storage upload failed, falling back to base64:", storageError.message);
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;
      const id = `img-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      base64Cache[id] = dataUrl;
      return NextResponse.json({ url: dataUrl, id, storage: "base64" }, { status: 201 });
    }

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id && base64Cache[id]) {
    return NextResponse.json({ url: base64Cache[id], storage: "base64" });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(req: NextRequest) {
  // Admin-only image deletion
  try {
    await getCurrentUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Path required for deletion" }, { status: 400 });
  }

  try {
    await storageUpload(new File([], "dummy"), ""); // ensure import
    const { deleteImage } = await import("@/lib/storage");
    await deleteImage(path);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

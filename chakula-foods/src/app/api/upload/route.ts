import { NextRequest, NextResponse } from "next/server";
import { getAdminOrTestUser } from "@/lib/test-mode";
import { uploadImage as storageUpload, deleteImage } from "@/lib/storage";

// Force Node.js runtime (Edge runtime has different FormData handling)
export const runtime = "nodejs";
// Disable static optimization so upload always hits the server
export const dynamic = "force-dynamic";
// Allow up to 6MB request body (Vercel default is 4.5MB; we validate 5MB max file)
export const maxDuration = 30;

// Ephemeral base64 cache (fallback when storage not configured)
const base64Cache: Record<string, string> = {};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      console.error("Upload: no file in request");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      console.error("Upload: invalid file type", file.type);
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Only JPEG, PNG, WebP, and GIF are allowed.` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length > 5 * 1024 * 1024) {
      console.error("Upload: file too large", buffer.length);
      return NextResponse.json({ error: "File too large. Maximum 5MB." }, { status: 400 });
    }

    // Try Supabase Storage first, fallback to base64
    const hasStorage = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (hasStorage) {
      try {
        const category = (formData.get("category") as string) || "media";
        const result = await storageUpload(file, category, buffer);
        console.info("Upload: stored in Supabase", { category, path: result.path });
        return NextResponse.json(
          { url: result.url, id: result.id, path: result.path, storage: "supabase" },
          { status: 201 }
        );
      } catch (storageError) {
        const msg = storageError instanceof Error ? storageError.message : "Unknown storage error";
        console.warn("Supabase upload failed, falling back to base64:", msg);
        // fallthrough to base64
      }
    } else {
      console.warn("Upload: Supabase Storage not configured, using base64");
    }

    // Base64 fallback
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;
    const id = `img-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    base64Cache[id] = dataUrl;
    return NextResponse.json({ url: dataUrl, id, storage: "base64" }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Upload error (outer):", error);
    return NextResponse.json({ error: `Upload failed: ${msg}` }, { status: 500 });
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
  // Admin-only image deletion (test mode allowed)
  const user = await getAdminOrTestUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Path required for deletion" }, { status: 400 });
  }

  try {
    await deleteImage(path);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = "https://pypteeknvrquehvmjqqp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5cHRlZWtudnJxdWVodm1qcXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NjUyODIsImV4cCI6MjA4NzU0MTI4Mn0.3_3JfqCVCPpQDRHS06LqJ7jtdIv3wYz6z-9fUST-xr0";

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
        { error: "Invalid file type" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Max 5MB" }, { status: 400 });
    }

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    // Upload to Supabase Storage via REST API
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${filename}`;
    
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": file.type,
      },
      body: buffer,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      console.error("Storage upload error:", err);
      // Fallback to base64
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;
      return NextResponse.json({ url: dataUrl, id: `fallback-${Date.now()}` }, { status: 201 });
    }

    // Return the public URL
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${filename}`;
    return NextResponse.json({ url: publicUrl, id: filename }, { status: 201 });
    
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("Upload called");
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      console.log("No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("File:", file.name, file.type, file.size);
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log("Buffer size:", buffer.length);
    // Max 2MB
    if (buffer.length > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum 2MB. Please compress the image." }, { status: 400 });
    }

    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;
    const id = `img-${Date.now()}`;

    console.log("Upload success, id:", id);
    return NextResponse.json({ url: dataUrl, id }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Upload failed: " + msg }, { status: 500 });
  }
}

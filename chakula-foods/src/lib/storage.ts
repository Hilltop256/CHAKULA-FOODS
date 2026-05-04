import { env } from "./env";

const BUCKET = env.SUPABASE_STORAGE_BUCKET;

interface UploadResult {
  url: string;
  path: string;
  id: string;
}

function generateUniqueFilename(originalName: string, prefix = ""): string {
  const ext = originalName.split(".").pop()?.toLowerCase() || "jpg";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}-${random}.${ext}`;
}

/**
 * Upload image to Supabase Storage
 * @param file - File object from input
 * @param buffer - Pre-read buffer (avoids double-reading file body)
 * @param category - Folder prefix (products, offers, packages, avatars)
 * @returns Public URL and storage path
 */
export async function uploadImage(file: File, category: string = "media", buffer?: Buffer): Promise<UploadResult> {
  if (!env.SUPABASE_SERVICE_ROLE_KEY || !env.SUPABASE_URL) {
    throw new Error("Storage not configured: Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!buffer) {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  }

  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error("File too large. Maximum 5MB.");
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.");
  }

  const filename = generateUniqueFilename(file.name, `${category}/`);
  const filePath = `${filename}`;

  const uploadResponse = await fetch(
    `${env.SUPABASE_URL}/storage/v1/object/${BUCKET}/${filePath}`,
    {
      method: "POST",
      headers: {
        "Content-Type": file.type,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "x-upsert": "true",
      },
      body: buffer as unknown as BodyInit,
    }
  );

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    console.error("Upload failed:", error);
    throw new Error(`Storage upload failed: ${uploadResponse.statusText}`);
  }

  const publicUrl = `${env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filePath}`;

  return {
    url: publicUrl,
    path: filePath,
    id: filePath,
  };
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(path: string): Promise<void> {
  if (!env.SUPABASE_SERVICE_ROLE_KEY || !env.SUPABASE_URL) {
    throw new Error("Storage not configured");
  }

  const response = await fetch(
    `${env.SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Delete failed:", error);
    throw new Error(`Storage delete failed: ${response.statusText}`);
  }
}

/**
 * Get signed URL for temporary access (if bucket is private)
 */
export async function getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
  if (!env.SUPABASE_SERVICE_ROLE_KEY || !env.SUPABASE_URL) {
    throw new Error("Storage not configured");
  }

  const response = await fetch(
    `${env.SUPABASE_URL}/storage/v1/object/sign/${BUCKET}/${path}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ expiresIn }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to generate signed URL");
  }

  const { signedURL } = await response.json();
  return signedURL;
}

/**
 * Bulk delete images
 */
export async function deleteImages(paths: string[]): Promise<void> {
  await Promise.all(
    paths.map((path) => deleteImage(path).catch((err) => console.error(`Failed to delete ${path}:`, err)))
  );
}

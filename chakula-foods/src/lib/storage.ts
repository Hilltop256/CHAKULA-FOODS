import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pypteeknvrquehvmjqqp.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5cHRlZWtudnJxdWVodm1qcXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NjUyODIsImV4cCI6MjA4NzU0MTI4Mn0.3_3JfqCVCPpQDRHS06LqJ7jtdIv3wYz6z-9fUST-xr0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

export async function uploadToStorage(
  bucket: string,
  file: File
): Promise<{ url: string; path: string; error: null } | { url: null; path: null; error: string }> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const path = `${bucket}/${fileName}`;

    const bytes = await file.arrayBuffer();
    const uint8Array = new Uint8Array(bytes);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, uint8Array, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      return { url: null, path: null, error: error.message };
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return { url: urlData.publicUrl, path: data?.path || path, error: null };
  } catch (err) {
    console.error("Upload error:", err);
    return { url: null, path: null, error: err instanceof Error ? err.message : "Upload failed" };
  }
}
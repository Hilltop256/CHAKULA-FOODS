const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pypteeknvrquehvmjqqp.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5cHRlZWtudnJxdWVodm1qcXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NjUyODIsImV4cCI6MjA4NzU0MTI4Mn0.3_3JfqCVCPpQDRHS06LqJ7jtdIv3wYz6z-9fUST-xr0";

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

export async function supabaseQuery<T>(
  table: string,
  params: Record<string, string> = {}
): Promise<T[]> {
  const query = new URLSearchParams(params).toString();
  const url = `${SUPABASE_URL}/rest/v1/${table}?${query}`;
  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Supabase REST error: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function supabaseCount(
  table: string,
  params: Record<string, string> = {}
): Promise<number> {
  const query = new URLSearchParams({ ...params, select: "id" }).toString();
  const url = `${SUPABASE_URL}/rest/v1/${table}?${query}`;
  const res = await fetch(url, {
    headers: { ...headers, Prefer: "count=exact" },
    cache: "no-store",
  });
  const contentRange = res.headers.get("content-range");
  if (contentRange) {
    const total = contentRange.split("/")[1];
    return parseInt(total) || 0;
  }
  return 0;
}

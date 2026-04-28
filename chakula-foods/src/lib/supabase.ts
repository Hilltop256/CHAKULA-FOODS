const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_ANON_KEY are required"
  );
}

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
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

export async function supabaseUpdate(
  table: string,
  id: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown>[]> {
  const url = `${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`;
  console.log("Supabase update URL:", url);
  console.log("Supabase update data:", data);
  const res = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
    cache: "no-store",
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Supabase update error: ${res.status} - ${errorText}`);
  }
  const result = await res.json();
  console.log("Supabase update response:", result);
  return result;
}

export async function supabaseInsert(
  table: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown>[]> {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Supabase insert error: ${res.status} ${await res.text()}`);
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

function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) are required");
  }
  return { url, key };
}

function getHeaders() {
  const { key } = getConfig();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
  };
}

export async function supabaseQuery<T>(
  table: string,
  params: Record<string, string> = {}
): Promise<T[]> {
  const { url } = getConfig();
  const query = new URLSearchParams(params).toString();
  const endpoint = `${url}/rest/v1/${table}?${query}`;
  const res = await fetch(endpoint, { headers: getHeaders(), cache: "no-store" });
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
  const { url } = getConfig();
  const endpoint = `${url}/rest/v1/${table}?id=eq.${id}`;
  const res = await fetch(endpoint, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Supabase update error: ${res.status} - ${errorText}`);
  }
  const result = await res.json();
  return result;
}

export async function supabaseInsert(
  table: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown>[]> {
  const { url } = getConfig();
  const endpoint = `${url}/rest/v1/${table}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: getHeaders(),
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
  const { url } = getConfig();
  const query = new URLSearchParams({ ...params, select: "id" }).toString();
  const endpoint = `${url}/rest/v1/${table}?${query}`;
  const res = await fetch(endpoint, {
    headers: { ...getHeaders(), Prefer: "count=exact" },
    cache: "no-store",
  });
  const contentRange = res.headers.get("content-range");
  if (contentRange) {
    const total = contentRange.split("/")[1];
    return parseInt(total) || 0;
  }
  return 0;
}

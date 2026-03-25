export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-UG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-UG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function generateOrderNumber(): string {
  const prefix = "CF";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function validateUgandaPhone(phone: string): boolean {
  const ugPhone = /^(\+256|0)(7[0-9]|3[1-9]|4[1-9])[0-9]{7}$/;
  return ugPhone.test(phone.replace(/\s/g, ""));
}

export function isMTNNumber(phone: string): boolean {
  const cleaned = phone.replace(/[\s+]/g, "");
  const normalized = cleaned.startsWith("256")
    ? cleaned.slice(3)
    : cleaned.startsWith("0")
    ? cleaned.slice(1)
    : cleaned;
  return /^(76|77|78|39|31)/.test(normalized);
}

export function isAirtelNumber(phone: string): boolean {
  const cleaned = phone.replace(/[\s+]/g, "");
  const normalized = cleaned.startsWith("256")
    ? cleaned.slice(3)
    : cleaned.startsWith("0")
    ? cleaned.slice(1)
    : cleaned;
  return /^(70|75|74|41|45)/.test(normalized);
}

export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s+\-()]/g, "");
  if (cleaned.startsWith("0")) {
    return "256" + cleaned.slice(1);
  }
  if (cleaned.startsWith("256")) {
    return cleaned;
  }
  return "256" + cleaned;
}

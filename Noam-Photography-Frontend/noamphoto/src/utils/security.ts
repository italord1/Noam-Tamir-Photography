export const MEDIA_CATEGORIES = [
  "fashion",
  "watersport",
  "portrait",
  "campign",
  "drone",
  "documentary",
  "video",
] as const;

export type MediaCategory = (typeof MEDIA_CATEGORIES)[number];

const ALLOWED_IMAGE_HOSTS = new Set([
  "lh5.googleusercontent.com",
  "lh3.googleusercontent.com",
  "drive.google.com",
  "res.cloudinary.com",
  "images.unsplash.com",
]);

const ALLOWED_IFRAME_HOSTS = new Set(["drive.google.com"]);

const DEFAULT_API_BASE = "https://noam-tamir-photography.onrender.com";

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_BASE
).replace(/\/$/, "");

export function isValidCategory(folder: string): folder is MediaCategory {
  return (MEDIA_CATEGORIES as readonly string[]).includes(folder);
}

export function sanitizeImageUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    if (!ALLOWED_IMAGE_HOSTS.has(parsed.hostname)) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

export function sanitizeIframeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    if (!ALLOWED_IFRAME_HOSTS.has(parsed.hostname)) return null;
    if (!parsed.pathname.includes("/file/d/")) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

export function buildDrivePreviewUrl(fileId: string): string | null {
  if (!/^[a-zA-Z0-9_-]{10,128}$/.test(fileId)) return null;
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function sanitizeContactField(value: string, maxLen: number): string | null {
  const cleaned = value.replace(/[\r\n\0]/g, "").trim();
  if (!cleaned || cleaned.length > maxLen) return null;
  return cleaned;
}

export interface ContactPayload {
  fname: string;
  lname: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export function validateContactPayload(
  raw: Record<string, string>
): { ok: true; data: ContactPayload } | { ok: false; error: string } {
  const fname = sanitizeContactField(raw.fname ?? "", 100);
  const lname = sanitizeContactField(raw.lname ?? "", 100);
  const email = sanitizeContactField(raw.email ?? "", 254);
  const phone = sanitizeContactField(raw.phone ?? "", 30);
  const subject = sanitizeContactField(raw.subject ?? "", 200);
  const message = sanitizeContactField(raw.message ?? "", 5000);

  if (!fname || !lname || !email || !phone || !subject || !message) {
    return { ok: false, error: "Please fill in all fields correctly." };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  return {
    ok: true,
    data: { fname, lname, email, phone, subject, message },
  };
}

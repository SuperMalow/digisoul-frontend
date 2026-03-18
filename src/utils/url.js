export const MEDIA_BASE_URL =
  import.meta.env.VITE_MEDIA_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000/";

export function joinUrl(base, path) {
  if (!path) return "";
  const normalizedBase = String(base || "").replace(/\/+$/, "");
  const normalizedPath = String(path).replace(/^\/+/, "");

  if (!normalizedBase) {
    return `/${normalizedPath}`;
  }

  return `${normalizedBase}/${normalizedPath}`;
}

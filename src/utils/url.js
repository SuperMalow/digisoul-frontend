export const MEDIA_BASE_URL =
  import.meta.env.VITE_MEDIA_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000/";

export function joinUrl(base, path) {
  if (!path) return "";
  const normalizedBase = String(base || "").replace(/\/+$/, "");
  let rawPath = String(path).trim();

  // 支持直接传入 data/blob URL
  if (/^(data|blob):/i.test(rawPath)) {
    return rawPath;
  }

  // 兼容错误格式：/http://xxx 或 /https://xxx
  rawPath = rawPath.replace(/^\/+(https?:\/\/)/i, "$1");

  // 如果后端返回了完整 URL，且路径是 /media 或 /static，统一改成同域相对路径
  if (/^https?:\/\//i.test(rawPath)) {
    try {
      const parsedUrl = new URL(rawPath);
      if (
        parsedUrl.pathname.startsWith("/media/") ||
        parsedUrl.pathname.startsWith("/static/")
      ) {
        rawPath = parsedUrl.pathname;
      } else {
        return rawPath;
      }
    } catch {
      return rawPath;
    }
  }

  const normalizedPath = rawPath.replace(/^\/+/, "");

  if (!normalizedBase) {
    return `/${normalizedPath}`;
  }

  return `${normalizedBase}/${normalizedPath}`;
}

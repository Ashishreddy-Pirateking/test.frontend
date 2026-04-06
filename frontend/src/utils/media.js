import logoImg from "../Legacy/logo.png";
import meImg from "../Legacy/Me .jpeg";
import bikashImg from "../Legacy/Bikash.jpeg";
import volliImg from "../Legacy/Volli.jpeg";
import monishImg from "../Legacy/Monish .jpeg";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/+$/, "");
const LOCALHOST_BACKEND_ORIGIN = "http://localhost:5000";
const LIVE_BACKEND_ORIGIN = "https://prasthanam-backend.onrender.com";

const LOCAL_MEDIA = {
  logo: logoImg,
  "logo.png": logoImg,
  me: meImg,
  "Me .jpeg": meImg,
  "Me.jpeg": meImg,
  bikash: bikashImg,
  "Bikash.jpeg": bikashImg,
  volli: volliImg,
  "Volli.jpeg": volliImg,
  monish: monishImg,
  "Monish .jpeg": monishImg,
  "Monish.jpeg": monishImg,
};

const normalizeMediaKey = (value) =>
  String(value || "")
    .trim()
    .replace(/\\/g, "/")
    .split("/")
    .pop()
    .replace(/\s+\./g, ".")
    .toLowerCase();

const LOCAL_MEDIA_NORMALIZED = Object.entries(LOCAL_MEDIA).reduce((acc, [key, media]) => {
  const normalizedKey = normalizeMediaKey(key);
  if (normalizedKey) acc[normalizedKey] = media;
  const withoutExtension = normalizedKey.replace(/\.[^.]+$/, "");
  if (withoutExtension) acc[withoutExtension] = media;
  return acc;
}, {});

export const normalizeImageUrl = (value) => {
  const ref = String(value || "").trim();
  if (!ref) return "";
  if (ref.startsWith(LOCALHOST_BACKEND_ORIGIN)) {
    return `${LIVE_BACKEND_ORIGIN}${ref.slice(LOCALHOST_BACKEND_ORIGIN.length)}`;
  }
  if (ref.startsWith("http://")) {
    return `https://${ref.slice("http://".length)}`;
  }
  return ref;
};

export const toBackgroundImage = (value) => {
  const resolved = resolveMediaUrl(value);
  return resolved ? `url("${resolved}")` : "none";
};

export const resolveMediaUrl = (value) => {
  if (typeof value !== "string") return "";

  const ref = value.trim();
  if (!ref) return "";
  let decodedRef = ref;
  try {
    decodedRef = decodeURIComponent(ref);
  } catch {
    decodedRef = ref;
  }
  if (ref === "[object Object]" || decodedRef === "[object Object]") return "";

  const normalizedRef = normalizeMediaKey(ref);
  const normalizedDecodedRef = normalizeMediaKey(decodedRef);
  const normalizedRefBase = normalizedRef.replace(/\.[^.]+$/, "");
  const normalizedDecodedRefBase = normalizedDecodedRef.replace(/\.[^.]+$/, "");
  const localMedia =
    LOCAL_MEDIA[ref] ||
    LOCAL_MEDIA[decodedRef] ||
    LOCAL_MEDIA_NORMALIZED[normalizedRef] ||
    LOCAL_MEDIA_NORMALIZED[normalizedDecodedRef] ||
    LOCAL_MEDIA_NORMALIZED[normalizedRefBase] ||
    LOCAL_MEDIA_NORMALIZED[normalizedDecodedRefBase];
  if (localMedia) return localMedia;

  if (ref.startsWith("http://") || ref.startsWith("https://")) {
    return normalizeImageUrl(ref);
  }
  if (decodedRef.startsWith("http://") || decodedRef.startsWith("https://")) {
    return normalizeImageUrl(decodedRef);
  }

  if (decodedRef.startsWith("uploads/")) return normalizeImageUrl(`${API_BASE}/${decodedRef}`);
  if (decodedRef.startsWith("/uploads/")) return normalizeImageUrl(`${API_BASE}${decodedRef}`);
  if (/^[^/]+\.(png|jpe?g|webp|gif|svg|mp4|m4a)$/i.test(decodedRef)) {
    return normalizeImageUrl(`${API_BASE}/uploads/${decodedRef}`);
  }

  return "";
};

export const getApiBase = () => API_BASE;


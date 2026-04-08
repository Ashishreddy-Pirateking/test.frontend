import { useEffect, useState } from "react";
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

const CLOUDINARY_TRANSFORM = "f_auto,q_auto,w_800";

export const optimizeImageUrl = (value) => {
  const ref = String(value || "").trim();
  if (!ref) return "";
  if (!/^https?:\/\//i.test(ref)) return ref;

  try {
    const url = new URL(ref);
    if (!url.hostname.toLowerCase().includes("cloudinary.com")) return ref;

    const uploadMarker = "/upload/";
    const uploadIndex = url.pathname.indexOf(uploadMarker);
    if (uploadIndex === -1) return ref;

    const beforeUpload = url.pathname.slice(0, uploadIndex + uploadMarker.length);
    const afterUpload = url.pathname.slice(uploadIndex + uploadMarker.length);
    if (afterUpload.startsWith(`${CLOUDINARY_TRANSFORM}/`)) return ref;

    url.pathname = `${beforeUpload}${CLOUDINARY_TRANSFORM}/${afterUpload}`;
    return url.toString();
  } catch {
    return ref;
  }
};

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

  if (localMedia) return optimizeImageUrl(localMedia);

  if (ref.startsWith("http://") || ref.startsWith("https://")) {
    return optimizeImageUrl(normalizeImageUrl(ref));
  }

  if (decodedRef.startsWith("http://") || decodedRef.startsWith("https://")) {
    return optimizeImageUrl(normalizeImageUrl(decodedRef));
  }

  if (decodedRef.startsWith("uploads/")) {
    return optimizeImageUrl(normalizeImageUrl(`${API_BASE}/${decodedRef}`));
  }

  if (decodedRef.startsWith("/uploads/")) {
    return optimizeImageUrl(normalizeImageUrl(`${API_BASE}${decodedRef}`));
  }

  if (/^[^/]+\.(png|jpe?g|webp|gif|svg|mp4|m4a)$/i.test(decodedRef)) {
    return optimizeImageUrl(normalizeImageUrl(`${API_BASE}/uploads/${decodedRef}`));
  }

  return "";
};

export const getApiBase = () => API_BASE;

export const BP = { sm: 480, md: 768, lg: 1024, xl: 1280 };

export const mq = (bp) => `@media (max-width: ${BP[bp]}px)`;

export function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth <= BP.md);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(`(max-width: ${BP.md}px)`);
    const handleChange = (event) => setMobile(event.matches);

    mediaQueryList.addEventListener("change", handleChange);

    return () => mediaQueryList.removeEventListener("change", handleChange);
  }, []);

  return mobile;
}

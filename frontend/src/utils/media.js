import logoImg from "../Legacy/logo.png";
import meImg from "../Legacy/Me .jpeg";
import bikashImg from "../Legacy/Bikash.jpeg";
import volliImg from "../Legacy/Volli.jpeg";
import monishImg from "../Legacy/Monish .jpeg";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/+$/, "");

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

export const resolveMediaUrl = (value) => {
  const ref = String(value || "").trim();
  if (!ref) return "";
  if (ref.startsWith("http://") || ref.startsWith("https://")) return ref;
  if (ref.startsWith("/uploads/")) return `${API_BASE}${ref}`;
  return LOCAL_MEDIA[ref] || LOCAL_MEDIA[decodeURIComponent(ref)] || ref;
};

export const getApiBase = () => API_BASE;


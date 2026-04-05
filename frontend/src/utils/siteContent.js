import { createDefaultSiteContent } from "../data/defaultSiteContent.js";

export const SITE_CONTENT_CACHE_KEY = "prasthanam_public_site_content";
export const SITE_CONTENT_SNAPSHOT_ENDPOINT = "/api/site-content-snapshot";
export const SITE_CONTENT_SNAPSHOT_PATHNAME = "site-content/public.json";

export const mergeSiteContent = (incoming) => {
  const fallback = createDefaultSiteContent();
  if (!incoming || typeof incoming !== "object") return fallback;
  return {
    ...fallback,
    ...incoming,
    gallery: {
      ...fallback.gallery,
      ...(incoming.gallery || {}),
      images: Array.isArray(incoming.gallery?.images)
        ? incoming.gallery.images
        : fallback.gallery.images,
    },
    timeline:
      Array.isArray(incoming.timeline) && incoming.timeline.length
        ? incoming.timeline
        : fallback.timeline,
    navarasas:
      Array.isArray(incoming.navarasas) && incoming.navarasas.length
        ? incoming.navarasas
        : fallback.navarasas,
    castBatches:
      Array.isArray(incoming.castBatches) && incoming.castBatches.length
        ? incoming.castBatches
        : fallback.castBatches,
    governors:
      Array.isArray(incoming.governors) && incoming.governors.length
        ? incoming.governors
        : fallback.governors,
    latestEvent: {
      ...fallback.latestEvent,
      ...(incoming.latestEvent || {}),
    },
  };
};

export const normalizeSiteContentDocument = (incoming) => {
  if (!incoming || typeof incoming !== "object") return null;
  if (incoming.siteContent && typeof incoming.siteContent === "object") {
    return {
      ...incoming,
      siteContent: mergeSiteContent(incoming.siteContent),
    };
  }
  return {
    siteContent: mergeSiteContent(incoming),
    source: "raw",
    savedAt: "",
  };
};

export const readCachedSiteContent = () => {
  if (typeof window === "undefined") return createDefaultSiteContent();
  try {
    const raw = localStorage.getItem(SITE_CONTENT_CACHE_KEY);
    if (!raw) return createDefaultSiteContent();
    return mergeSiteContent(JSON.parse(raw));
  } catch {
    return createDefaultSiteContent();
  }
};

export const writeCachedSiteContent = (content) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      SITE_CONTENT_CACHE_KEY,
      JSON.stringify(mergeSiteContent(content))
    );
  } catch {
    // Ignore storage failures and keep runtime state alive.
  }
};

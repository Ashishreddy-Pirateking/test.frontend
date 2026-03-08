/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createDefaultSiteContent } from "../data/defaultSiteContent";
import { fetchPublicSiteContent } from "../services/service";

const SiteContentContext = createContext({
  siteContent: createDefaultSiteContent(),
  loading: false,
  error: "",
  refresh: async () => {},
});

const AUTO_REFRESH_MS = 15000;

const mergeSiteContent = (incoming) => {
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
    timeline: Array.isArray(incoming.timeline) && incoming.timeline.length
      ? incoming.timeline
      : fallback.timeline,
    navarasas: Array.isArray(incoming.navarasas) && incoming.navarasas.length
      ? incoming.navarasas
      : fallback.navarasas,
    castBatches: Array.isArray(incoming.castBatches) && incoming.castBatches.length
      ? incoming.castBatches
      : fallback.castBatches,
    governors: Array.isArray(incoming.governors) && incoming.governors.length
      ? incoming.governors
      : fallback.governors,
    latestEvent: {
      ...fallback.latestEvent,
      ...(incoming.latestEvent || {}),
    },
  };
};

export function SiteContentProvider({ children }) {
  const [siteContent, setSiteContent] = useState(createDefaultSiteContent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPublicContent = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    if (!silent) setError("");
    try {
      const data = await fetchPublicSiteContent();
      setSiteContent(mergeSiteContent(data));
    } catch (err) {
      setError(err?.message || "Failed to load content.");
      setSiteContent(createDefaultSiteContent());
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicContent();

    const intervalId = window.setInterval(() => {
      fetchPublicContent({ silent: true });
    }, AUTO_REFRESH_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchPublicContent({ silent: true });
      }
    };

    const onFocus = () => {
      fetchPublicContent({ silent: true });
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchPublicContent]);

  const value = useMemo(
    () => ({
      siteContent,
      loading,
      error,
      refresh: fetchPublicContent,
    }),
    [siteContent, loading, error, fetchPublicContent]
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export const useSiteContent = () => useContext(SiteContentContext);

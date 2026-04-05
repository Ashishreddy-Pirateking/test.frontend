/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createDefaultSiteContent } from "../data/defaultSiteContent";
import { fetchPublicSiteContent } from "../services/service";
import {
  mergeSiteContent,
  readCachedSiteContent,
  writeCachedSiteContent,
} from "../utils/siteContent";

const SiteContentContext = createContext({
  siteContent: createDefaultSiteContent(),
  loading: false,
  error: "",
  refresh: async () => {},
});

const AUTO_REFRESH_MS = 15000;

export function SiteContentProvider({ children }) {
  const [siteContent, setSiteContent] = useState(readCachedSiteContent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPublicContent = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    if (!silent) setError("");
    try {
      const data = await fetchPublicSiteContent();
      const mergedContent = mergeSiteContent(data);
      setSiteContent(mergedContent);
      writeCachedSiteContent(mergedContent);
    } catch (err) {
      setError(err?.message || "Failed to load content.");
      setSiteContent((prev) => prev || readCachedSiteContent());
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

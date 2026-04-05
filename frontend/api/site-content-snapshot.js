import { get, put } from "@vercel/blob";
import { createDefaultSiteContent } from "../src/data/defaultSiteContent.js";
import {
  mergeSiteContent,
  normalizeSiteContentDocument,
  SITE_CONTENT_SNAPSHOT_PATHNAME,
} from "../src/utils/siteContent.js";

const runtimeEnv = globalThis.process?.env || {};

const BACKEND_BASE_URL = String(
  runtimeEnv.SITE_CONTENT_BACKEND_URL || runtimeEnv.VITE_API_BASE_URL || ""
).replace(/\/+$/, "");

const HAS_BLOB_STORAGE = Boolean(runtimeEnv.BLOB_READ_WRITE_TOKEN);
const BLOB_MEDIA_PREFIX = "site-content/media";

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

const parseFetchResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return response.json();
  const text = await response.text();
  return { message: text || "Unexpected server response." };
};

const cloneContent = (value) => JSON.parse(JSON.stringify(value));

const sanitizePathSegment = (value, fallback = "asset") =>
  String(value || fallback)
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || fallback;

const buildSnapshotDocument = (siteContent, source, extra = {}) => ({
  siteContent: mergeSiteContent(siteContent),
  savedAt: extra.savedAt || new Date().toISOString(),
  source,
  backendBaseUrl: BACKEND_BASE_URL || null,
});

const isBackendMediaReference = (value) => {
  const ref = String(value || "").trim();
  if (!ref) return false;
  if (ref.startsWith("uploads/") || ref.startsWith("/uploads/")) return true;
  if (/^[^/]+\.(png|jpe?g|webp|gif|svg|mp4|m4a)$/i.test(ref)) return true;

  if (ref.startsWith("http://") || ref.startsWith("https://")) {
    if (!BACKEND_BASE_URL) return false;
    try {
      const refUrl = new URL(ref);
      const backendUrl = new URL(BACKEND_BASE_URL);
      if (refUrl.origin !== backendUrl.origin) return false;
      return refUrl.pathname.startsWith("/uploads/");
    } catch {
      return false;
    }
  }

  return false;
};

const toBackendMediaUrl = (value) => {
  const ref = String(value || "").trim();
  if (!ref) return "";
  if (ref.startsWith("http://") || ref.startsWith("https://")) return ref;
  if (!BACKEND_BASE_URL) return "";
  if (ref.startsWith("uploads/")) return `${BACKEND_BASE_URL}/${ref}`;
  if (ref.startsWith("/uploads/")) return `${BACKEND_BASE_URL}${ref}`;
  if (/^[^/]+\.(png|jpe?g|webp|gif|svg|mp4|m4a)$/i.test(ref)) {
    return `${BACKEND_BASE_URL}/uploads/${ref}`;
  }
  return "";
};

const mirrorMediaReference = async (value, folder) => {
  if (!HAS_BLOB_STORAGE || !isBackendMediaReference(value)) return value;

  const sourceUrl = toBackendMediaUrl(value);
  if (!sourceUrl) return value;

  const mediaResponse = await fetch(sourceUrl, { cache: "no-store" });
  if (!mediaResponse.ok) return value;

  const buffer = await mediaResponse.arrayBuffer();
  const sourceName = String(value || "").split(/[\\/]/).pop();
  const sourceUrlParts = new URL(sourceUrl);
  const sourcePathName = sourceUrlParts.pathname.split("/").pop() || sourceName;
  const finalName = sanitizePathSegment(sourcePathName, "asset");
  const pathname = `${BLOB_MEDIA_PREFIX}/${sanitizePathSegment(folder, "misc")}/${finalName}`;

  const blob = await put(pathname, buffer, {
    access: "public",
    allowOverwrite: true,
    contentType: mediaResponse.headers.get("content-type") || undefined,
    cacheControlMaxAge: 3600,
  });

  return blob.url;
};

const mirrorSiteMedia = async (siteContent) => {
  if (!HAS_BLOB_STORAGE) return mergeSiteContent(siteContent);

  const next = cloneContent(mergeSiteContent(siteContent));

  next.gallery.images = await Promise.all(
    (next.gallery?.images || []).map((image, index) =>
      mirrorMediaReference(image, `gallery-${index + 1}`)
    )
  );

  next.latestEvent = {
    ...(next.latestEvent || {}),
    poster: await mirrorMediaReference(next.latestEvent?.poster, "latest-event"),
  };

  next.castBatches = await Promise.all(
    (next.castBatches || []).map(async (batch) => ({
      ...batch,
      photos: await Promise.all(
        (batch.photos || []).map((photo, index) =>
          mirrorMediaReference(photo, `cast-${sanitizePathSegment(batch.id, "batch")}-${index + 1}`)
        )
      ),
    }))
  );

  next.governors = await Promise.all(
    (next.governors || []).map(async (governor, index) => ({
      ...governor,
      img: await mirrorMediaReference(
        governor.img,
        `governor-${sanitizePathSegment(governor.name || `member-${index + 1}`)}`
      ),
    }))
  );

  return next;
};

const readStoredSnapshot = async () => {
  if (!HAS_BLOB_STORAGE) return null;
  try {
    const result = await get(SITE_CONTENT_SNAPSHOT_PATHNAME, { access: "public" });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const raw = await new Response(result.stream).text();
    return normalizeSiteContentDocument(JSON.parse(raw));
  } catch {
    return null;
  }
};

const writeStoredSnapshot = async (snapshotDocument) => {
  if (!HAS_BLOB_STORAGE) return snapshotDocument;
  await put(
    SITE_CONTENT_SNAPSHOT_PATHNAME,
    JSON.stringify(snapshotDocument, null, 2),
    {
      access: "public",
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    }
  );
  return snapshotDocument;
};

const fetchBackendPublicContent = async () => {
  if (!BACKEND_BASE_URL) {
    throw new Error("SITE_CONTENT_BACKEND_URL or VITE_API_BASE_URL is not configured.");
  }

  const response = await fetch(`${BACKEND_BASE_URL}/api/content/public`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const data = await parseFetchResponse(response);
  if (!response.ok) {
    throw new Error(data?.message || `Backend content request failed with status ${response.status}.`);
  }

  return mergeSiteContent(data);
};

const refreshSnapshotFromBackend = async () => {
  const backendContent = await fetchBackendPublicContent();
  const mirroredContent = await mirrorSiteMedia(backendContent);
  const snapshotDocument = buildSnapshotDocument(mirroredContent, "backend-refresh");
  await writeStoredSnapshot(snapshotDocument);
  return snapshotDocument;
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const shouldRefresh = searchParams.get("refresh") === "1";

  if (!shouldRefresh) {
    const cachedSnapshot = await readStoredSnapshot();
    if (cachedSnapshot) {
      return jsonResponse({
        ...cachedSnapshot,
        fromCache: true,
        stale: false,
      });
    }
  }

  try {
    const freshSnapshot = await refreshSnapshotFromBackend();
    return jsonResponse({
      ...freshSnapshot,
      fromCache: false,
      stale: false,
      persisted: HAS_BLOB_STORAGE,
    });
  } catch (error) {
    const cachedSnapshot = await readStoredSnapshot();
    if (cachedSnapshot) {
      return jsonResponse({
        ...cachedSnapshot,
        fromCache: true,
        stale: true,
        persisted: HAS_BLOB_STORAGE,
        message:
          error?.message || "Backend unavailable. Serving the last saved live snapshot instead.",
      });
    }

    return jsonResponse(
      {
        siteContent: createDefaultSiteContent(),
        fromCache: false,
        stale: true,
        persisted: false,
        requiresBlob: !HAS_BLOB_STORAGE,
        message:
          error?.message ||
          "No saved live snapshot is available yet. Connect the backend once or configure Blob storage.",
      },
      503
    );
  }
}

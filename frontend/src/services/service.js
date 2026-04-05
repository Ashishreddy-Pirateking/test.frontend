import { getApiBase } from "../utils/media";
import { SITE_CONTENT_SNAPSHOT_ENDPOINT } from "../utils/siteContent";

const API_BASE = getApiBase();

const parseApiResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return response.json();
  const text = await response.text();
  return { message: text || "Unexpected server response." };
};

const createApiError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const snapshotRequest = async (query = "") => {
  let response;
  try {
    response = await fetch(`${SITE_CONTENT_SNAPSHOT_ENDPOINT}${query}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });
  } catch {
    throw createApiError("Cannot reach the live content snapshot endpoint.", 0);
  }

  const data = await parseApiResponse(response);
  if (!response.ok) {
    throw createApiError(data?.message || "Snapshot request failed.", response.status);
  }
  if (!data || typeof data !== "object" || !data.siteContent) {
    throw createApiError("Snapshot endpoint returned an invalid response.", response.status || 500);
  }
  return data;
};

const apiRequest = async (path, options = {}) => {
  const { token, headers, ...rest } = options;
  const method = String(rest.method || "GET").toUpperCase();
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...rest,
      ...(method === "GET" ? { cache: "no-store" } : {}),
      headers: {
        ...(headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw createApiError(
      `Cannot reach backend at ${API_BASE}. Ensure backend server is running.`,
      0
    );
  }
  const data = await parseApiResponse(response);
  if (!response.ok) {
    throw createApiError(data?.message || "Request failed.", response.status);
  }
  return data;
};

export const loginAdmin = (username, password) =>
  apiRequest("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

export const submitTicketBooking = (payload) =>
  apiRequest("/api/tickets/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const fetchPublicSiteContent = async () => {
  try {
    const data = await snapshotRequest("");
    return data?.siteContent || data;
  } catch {
    return apiRequest("/api/content/public");
  }
};

export const refreshPublicSiteSnapshot = () => snapshotRequest("?refresh=1");

export const fetchAdminSiteContent = (token) =>
  apiRequest("/api/content/admin", {
    token,
  });

export const updateAdminSiteContent = (token, payload) =>
  apiRequest("/api/content/admin", {
    method: "PUT",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const uploadAdminImage = (token, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest("/api/content/admin/upload", {
    method: "POST",
    token,
    body: formData,
  });
};

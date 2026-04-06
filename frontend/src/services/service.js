import { getApiBase } from "../utils/media";

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
  let response;
  try {
    response = await fetch(`${API_BASE}/api/content/public`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
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

export const refreshPublicSiteSnapshot = () => fetchPublicSiteContent();

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

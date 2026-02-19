/**
 * API client for FastAPI backend at http://127.0.0.1:8000
 * All requests include Authorization JWT header and X-Business-Id header.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const TOKEN_KEY = "finance_token";
export const BUSINESS_KEY = "finance_business_id";
export const USER_KEY = "finance_user";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getBusinessId(): string | null {
  return localStorage.getItem(BUSINESS_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function setBusinessId(id: string | number) {
  localStorage.setItem(BUSINESS_KEY, String(id));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(BUSINESS_KEY);
  localStorage.removeItem(USER_KEY);
}

function buildHeaders(extra: Record<string, string> = {}): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extra,
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const biz = getBusinessId();
  if (biz) headers["X-Business-Id"] = biz;
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMsg = `Error ${res.status}`;
    try {
      const data = await res.json();
      errMsg = data?.detail || data?.message || errMsg;
    } catch {}
    throw new Error(errMsg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) =>
    fetch(`${API_BASE}${path}`, { headers: buildHeaders() }).then((r) => handleResponse<T>(r)),

  post: <T>(path: string, body: unknown) =>
    fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(body),
    }).then((r) => handleResponse<T>(r)),

  put: <T>(path: string, body: unknown) =>
    fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers: buildHeaders(),
      body: JSON.stringify(body),
    }).then((r) => handleResponse<T>(r)),

  patch: <T>(path: string, body: unknown) =>
    fetch(`${API_BASE}${path}`, {
      method: "PATCH",
      headers: buildHeaders(),
      body: JSON.stringify(body),
    }).then((r) => handleResponse<T>(r)),

  delete: <T>(path: string) =>
    fetch(`${API_BASE}${path}`, { method: "DELETE", headers: buildHeaders() }).then((r) =>
      handleResponse<T>(r),
    ),
};

// WebSocket factory for finance real-time channel
export function createFinanceWS(businessId: string | number, token: string): WebSocket {
  const wsBase = API_BASE.replace(/^http/, "ws");
  return new WebSocket(`${wsBase}/ws/finance/${businessId}?token=${token}`);
}

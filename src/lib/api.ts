"use client";

import { API_URL, authClient } from "@/lib/auth-client";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type TokenCache = { token: string; expiresAt: number };
let tokenCache: TokenCache | null = null;

export function clearApiToken() {
  tokenCache = null;
}

function decodeExpiry(token: string) {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")));
    return typeof json.exp === "number" ? json.exp * 1000 : Date.now() + 5 * 60_000;
  } catch {
    return Date.now() + 5 * 60_000;
  }
}

async function getToken(force = false) {
  if (!force && tokenCache && tokenCache.expiresAt - 30_000 > Date.now()) {
    return tokenCache.token;
  }

  const { data, error } = await authClient.token();
  if (error || !data?.token) {
    tokenCache = null;
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }

  tokenCache = { token: data.token, expiresAt: decodeExpiry(data.token) };
  return data.token;
}

async function request<T>(path: string, options: RequestInit, token: string | null) {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 204) return undefined as T;

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.message || `Request failed with status ${response.status}`,
      body?.details,
    );
  }
  return body as T;
}

/** Authenticated API call. Automatically attaches a fresh Better Auth JWT. */
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  let token: string;
  try {
    token = await getToken();
  } catch (error) {
    throw error;
  }

  try {
    return await request<T>(path, options, token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      tokenCache = null;
      const fresh = await getToken(true);
      return request<T>(path, options, fresh);
    }
    throw error;
  }
}

/** Public API call that never requires a session. */
export async function apiPublic<T>(path: string, options: RequestInit = {}): Promise<T> {
  return request<T>(path, options, null);
}

/** Upload a file to the API (ImgBB in production, local disk fallback in dev). */
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("image", file);
  const response = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    body: form,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.url) {
    throw new ApiError(response.status, body?.message || "Image upload failed");
  }
  return body.url as string;
}

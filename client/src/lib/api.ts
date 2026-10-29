const API_ROOT = import.meta.env.VITE_API_URL ?? "/api/v1";

function readToken(): string | null {
  return localStorage.getItem("bc_token") ?? sessionStorage.getItem("bc_token");
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const token = readToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_ROOT}${path}`, { ...options, headers });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (payload as { error?: string }).error ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return payload as T;
}

export function persistToken(token: string, remember: boolean) {
  localStorage.removeItem("bc_token");
  sessionStorage.removeItem("bc_token");
  (remember ? localStorage : sessionStorage).setItem("bc_token", token);
}

export function clearToken() {
  localStorage.removeItem("bc_token");
  sessionStorage.removeItem("bc_token");
}

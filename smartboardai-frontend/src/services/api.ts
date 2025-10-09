const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export const api = {
  // Auth examples (adjust paths to your Spring controllers)
  login: (payload: { email: string; password: string }) =>
    request<{ token: string }>(`/auth/login`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  signup: (payload: { name: string; email: string; password: string }) =>
    request<{ id: string }>(`/auth/signup`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // AI ticket generation example
  generateTickets: (payload: { prompt: string }) =>
    request<{ tickets: Array<{ title: string; description?: string }> }>(
      `/ai/generate-tickets`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),
};

export type { };

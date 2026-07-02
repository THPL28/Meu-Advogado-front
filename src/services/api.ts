const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').trim().replace(/\/+$/, '');

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  rawResponse = false
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: options.credentials || 'include',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}`);
  }

  if (rawResponse) {
    return response.text() as unknown as T;
  }

  return response.json() as Promise<T>;
}

export async function apiGet<T = unknown>(
  endpoint: string
): Promise<T> {
  return apiRequest<T>(endpoint, { credentials: 'include' });
}

export async function apiPost<T = unknown>(
  endpoint: string,
  body: unknown
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
    credentials: 'include',
  });
}

export async function apiPut<T = unknown>(
  endpoint: string,
  body: unknown
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
    credentials: 'include',
  });
}

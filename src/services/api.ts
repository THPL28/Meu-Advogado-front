const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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

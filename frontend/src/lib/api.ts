const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH";
  token?: string;
  body?: unknown;
}

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const requestInit: RequestInit = {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    }
  };

  if (options.body !== undefined) {
    requestInit.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_URL}${path}`, requestInit);

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = typeof data?.message === "string" ? data.message : "Request failed";
    throw new Error(message);
  }

  return data as T;
};

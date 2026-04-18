const envApiBase = import.meta.env.VITE_API_URL as string | undefined;

const normalizeApiBase = (value: string): string => {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return "http://localhost:4000/api";
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.replace(/\/+$/, "");
  }

  if (/^[a-zA-Z0-9.-]+$/.test(trimmed)) {
    return `https://${trimmed.replace(/\/+$/, "")}/api`;
  }

  return trimmed.replace(/\/+$/, "");
};

const guessRenderApiBase = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const host = window.location.hostname;
  if (!host.endsWith(".onrender.com")) {
    return null;
  }

  const guessedHost = host.replace("-web", "-api").replace("frontend", "api");
  if (guessedHost === host) {
    return null;
  }

  return `https://${guessedHost}/api`;
};

const API_URL = (() => {
  const guessed = guessRenderApiBase();

  if (envApiBase && envApiBase.trim().length > 0) {
    const normalizedEnv = normalizeApiBase(envApiBase);

    if (
      typeof window !== "undefined" &&
      window.location.hostname.endsWith(".onrender.com") &&
      normalizedEnv.includes("medisync-api.onrender.com") &&
      guessed
    ) {
      return guessed;
    }

    return normalizedEnv;
  }

  if (guessed) {
    return guessed;
  }

  return "http://localhost:4000/api";
})();

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

  const send = async (base: string) => fetch(`${base}${path}`, requestInit);

  let activeBase = API_URL;
  let response = await send(activeBase);

  if (response.status === 404) {
    const alternateBase = activeBase.endsWith("/api") ? activeBase.slice(0, -4) : `${activeBase}/api`;
    if (alternateBase !== activeBase) {
      const alternate = await send(alternateBase);
      if (alternate.ok) {
        activeBase = alternateBase;
        response = alternate;
      }
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : `Request failed (${response.status}) at ${activeBase}${path}`;
    throw new Error(message);
  }

  return data as T;
};

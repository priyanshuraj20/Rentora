let isRefreshing = false;
let failedQueue = [];
let cachedCsrfToken = null;

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Fetch a CSRF token with caching to eliminate manual fetching across components
 */
export const getCsrfToken = async (forceRefresh = false) => {
  if (cachedCsrfToken && !forceRefresh) return cachedCsrfToken;
  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    if (data.csrfToken) {
      cachedCsrfToken = data.csrfToken;
      return cachedCsrfToken;
    }
  } catch (err) {
    console.warn("Could not fetch CSRF token:", err);
  }
  return null;
};

/**
 * Centralized API fetch client with:
 * 1. Automatic JSON stringification / parsing support
 * 2. Automatic CSRF token injection for state-modifying requests (POST, PUT, PATCH, DELETE)
 * 3. Automatic 401 silent token refresh and single retry
 */
export const apiClient = async (url, options = {}, isRetry = false) => {
  const method = (options.method || "GET").toUpperCase();
  const defaultHeaders = {};

  if (options.body && !(options.body instanceof FormData) && typeof options.body === "string") {
    defaultHeaders["Content-Type"] = "application/json";
  }

  // Auto-attach CSRF token for mutations if not explicitly set
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    if (!options.headers?.["X-CSRF-Token"]) {
      const csrf = await getCsrfToken();
      if (csrf) {
        defaultHeaders["X-CSRF-Token"] = csrf;
      }
    }
  }

  const config = {
    ...options,
    credentials: "include",
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // If CSRF token expired or invalid (403), re-fetch CSRF and retry once
    if (response.status === 403 && !isRetry && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      const newCsrf = await getCsrfToken(true);
      if (newCsrf) {
        config.headers["X-CSRF-Token"] = newCsrf;
        return apiClient(url, config, true);
      }
    }

    // If 401 Unauthorized and not already retried, attempt silent refresh
    // Exclude login, register, refresh, and initial guest session check (/auth/me)
    if (
      response.status === 401 &&
      !isRetry &&
      !url.includes("/auth/login") &&
      !url.includes("/auth/register") &&
      !url.includes("/auth/refresh") &&
      !url.includes("/auth/me")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(url, options, true));
      }

      isRefreshing = true;

      try {
        const refreshRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/auth/refresh`,
          {
            method: "POST",
            credentials: "include",
          },
        );

        const refreshData = await refreshRes.json();

        if (refreshRes.ok && refreshData.success) {
          processQueue(null);
          isRefreshing = false;
          // Retry original request once
          return apiClient(url, options, true);
        } else {
          processQueue(new Error("Session expired"));
          isRefreshing = false;
          return response;
        }
      } catch (refreshErr) {
        processQueue(refreshErr);
        isRefreshing = false;
        return response;
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
};

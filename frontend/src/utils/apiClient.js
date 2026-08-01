let isRefreshing = false;
let failedQueue = [];

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
 * Centralized API fetch client with automatic 401 silent token refresh and single retry.
 */
export const apiClient = async (url, options = {}, isRetry = false) => {
  const defaultHeaders = {};

  if (options.body && !(options.body instanceof FormData) && typeof options.body === "string") {
    defaultHeaders["Content-Type"] = "application/json";
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

    // If 401 Unauthorized and not already retried, attempt silent refresh
    if (
      response.status === 401 &&
      !isRetry &&
      !url.includes("/auth/login") &&
      !url.includes("/auth/register") &&
      !url.includes("/auth/refresh")
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

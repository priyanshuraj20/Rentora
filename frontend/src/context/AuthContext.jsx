import { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    try {
      const response = await apiClient(`${import.meta.env.VITE_BACKEND_URL}/auth/me`, {
        method: "GET",
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error("Unable to fetch the user");
      }
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const csrfRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
        method: "GET",
        credentials: "include",
      });
      const csrfData = await csrfRes.json();

      const response = await apiClient(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: {
          "X-CSRF-Token": csrfData.csrfToken,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchUser();
        return { success: true, data };
      } else {
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (err) {
      return { success: false, message: err.message || "Network error" };
    }
  };

  const logout = async () => {
    try {
      const csrfRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
        method: "GET",
        credentials: "include",
      });
      const csrfData = await csrfRes.json();

      await apiClient(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "X-CSRF-Token": csrfData.csrfToken,
        },
      });
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, logout, reFetch: fetchUser, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

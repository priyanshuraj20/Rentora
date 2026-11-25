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
      const response = await apiClient(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
        method: "POST",
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
      await apiClient(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser(null);
    }
  };

  const demoLogin = async (persona) => {
    try {
      const response = await apiClient(`${import.meta.env.VITE_BACKEND_URL}/auth/demo-login`, {
        method: "POST",
        body: JSON.stringify({ persona }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchUser();
        return { success: true, data };
      } else {
        return { success: false, message: data.message || "Demo login failed" };
      }
    } catch (err) {
      return { success: false, message: err.message || "Network error" };
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, logout, demoLogin, reFetch: fetchUser, setUser }}
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

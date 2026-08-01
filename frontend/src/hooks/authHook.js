import { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";

const useAuth = () => {
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
        } catch (error) {
            setError(error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return { user, loading, error, reFetch: fetchUser };
};

export default useAuth;
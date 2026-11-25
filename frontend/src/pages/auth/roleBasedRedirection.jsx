import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/authHook";

export default function RoleRedirect() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            navigate("/", { replace: true });
            return;
        }

        const roleValue = user.role ?? user.roles ?? [];
        const roles = Array.isArray(roleValue) ? roleValue : [roleValue];

        // Admin always goes directly to the governance portal
        if (roles.includes("admin")) {
            navigate("/admin", { replace: true });
            return;
        }

        // If profile is incomplete for consumer accounts, redirect to complete profile
        if (!user.phone) {
            navigate("/?auth=success&mode=completeProfile", { replace: true });
            return;
        }

        if (roles.includes("owner")) {
            navigate("/owner", { replace: true });
            return;
        }

        navigate("/renter", { replace: true });
    }, [loading, user, navigate]);


    return (
        <div className="flex items-center justify-center h-screen bg-background text-text-primary">
            <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <span className="text-sm font-semibold">Redirecting to your workspace...</span>
            </div>
        </div>
    );
}

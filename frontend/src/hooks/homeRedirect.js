import { useEffect } from "react";
import useAuth from "./authHook";
import { useNavigate, useSearchParams } from "react-router-dom";

const homeRedirect=()=>{
    const {user,loading}=useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // Don't redirect if we are in the middle of an auth action/flow
        if (searchParams.get("mode") === "completeProfile") return;

        // Wait for auth to finish loading and ensure user exists
        if (!loading && user) {
            // Stay on home if profile is incomplete
            if (!user.phone) return;

            if (user.role === "owner" || (Array.isArray(user.role) && user.role.includes("owner"))) {
                navigate("/owner", { replace: true });
            } else if (user.role === "renter" || (Array.isArray(user.role) && user.role.includes("renter"))) {
                navigate("/renter", { replace: true });
            }
        }
    }, [user, loading, navigate, searchParams]);
}
export default homeRedirect;
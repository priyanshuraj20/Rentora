import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/authHook";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-bright"></div>
          <span className="text-text-primary text-sm font-medium">Verifying authentication...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/?auth=required" replace />;
  }

  const roleValue = user.role ?? user.roles ?? [];
  const userRoles = Array.isArray(roleValue) ? roleValue : [roleValue];

  if (allowedRoles.length > 0) {
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      if (userRoles.includes("owner") || userRoles.includes("admin")) {
        return <Navigate to="/owner" replace />;
      }
      return <Navigate to="/renter" replace />;
    }
  }

  return <Outlet />;
}

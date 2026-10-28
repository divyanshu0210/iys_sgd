// src/components/PublicOnlyRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAuthReturnTo } from "../utils/authReturnTo";

export default function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While loading, show the route normally
  if (loading) {
    return <Outlet />;
  }

  // Preserve the destination when authentication completes before the form
  // gets a chance to perform its own redirect.
  if (user) {
    return <Navigate to={getAuthReturnTo(location.state?.from)} replace />;
  }

  // Otherwise allow access to this public route
  return <Outlet />;
}

// src/components/PublicOnlyRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  // While loading, show the route normally
  if (loading) {
    return <Outlet />;
  }

  // If user is logged in → redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Otherwise allow access to this public route
  return <Outlet />;
}

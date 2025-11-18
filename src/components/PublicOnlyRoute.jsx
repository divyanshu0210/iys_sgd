// src/components/PublicOnlyRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FullPageLoader from "./FullPageLoader";

export default function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader />;

  // If user is logged in → redirect to home
  return user ? <Navigate to="/" replace /> : <Outlet />;
}

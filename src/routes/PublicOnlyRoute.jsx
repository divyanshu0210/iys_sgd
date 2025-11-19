// src/components/PublicOnlyRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FullPageLoader from "../components/FullPageLoader";

export default function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  // If user is logged in → redirect to home
  return user && !loading? <Navigate to="/" replace /> : <Outlet />;
}

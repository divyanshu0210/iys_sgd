// src/components/PublicOnlyRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicOnlyRoute() {
  const { user } = useAuth();

  // If user is logged in → redirect to home
  return user ? <Navigate to="/" replace /> : <Outlet />;
}

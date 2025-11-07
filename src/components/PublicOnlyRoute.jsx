// src/components/PublicOnlyRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <p>Public route Loading...</p>
      </div>
    );
  }

  // If user is logged in → redirect to home
  return user ? <Navigate to="/" replace /> : <Outlet />;
}

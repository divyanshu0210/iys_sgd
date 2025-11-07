// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <p>protected route Loading...</p>
      </div>
    );
  }

   return user ? <Outlet /> : <Navigate to="/signin" replace />;
}
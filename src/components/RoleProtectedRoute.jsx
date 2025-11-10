// src/components/RoleProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function RoleProtectedRoute({ allowedStatuses }) {
  const { user, profileStage,loading } = useAuth();


  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <p>Loading...</p>
      </div>
    );
  }

  // If no user logged in, redirect to signin
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // If user does not have the required profileStatus
  if (!allowedStatuses.includes(profileStage)) {
    return <Navigate to="/" replace />;
  }

  // If authorized, render child routes
  return <Outlet />;
}

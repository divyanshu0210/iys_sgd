// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FullPageLoader from "./FullPageLoader";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

   if (loading) return <FullPageLoader />;

   return user ? <Outlet /> : <Navigate to="/signin" replace />;
}
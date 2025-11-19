// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FullPageLoader from "../components/FullPageLoader";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

 

   return user && !loading? <Outlet /> : <Navigate to="/signin" replace />;
}
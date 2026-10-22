// src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FullPageLoader from "../components/FullPageLoader";

export default function ProtectedRoute({ children }) {
  const { user,loading } = useAuth();
  const location = useLocation();

   return user || loading
     ? <Outlet />
     : <Navigate to="/signin" replace state={{
         from: `${location.pathname}${location.search}${location.hash}`,
       }} />;
}

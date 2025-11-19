// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";

// Pages
import Home from "./pages/Home";
import YatraList from "./pages/YatraList";
import Profile from "./pages/Profile/Profile";
import BasicProfile from "./pages/Profile/BasicProfile";

// Auth Pages
import VerifyEmail from "./pages/Auth/VerifyEmail";
import PasswordReset from "./pages/Auth/PasswordReset";
import PasswordResetDone from "./pages/Auth/PasswordResetDone";
import PasswordResetConfirm from "./pages/Auth/PasswordResetConfirm";
import PasswordResetComplete from "./pages/Auth/PasswordResetComplete";
import PasswordChange from "./pages/Auth/PasswordChange";
import PasswordChangeDone from "./pages/Auth/PasswordChangeDone";
import VerificationEmailSent from "./pages/Auth/VerificationEmailSent";
import Members from "./pages/Members/Members";
import RoleProtectedRoute from "./routes/RoleProtectedRoute";
import YatraRegister from "./pages/Registration/YatraRegister";
import { YatraRegistrationProvider } from "./pages/Registration/context/YatraRegistrationContext";
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import "./App.css";
import CheckoutStep from "./pages/Registration/steps/CheckoutStep";
import YatraRegistrationLayout from "./pages/Registration/context/YatraRegistrationLayout";
import FullPageLoader from "./components/FullPageLoader";
import AppRoutes from "./routes/AppRoutes";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const {loading } = useAuth();
  return (
    <>
     {loading&&( <FullPageLoader />)}
      <Navbar />
      <main>
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <AppRoutes />
        </div>
      </main>
    </>
  );
}

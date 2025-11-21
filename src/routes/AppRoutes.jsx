  // src/AppRoutes.jsx
  import { Routes, Route, Navigate } from "react-router-dom";
  import Home from "../pages/Home";
  import PublicOnlyRoute from "./PublicOnlyRoute";
  import SignIn from "../pages/Auth/SignIn";
  import SignUp from "../pages/Auth/SignUp";
  import PasswordReset from "../pages/Auth/PasswordReset";
  import PasswordResetDone from "../pages/Auth/PasswordResetDone";
  import PasswordResetConfirm from "../pages/Auth/PasswordResetConfirm";
  import PasswordResetComplete from "../pages/Auth/PasswordResetComplete";
  import ProtectedRoute from "./ProtectedRoute";
  import BasicProfile from "../pages/Profile/BasicProfile";
  import YatraList from "../pages/YatraList";
  import YatraRegistrationLayout from "../pages/Registration/context/YatraRegistrationLayout";
  import YatraRegister from "../pages/Registration/YatraRegister";
  import CheckoutStep from "../pages/Registration/steps/CheckoutStep";
  import Profile from "../pages/Profile/Profile";
  import RoleProtectedRoute from "./RoleProtectedRoute";
  import Members from "../pages/Members/Members";
  import VerifyEmail from "../pages/Auth/VerifyEmail";
  import VerificationEmailSent from "../pages/Auth/VerificationEmailSent";

  export default function AppRoutes() {
    return (
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />

        {/* Public-only (blocked if logged in) */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/password_reset" element={<PasswordReset />} />
          <Route path="/password_reset_done" element={<PasswordResetDone />} />
          <Route
            path="/password-reset-confirm/:uidb64/:token"
            element={<PasswordResetConfirm />}
          />
          <Route
            path="/password_reset_complete"
            element={<PasswordResetComplete />}
          />
        </Route>

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/complete-profile" element={<BasicProfile />} />
          <Route path="/yatras" element={<YatraList />} />

          <Route element={<YatraRegistrationLayout />}>
            <Route path="/yatra/:yatra_id/register" element={<YatraRegister />} />
            <Route path="/checkout" element={<CheckoutStep />} />
          </Route>
        </Route>

        {/* Profile (public?) */}
        <Route path="/profile" element={<Profile />} />

        {/* Role Protected */}
        <Route
          element={<RoleProtectedRoute allowedStatuses={["devotee", "mentor"]} />}
        >
          <Route path="/members" element={<Members />} />
        </Route>

        {/* Email verification */}
        <Route path="/email-verified" element={<VerifyEmail />} />
        <Route path="/email-sent" element={<VerificationEmailSent />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

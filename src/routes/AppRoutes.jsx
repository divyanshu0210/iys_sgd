// src/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import PublicOnlyRoute from "./PublicOnlyRoute";
import SignIn from "../pages/Auth/SignIn";
import SignUp from "../pages/Auth/SignUp";
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
import PendingPaymentGuard from "./PendingPaymentGuard";
import DonatePage from "../pages/Donate/DonatePage";
import VerifiedEmailAlready from "../pages/Auth/VerifiedEmailAlready";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import PasswordResetSuccess from "../pages/Auth/PasswordResetSuccess";
import DonationDetailsPage from "../pages/Donate/DonationDetailsPage";
import ResourcesPage from "../pages/Resources/ResourcesPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PendingPaymentGuard />}>
        <Route path="/" element={<Home />} />
      </Route>

      {/* Public-only (blocked if logged in) */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/reset-password/:uidb36/:token"
          element={<ResetPassword />}
        />
        <Route
          path="/password-reset-success"
          element={<PasswordResetSuccess />}
        />
        {/* <Route path="/reset-link-invalid" element={<ResetLinkInvalid />} /> */}
      </Route>

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<PendingPaymentGuard />}>
          <Route path="/complete-profile" element={<BasicProfile />} />
          <Route path="/yatras" element={<YatraList />} />

          <Route element={<YatraRegistrationLayout />}>
            <Route
              path="/yatra/:yatra_id/register"
              element={<YatraRegister />}
            />
            <Route path="/checkout" element={<CheckoutStep />} />
          </Route>
        </Route>
      </Route>

      {/* Profile (public?) */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/donate" element={<DonatePage />} />
      <Route path="/donate/details" element={<DonationDetailsPage />} />
      <Route path="/resources" element={<ResourcesPage />} />

      {/* Role Protected */}
      <Route
        element={<RoleProtectedRoute allowedStatuses={["devotee", "mentor"]} />}
      >
        <Route path="/members" element={<Members />} />
      </Route>

      {/* Email verification */}
      <Route path="/email-verified" element={<VerifyEmail />} />
      <Route path="/email-sent" element={<VerificationEmailSent />} />
      <Route
        path="/email-already-verified"
        element={<VerifiedEmailAlready />}
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

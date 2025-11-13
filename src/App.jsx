// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";

// Pages
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
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
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import YatraRegister from "./pages/Registration/YatraRegister";
import { YatraRegistrationProvider } from "./pages/Registration/context/YatraRegistrationContext";

export default function App() {
  return (
    <>
      <Navbar />
      <main
        style={{
          minHeight: "calc(100vh - 64px)",
          padding: "2rem 1rem",
          backgroundColor: "#f8f9fa",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />

            {/* Public Only (Block if logged in) */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/password_reset" element={<PasswordReset />} />
              <Route
                path="/password_reset_done"
                element={<PasswordResetDone />}
              />
              <Route
                path="/password-reset-confirm/:uidb64/:token"
                element={<PasswordResetConfirm />}
              />
              <Route
                path="/password_reset_complete"
                element={<PasswordResetComplete />}
              />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              {/* <Route path="/password_change" element={<PasswordChange />} />
              <Route path="/password_change_done" element={<PasswordChangeDone />} /> */}

              <Route path="/complete-profile" element={<BasicProfile />} />
              <Route path="/yatras" element={<YatraList />} />
              <Route
                path="/yatra/:yatra_id/register"
                element={
                  <YatraRegistrationProvider>
                    <YatraRegister />
                  </YatraRegistrationProvider>
                }
              />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route
              element={
                <RoleProtectedRoute allowedStatuses={["devotee", "mentor"]} />
              }
            >
              <Route path="/members" element={<Members />} />
            </Route>

            {/* Email Verification (Public, but outside guards) */}
            <Route path="/email-verified" element={<VerifyEmail />} />
            <Route path="/email-sent" element={<VerificationEmailSent />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </>
  );
}

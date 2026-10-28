import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "../../css/signIn.css";
import GoogleBtn from "../../components/GoogleBtn";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { clearAuthReturnTo, getAuthReturnTo } from "../../utils/authReturnTo";

const isEmailVerificationMandatoryForSignUp =
  import.meta.env.VITE_ACCOUNT_EMAIL_VERIFICATION === "mandatory";

export default function SignUp() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = getAuthReturnTo(location.state?.from);
  const [status, setStatus] = useState(null); // { type, msg }
  const { loading, setLoading, login, fetchProfile } = useAuth();

  // Email/Password Sign Up
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return;
    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    const username = form.email.split("@")[0]; // derive username from email
    formData.append("username", username);
    formData.append("email", form.email);
    formData.append("password1", form.password);
    formData.append("password2", form.password);

    // username, email, password1, password2
    try {
      await API.post("api/auth/register/", formData);
      setStatus({
        type: "success",
        msg: isEmailVerificationMandatoryForSignUp
          ? "Signup successful. Please verify your email."
          : "Signup successful. Signing you in...",
      });
      if (isEmailVerificationMandatoryForSignUp) {
        setTimeout(() => navigate("/email-sent", { state: { from: returnTo } }), 1000);
      } else {
        await login(form.email, form.password);
        await fetchProfile();
        clearAuthReturnTo();
        navigate(returnTo, { replace: true });
      }
    } catch (err) {
      const msg =
        err.response?.data?.email?.[0] ||
        err.response?.data?.password1?.[0] ||
        err.response?.data?.password2?.[0] ||
        err.response?.data?.username?.[0] ||
        err.response?.data?.non_field_errors?.[0] ||
        "Registration failed. Please try again.";
      setStatus({ type: "error", msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-page">
      <form className="reg-card" onSubmit={handleSubmit} noValidate>
        <h2 className="reg-title">Sign Up</h2>

        {/* Status */}
        {status && (
          <div
            className={`status-box ${
              status.type === "info"
                ? "info"
                : status.type === "success"
                ? "success"
                : "error"
            }`}
            style={{ marginBottom: "1rem" }}
          >
            {status.msg}
          </div>
        )}

        <div className="reg-grid">
          <div className="input-group reg-field-full">
            <input
              type="email"
              placeholder=" "
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              disabled={loading}
              autoComplete="email"
            />
            <label>Email</label>
          </div>

          <div className="input-group reg-field-full">
            <input
              type="password"
              placeholder=" "
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              disabled={loading}
              autoComplete="new-password"
            />
            <label>Password</label>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !form.email || !form.password}
          >
            {loading ? "Creating..." : "Create Account"}
            {/* {loading ? "Sending..." : "Send Verification Email"} */}
          </button>
        </div>

        <p
          style={{
            margin: "1.5rem 0",
            textAlign: "center",
            fontSize: "0.9rem",
          }}
        >
          Already have an account?{" "}
          <Link replace to="/signin" state={{ from: returnTo }} className="btn-link">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

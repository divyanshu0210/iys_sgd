// src/pages/SignIn.jsx
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "../../css/signIn.css"; 
import GoogleBtn from "../../components/GoogleBtn";
import { useAuth } from "../../context/AuthContext";


export default function SignIn() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login, profile, fetchProfile ,loading, setLoading} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState(null); // { type, msg }
  const storedReturnTo = sessionStorage.getItem("authReturnTo");
  const storedReturnToAt = Number(sessionStorage.getItem("authReturnToAt"));
  const hasFreshStoredReturnTo = storedReturnTo && storedReturnToAt &&
    Date.now() - storedReturnToAt < 10 * 60 * 1000;
  const returnTo = location.state?.from || (hasFreshStoredReturnTo ? storedReturnTo : "/");

  // Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return;

    setLoading(true);
    setStatus(null);

    try {
      await login(form.email, form.password);
      setStatus({ type: "success", msg: "Signed in successfully!" });
      await fetchProfile(); // refresh latest profile

      setTimeout(() => {
        sessionStorage.removeItem("authReturnTo");
        sessionStorage.removeItem("authReturnToAt");
        navigate(returnTo, { replace: true }); // return to the originally requested page
      }, 1000);
    } catch (err) {
       const msg =
        err.response?.data?.email?.[0] ||
        err.response?.data?.password1?.[0] ||
        err.response?.data?.password2?.[0] ||
        err.response?.data?.username?.[0] ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.response?.data?.non_field_errors?.[0] ||
        "Login failed. Please try again.";
      // const msg = "Invalid Email or Password";
      err.response?.data?.error ||
        err.message ||
        "Login failed. Please try again.";
      setStatus({ type: "error", msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-page">
      <div className="reg-card">

      <form  onSubmit={handleSubmit} noValidate>
        <h2 className="reg-title">Sign In</h2>

        {/* Status */}
        {status && (
          <div
            className={`status-box ${
              status.type === "success" ? "success" : "error"
            }`}
            style={{ marginBottom: "1rem" }}
          >
            {status.msg}
          </div>
        )}

        <div className="reg-grid">
          <div className="input-group">
            <input
              id="email"
              type="email"
              placeholder=" "
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              disabled={loading}
              autoComplete="email"
            />
            <label htmlFor="email">Email</label>
          </div>

          <div className="input-group">
            <input
              id="password"
              type="password"
              placeholder=" "
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              disabled={loading}
              autoComplete="current-password"
            />
            <label htmlFor="password">Password</label>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !form.email || !form.password}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </div>

      </form>
      
        <p style={{ textAlign: "center", margin: "0.5rem 0" }}>
          <Link to="/forgot-password" className="btn-link">
            Forgot password?
          </Link>
        </p>

        {/* Google Login */}
        <div style={{ margin: "1.5rem 0", textAlign: "center" }}>
          <GoogleBtn setStatus={setStatus} returnTo={returnTo} />
        </div>

        <p style={{ textAlign: "center", fontSize: "0.9rem" }}>
          New here?{" "}
          <Link replace to="/signup" state={{ from: returnTo }} className="btn-link">
            Create account
          </Link>
        </p>
      </div>

    </div>
  );
}

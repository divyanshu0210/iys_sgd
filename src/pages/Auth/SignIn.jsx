// src/pages/SignIn.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../css/signIn.css"; 
import GoogleBtn from "../../components/GoogleBtn";
import { useAuth } from "../../context/AuthContext";


export default function SignIn() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login, profile, fetchProfile ,loading, setLoading} = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null); // { type, msg }

  // Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return;

    setLoading(true);
    setStatus(null);

    try {
      await login(form.email, form.password);
      setStatus({ type: "success", msg: "Signed in successfully!" });
      const stage = await fetchProfile(); // refresh latest profile

      setTimeout(() => {
        if (stage !== "not-exists") {
          navigate("/"); // ✅ any kind of profile exists
        } else {
          navigate("/complete-profile"); // ❌ no profile at all
        }
      }, 800);
    } catch (err) {
      const msg = "Invalid Email or Password";
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
      <form className="reg-card" onSubmit={handleSubmit} noValidate>
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

        <p style={{ textAlign: "center", margin: "0.5rem 0" }}>
          <Link to="/password_reset" className="btn-link">
            Forgot password?
          </Link>
        </p>

        {/* Google Login */}
        <div style={{ margin: "1.5rem 0", textAlign: "center" }}>
          <GoogleBtn />
        </div>

        <p style={{ textAlign: "center", fontSize: "0.9rem" }}>
          New here?{" "}
          <Link to="/signup" className="btn-link">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}

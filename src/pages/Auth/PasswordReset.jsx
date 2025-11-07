// src/pages/PasswordReset.jsx
import { useState } from "react";
import API from "../../services/api";
import "../../css/signIn.css";
import { Link } from "react-router-dom";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // { type, msg }
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setStatus(null);

    try {
      await API.post("api/auth/password/reset/", { email });
      setStatus({
        type: "info",
        msg: "Password reset link sent! Check your email.",
      });
    } catch (err) {
      const msg =
        err.response?.data?.email?.[0] ||
        err.response?.data?.detail ||
        "Failed to send reset email. Please try again.";
      setStatus({ type: "error", msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-page">
      <form className="reg-card" onSubmit={handleSubmit}>
        <h2 className="reg-title">Reset Password</h2>

        {/* Status message */}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />
            <label>Email</label>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !email}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: "0.9rem", marginTop: "1rem" }}>
          Remembered your password?{" "}
          <Link to="/signin" className="btn-link">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

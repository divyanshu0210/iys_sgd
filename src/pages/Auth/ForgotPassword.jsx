import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import "../../css/signIn.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    return ; 
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      await API.post("api/yatra_auth/password/reset/", { email });
      // Same response whether email exists or not
      setSent(true);
    } catch (err) {
      setError(
        err.response?.data?.email ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-page">
      <form className="reg-card" onSubmit={handleSubmit}>
        <h2 className="reg-title">Forgot Password</h2>

        {/* Success message (safe, non-leaking) */}
        {sent && (
          <div className="status-box info" style={{ marginBottom: "1rem" }}>
            If an account exists for <b>{email}</b>, a password reset link has
            been sent.
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="status-box error" style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {!sent && (
          <>
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
          </>
        )}

        <p
          style={{
            textAlign: "center",
            fontSize: "0.9rem",
            marginTop: "1rem",
          }}
        >
          Remembered your password?{" "}
          <Link replace to="/signin" className="btn-link">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

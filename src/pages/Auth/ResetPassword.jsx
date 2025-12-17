// src/pages/PasswordResetConfirm.jsx
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import "../../css/signIn.css";

export default function PasswordResetConfirm() {
  const { uidb36, token } = useParams();
  const [form, setForm] = useState({ new_password1: "", new_password2: "" });
  const [status, setStatus] = useState(null); // { type, msg }
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.new_password1 || !form.new_password2) return;
    if (form.new_password1 !== form.new_password2) {
      setStatus({ type: "error", msg: "Passwords do not match" });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      await API.post(`api/yatra_auth/password/reset/confirm/`, {
        uid: uidb36,
        token: token,
        new_password: form.new_password1,
        password1: form.new_password1,
        password2: form.new_password2,
      });
      setStatus({ type: "success", msg: "Password reset successful!" });
      setDone(true);
      setForm({ new_password1: "", new_password2: "" });
      navigate("/password-reset-success", { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.token?.[0] ||
        err.response?.data?.new_password?.[0] ||
        err.response?.data?.new_password1?.[0] ||
        err.response?.data?.new_password2?.[0] ||
        err.response?.data?.non_field_errors?.[0] ||
        "Password reset failed. Please try again.";
      setStatus({ type: "error", msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-page">
      <form className="reg-card" onSubmit={handleSubmit}>
        <h2 className="reg-title">Set New Password</h2>

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

        {!done ? (
          <div className="reg-grid">
            <div className="input-group reg-field-full">
              <input
                type="password"
                placeholder=" "
                value={form.new_password1}
                onChange={(e) =>
                  setForm({ ...form, new_password1: e.target.value })
                }
                required
                disabled={loading}
                autoComplete="new-password"
              />
              <label>New Password</label>
            </div>

            <div className="input-group reg-field-full">
              <input
                type="password"
                placeholder=" "
                value={form.new_password2}
                onChange={(e) =>
                  setForm({ ...form, new_password2: e.target.value })
                }
                required
                disabled={loading}
                autoComplete="new-password"
              />
              <label>Confirm New Password</label>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !form.new_password1 || !form.new_password2}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <Link replace to="/signin" className="btn-primary">
              Go to Sign In
            </Link>
          </div>
        )}
      </form>
    </div>
  );
}

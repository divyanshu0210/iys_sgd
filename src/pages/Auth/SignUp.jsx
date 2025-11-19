import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../css/signIn.css";
import GoogleBtn from "../../components/GoogleBtn";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function SignUp() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const [status, setStatus] = useState(null); // { type, msg }
  const {loading, setLoading}= useAuth();

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
        // msg: "Verification email sent! Redirecting...",
        msg: "Signup Successful....",
      });
      // setTimeout(() => navigate("/email-sent"), 1000);
      setTimeout(() => navigate("/signin"), 1000);
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

        {/* Google Sign Up */}
        <div style={{ margin: "1.5rem 0", textAlign: "center" }}>
          <GoogleBtn/>
        </div>

        <p style={{ textAlign: "center", fontSize: "0.9rem" }}>
          Already have an account?{" "}
          <Link to="/signin" className="btn-link">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

import { CircleAlert, Info } from "lucide-react";
import { Link } from "react-router-dom";

export default function VerifiedEmailAlready() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb",
        padding: "16px",
      }}
    >
      <div
        style={{
          maxWidth: "420px",
          width: "100%",
          background: "#ffffff",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        <CircleAlert size={56} color="#f00" style={{ marginBottom: "16px" }} />

        <h2 style={{ fontSize: "22px", fontWeight: "600", marginBottom: "8px" }}>
         This Link is No Longer Active
        </h2>

        <p style={{ fontSize: "14px", color: "#4b5563", marginBottom: "20px" }}>
         If you’ve already verified your email, you can sign in safely.
        </p>

        <Link
          to="/signin"
           replace
          style={{
            display: "inline-block",
            padding: "10px 20px",
            borderRadius: "10px",
            background: "#2563eb",
            color: "#ffffff",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

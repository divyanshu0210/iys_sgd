import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GoogleBtn = () => {
  const navigate = useNavigate();
  const { setUser, fetchProfile } = useAuth();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        console.log("Google access token:", tokenResponse.access_token);
        const res = await API.post("/api/auth/registration/social/login/", {
          provider: "google",
          access_token: tokenResponse.access_token,
        });

        localStorage.setItem("userToken", res.data.key);
        localStorage.setItem("accessToken", tokenResponse.access_token);
        setUser(res.data.key);
        const stage = await fetchProfile(); // refresh latest profile

        setTimeout(() => {
          if (stage !== "not-exists") {
            navigate("/"); // ✅ any kind of profile exists
          } else {
            navigate("/complete-profile"); // ❌ no profile at all
          }
        }, 800);
      } catch (err) {
        console.error("Google login error:", err.response?.data || err.message);
      }
    },
    onError: () => {
      console.error("Google login failed");
    },
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "300px",
          display: "flex",
          alignItems: "center",
          textAlign: "center",
          color: "#6b7280",
          fontSize: "14px",
          marginBottom: "10px",
        }}
      >
        <hr
          style={{ flex: 1, border: "none", borderTop: "1px solid #e5e7eb" }}
        />
        <span style={{ margin: "0 10px" }}>OR</span>
        <hr
          style={{ flex: 1, border: "none", borderTop: "1px solid #e5e7eb" }}
        />
      </div>

      <button
        onClick={() => login()}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          color: "#3c4043",
          border: "1px solid #dadce0",
          borderRadius: "8px",
          fontWeight: "500",
          fontSize: "16px",
          padding: "10px 20px",
          cursor: "pointer",
          boxShadow:
            "0 1px 3px rgba(60,64,67,0.3), 0 1px 1px rgba(60,64,67,0.15)",
          transition: "background-color 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "#f7f8f8";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "#ffffff";
        }}
      >
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google logo"
          style={{
            width: "25px",
            height: "25px",
            background: "white",
            borderRadius: "2px",
            marginRight: "10px",
          }}
        />
        Continue with Google
      </button>
    </div>
  );
};

export default GoogleBtn;

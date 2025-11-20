import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FullPageLoader from "./FullPageLoader";

const GoogleBtn = ({ setStatus }) => {
  const navigate = useNavigate();
  const { setUser, fetchProfile ,setLoading} = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setStatus(""); 

      try {
        const res = await API.post("/api/auth/registration/social/login/", {
          provider: "google",
          access_token: tokenResponse.access_token,
        });

        // Save tokens
        localStorage.setItem("userToken", res.data.key);
        localStorage.setItem("accessToken", tokenResponse.access_token);
        setUser(res.data.key);

        const stage = await fetchProfile();

        setTimeout(() => {
          if (stage !== "not-exists") {
            navigate("/");
          } else {
            navigate("/complete-profile");
          }
        }, 800);
      } catch (err) {
        console.error("Google login error:", err.response?.data || err.message);

        // Check backend error message
        const backendMsg =
          err.response?.data?.detail ||
          err.response?.data?.non_field_errors?.[0] ||
          "Google login failed. Please try again.";

        setStatus({ type: "error", msg: backendMsg });
      } finally {
        setGoogleLoading(false);
      }
    },

    onError: () => {
      setStatus("Google login failed. Please try again.");
    },
  });

  return (
    <>
    {googleLoading&&<FullPageLoader/>}
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
        disabled={googleLoading}
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
          cursor: googleLoading ? "not-allowed" : "pointer",
          opacity: googleLoading ? 0.7 : 1,
          boxShadow:
            "0 1px 3px rgba(60,64,67,0.3), 0 1px 1px rgba(60,64,67,0.15)",
          transition: "background-color 0.2s, box-shadow 0.2s",
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
        {googleLoading ? "Connecting..." : "Continue with Google"}
      </button>
    </div>
    </>

  );
};

export default GoogleBtn;

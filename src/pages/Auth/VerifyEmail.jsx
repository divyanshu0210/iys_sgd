import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const { user_id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        alert("Email verified! You can now log in.");
        navigate("/signin");
      } catch {
        alert("Invalid or expired link.");
      }
    };
    verify();
  }, [user_id, navigate]);

  return <p>Verifying email...</p>;
}
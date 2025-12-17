import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function PasswordResetSuccess() {
  return (
    <div className="reg-page">
      <div className="reg-card">
        <CheckCircle size={56} color="#16a34a" />
        <h2>Password Updated</h2>
        <p>
          Your password has been reset successfully.{" "}
          <Link replace to="/signin">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

// src/pages/EmailSent.jsx
import { Link } from "react-router-dom";
import "../../css/signIn.css"; 

export default function VerificationEmailSent() {
  return (
    <div className="reg-page">
      <div className="reg-card" style={{ textAlign: "center" }}>
        <h2 className="reg-title">Check Your Email</h2>
        <p style={{ margin: "1rem 0", fontSize: "1rem", color: "#555" }}>
          A verification email has been sent to your inbox.  
          Please click the link inside to verify your account.
        </p>

        <p style={{ marginTop: "1.5rem" }}>
          Didn’t receive the email?  
          <Link to="/signup" className="btn-link">Try again</Link>
        </p>

        {/* <Link
          to="/signin"
          className="btn-primary"
          style={{ display: "inline-block", marginTop: "2rem" }}
        >
          Go to Sign In
        </Link> */}
      </div>
    </div>
  );
}

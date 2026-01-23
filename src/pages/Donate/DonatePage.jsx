import "../../css/DonatePage.css";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function DonatePage() {
  const navigate = useNavigate();

  return (
    <div className="donation-container">
      <img
        src="/Donation_Page_Poster_2.png"
        alt="Donation"
        className="bg-image"
      />

      <div className="donate-cta-container">
        <button
          className="donate-btn"
          onClick={() => navigate("/donate/details")}
        >
          Donate Now
        </button>
        <p className="donate-text">
          Click on <strong>Donate Now</strong> to make your contribution !!
        </p>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="detail-row">
      <span style={{ color: "#285fa1", fontWeight: "bold" }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
export function AccountDetail() {
  return (
    <div className="donation-account-detail-box">
      <Detail label="Account Name" value="Vinod V Sankapal" />
      <Detail label="Account Number" value="337001000234" />
      <Detail label="IFSC Code" value="ICIC0003370" />
      <Detail label="Bank Name" value="ICICI Bank Nigdi" />
      <p style={{ textAlign: "center", fontWeight: "bold" }}>Or</p>
      <Detail label="UPI" value="7774032548" />
    </div>
  );
}

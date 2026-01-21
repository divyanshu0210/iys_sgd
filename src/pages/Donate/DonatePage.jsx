import "../../css/DonatePage.css";
import React, { useState } from "react";
import ImageSlider from "./ImageSlider";
import { useNavigate } from "react-router-dom";


export default function DonatePage() {
  const [qrLoading, setQrLoading] = useState(true);
  const navigate = useNavigate();

  return (

    <div className="donation-container">
        <img src="/Donation_Page_Poster.png" alt="Donation" className="bg-image" />

      <button
        className="donate-btn"
        onClick={() => navigate("/donate/details")}
      >
        Donate Now
      </button>
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

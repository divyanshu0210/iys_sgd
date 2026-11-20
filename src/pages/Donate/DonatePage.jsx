import "../../css/DonatePage.css";
import React from "react";
import { useNavigate } from "react-router-dom";


export default function DonatePage() {
  const navigate = useNavigate();

  return (
    <div className="donation-container">
      <div className="donation-inner">
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

export function AccountDetail({ paymentDetails = {} }) {
  const details = paymentDetails;
  return (
    <div className="donation-account-detail-box">
      <Detail label="Account Name" value={details.payment_account_name || "Loading…"} />
      <Detail label="Account Number" value={details.payment_account_number || "Loading…"} />
      <Detail label="IFSC Code" value={details.payment_ifsc || "Loading…"} />
      <Detail label="Bank Name" value={details.payment_bank_name || "Loading…"} />
      <p style={{ textAlign: "center", fontWeight: "bold" }}>Or</p>
      <Detail label="UPI" value={details.payment_upi_id || "Loading…"} />
    </div>
  );
}

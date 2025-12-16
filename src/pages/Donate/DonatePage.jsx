import "../../css/DonatePage.css";
import React, { useState } from "react";
import ImageSlider from "./ImageSlider";

export default function DonatePage() {
  const [qrLoading, setQrLoading] = useState(true);

  return (
    <div className="donate-page">
      <div className="donate-header">
        <h1 className="donate-heading">Support IYS Sri Govind Dham</h1>
        <p className="donate-sub">
          प्राणैरर्थैर्धिया वाचा — let your wealth help reawaken devotion in every soul.
        </p>
      </div>

      <div className="donate-wrapper">
        <div className="donate-right">
          <div className="donation-card">

            {/* <div className="qr-box">
              {qrLoading && <div className="qr-loader" />}

              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=Sample"
                className={`qr-img ${qrLoading ? "hidden" : ""}`}
                alt="QR"
                onLoad={() => setQrLoading(false)}
                onError={() => setQrLoading(false)}
              />

              <p className="upi-note">
                Google Pay • PhonePe • Paytm • All UPI Apps
              </p>
            </div> */}

            <Detail label="Account Name" value="Vinod V Sankapal" />
            <Detail label="Account Number" value="337001000234" />
            <Detail label="IFSC Code" value="ICIC0003370" />
            <Detail label="Bank Name" value="ICICI Bank Nigdi" />
            <Detail label="UPI" value="7774032548" />

            <button className="donate-btn">Share Donation Receipt</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

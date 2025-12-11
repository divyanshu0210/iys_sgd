import "../../css/DonatePage.css";
import React, { useEffect, useState } from "react";

export default function DonatePage() {
  const images = [
    "/images/activity1.jpg",
    "/images/activity2.jpg",
    "/images/activity3.jpg",
    "/images/activity4.jpg",
    "/images/activity4.jpg",
    "/images/activity4.jpg",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setIndex((i) => (i + 1) % images.length),
      2500
    );
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="donate-page">

      {/* HEADER */}
      <div className="donate-header">
        <h1 className="donate-heading">Support IYS Sri Govind Dham</h1>
        <p className="donate-sub">Small donations create big spiritual impact.</p>
      </div>

      {/* MAIN SECTIONS */}
      <div className="donate-wrapper">
        {/* LEFT SECTION */}
        <div className="donate-left">
          <div className="slider-container">
            <img src={images[index]} alt="Activity" className="slider-image" />
            <div className="slider-overlay">
              <p>Serving With Love & Devotion</p>
            </div>
            <div className="slider-dots">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`dot ${i === index ? "active" : ""}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          </div>

          <p className="donate-message">
            Your generous contribution helps us continue:
          </p>

          <ul className="donate-list">
            <li>• Youth preaching programs</li>
            <li>• Prasadam distribution</li>
            <li>• Temple seva & festivals</li>
            <li>• Scriptural education</li>
            <li>• Spiritual Yatras</li>
            <li>• Book Distribution</li>
          </ul>
        </div>

        {/* RIGHT SECTION */}
        <div className="donate-right">
          <div className="donation-card">
            <h2>Donation Details</h2>

            <Detail label="Account Name" value="Sri Govind Dham Trust" />
            <Detail label="Account Number" value="12345678910" />
            <Detail label="IFSC Code" value="SBIN0001234" />

            <div className="qr-box">
              <h3>Scan & Donate</h3>
              <img src="src/assets/react.svg" className="qr-img" alt="QR" />
              <p className="upi-note">Works on Google Pay • PhonePe • Paytm • All UPI Apps</p>

              <Detail label="UPI ID" value="govinddham@upi" />
            </div>

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

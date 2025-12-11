
import { useAuth } from "../../context/AuthContext";
import "../../css/DonatePage.css";
import React, { useEffect, useState } from "react";
export default function DonatePage() {
const images = [
  "https://i.ytimg.com/vi/zgJs9yK-b-8/sddefault.jpg",
  "https://www.krishnatemple.com/wp-content/uploads/2022/05/prasadam_donations2.jpg",
  "https://static.toiimg.com/thumb/msid-122098793,width-1280,height-720,resizemode-4/122098793.jpg",
  "https://www.krishnatemple.com/wp-content/uploads/2023/06/Be-a-Book-Distributor-Web.jpg",
  "https://iskconmumbaipull-21250.kxcdn.com/web/image/2452-4faea8e9/ff3.webp",
];
  const [index, setIndex] = useState(0);
  const {setDonatePage} = useAuth();
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 3000); // change every 3 seconds
    return () => clearInterval(interval);
  }, [images.length]);  
  
  useEffect(() => {
   setDonatePage(true);
    return () => setDonatePage(false);
  }, []);
  return (
    <div className="donate-page">
      {/* Full-screen background slideshow */}
      <div className="background-slider">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt="Background"
            className={`bg-image ${i === index ? "active" : ""}`}
          />
        ))}
        {/* Dark overlay to make text readable */}
        <div className="bg-overlay" />
      </div>
      {/* Content container */}
      <div className="content-container">
        {/* Left side - Shloka (centered vertically) */}
        <div className="shloka-section">
          <div className="donate-shloka">
            <p className="sanskrit">
              प्राणैरर्थैर्धिया वाचा श्रेय आचरणं सदा ॥
            </p>
            <p className="translation">
              "The perfection of life is to develop pure devotion to the Lord, which
              means to engage one's life, wealth, intelligence, and words in His
              service."
            </p>
          </div>
        </div>
        {/* Right side - Donation Card */}
        <div className="donation-card">
          <h2>Support IYS Sri Govind Dham</h2>
          <p className="donate-sub">
            Small donations create big spiritual impact.
          </p>
          <Detail label="Account Name" value="Sri Govind Dham Trust" />
          <Detail label="Account Number" value="12345678910" />
          <Detail label="IFSC Code" value="SBIN0001234" />
          <div className="qr-box">
            <h3>Scan & Donate</h3>
            <img src="src\assets\react.svg" className="qr-img" alt="UPI QR" />
            <p className="upi-note">
              Google Pay • PhonePe • Paytm • All UPI Apps
            </p>
          </div>
            <Detail label="UPI ID" value="govinddham@upi" />

          <button className="donate-btn">Share Donation Receipt</button>
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

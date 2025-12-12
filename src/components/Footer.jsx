// src/components/Footer.jsx

import React from "react";
import "../css/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-bottom">
        © {new Date().getFullYear()} IYS Sri Govind Dham — Dedicated to Youth &
        Spirituality
      </div>
    </footer>
  );
}

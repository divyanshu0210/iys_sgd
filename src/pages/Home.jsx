// src/pages/Home.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import YatraList from "./YatraList";
import Modal from "../components/Modal";
import ProfileApprovalForm from "./Profile/ProfileApprovalForm";
import ImageSlider from "./Donate/ImageSlider";
import "../css/Home.css";
import Footer from "../components/Footer";
import { Instagram, Youtube, Facebook, MapPin, Phone } from "lucide-react";

export default function Home() {
  const { user, profileStage, loading, setDonatePage } = useAuth();
  const navigate = useNavigate();
  const [openApprovalModal, setOpenApprovalModal] = useState(false);

  useEffect(() => {
    setDonatePage(true);
    if (loading) return;
    if (user && profileStage === "not-exists") {
      navigate("/complete-profile", { replace: true });
    }

    return () => {
      setDonatePage(false);
    };
  }, [user, profileStage, loading, navigate]);

  const bannerStyle = {
    background: "#fff3cd",
    border: "1px solid #ffeaa7",
    padding: "1rem",
    borderRadius: "8px",
    marginTop: "1rem",
    textAlign: "center",
  };

  return (
    <div>
      {/** --------------------- APPROVAL BANNERS --------------------- **/}

      {/** --------------------- MAIN WRAPPER --------------------- **/}

      <div className="home-wrapper">
        {profileStage === "guest" && (
          <div style={bannerStyle}>
            <strong>Get Approved!</strong> To access all features, please get
            your profile approved by your mentor.
            <button
              onClick={() => setOpenApprovalModal(true)}
              style={{
                marginLeft: "1rem",
                background: "#f39c12",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Get Approved
            </button>
          </div>
        )}

        {profileStage === "approval" && (
          <div style={bannerStyle}>
            <strong>Approval Pending:</strong> Your profile has been submitted
            for approval. You’ll get access to all features once it’s confirmed.
          </div>
        )}

        {/** --------------------- HERO + SLIDER (SIDE BY SIDE) --------------------- **/}
        <div className="home-row">
          {/* HERO SECTION */}
          <section className="hero-section">
            <div className="hero-overlay">
              <h1 className="hero-title">
                <span className="highlight">I</span>nspiring{" "}
                <br className="mobile_break" />
                <span className="highlight">Y</span>outh <br />
                Through <br />
                <span className="highlight"> S</span>piritual{" "}
                <br className="mobile_break" /> Experience
              </h1>

              <p className="hero-subtitle">
                Grow with devotion, service & meaningful association.
              </p>
              <button
                className="hero-btn"
                onClick={() => {
                  document
                    .getElementById("youth-centers")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Join Youth Programs
              </button>
            </div>
          </section>

          {/* FIRST SLIDER */}
          <section className="slider-section">
            <h2 className="home-section-title">Our Activities</h2>
            <ImageSlider />
          </section>
        </div>

        {/** --------------------- YOUTH SECTION --------------------- **/}

        <section className="youth-section">
          <h2 className="home-section-title">For the Youth</h2>
          <div className="youth-cards">
            <div className="card">
              <h3>Youth Spiritual Retreats</h3>
              <p>
                Experience transformative yatras and retreats designed for
                youth.
              </p>
            </div>

            <div className="card">
              <h3>Career + Ethics Workshops</h3>
              <p>Learn life skills with spiritual grounding.</p>
            </div>

            <div className="card">
              <h3>Meditation & Kirtan Sessions</h3>
              <p>Daily joy through mantra meditation & kirtans.</p>
            </div>
          </div>
        </section>

        {/** --------------------- LATEST YATRA UPDATES --------------------- **/}
        {/** --------------------- LATEST YATRA UPDATES + MOMENTS (SIDE BY SIDE) --------------------- **/}
        <div className="home-row yatra-row">
          <section className="slider-section">
            <h2 className="home-section-title">Glimpses From Our Yatras</h2>
            <ImageSlider />
          </section>
          <section className="updates-section" style={{ flex: "1 1 50%" }}>
            <h2 className="home-section-title">Upcoming Yatras</h2>
            <YatraList />
          </section>
        </div>

        {/** --------------------- NEW: YOUTH CENTERS INFO --------------------- **/}

        <section className="youth-section" id="youth-centers">
          <h2 className="home-section-title">Youth Centers Near You</h2>

          <div className="youth-cards">
            <div className="card">
              <h3>Vrindavan Bace</h3>
              <p>
                A vibrant spiritual home for youth—daily kirtans, classes,
                mentoring & seva opportunities.
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                }}
              >
                <p>
                  <strong>
                    {" "}
                    <MapPin size={18} />
                  </strong>{" "}
                  <a
                    href="https://maps.app.goo.gl/y1KSdUnGKirjerqq9"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#2563EB", textDecoration: "none" }}
                  >
                    Vrindavan Bace
                  </a>
                </p>

                <p>
                  <strong>
                    <Phone size={18} />
                  </strong>{" "}
                  <a
                    href="tel:+919876543210"
                    style={{ color: "#2563EB", textDecoration: "none" }}
                  >
                    +91 9140718421
                  </a>
                </p>
              </div>
            </div>

            <div className="card">
              <h3>Giri Govardhan Bace</h3>
              <p>
                Special programs for college students—weekly sessions, group
                discussions & retreats.
              </p>
            </div>

            <div className="card">
              <h3>Mayapur Bace</h3>
              <p>
                Special programs for college students to connect, grow, and
                study the Gita together.
              </p>
            </div>
          </div>
          <h2 className="home-section-title">Connect, Cultivate, Contribute</h2>

          <div className="youth-cards">
            {/* ---- CONTACT INFO ---- */}
            <div className="card">
              <h3 className="footer-heading">Contact Us</h3>
              <p>
                {" "}
                <MapPin size={18} /> Sri Govind Dham , ISKCON Ravet
              </p>
              <p>
                <Phone size={18} /> +91 9140718421
              </p>
              {/* <p>📧 iys.srigovinddham@gmail.com</p> */}
            </div>

            {/* ---- SHLOKA ---- */}
            <div className="card footer-shloka">
              <h3 className="footer-heading">Inspiration</h3>
              “Wherever Krishna, the master of yoga, and Arjuna, the wielder of
              the bow, are present — there surely reside fortune, victory,
              prosperity and righteousness.”
            </div>

            {/* ---- SOCIAL LINKS ---- */}
            <div className="card">
              <h3 className="footer-heading">Connect</h3>
              <p
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <Instagram size={18} />
                <a
                  href="https://www.instagram.com/iys.srigovinddham"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#2563EB", textDecoration: "none" }}
                >
                  @iys.srigovinddham
                </a>
              </p>

              <p
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <Youtube size={18} />
                <a
                  href="https://www.youtube.com/@IYSSriGovindDham"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#2563EB", textDecoration: "none" }}
                >
                  IYS Sri Govind Dham
                </a>
              </p>

              <p
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <Facebook size={18} />
                <a
                  href="https://www.facebook.com/IYSGovindDham"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#2563EB", textDecoration: "none" }}
                >
                  IYS Govind Dham
                </a>
              </p>
            </div>
          </div>
        </section>
        <br />
      </div>
      {/** --------------------- APPROVAL MODAL --------------------- **/}
      <Footer />

      <Modal
        open={openApprovalModal}
        onClose={() => setOpenApprovalModal(false)}
      >
        <ProfileApprovalForm onClose={() => setOpenApprovalModal(false)} />
      </Modal>
      <a
        href="https://wa.me/919140718421"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp"
        />
      </a>
    </div>
  );
}

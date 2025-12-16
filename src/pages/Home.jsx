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
import YouthCenter, {
  LocationLink,
  PhoneLink,
} from "../components/YouthCenter";
import SocialLink from "../components/SocialLink";
import DraggableWhatsApp from "../components/DraggableWhatsApp";

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
            <YouthCenter
              name="Vrindavan Bace"
              note="A vibrant spiritual home for youth—daily kirtans, classes, mentoring & seva opportunities."
              location="https://maps.app.goo.gl/y1KSdUnGKirjerqq9"
              contact="+919075080391"
              mail="purushgovindadas@gmail.com"
            />

            <YouthCenter
              name="Giri Govardhan Bace"
              note="Special programs for college students—weekly sessions, group discussions & retreats."
              contact="+917774032548"
              mail="srigovind.rns@gmail.com"
              location="https://maps.app.goo.gl/ygcFt7Scu8KjUu8T6"
            />

            <YouthCenter
              name="Mayapur Bace"
              note="Special programs for college students to connect, grow, and study the Gita together."
              contact="+917774048503"
              mail="vcdrns@gmail.com"
              location="https://maps.app.goo.gl/KpmwWMBxfpRdafxHA"
            />
          </div>
          <h2 className="home-section-title">Connect, Cultivate, Contribute</h2>

          <div className="youth-cards">
            {/* ---- SHLOKA ---- */}
            <div className="card footer-shloka">
              <h3 className="footer-heading">Inspiration</h3>
              “Wherever Krishna, the master of yoga, and Arjuna, the wielder of
              the bow, are present — there surely reside fortune, victory,
              prosperity and righteousness.”
            </div>

            {/* ---- CONTACT INFO ---- */}
            <div className="card">
              <h3 className="footer-heading">Contact Us</h3>
              <LocationLink
                href="https://maps.app.goo.gl/KD3chYPiY4TK7mv78"
                label="IYS ISKCON Ravet"
              />
              <br />
              <PhoneLink number="+919075080391" />
            </div>

            {/* ---- SOCIAL LINKS ---- */}
            <div className="card">
              <h3 className="footer-heading">Connect</h3>
              <SocialLink
                icon={Youtube}
                href="https://youtube.com/@iysgovinddham?si=cWnX_jBTMgBpDLGS"
                label="IYS Sri Govind Dham"
              />
              <SocialLink
                icon={Instagram}
                href="https://www.instagram.com/iys.srigovinddham"
                label="Coming Soon..."
              />
            </div>
          </div>
        </section>
        <br />
      </div>
      <a
        href="https://wa.me/919075080391"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp"
        />
      </a>
      <Footer />
      {/** --------------------- APPROVAL MODAL --------------------- **/}

      <Modal
        open={openApprovalModal}
        onClose={() => setOpenApprovalModal(false)}
      >
        <ProfileApprovalForm onClose={() => setOpenApprovalModal(false)} />
      </Modal>
    </div>
  );
}

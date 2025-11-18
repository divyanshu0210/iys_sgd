import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const { user, profile, profileStage, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      onClick={() => setIsMenuOpen(false)}
      style={{
        color: "#fff",
        textDecoration: "none",
        fontWeight: "500",
        padding: "10px 14px",
        display: "block",
        background: "transparent",
      }}
    >
      {children}
    </Link>
  );

  return (
    <nav
      style={{
        padding: "10px 24px",
        background: "#2c3e50",
        color: "#fff",
        borderBottom: "1px solid #34495e",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          className={ "logo-text"}
          style={{
            fontWeight: 700,
            fontSize: "1.4rem", // default larger size
            color: "#fff",
            textDecoration: "none",
            transition: "font-size 0.2s",
          }}
        >
          IYS <br></br>Sri Govind Dham
        </Link>

        {/* Desktop or Always-visible Menu for non-logged users */}
        <div className={`desktop-menu ${!user ? "always-visible" : ""}`}>
          <NavLink to="/">Home</NavLink>
          {user ? (
            profileStage !== "not-exists" ? (
              <>
                {(profileStage === "devotee" || profileStage === "mentor") && (
                  <NavLink to="/members">Members</NavLink>
                )}
                <NavLink to="/yatras">Yatras</NavLink>
                <NavLink to="/profile">Profile</NavLink>
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="logout-btn"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/complete-profile">Profile</NavLink>
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="logout-btn"
                >
                  Logout
                </button>
              </>
            )
          ) : (
            <>
              <NavLink to="/signin">Sign In</NavLink>
              <NavLink to="/signup">Sign Up</NavLink>
            </>
          )}
        </div>

        {/* Mobile Hamburger (only when logged in) */}
        {user && (
          <div
            className="mobile-only"
            onClick={() => setIsMenuOpen(true)}
            style={{ cursor: "pointer" }}
          >
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        )}
      </div>

      {/* Overlay & Sliding Menu */}
      {isMenuOpen && (
        <div className="overlay">
          <div className="mobile-menu" ref={menuRef}>
            <button className="close-btn" onClick={() => setIsMenuOpen(false)}>
              ✕
            </button>

            <NavLink to="/">Home</NavLink>
            {profileStage !== "not-exists" ? (
              <>
                {(profileStage === "devotee" || profileStage === "mentor") && (
                  <NavLink to="/members">Members</NavLink>
                )}
                <NavLink to="/yatras">Yatras</NavLink>
                <NavLink to="/profile">Profile</NavLink>
              </>
            ) : (
              <NavLink to="/complete-profile">Profile</NavLink>
            )}
            <button
              onClick={() => {
                logout();
                setIsMenuOpen(false);
                navigate("/");
              }}
              className="logout-btn"
            >
              Logout
            </button>
          </div>
        </div>
      )}
      <style>
        {`
    .desktop-menu {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: nowrap;
    }

    .logout-btn {
      background: #e63946;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 14px;
      cursor: pointer;
      font-weight: 600;
    }

    .mobile-only {
      display: none;
    }

    .bar {
      width: 25px;
      height: 3px;
      background-color: #fff;
      margin: 4px 0;
    }

    /* Overlay & Mobile Menu - unchanged */
    .overlay {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background: rgba(0, 0, 0, 0, 0.4);
      display: flex;
      justify-content: flex-end;
      z-index: 2000;
    }

    .mobile-menu {
      width: 260px;
      background: #2c3e50;
      height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 20px;
      gap: 10px;
      transform: translateX(0);
      animation: slideIn 0.3s ease forwards;
      box-shadow: -4px 0 12px rgba(0,0,0,0.3);
    }

    .close-btn {
      align-self: flex-end;
      background: transparent;
      border: none;
      color: #fff;
      font-size: 1.5rem;
      cursor: pointer;
      margin-bottom: 10px;
    }

    @keyframes slideIn {
      from { transform: translateX(100%); }
      to   { transform: translateX(0); }
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .desktop-menu {
        display: none;
      }

      /* When NOT logged in → show links inline, smaller */
      .desktop-menu.always-visible {
        display: flex !important;
        gap: 8px;
        font-size: 0.875rem; /* 14px */
      }

      /* Reduce logo size only when not signed in */
      .logo-text {
        font-size: 0.7rem !important;
        font-weight: 600;
      }

      /* Smaller padding on links when in always-visible mode */
      .desktop-menu.always-visible a {
        padding: 6px 10px !important;
        font-size: 0.8rem;
      }

      .mobile-only {
        display: block;
      }
    }

    @media (min-width: 769px) {
      .mobile-menu { display: none !important; }
    }
  `}
      </style>
    </nav>
  );
}

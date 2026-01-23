import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const {
    user,
    profile,
    profileStage,
    logout,
    isNavigationLocked,
    donatePage,
  } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
  const [visible, setVisible] = useState(true);
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

  // Scroll handler to hide/show navbar
  useEffect(() => {
    if (!donatePage) return;

    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos, donatePage]);

  const NavLink = ({ to, replace = false, children }) => (
    <Link
      to={to}
      replace={replace}
      onClick={(e) => {
        if (isNavigationLocked) {
          e.preventDefault();
          alert("Please complete or cancel the payment before leaving.");
        } else {
          setIsMenuOpen(false);
        }
      }}
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
      id="navbar"
      style={{
        // padding: "0px 12px",
        padding: "0px 5px 0px 5px",
        background: "#2c3e50",
        color: "#fff",
        borderBottom: "1px solid #34495e",
        position: "sticky",
        width: "100%",
        top: visible ? 0 : "-100px", // hide/show based on scroll
        zIndex: 1000,
        transition: "top 0.3s",
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
          className="logo-text"
          onClick={(e) => {
            if (isNavigationLocked) {
              e.preventDefault();
              alert("Please complete or cancel the payment before leaving.");
            }
          }}
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <img
            src="/iys_logo.png"
            alt="IYS Logo"
            style={{
              width: "clamp(33px, 5vw, 45px)",
              height: "auto",
              objectFit: "contain",
            }}
          />
          <div
            style={{
              padding: "5px",
              color: "#fff",
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              lineHeight: 1.1,
            }}
          >
            <span className="logo-main">IYS</span>

            <span
              style={{
                fontWeight: 400,
                fontSize: "clamp(0.6rem, 2.5vw, 0.75rem)",
                marginTop: "2px",
                opacity: 0.95,
              }}
            >
              Sri Govind Dham
            </span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className={`desktop-menu ${!user ? "always-visible" : ""}`}>
          <NavLink to="/donate">Donate</NavLink>
          {/* <NavLink to="/">Home</NavLink> */}
          {user ? (
            profileStage !== "not-exists" ? (
              <>
                {(profileStage === "devotee" || profileStage === "mentor") && (
                  <NavLink to="/members">Members</NavLink>
                )}
                <NavLink to="/yatras">Yatras</NavLink>
                <NavLink to="/resources">Resources</NavLink>
                <NavLink to="/profile">Profile</NavLink>
                <button
                  onClick={() => {
                    if (isNavigationLocked) {
                      alert(
                        "Please complete or cancel the payment before logging out."
                      );
                      return;
                    }
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
                    if (isNavigationLocked) {
                      alert(
                        "Please complete or cancel the payment before logging out."
                      );
                      return;
                    }
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
              <NavLink to="/resources">Resources</NavLink>
              <NavLink replace to="/signup">
                Sign Up
              </NavLink>
              <NavLink replace to="/signin">
                Sign In
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        {user && (
          <div
            style={{
              display: "flex",
              justifyContent: "right",
              alignItems: "center",
            }}
          >
            <div className="mobile-only" style={{ paddingRight: 15 }}>
              <NavLink to="/donate">Donate</NavLink>
            </div>
            <div
              className="mobile-only"
              onClick={(e) => {
                if (isNavigationLocked) {
                  e.preventDefault();
                  alert(
                    "Please complete or cancel the payment before leaving."
                  );
                } else {
                  setIsMenuOpen(true);
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Overlay Menu */}
      {isMenuOpen && (
        <div className="overlay">
          <div className="mobile-menu" ref={menuRef}>
            <button className="close-btn" onClick={() => setIsMenuOpen(false)}>
              ✕
            </button>

            {/* <NavLink to="/">Home</NavLink> */}
            {profileStage !== "not-exists" ? (
              <>
                {(profileStage === "devotee" || profileStage === "mentor") && (
                  <NavLink to="/members">Members</NavLink>
                )}
                <NavLink to="/yatras">Yatras</NavLink>
                <NavLink to="/resources">Resources</NavLink>

                <NavLink to="/profile">Profile</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/resources">Resources</NavLink>
                <NavLink to="/complete-profile">Profile</NavLink>
              </>
            )}
            <button
              onClick={() => {
                if (isNavigationLocked) {
                  alert(
                    "Please complete or cancel the payment before logging out."
                  );
                  return;
                }
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

    .logo-main {
  font-weight: 800;
  font-size: clamp(1.2rem, 4vw, 1.8rem);
  letter-spacing: clamp(0.2rem, 1.5vw, 0.6rem);
}


    @keyframes slideIn {
      from { transform: translateX(100%); }
      to   { transform: translateX(0); }
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .desktop-menu:not(.always-visible) {
    display: none;
  }


      /* When NOT logged in → show links inline, smaller */
      .desktop-menu.always-visible {
        display: flex !important;
      
         flex-wrap: nowrap;
  white-space: nowrap;
  gap: clamp(6px, 1vw, 10px);
      }

      /* Reduce logo size only when not signed in */
      .logo-text {
   flex-shrink: 0;
        font-weight: 600;
      }

#navbar > div {
  flex-wrap: nowrap;
}


      /* Smaller padding on links when in always-visible mode */
    .desktop-menu.always-visible a {
  font-size: clamp(0.75rem, 2.8vw, 0.9rem);
  padding: clamp(4px, 1vw, 8px) clamp(6px, 1.5vw, 12px) !important;
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

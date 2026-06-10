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
    setOpenApprovalModal,
  } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
  const [visible, setVisible] = useState(true);
  const menuRef = useRef();
  const dropdownRef = useRef();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef();
  const mobileNotifRef = useRef();

  // Close hamburger menu when clicking outside
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

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileDropdownOpen]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handle = (e) => {
      const inDesktop = notifRef.current && notifRef.current.contains(e.target);
      const inMobile = mobileNotifRef.current && mobileNotifRef.current.contains(e.target);
      if (!inDesktop && !inMobile) setNotifOpen(false);
    };
    if (notifOpen) document.addEventListener("mousedown", handle);
    else document.removeEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [notifOpen]);

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

  const NavLink = ({ to, replace = false, children, style: styleOverride }) => (
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
        ...styleOverride,
      }}
    >
      {children}
    </Link>
  );

  const handleLogout = () => {
    if (isNavigationLocked) {
      alert("Please complete or cancel the payment before logging out.");
      return;
    }
    logout();
    setIsMenuOpen(false);
    setProfileDropdownOpen(false);
    navigate("/");
  };

  const initials = profile?.first_name
    ? profile.first_name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "?";

  const displayName = profile?.initiated_name
    || (profile?.first_name
      ? `${profile.first_name}${profile.last_name ? " " + profile.last_name : ""}`
      : user?.email || "User");

  const photoUrl = profile?.profile_picture_url || null;

  const AvatarCircle = ({ size = 36, fontSize = 15 }) =>
    photoUrl ? (
      <img
        src={photoUrl}
        alt="Profile"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid rgba(255,255,255,0.4)",
          display: "block",
          flexShrink: 0,
        }}
      />
    ) : (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "#3b82f6",
          border: "2px solid rgba(255,255,255,0.4)",
          color: "#fff",
          fontWeight: 700,
          fontSize,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {initials}
      </div>
    );

  const ProfileAvatar = () => (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        onClick={() => setProfileDropdownOpen((v) => !v)}
        aria-label="Profile menu"
        style={{
          padding: "4px 8px 4px 4px",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 20,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <AvatarCircle size={28} fontSize={13} />
        <span style={{ color: "#fff", fontWeight: 500, fontSize: 14, whiteSpace: "nowrap" }}>
          {displayName}
        </span>
      </button>

      {profileDropdownOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 12px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)",
            padding: "6px",
            zIndex: 3000,
            minWidth: 140,
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {/* caret */}
          <div style={{
            position: "absolute",
            top: -6,
            right: 16,
            width: 12,
            height: 12,
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.06)",
            borderBottom: "none",
            borderRight: "none",
            transform: "rotate(45deg)",
          }} />
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "9px 14px",
              background: "transparent",
              color: "#dc2626",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
              whiteSpace: "nowrap",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );

  const hasNotif = user && (profileStage === "guest" || profileStage === "approval");

  return (
    <nav
      id="navbar"
      style={{
        padding: "0px 5px 0px 5px",
        background: "#2c3e50",
        color: "#fff",
        borderBottom: "1px solid #34495e",
        position: "sticky",
        width: "100%",
        top: visible ? 0 : "-100px",
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
          {user ? (
            profileStage !== "not-exists" ? (
              <>
                {(profileStage === "devotee" || profileStage === "mentor") && (
                  <NavLink to="/members">Members</NavLink>
                )}
                <NavLink to="/yatras">Yatras</NavLink>
                <NavLink to="/resources">Resources</NavLink>
                <NavLink to="/profile">Profile</NavLink>
                {hasNotif && (
                  <div ref={notifRef} style={{ position: "relative" }}>
                    <button
                      onClick={() => setNotifOpen(v => !v)}
                      aria-label="Notifications"
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        width: 36,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        flexShrink: 0,
                        padding: 0,
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                      </svg>
                      <span style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        width: 7,
                        height: 7,
                        background: "#ef4444",
                        borderRadius: "50%",
                        border: "1.5px solid #2c3e50",
                      }} />
                    </button>
                    {notifOpen && (
                      <div style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        right: 0,
                        background: "#fff",
                        borderRadius: 10,
                        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                        zIndex: 3000,
                        width: 280,
                        border: "1px solid #e5e7eb",
                        padding: "14px 16px",
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Notifications</div>
                        {profileStage === "guest" && (
                          <div style={{ borderLeft: "3px solid #f97316", paddingLeft: 10 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 4 }}>Profile Approval</div>
                            <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5, marginBottom: 10 }}>Get approved by your mentor to unlock full access.</div>
                            <button
                              onClick={() => { setNotifOpen(false); setOpenApprovalModal(true); }}
                              style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontWeight: 600, fontSize: 12 }}
                            >
                              Get Approved
                            </button>
                          </div>
                        )}
                        {profileStage === "approval" && (
                          <div style={{ borderLeft: "3px solid #f59e0b", paddingLeft: 10 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 4 }}>Pending Review</div>
                            <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>Your profile is awaiting confirmation from your mentor.</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <ProfileAvatar />
              </>
            ) : (
              <>
                <NavLink to="/complete-profile">Profile</NavLink>
                <ProfileAvatar />
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

        {/* Mobile: Donate + Hamburger (when logged in) */}
        {user && (
          <div
            style={{
              display: "flex",
              justifyContent: "right",
              alignItems: "center",
              gap: 2,
            }}
          >
            <div className="mobile-only">
              <NavLink to="/donate" style={{ padding: "10px 6px" }}>Donate</NavLink>
            </div>
            {hasNotif && (
              <div ref={mobileNotifRef} className="mobile-only" style={{ position: "relative" }}>
                <button
                  onClick={() => setNotifOpen(v => !v)}
                  aria-label="Notifications"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    padding: "0 6px",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  <span style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 7,
                    height: 7,
                    background: "#ef4444",
                    borderRadius: "50%",
                    border: "1.5px solid #2c3e50",
                  }} />
                </button>
                {notifOpen && (
                  <div style={{
                    position: "fixed",
                    top: 56,
                    right: 10,
                    background: "#fff",
                    borderRadius: 10,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                    zIndex: 3000,
                    width: 280,
                    maxWidth: "calc(100vw - 20px)",
                    border: "1px solid #e5e7eb",
                    padding: "14px 16px",
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Notifications</div>
                    {profileStage === "guest" && (
                      <div style={{ borderLeft: "3px solid #f97316", paddingLeft: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 4 }}>Profile Approval</div>
                        <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5, marginBottom: 10 }}>Get approved by your mentor to unlock full access.</div>
                        <button
                          onClick={() => { setNotifOpen(false); setOpenApprovalModal(true); }}
                          style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontWeight: 600, fontSize: 12 }}
                        >
                          Get Approved
                        </button>
                      </div>
                    )}
                    {profileStage === "approval" && (
                      <div style={{ borderLeft: "3px solid #f59e0b", paddingLeft: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 4 }}>Pending Review</div>
                        <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>Your profile is awaiting confirmation from your mentor.</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
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
              style={{ cursor: "pointer", padding: "0 6px" }}
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

            {/* Profile header in mobile menu */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "4px 0 16px 0",
                borderBottom: "1px solid rgba(255,255,255,0.15)",
                marginBottom: 4,
              }}
            >
              <AvatarCircle size={38} fontSize={16} />
              <span
                style={{
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 15,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {displayName}
              </span>
            </div>

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
            <button onClick={handleLogout} className="logout-btn">
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

    .overlay {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background: rgba(0, 0, 0, 0.4);
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

    @media (max-width: 768px) {
      .desktop-menu:not(.always-visible) {
        display: none;
      }

      .desktop-menu.always-visible {
        display: flex !important;
        flex-wrap: nowrap;
        white-space: nowrap;
        gap: clamp(6px, 1vw, 10px);
      }

      .logo-text {
        flex-shrink: 0;
        font-weight: 600;
      }

      #navbar > div {
        flex-wrap: nowrap;
      }

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

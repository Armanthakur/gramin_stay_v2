import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import api from "../api";
import { useAuth } from "../AuthContext";

// Component for the navigation bar
export default function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Effect to handle scroll-based styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effect to handle clicking outside the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);


  // Function to handle user logout
  const handleLogout = async () => {
    try {
      await api.post("/logout", {}, { withCredentials: true });
      setUser(null);
      setShowDropdown(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <style>{navbarStyles}</style>
      <nav 
        style={{
          ...styles.navbar,
          // UPDATED: Dynamic background and shadow for the new theme
          background: scrolled ? 'rgba(255, 255, 255, 0.85)' : 'rgb(255, 255, 255)',
          boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.2)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.05)',
          padding: scrolled ? '0.5rem 2.5rem' : '0.75rem 2.5rem',
        }}
      >
        <div style={styles.left} onClick={() => navigate("/")}>
          <img
            src="/logo.png"
            alt="Gramin Stay Logo"
            style={styles.logo}
            className="logo"
          />
          <span style={styles.brand}>GraminStay</span>
        </div>
        <div style={styles.right}>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }} ref={dropdownRef}>
              {user.ownerId && (
                <button
                  style={styles.myHomestayBtn}
                  className="my-homestay-btn nav-button"
                  onClick={() => navigate(`/dashboard/${user.ownerId}`)}
                >
                  My Homestay
                </button>
              )}
              <img
                src={user.photoURL || "/profilelogo.png"}
                alt="Profile"
                style={styles.profileIcon}
                className="profile-icon"
                onClick={() => setShowDropdown((prev) => !prev)}
                onError={e => { e.target.onerror = null; e.target.src = "/profilelogo.png"; }}
              />
              {showDropdown && (
                <div style={styles.dropdown} className="dropdown">
                  <div style={{ padding: "0.8rem 1.3rem", fontWeight: 600, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    {user.name || user.username || "Profile"}
                  </div>
                  <button
                    style={styles.logoutBtn}
                    className="logout-btn"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/user-login" className="find-near-me" style={{ marginTop: 0 , textDecoration: 'none'}}>
                For Users
              </Link>
              <Link to="/login?redirect=/homestayform" className="find-near-me" style={{ marginTop: 0, marginLeft: '1rem', textDecoration: 'none' }}>
                For Owners
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

// Inline styles object - REVAMPED for the new theme
const styles = {
  navbar: {
    width: "100%",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: "all 0.35s ease-in-out",
    backdropFilter: 'blur(16px)',
    webkitBackdropFilter: 'blur(16px)', // For Safari
  },
  left: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    gap: "0.8rem",
  },
  logo: {
    height: "48px",
    width: "48px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid var(--primary-color,rgba(0, 207, 0, 0.553))",
  },
  brand: {
    fontSize: "1.6rem",
    fontWeight: 700,
    color: "var(--text-light,rgb(0, 0, 0))",
    userSelect: "none",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  button: {
    padding: "0.7rem 1.5rem",
    borderRadius: "8px",
    border: "1px solid transparent",
    background: "var(--primary-color, #007BFF)",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.95rem",
    textDecoration: "none",
    cursor: "pointer",
    display: "inline-block",
  },
  ownerButton: {
    background: 'transparent',
    border: '1px solid var(--primary-color, #007BFF)',
    color: 'var(--primary-color, #007BFF)',
  },
  profileIcon: {
    height: "44px",
    width: "44px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid var(--primary-color, #007BFF)",
    cursor: "pointer",
    background: "#fff",
  },
  dropdown: {
    position: "absolute",
    top: "120%",
    right: 0,
    background: "rgba(44, 44, 44, 0.9)", // Lighter dark bg
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "12px",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
    minWidth: "200px",
    zIndex: 1001,
    overflow: "hidden",
    backdropFilter: "blur(20px)",
    webkitBackdropFilter: "blur(20px)",
    color: 'var(--text-light, #F5F5F5)',
  },
  logoutBtn: {
    width: "100%",
    background: "none",
    border: "none",
    color: "var(--danger-color, #FF4136)",
    fontWeight: 600,
    padding: "0.8rem 1.3rem",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  myHomestayBtn: {
    padding: "0.7rem 1.5rem",
    borderRadius: "8px",
    border: "none",
    background: "var(--primary-color, #007BFF)",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.95rem",
    cursor: "pointer",
  },
};

// REVAMPED: String containing new CSS for hover effects and animations
const navbarStyles = `
  .nav-button {
    transition: all 0.3s ease;
    box-shadow: 0 0 0px rgba(0, 123, 255, 0); /* Start with no shadow */
  }
  /* NEW: Aurora glow effect on hover */
  .nav-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 15px 3px rgba(0, 123, 255, 0.4);
  }
  .nav-button:active {
    transform: translateY(0px);
    box-shadow: 0 0 5px 1px rgba(0, 123, 255, 0.3);
  }
  .profile-icon {
    transition: transform 0.3s ease;
    animation: pulse 2.5s infinite cubic-bezier(0.4, 0, 0.6, 1);
  }
  .profile-icon:hover {
    transform: scale(1.1);
    animation-play-state: paused; /* Pause pulsing on hover */
  }
  .logo {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .logo:hover {
    transform: rotate(10deg);
  }
  .dropdown {
    /* UPDATED: Smoother slide-down animation */
    animation: dropdown-fade-in 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }
  @keyframes dropdown-fade-in {
    from {
      opacity: 0;
      transform: translateY(-15px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  .logout-btn {
    transition: background-color 0.2s ease, padding-left 0.3s ease;
  }
  .logout-btn:hover {
    /* NEW: More subtle hover for dark theme */
    background-color: rgba(255, 65, 54, 0.15) !important;
    padding-left: 1.6rem; /* Nudge text to the right */
  }
  /* NEW: Keyframes for the profile icon pulse effect */
  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.4);
    }
    50% {
      box-shadow: 0 0 0 6px rgba(0, 123, 255, 0);
    }
  }
`;
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api";
import { useAuth } from "../AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await api.post("/logout", {}, { withCredentials: true });
    setUser(null);
    setShowDropdown(false);
    navigate("/");
    
    // Show toast notification
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.textContent = 'Logged out successfully';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  return (
    <nav style={{
      ...styles.navbar,
      background: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)',
      boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none',
      backdropFilter: 'blur(10px)',
      padding: scrolled ? '0.25rem 2.5rem' : '0.35rem 2.5rem',
    }}>
      <div style={styles.left} onClick={() => navigate("/")}> 
        <img src="/logo.png" alt="Gramin Stay Logo" style={styles.logo} />
        <span style={styles.brand}>GraminStay</span>
      </div>
      <div style={styles.right}>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
            <img
              src={user.photoURL || "/profilelogo.png"}
              alt="Profile"
              style={styles.profileIcon}
              onClick={() => setShowDropdown((v) => !v)}
              onError={e => { e.target.onerror = null; e.target.src = "/profilelogo.png"; }}
            />
            {/* Show 'My Homestay' button if ownerId is present */}
            {user.ownerId && (
              <button
                style={styles.myHomestayBtn}
                onClick={() => navigate(`/dashboard/${user.ownerId}`)}
              >
                My Homestay
              </button>
            )}
            {showDropdown && (
              <div style={styles.dropdown}>
                <div style={{ padding: "0.7rem 1.2rem", fontWeight: 600 }}>{user.name || user.username || "Profile"}</div>
                <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/user-login" style={styles.button}>
              For Users
            </Link>
            <Link
              to="/login?redirect=/homestayform"
              style={{
                ...styles.button,
                background: "var(--primary)",
                color: "#fff",
                marginLeft: "1rem",
              }}
            >
              For Owners
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    width: "100%",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.35rem 2.5rem",
    transition: "all 0.3s ease",
  },
  left: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    gap: "0.7rem",
    textDecoration: "none",
  },
  logo: {
    height: "44px",
    width: "44px",
    borderRadius: "50%",
    objectFit: "cover",
    background: "#fff",
    border: "2px solid var(--primary)",
    transition: "transform 0.3s ease",
    '&:hover': {
      transform: "scale(1.05)",
    }
  },
  brand: {
    fontSize: "1.45rem",
    fontWeight: 700,
    color: "var(--dark)",
    letterSpacing: "1px",
    userSelect: "none",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "1.2rem",
  },
  button: {
    padding: "0.5rem 1.2rem",
    borderRadius: "8px",
    border: "none",
    background: "rgba(42, 157, 143, 0.08)",
    color: "var(--primary)",
    fontWeight: 600,
    fontSize: "1rem",
    textDecoration: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    '&:hover': {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(42, 157, 143, 0.2)",
    }
  },
  profileIcon: {
    height: "40px",
    width: "40px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid var(--primary)",
    cursor: "pointer",
    background: "#fff",
    transition: "transform 0.3s ease",
    '&:hover': {
      transform: "scale(1.05)",
    }
  },
  dropdown: {
    position: "absolute",
    top: "110%",
    right: 0,
    background: "#fff",
    border: "1px solid var(--light-gray)",
    borderRadius: "10px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
    minWidth: "160px",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    animation: "fadeIn 0.2s ease",
    overflow: "hidden",
  },
  logoutBtn: {
    width: "100%",
    background: "none",
    border: "none",
    color: "var(--danger)",
    fontWeight: 600,
    padding: "0.7rem 1.2rem",
    textAlign: "left",
    cursor: "pointer",
    borderTop: "1px solid var(--light-gray)",
    borderRadius: 0,
    transition: "background 0.2s ease",
    '&:hover': {
      background: "rgba(231, 111, 81, 0.1)",
    }
  },
  myHomestayBtn: {
    marginLeft: 10,
    padding: "0.5rem 1.1rem",
    borderRadius: "8px",
    border: "none",
    background: "var(--primary)",
    color: "#fff",
    fontWeight: 600,
    fontSize: "1rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    '&:hover': {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(42, 157, 143, 0.2)",
      background: "var(--primary-dark)",
    }
  },
};
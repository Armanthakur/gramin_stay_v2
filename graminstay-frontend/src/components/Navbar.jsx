import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Check session-based login status
    api.get("/me", { withCredentials: true })
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await api.post("/logout", {}, { withCredentials: true });
    setUser(null);
    setShowDropdown(false);
    navigate("/");
  };

  return (
    <nav style={styles.navbar}>
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
              Login
            </Link>
            <Link
              to="/login?redirect=/homestayform"
              style={{
                ...styles.button,
                background: "#4e7c50",
                color: "#fff",
                marginLeft: "1rem",
              }}
            >
              List your property
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
    background: "#fff", // solid white background
    // Remove or comment out the backdropFilter line
    // backdropFilter: "blur(6px)",
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
    border: "2px solid #4e7c50",
  },
  brand: {
    fontSize: "1.45rem",
    fontWeight: 700,
    color: "#2d4739",
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
    background: "rgba(78,124,80,0.08)",
    color: "#4e7c50",
    fontWeight: 600,
    fontSize: "1rem",
    textDecoration: "none",
    cursor: "pointer",
    transition: "background 0.2s, color 0.2s",
  },
  profileIcon: {
    height: "40px",
    width: "40px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #4e7c50",
    cursor: "pointer",
    background: "#fff",
  },
  dropdown: {
    position: "absolute",
    top: "110%",
    right: 0,
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "10px",
    boxShadow: "0 4px 16px rgba(60, 98, 85, 0.13)",
    minWidth: "160px",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  logoutBtn: {
    width: "100%",
    background: "none",
    border: "none",
    color: "#d32f2f",
    fontWeight: 600,
    padding: "0.7rem 1.2rem",
    textAlign: "left",
    cursor: "pointer",
    borderTop: "1px solid #eee",
    borderRadius: 0,
  },
  myHomestayBtn: {
    marginLeft: 10,
    padding: "0.5rem 1.1rem",
    borderRadius: "8px",
    border: "none",
    background: "#4e7c50",
    color: "#fff",
    fontWeight: 600,
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background 0.2s, color 0.2s",
  },
};
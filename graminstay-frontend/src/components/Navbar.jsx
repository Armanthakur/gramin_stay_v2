import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav style={styles.navbar}>
      <div style={styles.left} onClick={() => navigate("/")}>
        <img src="/logo.png" alt="Gramin Stay Logo" style={styles.logo} />
        <span style={styles.brand}>GraminStay</span>
      </div>
      <div style={styles.right}>
        <Link to="/user-login" style={styles.button}>
          Login
        </Link>
        <Link
          to="/login"
          style={{
            ...styles.button,
            background: "#4e7c50",
            color: "#fff",
            marginLeft: "1rem",
          }}
        >
          List your property
        </Link>
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
};
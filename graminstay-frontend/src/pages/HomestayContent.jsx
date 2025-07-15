import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import api from "../api";

export default function HomestayContent() {
  const { homestayId } = useParams();
  const [homestay, setHomestay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [mainPhoto, setMainPhoto] = useState(null);

  useEffect(() => {
    const fetchHomestay = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/homestay/details/${homestayId}`);
        setHomestay(res.data);
        setMainPhoto(res.data.photos && res.data.photos.length > 0 ? res.data.photos[0] : null);
      } catch {
        setHomestay(null);
      }
      setLoading(false);
    };
    fetchHomestay();
  }, [homestayId]);

  if (loading) return <div style={{ padding: "2rem" }}>Loading...</div>;
  if (!homestay) return <div style={{ padding: "2rem" }}>Homestay not found.</div>;

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        {mainPhoto ? (
          <div style={styles.gallery}>
            <img
              src={mainPhoto}
              alt="Main"
              style={styles.mainPhoto}
            />
            {homestay.photos && homestay.photos.length > 1 && (
              <div style={styles.thumbnailRow}>
                {homestay.photos.map((photo, idx) => (
                  <img
                    key={idx}
                    src={photo}
                    alt={`Thumbnail ${idx + 1}`}
                    style={{
                      ...styles.thumbnail,
                      border: mainPhoto === photo ? "2px solid #3a6141" : "2px solid transparent",
                    }}
                    onClick={() => setMainPhoto(photo)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={styles.noPhoto}>No photos available</div>
        )}
      </div>
      <div style={styles.right}>
        <h2 style={styles.title}>{homestay.name}</h2>
        <p style={styles.location}>
          <i className="fa-solid fa-location-dot" style={{ color: "#3a6141", marginRight: 6 }}></i>
          {homestay.location}
        </p>
        <div style={styles.infoRow}>
          <span style={styles.price}>₹{homestay.pricePerRoom} <span style={{ color: "#888", fontWeight: 400, fontSize: "1rem" }}>/room</span></span>
          <span style={styles.rooms}>Rooms: <b>{homestay.numRooms}</b></span>
        </div>
        <p style={styles.description}>
          <b>Description:</b> {homestay.description || <span style={{ color: "#aaa" }}>No description provided.</span>}
        </p>
        <div style={styles.calendarBox}>
          <b style={{ fontSize: "1.1rem" }}>Booking Calendar</b>
          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}>
            <Calendar
              onChange={setDate}
              value={date}
              minDate={new Date()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexWrap: "wrap",
    gap: "2.5rem",
    padding: "2.5rem",
    background: "#f8faf8",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  left: {
    flex: 1.2,
    minWidth: "340px",
    maxWidth: "600px",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  right: {
    flex: 1,
    minWidth: "320px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 4px 18px rgba(60, 98, 85, 0.10)",
    padding: "2.5rem 2.5rem 2rem 2.5rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    maxWidth: "500px",
  },
  gallery: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  mainPhoto: {
    width: "100%",
    maxWidth: "480px",
    height: "320px",
    objectFit: "cover",
    borderRadius: "14px",
    boxShadow: "0 2px 12px rgba(60, 98, 85, 0.13)",
    marginBottom: "1rem",
    background: "#eee",
  },
  thumbnailRow: {
    display: "flex",
    gap: "10px",
    marginTop: "0.5rem",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  thumbnail: {
    width: "60px",
    height: "60px",
    objectFit: "cover",
    borderRadius: "7px",
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(60, 98, 85, 0.10)",
    transition: "border 0.2s",
    background: "#eee",
  },
  noPhoto: {
    width: "100%",
    height: "320px",
    background: "#eee",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#888",
    fontSize: "1.1rem",
  },
  title: {
    color: "#3a6141",
    marginBottom: "1rem",
    fontWeight: 700,
    fontSize: "2rem",
    letterSpacing: "0.5px",
  },
  location: {
    fontSize: "1.1rem",
    marginBottom: "1.2rem",
    color: "#4e7c50",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
  },
  infoRow: {
    display: "flex",
    gap: "2.5rem",
    marginBottom: "1.2rem",
    fontSize: "1.08rem",
    alignItems: "center",
  },
  price: {
    color: "#2d4739",
    fontWeight: 600,
    fontSize: "1.15rem",
  },
  rooms: {
    color: "#6b7c6a",
    fontWeight: 500,
    fontSize: "1.08rem",
  },
  description: {
    color: "#444",
    fontSize: "1.08rem",
    marginBottom: "2rem",
    marginTop: 0,
    lineHeight: 1.6,
  },
  calendarBox: {
    marginTop: "auto",
    background: "#f5f5f5",
    borderRadius: "10px",
    padding: "1.2rem",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 1px 6px rgba(60, 98, 85, 0.07)",
  },
};
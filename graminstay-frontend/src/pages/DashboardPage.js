import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import HomestayForm from "../components/HomestayForm";

export default function DashboardPage() {
  const { ownerId } = useParams();
  const [homestay, setHomestay] = useState(null);
  const [editing, setEditing] = useState(false);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchHomestay = async () => {
      try {
        const res = await api.get(`/homestay/${ownerId}`);
        if (res.data && res.data._id) {
          setHomestay(res.data);
        }
      } catch (error) {
        console.error("Error fetching homestay", error);
      }
    };
    fetchHomestay();
  }, [ownerId]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (homestay && homestay._id) {
        try {
          const res = await api.get(`/bookings/homestay/${homestay._id}`);
          setBookings(res.data.bookings || []);
        } catch (error) {
          setBookings([]);
        }
      }
    };
    fetchBookings();
  }, [homestay]);

  const handleSave = async (formData) => {
    try {
      formData.append("ownerId", ownerId);
      if (homestay) {
        const res = await api.put(`/homestay/${ownerId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setHomestay(res.data.homestay);
        setEditing(false);
        alert("Homestay updated");
      } else {
        const res = await api.post(`/homestay`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setHomestay(res.data.homestay);
        setEditing(false);
        alert("Homestay added");
      }
    } catch (error) {
      console.error("Error saving homestay", error);
      alert("Failed to save homestay");
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.formContainer}>
        <h2 style={styles.heading}>Add / Edit Homestay</h2>
        {(!homestay || editing) ? (
          <HomestayForm initialData={homestay || {}} onSave={handleSave} ownerId={ownerId} />
        ) : (
          <div style={{ display: "flex", gap: 32 }}>
            <div style={styles.previewContainer}>
              <h3 style={{ marginBottom: "1rem" }}>Preview</h3>
              <h4>{homestay.name}</h4>
              <p><strong>Location:</strong> {homestay.location}</p>
              <p><strong>Description:</strong> {homestay.description}</p>
              <p><strong>Rooms:</strong> {homestay.numRooms}</p>
              <p><strong>Price per Room:</strong> ₹{homestay.pricePerRoom}</p>
              {homestay.photos && homestay.photos.length > 0 && (
                <div style={styles.photoGrid}>
                  {homestay.photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`Homestay ${idx + 1}`}
                      style={styles.photo}
                    />
                  ))}
                </div>
              )}
              <button style={{ marginTop: 16, padding: '0.5rem 1.2rem', borderRadius: 8, border: 'none', background: '#4e7c50', color: '#fff', fontWeight: 600, cursor: 'pointer' }} onClick={() => setEditing(true)}>
                Edit Homestay
              </button>
            </div>
            {/* Bookings List */}
            <div style={styles.bookingsContainer}>
              <h3 style={{ marginBottom: 12, color: '#3a6141' }}>Bookings</h3>
              {bookings.length === 0 ? (
                <div style={{ color: '#888' }}>No bookings yet.</div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {bookings.map((booking, idx) => (
                    <li key={booking._id || idx} style={{ marginBottom: 12, background: '#f5f5f5', borderRadius: 8, padding: '0.7rem 1rem', boxShadow: '0 1px 6px rgba(60, 98, 85, 0.07)' }}>
                      <div><b>From:</b> {new Date(booking.fromDate).toLocaleDateString()}</div>
                      <div><b>To:</b> {new Date(booking.toDate).toLocaleDateString()}</div>
                      <div><b>User:</b> {booking.userId}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: "flex",
    gap: "2rem",
    padding: "2rem",
    flexWrap: "wrap",
  },
  formContainer: {
    flex: 1,
    minWidth: "300px",
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
  },
  previewContainer: {
    flex: 1,
    minWidth: "300px",
    background: "#f9f9f9",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
  },
  bookingsContainer: {
    flex: 1,
    minWidth: "260px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(60, 98, 85, 0.09)",
    padding: "1.5rem 1.2rem",
    marginLeft: 16,
    alignSelf: 'flex-start',
    maxHeight: 420,
    overflowY: 'auto',
  },
  heading: {
    marginBottom: "1rem",
    color: "#4e7c50",
  },
  photoGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "1rem",
  },
  photo: {
    width: "100px",
    height: "100px",
    objectFit: "cover",
    borderRadius: "8px",
  },
};

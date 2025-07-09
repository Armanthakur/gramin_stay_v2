import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import HomestayForm from "../components/HomestayForm";

export default function DashboardPage() {
  const { ownerId } = useParams();
  const [homestay, setHomestay] = useState(null);

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

  const handleSave = async (formData) => {
  try {
    // Add ownerId to formData
    formData.append("ownerId", ownerId);

    if (homestay) {
      const res = await api.put(`/homestay/${ownerId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setHomestay(res.data.homestay);
      alert("Homestay updated");
    } else {
      const res = await api.post(`/homestay`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setHomestay(res.data.homestay);
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
        <HomestayForm initialData={homestay || {}} onSave={handleSave} ownerId={ownerId} />
      </div>

      {homestay && (
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
        </div>
      )}
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

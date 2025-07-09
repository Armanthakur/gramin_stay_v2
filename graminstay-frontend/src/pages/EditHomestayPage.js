import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import HomestayForm from "../components/HomestayForm";

export default function EditHomestayPage() {
  const { ownerId } = useParams();
  const [homestay, setHomestay] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomestay = async () => {
      try {
        const res = await api.get(`/homestay/${ownerId}`);
        if (res.data && res.data._id) {
          setHomestay(res.data);
        } else {
          alert("No homestay found");
          navigate(`/dashboard/${ownerId}`);
        }
      } catch (error) {
        console.error("Error fetching homestay", error);
        alert("Failed to load homestay");
        navigate(`/dashboard/${ownerId}`);
      }
    };
    fetchHomestay();
  }, [ownerId, navigate]);

  const handleSave = async (data) => {
    try {
      const res = await api.put(`/homestay/${ownerId}`, data);
      setHomestay(res.data.homestay);
      alert("Homestay updated successfully!");
      navigate(`/dashboard/${ownerId}`);
    } catch (error) {
      console.error("Error updating homestay", error);
      alert("Failed to update homestay");
    }
  };

  if (!homestay) return <div style={{ padding: "2rem" }}>Loading...</div>;

  return (
    <div style={styles.pageContainer}>
      <div style={styles.formContainer}>
        <h2 style={styles.heading}>Edit Homestay</h2>
        <HomestayForm initialData={homestay} onSave={handleSave} />
      </div>
      <div style={styles.previewContainer}>
        <h3>Current Preview</h3>
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

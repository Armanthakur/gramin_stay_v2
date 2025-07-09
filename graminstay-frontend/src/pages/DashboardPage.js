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
      if (homestay) {
        const res = await api.put(`/homestay/${ownerId}`, formData);
        setHomestay(res.data.homestay);
        alert("Homestay updated");
      } else {
        formData.append("ownerId", ownerId);
        const res = await api.post(`/homestay`, formData);
        setHomestay(res.data.homestay);
        alert("Homestay added");
      }
    } catch (error) {
      console.error("Error saving homestay", error);
      alert("Failed to save homestay");
    }
  };

  return (
    <div style={{ padding: "2rem", display: "flex", gap: "2rem" }}>
      <div style={{ flex: 1 }}>
        <h2>Dashboard</h2>
        <HomestayForm initialData={homestay || {}} onSave={handleSave} />
      </div>

      {homestay && (
        <div
          style={{
            flex: 1,
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            maxWidth: "500px",
          }}
        >
          <h3>{homestay.name}</h3>
          <p><strong>Location:</strong> {homestay.location}</p>
          <p><strong>Description:</strong> {homestay.description}</p>
          <p><strong>Rooms:</strong> {homestay.numRooms}</p>
          <p><strong>Price per Room:</strong> ₹{homestay.pricePerRoom}</p>
          {homestay.photos && homestay.photos.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {homestay.photos.map((photo, idx) => (
                <img
                  key={idx}
                  src={photo}
                  alt={`Homestay ${idx + 1}`}
                  style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "4px" }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

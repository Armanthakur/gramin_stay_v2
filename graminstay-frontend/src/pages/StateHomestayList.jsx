import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";

export default function StateHomestayList() {
  const { stateName } = useParams();
  const [homestays, setHomestays] = useState([]);

  useEffect(() => {
    const fetchHomestays = async () => {
      try {
        const res = await api.get(`/homestays/location/${stateName}`);
        setHomestays(res.data);
      } catch (error) {
        console.error("Error fetching homestays by state", error);
      }
    };

    fetchHomestays();
  }, [stateName]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Homestays in {stateName}</h2>
      {homestays.length === 0 ? (
        <p>No homestays found.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {homestays.map((homestay) => (
            <div
              key={homestay._id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "1rem",
                width: "250px",
              }}
            >
              <h3>{homestay.name}</h3>
              <p><strong>Location:</strong> {homestay.location}</p>
              <p><strong>Price:</strong> ₹{homestay.pricePerRoom}</p>
              {homestay.photos && homestay.photos.length > 0 && (
                <img
                  src={homestay.photos[0]}
                  alt={homestay.name}
                  style={{ width: "100%", borderRadius: "4px", objectFit: "cover" }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function CityHomestayList() {
  const { cityName } = useParams();
  const [homestays, setHomestays] = useState([]);

  useEffect(() => {
    const fetchHomestays = async () => {
      try {
        // Use correct API route
        const res = await api.get(`/homestays/location/${cityName}`);
        setHomestays(res.data);
      } catch (error) {
        console.error("Error fetching homestays", error);
      }
    };
    fetchHomestays();
  }, [cityName]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Homestays in {cityName}</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {homestays.map((homestay) => (
          <div
            key={homestay._id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              overflow: "hidden",
              width: "250px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {homestay.photos?.length > 0 && (
              <img
                src={homestay.photos[0]}
                alt={homestay.name}
                style={{ width: "100%", height: "160px", objectFit: "cover" }}
              />
            )}
            <div style={{ padding: "1rem" }}>
              <h3>{homestay.name}</h3>
              <p>₹{homestay.pricePerRoom} per room</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

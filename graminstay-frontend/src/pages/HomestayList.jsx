import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import api from "../api";
import "./HomestayList.css";

export default function HomestayList() {
  const { stateName, cityName } = useParams();
  const location = useLocation();
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get lat/lng from query params
  const query = new URLSearchParams(location.search);
  const lat = query.get("lat");
  const lng = query.get("lng");

  useEffect(() => {
    const fetchHomestays = async () => {
      setLoading(true);
      try {
        let res;
        if (lat && lng) {
          res = await api.get(`/homestays/nearby?lat=${lat}&lng=${lng}`);
        } else if (cityName) {
          res = await api.get(`/homestays/location/${cityName}`);
        } else if (stateName) {
          res = await api.get(`/homestays/location/${stateName}`);
        } else {
          res = { data: [] };
        }
        setHomestays(res.data);
      } catch {
        setHomestays([]);
      }
      setLoading(false);
    };
    fetchHomestays();
  }, [stateName, cityName, lat, lng]);

  return (
    <div className="homestay-page">
      <h2 style={{ color: "#fff", marginBottom: "2rem", fontWeight: 700, letterSpacing: "1px" }}>
        {lat && lng
          ? "Homestays Near You"
          : cityName
          ? `Homestays in ${cityName}`
          : stateName
          ? `Homestays in ${stateName}`
          : "Homestays"}
      </h2>
      {loading ? (
        <p>Loading...</p>
      ) : homestays.length === 0 ? (
        <p>No homestays found.</p>
      ) : (
        <div className="homestay-grid">
          {homestays.map((homestay, idx) => (
            <Link
              to={`/homestay/${homestay._id}`}
              className="homestay-card-link"
              key={homestay._id}
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="homestay-card">
                {homestay.photos && homestay.photos.length > 0 && (
                  <img
                    src={homestay.photos[0]}
                    alt={homestay.name}
                  />
                )}
                <div style={{ padding: "1.1rem 1.2rem", flex: 1 }}>
                  <h3>{homestay.name}</h3>
                  <p style={{ color: "#3a6141", fontWeight: 500 }}>
                    <i className="fa-solid fa-location-dot" style={{ marginRight: 6 }}></i>
                    {homestay.location}
                  </p>
                  <p style={{ color: "#4e7c50", fontWeight: 600 }}>
                    ₹{homestay.pricePerRoom} <span style={{ color: "#888", fontWeight: 400 }}>/room</span>
                  </p>
                  <p style={{ color: "#888", fontSize: "0.97rem", minHeight: "38px" }}>
                    {homestay.description
                      ? homestay.description.length > 60
                        ? homestay.description.slice(0, 60) + "..."
                        : homestay.description
                      : ""}
                  </p>
                  <p style={{ color: "#b1b1b1", fontSize: "0.9rem" }}>
                    Rooms: <b>{homestay.numRooms}</b>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

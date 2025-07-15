import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// import api from "../api";
import "./SearchBar.css";

export default function SearchBar() {
  const [searchValue, setSearchValue] = useState("");
  const [filteredStates, setFilteredStates] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [data, setData] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetch("/search/state.json")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Error loading data", err));
  }, []);

  useEffect(() => {
    if (searchValue.length === 0) {
      setFilteredStates([]);
      setFilteredCities([]);
      setShowSuggestions(false);
      return;
    }

    const matchedStates = data
      .filter((item) =>
        item.state.toLowerCase().includes(searchValue.toLowerCase())
      )
      .map((item) => item.state);

    let matchedCities = [];
    data.forEach((item) => {
      const cities = item.cities.filter((city) =>
        city.toLowerCase().includes(searchValue.toLowerCase())
      );
      matchedCities.push(...cities);
    });

    setFilteredStates(matchedStates);
    setFilteredCities(matchedCities);
    setShowSuggestions(true);
  }, [searchValue, data]);

  const handleFindNearMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        navigate(`/homestays/nearby?lat=${lat}&lng=${lng}`);
      },
      () => {
        alert("Unable to retrieve your location.");
      }
    );
  };

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Go somewhere you've never been"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        autoComplete="off"
      />
      <div className="search-icon">
        <i className="fa-solid fa-magnifying-glass"></i>
      </div>

      {showSuggestions && (
        <div className="suggestions-wrap">
          <ul>
            {filteredStates.map((state, idx) => (
              <li key={`state-${idx}`}>
                <Link
                  to={`/state/${encodeURIComponent(state)}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {state}
                </Link>
              </li>
            ))}
            {filteredCities.map((city, idx) => (
              <li key={`city-${idx}`}>
                <Link
                  to={`/city/${encodeURIComponent(city)}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {city}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Removed the List your property link from the bottom left */}

      <button
        type="button"
        style={{
          marginTop: "1.5rem",
          background: "#3a6141",
          color: "#fff",
          padding: "0.8rem 1.5rem",
          border: "none",
          borderRadius: "8px",
          fontSize: "1rem",
          cursor: "pointer",
        }}
        onClick={handleFindNearMe}
      >
        Find Near Me
      </button>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SearchBar.css";
import searchData from "../data/state.json";

export default function SearchBar() {
  const [searchValue, setSearchValue] = useState("");
  const [filteredStates, setFilteredStates] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (searchValue.length === 0) {
      setFilteredStates([]);
      setFilteredCities([]);
      setShowSuggestions(false);
      return;
    }

    // Use the imported searchData directly for simplicity
    const matchedStates = searchData
      .filter((item) =>
        item.state.toLowerCase().includes(searchValue.toLowerCase())
      )
      .map((item) => item.state);

    let matchedCities = [];
    searchData.forEach((item) => {
      const cities = item.cities.filter((city) =>
        city.toLowerCase().includes(searchValue.toLowerCase())
      );
      matchedCities.push(...cities);
    });

    setFilteredStates(matchedStates);
    setFilteredCities(matchedCities);
    setShowSuggestions(true);
  }, [searchValue]); // Removed 'data' dependency

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
    <div className="search-container page-container">
      <h1 className="search-title">Find your next stay</h1>

      {/* ✅ The search input AND suggestions now live inside this wrapper */}
      <div className="search-wrapper">
        <input
          type="text"
          placeholder="Go somewhere you've never been"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          autoComplete="off"
        />

        {/* ✅ MOVED THIS BLOCK INSIDE THE WRAPPER */}
        {showSuggestions && (
          <div className="suggestions-wrap">
            <ul>
              {filteredStates.map((state, idx) => (
                <li key={`state-${idx}`}>
                  <Link
                    to={`/state/${encodeURIComponent(state)}`}
                    style={{ textDecoration: "none", color: "inherit", display: "block" }}
                  >
                    {state}
                  </Link>
                </li>
              ))}
              {filteredCities.map((city, idx) => (
                <li key={`city-${idx}`}>
                  <Link
                    to={`/city/${encodeURIComponent(city)}`}
                    style={{ textDecoration: "none", color: "inherit", display: "block" }}
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button className="find-near-me" onClick={handleFindNearMe}>
        <i className="fa-solid fa-location-arrow"></i>
        Find Near Me
      </button>
    </div>
  );
}
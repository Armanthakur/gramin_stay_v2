import { useState } from "react";

export default function HomestayForm({ initialData = {}, onSave, ownerId }) {
  const [name, setName] = useState(initialData.name || "");
  const [photos, setPhotos] = useState([]);
  const [previewUrls, setPreviewUrls] = useState(initialData.photos || []);
  const [numRooms, setNumRooms] = useState(initialData.numRooms || "");
  const [pricePerRoom, setPricePerRoom] = useState(
    initialData.pricePerRoom || ""
  );
  const [location, setLocation] = useState(initialData.location || "");
  const [latitude, setLatitude] = useState(initialData.latitude || "");
  const [longitude, setLongitude] = useState(initialData.longitude || "");
  const [description, setDescription] = useState(initialData.description || "");

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);

    // Generate preview URLs
    const fileReaders = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(fileReaders).then((results) => {
      setPreviewUrls(results);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("numRooms", numRooms);
    formData.append("pricePerRoom", pricePerRoom);
    formData.append("location", location);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append("description", description);
    formData.append("ownerId", ownerId);

    for (let i = 0; i < photos.length; i++) {
      formData.append("photos", photos[i]);
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h2 style={headingStyle}>Homestay Details</h2>
      <input
        type="text"
        placeholder="Homestay Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inputStyle}
      />
      <input
        type="number"
        placeholder="Number of Rooms"
        value={numRooms}
        onChange={(e) => setNumRooms(e.target.value)}
        style={inputStyle}
      />
      <input
        type="number"
        placeholder="Price per Room"
        value={pricePerRoom}
        onChange={(e) => setPricePerRoom(e.target.value)}
        style={inputStyle}
      />
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        style={inputStyle}
      />
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="number"
          placeholder="Longitude"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        />
        <input
          type="number"
          placeholder="Latitude"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        />
      </div>

      {/* Image upload and preview */}
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handlePhotoUpload}
        style={inputStyle}
      />
      {previewUrls.length > 0 && (
        <div style={previewContainerStyle}>
          {previewUrls.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`Preview ${idx}`}
              style={{
                width: "60px",
                height: "60px",
                objectFit: "cover",
                borderRadius: "6px",
                border: "1px solid #eee",
              }}
            />
          ))}
        </div>
      )}

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={textareaStyle}
      />

      <button type="submit" style={buttonStyle}>
        Save Homestay
      </button>
    </form>
  );
}

const formStyle = {
  maxWidth: "350px",
  margin: "0 auto",
  background: "#f9f9f9",
  padding: "1.2rem 1.5rem",
  borderRadius: "10px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  fontFamily: "Segoe UI, Arial, sans-serif",
};

const headingStyle = {
  fontSize: "1.2rem",
  fontWeight: 600,
  marginBottom: "1rem",
  color: "#3a6141",
  letterSpacing: "0.5px",
  textAlign: "center",
};

const inputStyle = {
  width: "100%",
  padding: "0.45rem 0.7rem",
  marginBottom: "0.7rem",
  borderRadius: "6px",
  border: "1px solid #bbb",
  fontSize: "0.97rem",
  background: "#fff",
};

const textareaStyle = {
  width: "100%",
  padding: "0.45rem 0.7rem",
  marginBottom: "0.9rem",
  borderRadius: "6px",
  border: "1px solid #bbb",
  fontSize: "0.97rem",
  background: "#fff",
  height: "60px",
  resize: "vertical",
};

const buttonStyle = {
  width: "100%",
  padding: "0.7rem",
  backgroundColor: "#4e7c50",
  color: "#fff",
  border: "none",
  borderRadius: "7px",
  fontSize: "1rem",
  fontWeight: 500,
  cursor: "pointer",
  marginTop: "0.2rem",
  letterSpacing: "0.5px",
};

const previewContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  marginBottom: "1rem",
};

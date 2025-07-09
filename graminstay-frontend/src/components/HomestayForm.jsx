import { useState } from "react";

export default function HomestayForm({ initialData = {}, onSave, ownerId }) { // <-- Add ownerId as a prop
  const [name, setName] = useState(initialData.name || "");
  const [photos, setPhotos] = useState([]);
  const [previewUrls, setPreviewUrls] = useState(initialData.photos || []);
  const [numRooms, setNumRooms] = useState(initialData.numRooms || "");
  const [pricePerRoom, setPricePerRoom] = useState(initialData.pricePerRoom || "");
  const [location, setLocation] = useState(initialData.location || "");
  const [description, setDescription] = useState(initialData.description || "");

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);

    // Generate preview URLs
    const fileReaders = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(fileReaders).then(results => {
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
  formData.append("description", description);
  formData.append("ownerId", ownerId); // <-- Only ONCE

  // Append all images
  for (let i = 0; i < photos.length; i++) {
    formData.append("photos", photos[i]);
  }

  onSave(formData);
};


  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Homestay Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inputStyle}
      /><br />
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handlePhotoUpload}
        style={inputStyle}
      /><br />

      {previewUrls.length > 0 && (
        <div style={previewContainerStyle}>
          {previewUrls.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`Preview ${idx}`}
              style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px" }}
            />
          ))}
        </div>
      )}

      <input
        type="number"
        placeholder="Number of Rooms"
        value={numRooms}
        onChange={(e) => setNumRooms(e.target.value)}
        style={inputStyle}
      /><br />
      <input
        type="number"
        placeholder="Price per Room"
        value={pricePerRoom}
        onChange={(e) => setPricePerRoom(e.target.value)}
        style={inputStyle}
      /><br />
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        style={inputStyle}
      /><br />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ ...inputStyle, height: "80px" }}
      /><br />
      <button type="submit" style={buttonStyle}>Save Homestay</button>
    </form>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.7rem",
  marginBottom: "1rem",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "1rem",
};

const buttonStyle = {
  width: "100%",
  padding: "0.9rem",
  backgroundColor: "#4e7c50",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "1rem",
  cursor: "pointer",
};

const previewContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginBottom: "1rem",
};

import { useState, useEffect } from "react";

export default function HomestayForm({ initialData = {}, onSave }) {
  const [name, setName] = useState(initialData.name || "");
  const [photos, setPhotos] = useState(initialData.photos || []);
  const [numRooms, setNumRooms] = useState(initialData.numRooms || "");
  const [pricePerRoom, setPricePerRoom] = useState(initialData.pricePerRoom || "");
  const [location, setLocation] = useState(initialData.location || "");
  const [description, setDescription] = useState(initialData.description || "");

  useEffect(() => {
    setName(initialData.name || "");
    setPhotos(initialData.photos || []);
    setNumRooms(initialData.numRooms || "");
    setPricePerRoom(initialData.pricePerRoom || "");
    setLocation(initialData.location || "");
    setDescription(initialData.description || "");
  }, [initialData]);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((images) => {
      setPhotos(images);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name,
      photos,
      numRooms,
      pricePerRoom,
      location,
      description,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
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
        style={{ ...inputStyle, height: "100px" }}
      /><br />

      <button type="submit" style={buttonStyle}>Save Homestay</button>

      {photos.length > 0 && (
        <div style={previewContainerStyle}>
          {photos.map((photo, idx) => (
            <img
              key={idx}
              src={photo}
              alt={`preview-${idx}`}
              style={previewImageStyle}
            />
          ))}
        </div>
      )}
    </form>
  );
}

const formStyle = {
  width: "100%",
  maxWidth: "600px",
};

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
  marginTop: "1rem",
};

const previewImageStyle = {
  width: "100px",
  height: "100px",
  objectFit: "cover",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

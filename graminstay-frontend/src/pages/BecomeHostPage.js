import { useState } from "react";
import "./BecomeHostPage.css";

export default function BecomeHostPage() {
  const [form, setForm] = useState({
    name: "",
    location: "",
    rooms: "",
    phone: "",
    email: "",
  });
  const [status, setStatus] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    try {
      const res = await fetch("/api/contact-host-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setStatus(data.error || "Failed to send request. Please try again later.");
      }
    } catch (err) {
      setStatus("Failed to send request. Please try again later.");
    }
  };

  return (
    <div className="become-host-bg">
      <div className="about-us-section animate-fade-in">
        <h1 className="about-title">About Us</h1>
        <h2 className="about-subtitle">GraminStay – Stay Local. Live Authentic.</h2>
        <p className="about-desc">
          GraminStay is a village-themed homestay platform that connects travelers with real, rural experiences across India. Our goal is simple — to help you discover the heart of India by staying with local hosts in serene village settings, while also empowering rural communities through sustainable tourism.
        </p>
        <div className="about-diff">
          <h3>What makes us different?</h3>
          <ul>
            <li>No commission on bookings</li>
            <li>100% of the booking amount goes to the homestay owner</li>
            <li>Affordable yearly or monthly subscription for hosts</li>
            <li>Better pricing for guests, better earnings for hosts</li>
          </ul>
        </div>
        <p className="about-desc">
          We believe tourism should benefit the people who make it possible — the locals. By removing high commissions and offering fair pricing, we’re building a more transparent and community-focused travel ecosystem.
        </p>
        <p className="about-desc">
          Every homestay on GraminStay is handpicked for its cultural richness, comfort, and connection to nature. Whether it’s a stone cottage in the Himalayas or a bamboo hut near the backwaters, each stay promises authenticity, warmth, and a story worth sharing.
        </p>
        <div className="about-cta animate-slide-in">
          <span>GraminStay – Where Every Stay Supports a Dream.</span>
        </div>
      </div>
      {submitted ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <img src="/qrcode.png" alt="Gramin Stay" style={{ maxWidth: "400px", width: "100%", display: "block", margin: "0 auto" }} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="become-host-form animate-fade-in">
          <h2 className="form-title">List Your Property</h2>
          <input
            type="text"
            name="name"
            placeholder="Property Name"
            value={form.name}
            onChange={handleChange}
            required
            className="form-input"
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            required
            className="form-input"
          />
          <input
            type="number"
            name="rooms"
            placeholder="Number of Rooms"
            value={form.rooms}
            onChange={handleChange}
            required
            className="form-input"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
            className="form-input"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
            className="form-input"
          />
          <button type="submit" className="form-submit-btn">
            Submit
          </button>
          {status && (
            <div style={{ marginTop: 18, color: status.includes('sent') ? '#388e3c' : '#d32f2f', fontWeight: 600, textAlign: 'center' }}>{status}</div>
          )}
        </form>
      )}
    </div>
  );
}
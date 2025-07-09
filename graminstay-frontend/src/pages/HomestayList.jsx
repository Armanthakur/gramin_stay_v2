import { useParams } from "react-router-dom";
import "./HomestayList.css";

const dummyHomestays = [
  {
    id: 1,
    name: "Hilltop Retreat",
    pricePerRoom: 2000,
    image: "https://source.unsplash.com/400x300/?homestay,village",
  },
  {
    id: 2,
    name: "Riverside Cottage",
    pricePerRoom: 1800,
    image: "https://source.unsplash.com/400x300/?cottage,village",
  },
  {
    id: 3,
    name: "Forest Cabin",
    pricePerRoom: 2500,
    image: "https://source.unsplash.com/400x300/?cabin,village",
  },
];

export default function HomestayList() {
  const { stateName, cityName } = useParams();
  const location = stateName || cityName;

  // In real scenario, fetch data based on stateName or cityName

  return (
    <div className="homestay-page">
      <h2>Homestays in {location}</h2>
      <div className="homestay-grid">
        {dummyHomestays.map((homestay) => (
          <div className="homestay-card" key={homestay.id}>
            <img src={homestay.image} alt={homestay.name} />
            <h3>{homestay.name}</h3>
            <p>₹{homestay.pricePerRoom} per room</p>
          </div>
        ))}
      </div>
    </div>
  );
}

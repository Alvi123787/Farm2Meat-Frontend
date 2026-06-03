// Bestsellers.jsx – Premium Bestsellers Section

import { useNavigate } from "react-router-dom";
import "../css/Bestsellers.css";

const BESTSELLERS = [
  {
    id: "mutton-chops",
    name: "Mutton Chops",
    label: "Farm Fresh",
    description: "Bone-in chops, perfectly marbled for rich, tender grilling",
    image: "https://res.cloudinary.com/dqclqmuhi/image/upload/v1780450604/162191_kyebr6.jpg",
    tag: "#1 Seller",
    category: "mutton",
  },
  {
    id: "beef-boneless-boti",
    name: "Beef Boneless Boti",
    label: "Premium Grade",
    description: "Cubed boneless cuts, ideal for karahi and BBQ skewers",
    image: "https://res.cloudinary.com/dqclqmuhi/image/upload/v1780460459/47151_efaml8.jpg",
    tag: "Top Pick",
    category: "beef",
  },
  {
    id: "mutton-leg",
    name: "Mutton Leg",
    label: "Farm Fresh",
    description: "Whole leg, slow-roasted to fall-off-the-bone perfection",
    image: "https://res.cloudinary.com/dqclqmuhi/image/upload/v1780460979/12253_d0mhea.jpg",
    tag: "Festive Cut",
    category: "mutton",
  },
  {
    id: "beef-mince",
    name: "Beef Mince",
    label: "Premium Grade",
    description: "Freshly minced beef, perfect for qeema, kofta & bolognese",
    image: "https://res.cloudinary.com/dqclqmuhi/image/upload/v1780461121/2148611028_jqbiwj.jpg",
    tag: "Daily Fresh",
    category: "beef",
  },
  {
    id: "chicken-chest",
    name: "Chicken Chest",
    label: "Free Range",
    description: "Lean, hormone-free breast fillets for healthy everyday meals",
    image: "https://res.cloudinary.com/dqclqmuhi/image/upload/v1780451647/13456_qkjktf.jpg",
    tag: "Popular",
    category: "chicken",
  },
  {
    id: "chicken-legs",
    name: "Chicken Legs",
    label: "Free Range",
    description: "Juicy drumsticks and thighs, great for grilling or curries",
    image: "https://res.cloudinary.com/dqclqmuhi/image/upload/v1780461302/48681_rimiz2.jpg",
    tag: "Best Value",
    category: "chicken",
  },
];

const BestsellerCuts = () => {
  const navigate = useNavigate();

  return (
    <section className="bsc">
      {/* Section Header */}
      <div className="bsc__header">
        <div className="bsc__header-badge">
          <span className="bsc__header-line" />
          <span className="bsc__header-label">Customer Favourites</span>
          <span className="bsc__header-line" />
        </div>
        <h2 className="bsc__title">Bestseller Cuts</h2>
        <p className="bsc__subtitle">
          Our most-loved cuts, ordered again and again — for good reason
        </p>
      </div>

      {/* Cards Grid — always 3 columns */}
      <div className="bsc__grid">
        {BESTSELLERS.map((item, index) => (
          <div
            key={item.id}
            className="bsc__card"
            style={{ "--i": index }}
            onClick={() => navigate(`/shop?category=${item.category}&cut=${item.id}`)}
          >
            {/* Image */}
            <div className="bsc__card-img-wrap">
              <img
                src={item.image}
                alt={item.name}
                className="bsc__card-img"
                loading="lazy"
              />
              <div className="bsc__card-img-overlay" />
              <span className="bsc__card-tag">{item.tag}</span>
            </div>

            {/* Content */}
            <div className="bsc__card-body">
              <div className="bsc__card-meta">
                <span className="bsc__card-label">{item.label}</span>
              </div>
              <h3 className="bsc__card-name">{item.name}</h3>
              <p className="bsc__card-desc">{item.description}</p>
              <div className="bsc__card-footer">
                <span className="bsc__card-cta">
                  Order Now
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      d="M5 12h14m0 0-6-6m6 6-6 6"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BestsellerCuts;
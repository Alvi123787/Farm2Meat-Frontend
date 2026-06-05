// MeatByCategory.jsx (Professional Premium Redesign)

import { useNavigate } from "react-router-dom";
import "../css/MeatByCategory.css";
import { useSmartNavigation } from "../hooks/useSmartNavigation";

const CATEGORIES = [
  {
    id: "mutton",
    name: "Mutton",
    label: "Farm Fresh",
    description: "Tender, slow‑grown cuts from our grass‑fed flock",
    image: "https://res.cloudinary.com/dqclqmuhi/image/upload/v1780451671/821_x2485m.jpg",
    tag: "Best Seller",
    item_type_id: 2,
    category: "mutton",
    enableRedirection: true,
  },
  {
    id: "beef",
    name: "Beef",
    label: "Premium Grade",
    description: "Rich, marbled beef from ethically raised cattle",
    image: "https://res.cloudinary.com/dqclqmuhi/image/upload/v1780451655/72395_zpgbkk.jpg",
    tag: "Popular",
    item_type_id: 2,
    category: "beef",
    enableRedirection: true,
  },
  {
    id: "chicken",
    name: "Chicken",
    label: "Free Range",
    description: "Juicy, free‑range chicken raised without hormones",
    image: "https://res.cloudinary.com/dqclqmuhi/image/upload/v1780451647/13456_qkjktf.jpg",
    tag: "Daily Fresh",
    item_type_id: 2,
    category: "chicken",
    enableRedirection: true,
  },
  {
    id: "fish",
    name: "Fish",
    label: "Ocean Catch",
    description: "Wild‑caught and freshwater varieties, delivered daily",
    image: "https://res.cloudinary.com/dqclqmuhi/image/upload/v1780451674/18223_n8tjrv.jpg",
    tag: "Fresh Catch",
    item_type_id: 2,
    category: "fish",
    enableRedirection: true,
  },
];

const MeatByCategory = () => {
  const navigate = useNavigate();
  const { smartNavigate } = useSmartNavigation();

  return (
    <section className="mbc">
      {/* Section Header */}
      <div className="mbc__header">
        <div className="mbc__header-badge">
          <span className="mbc__header-line" />
          <span className="mbc__header-label">Our Selection</span>
          <span className="mbc__header-line" />
        </div>
        <h2 className="mbc__title">Meat By Category</h2>
        <p className="mbc__subtitle">
          Handpicked cuts, sourced fresh every day — choose your favourite
        </p>
      </div>

      {/* Cards Grid */}
      <div className="mbc__grid">
        {CATEGORIES.map((cat, index) => (
          <div
            key={cat.id}
            className="mbc__card"
            style={{ "--i": index }}
            onClick={() => {
              if (!smartNavigate(cat)) {
                navigate(`/shop?category=${cat.id}`);
              }
            }}
          >
            {/* Image */}
            <div className="mbc__card-img-wrap">
              <img
                src={cat.image}
                alt={cat.name}
                className="mbc__card-img"
                loading="lazy"
              />
              <div className="mbc__card-img-overlay" />
              {/* Tag */}
              <span className="mbc__card-tag">{cat.tag}</span>
            </div>

            {/* Content */}
            <div className="mbc__card-body">
              <div className="mbc__card-meta">
                <span className="mbc__card-label">{cat.label}</span>
              </div>
              <h3 className="mbc__card-name">{cat.name}</h3>
              <p className="mbc__card-desc">{cat.description}</p>
              <div className="mbc__card-footer">
                <span className="mbc__card-cta">
                  Shop {cat.name}
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

export default MeatByCategory;
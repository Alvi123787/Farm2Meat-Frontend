// UnavailableItem.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/UnavailableItem.css";

const UnavailableItem = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState(8);
  const [productName, setProductName] = useState("");

  useEffect(() => {
    // Get product name from location state if available
    if (location.state?.productName) {
      setProductName(location.state.productName);
    }

    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [location.state]);

  useEffect(() => {
    // Auto-redirect countdown
    if (countdown <= 0) {
      navigate("/shop");
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, navigate]);

  const handleBrowseProducts = () => {
    navigate("/shop");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleViewSimilar = () => {
    navigate("/shop", { state: { filter: "similar" } });
  };

  return (
    <div className={`unavailable-page ${isVisible ? "unavailable-page--visible" : ""}`}>
      <div className="unavailable-page__container">
        {/* Main Card */}
        <div className="unavailable-card">
          {/* Illustration Section */}
          <div className="unavailable-card__illustration">
            <div className="illustration-wrapper">
              <svg 
                className="illustration-svg" 
                viewBox="0 0 200 200" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background Circle */}
                <circle cx="100" cy="100" r="90" fill="url(#gradient-bg)" opacity="0.15" />
                
                {/* Shopping Bag */}
                <g transform="translate(60, 45)">
                  <path 
                    d="M10 20L5 65H75L70 20H10Z" 
                    fill="url(#gradient-bag)" 
                    stroke="var(--primary)" 
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M25 20V10C25 4 30 0 40 0C50 0 55 4 55 10V20" 
                    stroke="var(--primary)" 
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Sold Badge */}
                  <g transform="translate(8, 30) rotate(-15)">
                    <rect 
                      x="0" y="0" 
                      width="65" height="20" 
                      rx="4" 
                      fill="var(--primary)" 
                      opacity="0.9"
                    />
                    <text 
                      x="32.5" y="14" 
                      textAnchor="middle" 
                      fill="white" 
                      fontSize="10" 
                      fontWeight="700"
                      letterSpacing="1"
                    >
                      SOLD OUT
                    </text>
                  </g>
                </g>

                {/* Sad Face Elements */}
                <g transform="translate(100, 140)">
                  {/* Eyes */}
                  <circle cx="-15" cy="-5" r="4" fill="var(--text-secondary)" />
                  <circle cx="15" cy="-5" r="4" fill="var(--text-secondary)" />
                  {/* Sad Mouth */}
                  <path 
                    d="M-10 8 Q0 2 10 8" 
                    stroke="var(--text-secondary)" 
                    strokeWidth="2.5" 
                    fill="none" 
                    strokeLinecap="round"
                  />
                  {/* Tear */}
                  <circle cx="-20" cy="2" r="2.5" fill="var(--primary)" opacity="0.4">
                    <animate 
                      attributeName="cy" 
                      values="2;8;2" 
                      dur="2s" 
                      repeatCount="indefinite" 
                    />
                    <animate 
                      attributeName="opacity" 
                      values="0.4;0;0.4" 
                      dur="2s" 
                      repeatCount="indefinite" 
                    />
                  </circle>
                </g>

                {/* Decorative Elements */}
                <circle cx="30" cy="30" r="3" fill="var(--accent)" opacity="0.3">
                  <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="170" cy="40" r="4" fill="var(--accent)" opacity="0.2">
                  <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="160" cy="170" r="3" fill="var(--primary)" opacity="0.15">
                  <animate attributeName="opacity" values="0.15;0.35;0.15" dur="3.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="40" cy="160" r="2.5" fill="var(--accent)" opacity="0.2">
                  <animate attributeName="opacity" values="0.2;0.45;0.2" dur="2.8s" repeatCount="indefinite" />
                </circle>

                <defs>
                  <radialGradient id="gradient-bg" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.05" />
                  </radialGradient>
                  <linearGradient id="gradient-bag" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Content Section */}
          <div className="unavailable-card__content">
            {/* Status Badge */}
            <div className="status-badge">
              <span className="status-badge__dot"></span>
              Unavailable
            </div>

            {/* Main Heading */}
            <h1 className="unavailable-card__title">
              {productName ? (
                <>
                  <span className="title-product">{productName}</span>
                  <br />
                  <span className="title-status">is no longer available</span>
                </>
              ) : (
                <>
                  This item has
                  <br />
                  <span className="title-status">already been purchased</span>
                </>
              )}
            </h1>

            {/* Description */}
            <p className="unavailable-card__description">
              Another customer has already completed the purchase of this item.
              <br className="hide-mobile" />
              Don't worry — we have plenty of other fresh options waiting for you!
            </p>

            {/* Action Buttons */}
            <div className="unavailable-card__actions">
              <button 
                className="btn btn--primary"
                onClick={handleBrowseProducts}
              >
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 12h18M3 6h18M3 18h18" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Browse Other Products
              </button>
              
              <button 
                className="btn btn--secondary"
                onClick={handleViewSimilar}
              >
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M12 8v8M8 12h8" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                View Similar Items
              </button>
              
              <button 
                className="btn btn--outline"
                onClick={handleGoHome}
              >
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 12l9-9 9 9M5 10v10h14V10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Go to Home
              </button>
            </div>

            {/* Auto-redirect Notice */}
            <p className="unavailable-card__redirect">
              Redirecting to shop in <span className="countdown">{countdown}</span> seconds...
            </p>
          </div>
        </div>

        {/* Recommended Products Section */}
        <div className="recommended-section">
          <h2 className="recommended-section__title">
            You might also like
          </h2>
          
          <div className="recommended-grid">
            {/* Product Card 1 */}
            <div className="product-card" onClick={() => navigate("/shop")}>
              <div className="product-card__image">
                <img 
                  src="https://res.cloudinary.com/dqclqmuhi/image/upload/v1775621674/ulleo-goats-2719445_qgvc4s.jpg"
                  alt="Fresh Goat Meat"
                />
                <span className="product-card__badge">Fresh</span>
              </div>
              <div className="product-card__info">
                <h3>Premium Goat Meat</h3>
                <p>Farm fresh, halal certified</p>
                <span className="product-card__price">From $12.99/lb</span>
              </div>
            </div>

            {/* Product Card 2 */}
            <div className="product-card" onClick={() => navigate("/shop")}>
              <div className="product-card__image">
                <img 
                  src="https://res.cloudinary.com/dqclqmuhi/image/upload/v1775621674/ulleo-goats-2719445_qgvc4s.jpg"
                  alt="Organic Lamb"
                />
                <span className="product-card__badge product-card__badge--organic">Organic</span>
              </div>
              <div className="product-card__info">
                <h3>Organic Lamb</h3>
                <p>Grass-fed, premium quality</p>
                <span className="product-card__price">From $14.99/lb</span>
              </div>
            </div>

            {/* Product Card 3 */}
            <div className="product-card" onClick={() => navigate("/shop")}>
              <div className="product-card__image">
                <img 
                  src="https://res.cloudinary.com/dqclqmuhi/image/upload/v1775621674/ulleo-goats-2719445_qgvc4s.jpg"
                  alt="Beef Selection"
                />
                <span className="product-card__badge">Best Seller</span>
              </div>
              <div className="product-card__info">
                <h3>Premium Beef Cuts</h3>
                <p>Aged to perfection</p>
                <span className="product-card__price">From $16.99/lb</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnavailableItem;
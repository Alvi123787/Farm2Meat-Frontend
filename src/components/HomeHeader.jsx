// HomeHeader.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePwaInstall from "../hooks/usePwaInstall";
import "../css/HomeHeader.css";

const INSTALL_FEEDBACK_TIMEOUT_MS = 3200;

const HomeHeader = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [installFeedback, setInstallFeedback] = useState("");
  const { canInstall, isInstalled, needsManualInstall, promptInstall } = usePwaInstall();

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!installFeedback) return;
    const feedbackTimer = setTimeout(() => setInstallFeedback(""), INSTALL_FEEDBACK_TIMEOUT_MS);
    return () => clearTimeout(feedbackTimer);
  }, [installFeedback]);

  const handleInstallClick = async () => {
    const outcome = await promptInstall();
    const messages = {
      manual: "On iPhone, tap Share → Add to Home Screen",
      dismissed: "You can install anytime from the menu",
      accepted: "Installing Farm2Meat...",
      installed: "Already installed on this device"
    };
    setInstallFeedback(messages[outcome] || "Install not available in this browser");
  };

  const showInstallButton = canInstall || needsManualInstall || isInstalled;
  
  const installButtonLabel = isInstalled 
    ? "✓ Installed" 
    : needsManualInstall 
      ? "Add to Home Screen" 
      : "Install App";

  return (
    <section className={`hero ${loaded ? "hero--loaded" : ""}`}>
      {/* Background */}
      <div className="hero__background">
        <img
          src="https://res.cloudinary.com/dqclqmuhi/image/upload/v1775621674/ulleo-goats-2719445_qgvc4s.jpg"
          alt="Farm landscape with goats"
          className="hero__image"
        />
        <div className="hero__overlay" />
      </div>

      {/* Top Header Row (Logo & Install) */}
      <div className="hero__header-row">
        <div className="hero__logo" onClick={() => navigate('/')}>
          <img 
            src="https://res.cloudinary.com/dqclqmuhi/image/upload/v1775796488/Gemini_Generated_Image_1vibo61vibo61vib-removebg-preview_me9etj.png" 
            alt="Farm2Meat" 
          />
        </div>

        {showInstallButton && (
          <div className="hero__install">
            <button
              className={`install-btn ${isInstalled ? "install-btn--installed" : ""}`}
              onClick={handleInstallClick}
              disabled={isInstalled}
            >
              <svg className="install-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{installButtonLabel}</span>
            </button>
            {installFeedback && (
              <div className="install-feedback">{installFeedback}</div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="hero__content">
        <div className="hero__container">
          <span className="hero__badge">
            <span className="hero__badge-dot" />
            Since 1990
          </span>

          <h1 className="hero__title">
            <span className="hero__title-line">
              <span className="hero__title-word">Fresh</span>
              <span className="hero__title-word hero__title-word--highlight">Meat.</span>
            </span>
            <span className="hero__title-line">
              <span className="hero__title-word">Honest</span>
              <span className="hero__title-word hero__title-word--highlight">Weight.</span>
            </span>
            <span className="hero__title-line">
              <span className="hero__title-word">Farm</span>
              <span className="hero__title-word hero__title-word--highlight">Fresh.</span>
            </span>
          </h1>

          <p className="hero__description">
            Premium quality meat delivered fresh from our farm to your table. 
            100% halal, ethically raised, and transparent pricing.
          </p>

          <div className="hero__actions">
            <button className="btn btn--primary" onClick={() => navigate("/shop")}>
              Shop Now
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12h14m0 0-6-6m6 6-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="btn btn--secondary" onClick={() => navigate("/about")}>
              Learn More
            </button>
          </div>

          <div className="hero__features">
            <div className="feature-card">
              <div className="feature-card__glow" />
              <div className="feature-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div className="feature-card__content">
                <span className="feature-card__value">100%</span>
                <span className="feature-card__label">Verified Weight</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-card__glow" />
              <div className="feature-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="feature-card__content">
                <span className="feature-card__value">Premium</span>
                <span className="feature-card__label">Farm Raised</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-card__glow" />
              <div className="feature-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div className="feature-card__content">
                <span className="feature-card__value">Free</span>
                <span className="feature-card__label">RYK Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="hero__scroll">
        <span>Scroll</span>
        <div className="scroll-indicator">
          <div className="scroll-indicator__dot" />
        </div>
      </div>
    </section>
  );
};

export default HomeHeader;
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
    if (!installFeedback) {
      return undefined;
    }

    const feedbackTimer = window.setTimeout(() => {
      setInstallFeedback("");
    }, INSTALL_FEEDBACK_TIMEOUT_MS);

    return () => window.clearTimeout(feedbackTimer);
  }, [installFeedback]);

  const handleInstallClick = async () => {
    const installOutcome = await promptInstall();

    if (installOutcome === "manual") {
      setInstallFeedback(
        "On iPhone, tap Share and then choose Add to Home Screen."
      );
      return;
    }

    if (installOutcome === "dismissed") {
      setInstallFeedback("Install prompt was dismissed. You can try again anytime.");
      return;
    }

    if (installOutcome === "accepted") {
      setInstallFeedback("Installing Farm2Meat...");
      return;
    }

    if (installOutcome === "installed") {
      setInstallFeedback("Farm2Meat is already installed on this device.");
      return;
    }

    setInstallFeedback("Install is not available in this browser right now.");
  };

  const showInstallButton = canInstall || needsManualInstall || isInstalled;

  if (!showInstallButton) {
    return (
      <div className="container-fluid px-lg-3 px-2">
        <div className={`homeHeader-wrapper ${loaded ? "homeHeader-loaded" : ""}`}>
          {/* Background Image */}
          <div className="homeHeader-bg">
            <img
              src="https://res.cloudinary.com/dqclqmuhi/image/upload/v1775621674/ulleo-goats-2719445_qgvc4s.jpg"
              alt="Header"
              className="homeHeader-bg-img"
            />
          </div>

          {/* Gradient Overlays */}
          <div className="homeHeader-gradient-main"></div>
          <div className="homeHeader-gradient-radial"></div>
          <div className="homeHeader-gradient-bottom"></div>

          {/* Floating Particles */}
          <div className="homeHeader-particles">
            <span className="homeHeader-particle homeHeader-particle-1"></span>
            <span className="homeHeader-particle homeHeader-particle-2"></span>
            <span className="homeHeader-particle homeHeader-particle-3"></span>
            <span className="homeHeader-particle homeHeader-particle-4"></span>
            <span className="homeHeader-particle homeHeader-particle-5"></span>
          </div>

          {/* Left Accent Bar */}
          <div className="homeHeader-accent-bar"></div>

          {/* Main Content */}
          <div className="homeHeader-content-wrapper">
            <div className="homeHeader-content-inner">
              {/* Top Badge - Hidden on Mobile */}
              <div className="homeHeader-badge-row homeHeader-hide-mobile">
                <span className="homeHeader-badge">
                  <span className="homeHeader-badge-dot"></span>
                  Since 1990
                </span>
              </div>

              {/* Main Title - Always Visible */}
              <h1 className="homeHeader-title">
                <span className="homeHeader-title-line homeHeader-title-line-1">
                  <span className="homeHeader-title-word">Healthy</span>
                  <span className="homeHeader-title-word homeHeader-title-highlight">Bakray.</span>
                </span>
                <span className="homeHeader-title-line homeHeader-title-line-2">
                  <span className="homeHeader-title-word">Honest</span>
                  <span className="homeHeader-title-word homeHeader-title-highlight">Weight.</span>
                </span>
              </h1>

              {/* Subtitle - Always Visible */}
              <p className="homeHeader-subtitle">
                Farm2Meat brings the farm directly to your home. We provide healthy, quality animals with guaranteed weight and premium service.
              </p>

              {/* CTA Buttons */}
              <div className="homeHeader-cta-group">
                <button
                  className="homeHeader-btn-primary"
                  onClick={() => navigate("/shop")}
                >
                  <span className="homeHeader-btn-text">Shop Now</span>
                  <span className="homeHeader-btn-icon">→</span>
                </button>
                <button
                  className="homeHeader-btn-secondary"
                  onClick={() => navigate("/about")}
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const installButtonLabel = isInstalled
    ? "Installed"
    : needsManualInstall
      ? "Add to Home Screen"
      : "Install App";
  const installButtonStateClass = isInstalled
    ? "homeHeader-install-btn-installed"
    : needsManualInstall
      ? "homeHeader-install-btn-manual"
      : "homeHeader-install-btn-ready";

  return (
    <div className="container-fluid px-lg-3 px-2">
      <div className={`homeHeader-wrapper ${loaded ? "homeHeader-loaded" : ""}`}>
        {/* Background Image */}
        <div className="homeHeader-bg">
          <img
            src="https://res.cloudinary.com/dqclqmuhi/image/upload/v1775621674/ulleo-goats-2719445_qgvc4s.jpg"
            alt="Header"
            className="homeHeader-bg-img"
          />
        </div>

        {/* Gradient Overlays */}
        <div className="homeHeader-gradient-main"></div>
        <div className="homeHeader-gradient-radial"></div>
        <div className="homeHeader-gradient-bottom"></div>

        {/* Floating Particles */}
        <div className="homeHeader-particles">
          <span className="homeHeader-particle homeHeader-particle-1"></span>
          <span className="homeHeader-particle homeHeader-particle-2"></span>
          <span className="homeHeader-particle homeHeader-particle-3"></span>
          <span className="homeHeader-particle homeHeader-particle-4"></span>
          <span className="homeHeader-particle homeHeader-particle-5"></span>
        </div>

        {/* Left Accent Bar */}
        <div className="homeHeader-accent-bar"></div>

        {/* Site Logo */}
        <div className="homeHeader-logo-wrap logo-visibility-wrapper" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img 
            src="https://res.cloudinary.com/dqclqmuhi/image/upload/v1775796488/Gemini_Generated_Image_1vibo61vibo61vib-removebg-preview_me9etj.png" 
            alt="Farm2Meat Logo" 
            className="homeHeader-logo-img"
            style={{ width: '50px', height: '50px', objectFit: 'contain' }}
          />
        </div>

        <div className="homeHeader-install-wrapper">
          <button
            className={`homeHeader-install-btn ${installButtonStateClass}`}
            type="button"
            onClick={handleInstallClick}
            disabled={isInstalled}
          >
            <span className="homeHeader-install-icon" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3v12" />
                <path d="m7 10 5 5 5-5" />
                <path d="M5 21h14" />
              </svg>
            </span>
            <span>{installButtonLabel}</span>
          </button>

          {installFeedback ? (
            <p className="homeHeader-install-feedback">{installFeedback}</p>
          ) : null}
        </div>

        {/* Main Content */}
        <div className="homeHeader-content-wrapper">
          <div className="homeHeader-content-inner">
            {/* Top Badge - Hidden on Mobile */}
            <div className="homeHeader-badge-row homeHeader-hide-mobile">
              <span className="homeHeader-badge">
                <span className="homeHeader-badge-dot"></span>
                Since 1990
              </span>
            </div>

            {/* Main Title - Always Visible */}
            <h1 className="homeHeader-title">
              <span className="homeHeader-title-line homeHeader-title-line-1">
                <span className="homeHeader-title-word">Healthy</span>
                <span className="homeHeader-title-word homeHeader-title-highlight">Bakray.</span>
              </span>
              <span className="homeHeader-title-line homeHeader-title-line-2">
                <span className="homeHeader-title-word">Honest</span>
                <span className="homeHeader-title-word homeHeader-title-highlight">Weight.</span>
              </span>
              <span className="homeHeader-title-line homeHeader-title-line-3">
                <span className="homeHeader-title-word">Trusted</span>
                <span className="homeHeader-title-word homeHeader-title-highlight">Service.</span>
              </span>
            </h1>

            {/* Description - Hidden on Mobile */}
            <p className="homeHeader-description homeHeader-hide-mobile">
              Healthy, farm-raised bakray with honest weight aur 100%
              transparent service. Har selection trust aur care ke saath —
              kyun ke aap ka itmaad hi hamari asli zimmedari hai.
            </p>

            {/* CTA Buttons - Hidden on Mobile */}
            <div className="homeHeader-cta-row homeHeader-hide-mobile">
              <button className="homeHeader-btn-primary" type="button" onClick={() => navigate("/shop")}>
                <span className="homeHeader-btn-content">
                  <span>Explore Collection</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
                <span className="homeHeader-btn-shimmer"></span>
              </button>
            </div>

            {/* Trust highlights — desktop / tablet */}
            <div className="homeHeader-stats homeHeader-hide-mobile" role="list">
              <div className="homeHeader-trust-card" role="listitem">
                <div className="homeHeader-trust-card-glow" aria-hidden="true" />
                <div className="homeHeader-trust-card-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div className="homeHeader-trust-card-text">
                  <span className="homeHeader-trust-card-value">100%</span>
                  <span className="homeHeader-trust-card-label">Verified weight</span>
                </div>
              </div>
              <div className="homeHeader-trust-card" role="listitem">
                <div className="homeHeader-trust-card-glow" aria-hidden="true" />
                <div className="homeHeader-trust-card-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="homeHeader-trust-card-text">
                  <span className="homeHeader-trust-card-value">24/7</span>
                  <span className="homeHeader-trust-card-label">Customer support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Scroll Indicator - Hidden on Mobile */}
        <div className="homeHeader-scroll-indicator homeHeader-hide-mobile">
          <div className="homeHeader-scroll-mouse">
            <div className="homeHeader-scroll-dot"></div>
          </div>
          <span>Scroll Down</span>
        </div>

        {/* Corner Decorations */}
        <div className="homeHeader-corner-decor homeHeader-corner-top-right" aria-hidden="true" />
        <div className="homeHeader-corner-decor homeHeader-corner-bottom-left" aria-hidden="true" />
      </div>
    </div>
  );
};

export default HomeHeader;

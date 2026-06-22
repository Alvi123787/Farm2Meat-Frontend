// HomeHeader.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePwaInstall from "../hooks/usePwaInstall";
import api from "../services/api";
import "../css/HomeHeader.css";

const INSTALL_FEEDBACK_TIMEOUT_MS = 3200;
const SLIDE_INTERVAL_MS = 3000;

const HERO_IMAGES = [
  {
    src: "https://res.cloudinary.com/dqclqmuhi/image/upload/v1780448757/140922_ffcmmu.jpg",
    alt: "Premium quality meat on cutting board",
    // FIX 3: changed null → '' so currentSlide.badge is always a safe string
    badge: "",
    titleTop: "Enjoy the Highest",
    titleBottom: "Quality Meat",
  },
  {
    src: "https://res.cloudinary.com/dqclqmuhi/image/upload/v1780450604/162191_kyebr6.jpg",
    alt: "Mutton Chops fresh cut",
    badge: "High Quality",
    titleTop: "High Quality",
    titleBottom: "Mutton Chops",
  },
];

const getPrefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const HomeHeader = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [installFeedback, setInstallFeedback] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // FIX 5: initialise with HERO_IMAGES so there is never a flash of an empty
  // slides array between mount and the first API response
  const [slides, setSlides] = useState(HERO_IMAGES);
  const { canInstall, isInstalled, needsManualInstall, promptInstall } = usePwaInstall();

  // FIX 4: use a cancelled flag so setState is never called on an unmounted
  // component when the fetch resolves after unmount
  useEffect(() => {
    let cancelled = false;

    const fetchHeaderItems = async () => {
      try {
        const response = await api.get('/api/meat-items?showInHeader=true&isAvailable=true');
        if (cancelled) return;
        if (
          response.data.success &&
          Array.isArray(response.data.data) &&
          response.data.data.length > 0
        ) {
          const dynamicSlides = response.data.data.map((item) => ({
            src: item.imageUrl || HERO_IMAGES[0].src,
            alt: item.name || 'Featured meat item',
            badge: item.badge || 'Featured',
            titleTop: item.titleTop || (item.name ? item.name.split(' ').slice(0, 2).join(' ') : 'Premium'),
            titleBottom: item.titleBottom || (item.name ? item.name.split(' ').slice(2).join(' ') : 'Special'),
            id: item._id || `${item.name}-${Math.random()}`
          }));
          setSlides(dynamicSlides);
          setActiveSlide(0);
        }
        // If the response is empty/unsuccessful we keep the HERO_IMAGES default
        // that was already set at initialisation — no extra work needed
      } catch (error) {
        // On network error also keep the default slides already in state
        console.error('Error fetching header items:', error);
      }
    };

    fetchHeaderItems();
    return () => { cancelled = true; };
  }, []);

  // FIX 1: the original effect had [activeSlide, slides.length] as deps, which
  // made it fire on EVERY slide change — competing with (and duplicating) the
  // `% slides.length` wrapping already done inside the interval.  We only need
  // this guard when the slides *array itself* changes length (e.g. after the API
  // fetch comes back), so activeSlide is removed from the dep array.
  useEffect(() => {
    if (activeSlide >= slides.length) {
      setActiveSlide(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length]);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!installFeedback) return;
    const feedbackTimer = setTimeout(() => setInstallFeedback(""), INSTALL_FEEDBACK_TIMEOUT_MS);
    return () => clearTimeout(feedbackTimer);
  }, [installFeedback]);

  useEffect(() => {
    if (slides.length <= 1) return;
    if (isPaused) return;
    if (getPrefersReducedMotion()) return;

    const intervalId = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [isPaused, slides.length]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handlePreferenceChange = (event) => {
      if (event.matches) setActiveSlide(0);
      // FIX 2: original code was `setIsPaused((prev) => prev)` which is a no-op
      // (sets state to itself). The intent is to pause the slider when the user
      // has requested reduced motion, and unpause when they haven't.
      setIsPaused(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handlePreferenceChange);
    } else if (mediaQuery.addListener) {
      // Legacy Safari fallback
      mediaQuery.addListener(handlePreferenceChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handlePreferenceChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handlePreferenceChange);
      }
    };
  }, []);

  const goToSlide = (index) => setActiveSlide(index);

  const handleInstallClick = async () => {
    const outcome = await promptInstall();
    const messages = {
      manual: "On iPhone, tap Share → Add to Home Screen",
      dismissed: "You can install anytime from the menu",
      accepted: "Installing MeatByAlvi...",
      installed: "Already installed on this device",
    };
    setInstallFeedback(messages[outcome] || "Install not available in this browser");
  };

  const showInstallButton = canInstall || needsManualInstall || isInstalled;

  const installButtonLabel = isInstalled
    ? "Installed"
    : needsManualInstall
      ? "Add to Home Screen"
      : "Install App";

  // FIX 5 (cont.): because slides now initialises with HERO_IMAGES, the fallback
  // chain here is simpler — slides[activeSlide] will always be defined on first
  // render. The extra fallbacks are kept as a defensive belt-and-braces guard.
  const currentSlide = slides[activeSlide] ?? slides[0] ?? HERO_IMAGES[0];

  return (
    <section
      className={`hero ${loaded ? "hero--loaded" : ""}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      onTouchCancel={() => setIsPaused(false)}
    >
      {/* Background slider */}
      <div className="hero__background">
        <div className="hero__slider">
          {slides.map((image, index) => (
            <img
              key={`${image.src}-${index}`}
              src={image.src}
              alt={image.alt}
              className={`hero__image ${index === activeSlide ? "hero__image--active" : ""}`}
              aria-hidden={index === activeSlide ? "false" : "true"}
              loading={index === 0 ? "eager" : "lazy"}
            />
          ))}
        </div>
        <div className="hero__overlay" />
      </div>

      {/* Top Header Row */}
      <div className="hero__header-row">
        {/* Logo + Brand Name */}
        <div className="hero__brand" onClick={() => navigate("/")}>
          <div className="hero__logo">
            <img
              src="https://res.cloudinary.com/dqclqmuhi/image/upload/v1775796488/Gemini_Generated_Image_1vibo61vibo61vib-removebg-preview_me9etj.png"
              alt="MeatByAlvi"
            />
          </div>
          <div className="hero__brand-text">
            <span className="hero__brand-name">MEATBYALVI</span>
            <span className="hero__brand-tagline">Quality Meat</span>
          </div>
        </div>

        {/* Nav Links (desktop) */}
        <nav className="hero__nav">
          <a className="hero__nav-link" onClick={() => navigate("/")}>Home</a>
          <a className="hero__nav-link" onClick={() => navigate("/shop")}>Shop</a>
          <a className="hero__nav-link" onClick={() => navigate("/about")}>About</a>
          <a className="hero__nav-link" onClick={() => navigate("/contact")}>Contact</a>
        </nav>

        {/* Right: Install + Shop Now */}
        <div className="hero__header-right">
          {showInstallButton && (
            <div className="hero__install">
              <button
                className={`install-btn ${isInstalled ? "install-btn--installed" : ""}`}
                onClick={handleInstallClick}
                disabled={isInstalled}
              >
                <svg className="install-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{installButtonLabel}</span>
              </button>
              {installFeedback && (
                <div className="install-feedback">{installFeedback}</div>
              )}
            </div>
          )}
          <button className="hero__shop-btn" onClick={() => navigate("/shop")}>
            Shop Now
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="hero__content">
        <div className="hero__container">
          {/* Quality badge */}
          <div className="hero__quality-badge">
            <span className="hero__quality-line" />
            <span className="hero__quality-text">quality meat</span>
            <span className="hero__quality-line" />
          </div>

          <h1 className="hero__title" key={activeSlide}>
            <span className="hero__title-top">{currentSlide.titleTop}</span>
            <span className="hero__title-bottom">{currentSlide.titleBottom}</span>
          </h1>

          <p className="hero__description">
            Premium quality meat delivered fresh from our farm to your table.
            100% halal, ethically raised, and transparent pricing.
          </p>

          <div className="hero__actions">
            <button className="btn btn--primary" onClick={() => navigate("/shop")}>
              View Our Menu
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12h14m0 0-6-6m6 6-6 6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="btn btn--secondary" onClick={() => navigate("/about")}>
              Learn More
            </button>
          </div>

          {/* Feature cards */}
          <div className="hero__features">
            <div className="feature-card">
              <div className="feature-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div className="feature-card__content">
                <span className="feature-card__value">100%</span>
                <span className="feature-card__label">Verified Halal</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="feature-card__content">
                <span className="feature-card__value">Premium</span>
                <span className="feature-card__label">Farm Raised</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <div className="feature-card__content">
                <span className="feature-card__value">Since 1990</span>
                <span className="feature-card__label">Est. Trusted</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slider Dots */}
      {slides.length > 1 && (
        <div className="hero__dots" role="tablist" aria-label="Background slides">
          {slides.map((image, index) => (
            <button
              key={`dot-${index}`}
              type="button"
              className={`hero__dot ${index === activeSlide ? "hero__dot--active" : ""}`}
              onClick={() => goToSlide(index)}
              role="tab"
              aria-selected={index === activeSlide}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

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
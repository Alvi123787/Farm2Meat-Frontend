import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaw,
  faTimes,
  faShieldAlt,
  faHome,
  faHeart,
  faEye,
  faTag,
  faCalendarCheck,
  faInfoCircle,
  faTimesCircle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import '../css/AnimalCareModal.css';

const AnimalCareModal = ({ isOpen, onClose, onProceed, animalName = "your animal" }) => {

  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleProceed = () => {
    if (onProceed) onProceed();
  };

  // ESC key close support
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") handleClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`acm-overlay ${isOpen ? 'acm-overlay--active' : ''}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="acm-container" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="acm-header">
          <div className="acm-header__icon">
            <FontAwesomeIcon icon={faPaw} />
          </div>
          <h2 className="acm-header__title">Need Space for {animalName}?</h2>
          <p className="acm-header__sub">We'll keep your animal safe until you're ready</p>
          <button className="acm-close" onClick={handleClose} aria-label="Close modal">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Content */}
        <div className="acm-content">

          <div className="acm-trust">
            <FontAwesomeIcon icon={faShieldAlt} />
            <span>Trusted Animal Care Service</span>
          </div>

          <p className="acm-message">
            If you don't have space to keep your animal, we provide a safe, clean,
            and well-managed facility where your animal will be properly cared for.
          </p>

          <div className="acm-features">
            <div className="acm-feature">
              <div className="acm-feature__icon">
                <FontAwesomeIcon icon={faHome} />
              </div>
              <div className="acm-feature__text">
                <h3>Safe &amp; Secure Facility</h3>
                <p>Clean, managed, and comfortable environment</p>
              </div>
            </div>

            <div className="acm-feature">
              <div className="acm-feature__icon">
                <FontAwesomeIcon icon={faHeart} />
              </div>
              <div className="acm-feature__text">
                <h3>Full Responsibility</h3>
                <p>Feeding, safety, and proper care handled by us</p>
              </div>
            </div>

            <div className="acm-feature">
              <div className="acm-feature__icon">
                <FontAwesomeIcon icon={faEye} />
              </div>
              <div className="acm-feature__text">
                <h3>Visit Anytime</h3>
                <p>You can visit anytime to check your animal</p>
              </div>
            </div>
          </div>

          <div className="acm-pricing">
            <div className="acm-pricing__card">
              <div className="acm-pricing__head">
                <FontAwesomeIcon icon={faTag} />
                <span>Daily Rate</span>
              </div>
              <div className="acm-pricing__amount">
                <span className="acm-pricing__currency">Rs.</span>
                <span className="acm-pricing__number">100</span>
                <span className="acm-pricing__period">/ day</span>
              </div>
              <p className="acm-pricing__note">Simple and affordable pricing</p>
            </div>

            <div className="acm-pricing__card acm-pricing__card--accent">
              <div className="acm-pricing__head">
                <FontAwesomeIcon icon={faCalendarCheck} />
                <span>Advance Payment</span>
              </div>
              <div className="acm-pricing__amount">
                <span className="acm-pricing__number">20%</span>
                <span className="acm-pricing__period">required to confirm</span>
              </div>
              <p className="acm-pricing__note">Advance ensures your booking is secured</p>
            </div>
          </div>

          <div className="acm-info">
            <FontAwesomeIcon icon={faInfoCircle} />
            <p>Your animal will be kept in a secure environment with proper attention and care.</p>
          </div>

        </div>

        {/* Footer */}
        <div className="acm-footer">
          <button className="acm-btn acm-btn--cancel" onClick={handleClose}>
            <FontAwesomeIcon icon={faTimesCircle} />
            Cancel
          </button>
          <button className="acm-btn acm-btn--proceed" onClick={handleProceed}>
            <FontAwesomeIcon icon={faCheckCircle} />
            Proceed with Service
          </button>
        </div>

      </div>
    </div>
  );
};

export default AnimalCareModal;
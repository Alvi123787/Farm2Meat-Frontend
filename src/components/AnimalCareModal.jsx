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
      className={`modal-overlay ${isOpen ? 'active' : ''}`} 
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="modal-container" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="header-icon-wrapper">
            <FontAwesomeIcon icon={faPaw} />
          </div>
          <h2>Need Space for {animalName}?</h2>
          <button 
            className="close-button" 
            onClick={handleClose}
            aria-label="Close modal"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          
          {/* Trust Badge */}
          <div className="trust-badge">
            <FontAwesomeIcon icon={faShieldAlt} />
            <span>Trusted Animal Care Service</span>
          </div>

          {/* Message */}
          <p className="main-message">
            If you don’t have space to keep your animal, we provide a safe, clean, 
            and well-managed facility where your animal will be properly cared for.
          </p>

          {/* Features */}
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">
                <FontAwesomeIcon icon={faHome} />
              </div>
              <div className="feature-text">
                <h3>Safe & Secure Facility</h3>
                <p>Clean, managed, and comfortable environment</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <FontAwesomeIcon icon={faHeart} />
              </div>
              <div className="feature-text">
                <h3>Full Responsibility</h3>
                <p>Feeding, safety, and proper care handled by us</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <FontAwesomeIcon icon={faEye} />
              </div>
              <div className="feature-text">
                <h3>Visit Anytime</h3>
                <p>You can visit anytime to check your animal</p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="pricing-section">
            <div className="pricing-card">
              <div className="price-header">
                <FontAwesomeIcon icon={faTag} />
                <span>Daily Rate</span>
              </div>
              <div className="price-amount">
                <span className="currency">Rs.</span>
                <span className="amount">100</span>
                <span className="period">/ day</span>
              </div>
              <p className="price-note">Simple and affordable pricing</p>
            </div>

            <div className="advance-payment-card">
              <div className="advance-header">
                <FontAwesomeIcon icon={faCalendarCheck} />
                <span>Advance Payment</span>
              </div>
              <div className="advance-amount">
                <span className="percentage">20%</span>
                <span className="label">required to confirm booking</span>
              </div>
              <p className="advance-note">Advance ensures your booking is secured</p>
            </div>
          </div>

          {/* Info */}
          <div className="info-note">
            <FontAwesomeIcon icon={faInfoCircle} />
            <p>
              Your animal will be kept in a secure environment with proper attention and care.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={handleClose}>
            <FontAwesomeIcon icon={faTimesCircle} />
            Cancel
          </button>
          <button className="btn-proceed" onClick={handleProceed}>
            <FontAwesomeIcon icon={faCheckCircle} />
            Proceed with Service
          </button>
        </div>

      </div>
    </div>
  );
};

export default AnimalCareModal;
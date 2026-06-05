import React, { useState, useEffect, useCallback } from 'react';
import {
  FaTimes,
  FaMapMarkerAlt,
  FaArrowRight,
  FaShippingFast,
  FaInfoCircle,
} from 'react-icons/fa';
import { useAuth } from '../contexts/authContextCore';
import '../css/WelcomeModal.css';

const WelcomeModal = () => {
  const { role, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!loading && role === 'guest') {
      const seen = sessionStorage.getItem('welcome_modal_seen');

      if (!seen) {
        const timer = setTimeout(() => setIsOpen(true), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [role, loading]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => (document.body.style.overflow = 'auto');
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setClosing(false);
      sessionStorage.setItem('welcome_modal_seen', 'true');
    }, 200);
  }, []);

  if (!isOpen) return null;

  return (
    <div className={`wm-overlay ${closing ? 'wm-closing' : ''}`} onClick={handleClose}>
      <div className="wm-modal" onClick={(e) => e.stopPropagation()}>

        {/* Minimal Close Button - No Background, Just Icon */}
        <button className="wm-close" onClick={handleClose}>
          <FaTimes />
        </button>

        {/* Refined Header with better spacing */}
        <div className="wm-header">
          <div className="wm-logo-wrap" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
            <div className="logo-visibility-wrapper" style={{ background: 'rgba(128, 0, 0, 0.05)', border: '1px solid rgba(128, 0, 0, 0.1)', padding: '10px' }}>
              <img 
                src="https://res.cloudinary.com/dqclqmuhi/image/upload/v1775796488/Gemini_Generated_Image_1vibo61vibo61vib-removebg-preview_me9etj.png" 
                alt="MeatByAlvi Logo" 
                style={{ width: '60px', height: '60px', objectFit: 'contain' }}
              />
            </div>
          </div>
          <div className="wm-icon-badge">
            <FaMapMarkerAlt className="wm-icon" />
          </div>
          <h2>Delivery Area Notice</h2>
          <p>We're currently growing. Here's where we deliver.</p>
        </div>

        {/* Primary Info Card - Cleaner Layout */}
        <div className="wm-card wm-card-primary">
          <div className="wm-card-icon-wrapper">
            <FaShippingFast />
          </div>
          <div className="wm-card-content">
            <h4>Current Service Area</h4>
            <p>Available only in <strong>Rahim Yar Khan</strong>.</p>
          </div>
        </div>

        {/* Secondary Info Card */}
        <div className="wm-card wm-card-secondary">
          <div className="wm-card-icon-wrapper">
            <FaInfoCircle />
          </div>
          <div className="wm-card-content">
            <h4>Expanding Nationwide</h4>
            <p>More cities across Pakistan coming very soon.</p>
          </div>
        </div>

        {/* Refined Button with Smooth Interaction */}
        <button className="wm-btn" onClick={handleClose}>
          <span>Understood, Continue</span>
          <FaArrowRight className="wm-btn-icon" />
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;
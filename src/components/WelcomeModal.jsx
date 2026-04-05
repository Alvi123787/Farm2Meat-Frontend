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

        <button className="wm-close" onClick={handleClose}>
          <FaTimes />
        </button>

        <div className="wm-header">
          <FaMapMarkerAlt className="wm-icon" />
          <h2>Delivery Area Notice</h2>
          <p>We currently operate in limited locations.</p>
        </div>

        <div className="wm-card">
          <FaShippingFast className="wm-card-icon" />
          <div>
            <h4>Service Area</h4>
            <p>Currently available only in <b>Rahim Yar Khan</b>.</p>
          </div>
        </div>

        <div className="wm-card wm-muted">
          <FaInfoCircle className="wm-card-icon" />
          <div>
            <h4>Expanding Soon</h4>
            <p>We are expanding to more cities in Pakistan.</p>
          </div>
        </div>

        <button className="wm-btn" onClick={handleClose}>
          Continue <FaArrowRight />
        </button>

      </div>
    </div>
  );
};

export default WelcomeModal;
import React, { useState, useEffect, useCallback } from 'react';
import {
  FaTimes,
  FaMapMarkerAlt,
  FaArrowRight,
  FaHeart,
  FaInfoCircle,
  FaShippingFast,
  FaExpandArrowsAlt,
} from 'react-icons/fa';
import { useAuth } from '../contexts/authContextCore';
import '../css/WelcomeModal.css';

const WelcomeModal = () => {
  const { role, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (role !== 'guest') {
      setIsOpen(false);
      setClosing(false);
      return;
    }

    if (!loading && role === 'guest') {
      const hasSeenModal = sessionStorage.getItem('welcome_modal_seen');

      if (!hasSeenModal) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [role, loading]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setClosing(false);
      sessionStorage.setItem('welcome_modal_seen', 'true');
    }, 300);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`modal-overlay ${closing ? 'modal-overlay--closing' : ''}`}
      onClick={handleClose}
    >
      <div
        className={`modal-container ${closing ? 'modal-container--closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Close Button */}
        <button className="modal-close" onClick={handleClose} aria-label="Close">
          <FaTimes />
        </button>

        {/* Content */}
        <div className="modal-content">
          {/* Icon */}
          <div className="modal-icon">
            <FaMapMarkerAlt />
          </div>

          {/* Header */}
          <div className="modal-header">
            <span className="modal-badge">
              <FaInfoCircle />
              Important Notice
            </span>
            <h2 id="modal-title" className="modal-title">
              Delivery Area Update
            </h2>
            <p className="modal-subtitle">
              Please review our current service availability
            </p>
          </div>

          {/* Info Cards */}
          <div className="modal-cards">
            <div className="info-card">
              <div className="card-icon">
                <FaShippingFast />
              </div>
              <div className="card-content">
                <strong className="card-title">Current Service Area</strong>
                <p className="card-description">
                  Our delivery service is currently available only for users in{' '}
                  <strong>Rahim Yar Khan</strong>.
                </p>
              </div>
            </div>

            <div className="info-card">
              <div className="card-icon card-icon--accent">
                <FaExpandArrowsAlt />
              </div>
              <div className="card-content">
                <strong className="card-title">Expanding Soon</strong>
                <p className="card-description">
                  We're working to bring our services to more cities across Pakistan.
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="modal-divider">
            <span className="divider-line" />
            <FaHeart className="divider-icon" />
            <span className="divider-line" />
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button className="modal-button" onClick={handleClose}>
              <span>Continue Browsing</span>
              <FaArrowRight />
            </button>
            <p className="modal-thanks">
              <FaHeart />
              Thank you for your patience &amp; support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
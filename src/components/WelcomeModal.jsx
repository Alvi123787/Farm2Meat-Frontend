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
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    if (role !== 'guest') {
      const t = setTimeout(() => {
        setIsOpen(false);
        setClosing(false);
        setContentReady(false);
      }, 0);
      return () => clearTimeout(t);
    }

    if (!loading && role === 'guest') {
      const hasSeenModal = sessionStorage.getItem('welcome_modal_seen');

      if (!hasSeenModal) {
        const timer = setTimeout(() => {
          setIsOpen(true);
          setTimeout(() => setContentReady(true), 100);
        }, 1200);
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
      setContentReady(false);
      sessionStorage.setItem('welcome_modal_seen', 'true');
    }, 350);
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
      className={`wm-overlay ${closing ? 'wm-overlay--closing' : ''}`}
      onClick={handleClose}
      role="presentation"
    >
      <div className="wm-backdrop" aria-hidden />

      <div
        className={`wm-modal ${closing ? 'wm-modal--closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wm-heading"
      >
        {/* decorative */}
        <div className="wm-decor" aria-hidden>
          <span className="wm-orb wm-orb--1" />
          <span className="wm-orb wm-orb--2" />
          <span className="wm-orb wm-orb--3" />
          <div className="wm-grid-pattern" />
        </div>

        {/* accent bar */}
        <div className="wm-accent-bar" aria-hidden>
          <span className="wm-accent-sweep" />
        </div>

        {/* close */}
        <button className="wm-close" onClick={handleClose} aria-label="Close">
          <FaTimes />
        </button>

        {/* content */}
        <div className={`wm-content ${contentReady ? 'wm-content--visible' : ''}`}>
          {/* hero icon */}
          <div className="wm-hero-icon">
            <div className="wm-hero-bg" />
            <FaMapMarkerAlt className="wm-hero-svg" />
            <span className="wm-hero-ping" />
            <span className="wm-hero-ring" />
          </div>

          {/* header */}
          <div className="wm-header">
            <span className="wm-badge">
              <FaInfoCircle className="wm-badge-icon" />
              Important Notice
            </span>
            <h2 className="wm-heading" id="wm-heading">
              Delivery Area Update
            </h2>
            <p className="wm-subheading">
              Please review our current service availability
            </p>
          </div>

          {/* info cards */}
          <div className="wm-cards">
            <div className="wm-card">
              <div className="wm-card-icon-wrap wm-card-icon-wrap--primary">
                <FaShippingFast className="wm-card-icon" />
              </div>
              <div className="wm-card-text">
                <strong className="wm-card-title">Current Service Area</strong>
                <p className="wm-card-desc">
                  Our delivery service is currently available only for users in{' '}
                  <span className="wm-highlight">Rahim Yar Khan</span>.
                </p>
              </div>
            </div>

            <div className="wm-card wm-card--alt">
              <div className="wm-card-icon-wrap wm-card-icon-wrap--accent">
                <FaExpandArrowsAlt className="wm-card-icon" />
              </div>
              <div className="wm-card-text">
                <strong className="wm-card-title">Expanding Soon</strong>
                <p className="wm-card-desc">
                  We're working to bring our services to more cities across Pakistan.
                </p>
              </div>
            </div>
          </div>

          {/* divider */}
          <div className="wm-divider">
            <span className="wm-divider-line" />
            <FaHeart className="wm-divider-icon" />
            <span className="wm-divider-line" />
          </div>

          {/* footer */}
          <div className="wm-footer">
            <button className="wm-btn" onClick={handleClose}>
              <span className="wm-btn-shine" />
              <span className="wm-btn-label">Continue Browsing</span>
              <FaArrowRight className="wm-btn-arrow" />
            </button>

            <p className="wm-thanks">
              <FaHeart className="wm-thanks-icon" />
              Thank you for your patience &amp; support!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;

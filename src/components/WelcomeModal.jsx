import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/authContextCore';
import '../css/WelcomeModal.css';

const WelcomeModal = () => {
  const { role, loading } = useAuth();
  const [isOpen, setIsOpen]   = useState(false);
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
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setClosing(false);
      sessionStorage.setItem('welcome_modal_seen', 'true');
    }, 220);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className={`wm-overlay${closing ? ' wm-overlay--closing' : ''}`}
      onClick={handleClose}
    >
      <div className="wm-modal" onClick={(e) => e.stopPropagation()}>

        {/* Close */}
        <button className="wm-close" onClick={handleClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Logo */}
        <div className="wm-logo-wrap">
          <img
            src="https://res.cloudinary.com/dqclqmuhi/image/upload/v1775796488/Gemini_Generated_Image_1vibo61vibo61vib-removebg-preview_me9etj.png"
            alt="MeatByAlvi"
          />
        </div>

        {/* Heading */}
        <div className="wm-header">
          <h2>Delivery Area Notice</h2>
          <p>We're growing fast. Here's where we currently serve.</p>
        </div>

        {/* Divider */}
        <div className="wm-rule" aria-hidden="true" />

        {/* Info rows */}
        <div className="wm-info">

          <div className="wm-row">
            <div className="wm-row__icon" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div className="wm-row__body">
              <p className="wm-row__label">Current service area</p>
              <p className="wm-row__value">Rahim Yar Khan</p>
            </div>
          </div>

          <div className="wm-row">
            <div className="wm-row__icon" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="wm-row__body">
              <p className="wm-row__label">Expansion</p>
              <p className="wm-row__value">More cities across Pakistan — coming soon</p>
            </div>
          </div>

        </div>

        {/* CTA */}
        <button className="wm-btn" onClick={handleClose}>
          Understood, continue
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>

      </div>
    </div>
  );
};

export default WelcomeModal;